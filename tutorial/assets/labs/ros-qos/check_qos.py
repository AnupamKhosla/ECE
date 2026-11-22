"""Run isolated ROS 2 QoS discovery, retention and deadline checks."""

import csv
import sys
import time

import rclpy
from rclpy.duration import Duration
from rclpy.event_handler import PublisherEventCallbacks, SubscriptionEventCallbacks
from rclpy.executors import SingleThreadedExecutor
from rclpy.qos import DurabilityPolicy, QoSPolicyKind, QoSProfile, ReliabilityPolicy
from rclpy.utilities import get_rmw_implementation_identifier
from std_msgs.msg import Int32


BEST_EFFORT = ReliabilityPolicy.BEST_EFFORT
RELIABLE = ReliabilityPolicy.RELIABLE
VOLATILE = DurabilityPolicy.VOLATILE
TRANSIENT = DurabilityPolicy.TRANSIENT_LOCAL


def profile(reliability=RELIABLE, durability=VOLATILE, deadline_ms=None, lifespan_ms=None):
    settings = {"depth": 3, "reliability": reliability, "durability": durability}
    if deadline_ms is not None:
        settings["deadline"] = Duration(nanoseconds=deadline_ms * 1_000_000)
    if lifespan_ms is not None:
        settings["lifespan"] = Duration(nanoseconds=lifespan_ms * 1_000_000)
    return QoSProfile(**settings)


class Experiment:
    def __init__(self, output):
        self.pub_node = rclpy.create_node("ece_training_publisher")
        self.sub_node = rclpy.create_node("ece_training_observer")
        self.executor = SingleThreadedExecutor()
        self.executor.add_node(self.pub_node)
        self.executor.add_node(self.sub_node)
        self.start = time.monotonic()
        self.rmw = get_rmw_implementation_identifier()
        self.trace = csv.writer(output, lineterminator="\n")
        self.trace.writerow(("rmw", "elapsed_s", "case", "observation", "value"))

    def close(self):
        self.executor.shutdown()
        self.pub_node.destroy_node()
        self.sub_node.destroy_node()

    def record(self, case, observation, value):
        self.trace.writerow((self.rmw, f"{time.monotonic() - self.start:.3f}",
                             case, observation, value))

    def spin_for(self, seconds):
        end = time.monotonic() + seconds
        while (remaining := end - time.monotonic()) > 0:
            self.executor.spin_once(timeout_sec=min(0.025, remaining))

    def wait(self, condition, note):
        end = time.monotonic() + 4
        while not condition():
            if (remaining := end - time.monotonic()) <= 0:
                raise RuntimeError(f"Timed out waiting for {note}")
            self.executor.spin_once(timeout_sec=min(0.025, remaining))

    def publisher(self, topic, qos):
        return self.pub_node.create_publisher(
            Int32, f"/ece_qos_lab/{topic}", qos,
            event_callbacks=PublisherEventCallbacks(use_default_callbacks=False),
        )

    def subscription(self, topic, qos, received, **callbacks):
        return self.sub_node.create_subscription(
            Int32, f"/ece_qos_lab/{topic}", lambda message: received.append(message.data), qos,
            event_callbacks=SubscriptionEventCallbacks(use_default_callbacks=False, **callbacks),
        )

    def reliability_case(self):
        topic = "reliability"
        rejected, accepted, mismatches = [], [], []
        publisher = self.publisher(topic, profile(reliability=BEST_EFFORT))
        self.subscription(topic, profile(), rejected, incompatible_qos=mismatches.append)
        self.subscription(topic, profile(reliability=BEST_EFFORT), accepted)
        self.wait(lambda: self.pub_node.count_subscribers("/ece_qos_lab/reliability") == 2
                  and publisher.get_subscription_count() == 1 and mismatches,
                  "one best-effort match and a reliability incompatibility")
        for value in (10, 11, 12):
            publisher.publish(Int32(data=value))
            self.wait(lambda: accepted and accepted[-1] == value, f"live sample {value}")
        policy = QoSPolicyKind(mismatches[-1].last_policy_kind)
        assert policy == QoSPolicyKind.RELIABILITY
        assert not rejected
        self.record(topic, "discovered_readers",
                    self.pub_node.count_subscribers("/ece_qos_lab/reliability"))
        self.record(topic, "matched_readers", publisher.get_subscription_count())
        self.record(topic, "incompatible_policy", policy.name)
        self.record(topic, "reliable_reader_values", len(rejected))
        self.record(topic, "best_effort_reader_values", "|".join(map(str, accepted)))

    def durability_case(self):
        topic = "durability"
        retained, volatile = [], []
        publisher = self.publisher(topic, profile(durability=TRANSIENT))
        publisher.publish(Int32(data=40))
        self.spin_for(0.10)
        self.subscription(topic, profile(durability=TRANSIENT), retained)
        self.subscription(topic, profile(), volatile)
        self.wait(lambda: publisher.get_subscription_count() == 2 and retained == [40],
                  "both late readers and the retained sample")
        self.spin_for(0.15)
        assert not volatile
        self.record(topic, "transient_received_before_new_sample", retained[0])
        self.record(topic, "volatile_received_before_new_sample", len(volatile))
        publisher.publish(Int32(data=41))
        self.wait(lambda: retained == [40, 41] and volatile == [41], "both readers receive 41")
        self.record(topic, "both_received_live", 41)

    def deadline_case(self):
        topic = "deadline"
        received, rejected, missed, mismatches = [], [], [], []
        publisher = self.publisher(topic, profile(deadline_ms=120))
        self.subscription(topic, profile(deadline_ms=120), received, deadline=missed.append)
        self.subscription(topic, profile(deadline_ms=60), rejected, incompatible_qos=mismatches.append)
        self.wait(lambda: publisher.get_subscription_count() == 1 and mismatches,
                  "matching 120 ms reader and rejection of the 60 ms reader")
        policy = QoSPolicyKind(mismatches[-1].last_policy_kind)
        assert policy == QoSPolicyKind.DEADLINE
        self.record(topic, "shorter_requested_policy_rejected", policy.name)
        for value in (21, 22, 23):
            publisher.publish(Int32(data=value))
            self.wait(lambda: received and received[-1] == value, f"timely sample {value}")
            self.spin_for(0.035)

        initial_misses = missed[-1].total_count if missed else 0
        self.spin_for(0.39)
        additional = missed[-1].total_count - initial_misses if missed else 0
        assert additional >= 1 and received == [21, 22, 23]
        assert not rejected
        assert publisher.get_subscription_count() == 1
        self.record(topic, "misses_during_pause", additional)
        self.record(topic, "matched_readers_during_pause", publisher.get_subscription_count())
        publisher.publish(Int32(data=24))
        self.wait(lambda: received[-1] == 24, "sample after publisher resumes")
        self.record(topic, "received_after_pause", 24)

    def lifespan_case(self):
        topic = "lifespan"
        received = []
        publisher = self.publisher(topic, profile(durability=TRANSIENT, lifespan_ms=160))
        publisher.publish(Int32(data=301))
        self.spin_for(0.45)
        self.subscription(topic, profile(durability=TRANSIENT), received)
        self.wait(lambda: publisher.get_subscription_count() == 1, "late lifespan reader")
        self.spin_for(0.25)
        assert not received
        self.record(topic, "expired_retained_values_received", len(received))
        publisher.publish(Int32(data=302))
        self.wait(lambda: received == [302], "new sample with unexpired lifespan")
        self.record(topic, "unexpired_live_value", received[0])


def main():
    rclpy.init()
    experiment = Experiment(sys.stdout)
    try:
        experiment.reliability_case()
        experiment.durability_case()
        experiment.deadline_case()
        experiment.lifespan_case()
    finally:
        experiment.close()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
