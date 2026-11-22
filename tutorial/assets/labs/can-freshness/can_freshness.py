"""Observe a fictional encoder source on a Linux virtual CAN interface."""

import argparse
import csv
import socket
import struct
import sys
import time
from dataclasses import dataclass


TRAINING_ID = 0x421
INTERFACE = "vcan0"
SAMPLE = struct.Struct("<HBBhH")
# Linux struct can_frame. CAN ID uses the host's byte order. The payload has
# its own declared byte order and can be decoded independently.
CAN_FRAME = struct.Struct("=IB3x8s")
MS = 1_000_000
EXPIRES_NS = 350 * MS


@dataclass(frozen=True)
class Sample:
    generation: int
    counter: int
    quality: int
    speed_tenths_rpm: int
    sample_tick: int

    def encode(self):
        return SAMPLE.pack(self.generation, self.counter, self.quality,
                           self.speed_tenths_rpm, self.sample_tick)


class Monitor:
    def __init__(self):
        self.arm(17)

    def arm(self, generation):
        # An explicit change of context clears proof even if the old source
        # was fresh. This training script never arms from a received frame.
        self.generation = generation
        self.last_sample = None
        self.deadline_ns = None
        self.status = "awaiting"

    def expire(self, now_ns):
        if self.status == "fresh" and now_ns >= self.deadline_ns:
            self.status = "stale"
            self.deadline_ns = None
            return True
        return False

    def observe(self, can_id, payload, now_ns):
        self.expire(now_ns)
        if can_id != TRAINING_ID:
            return "other_id", None
        if len(payload) != SAMPLE.size:
            return "wrong_length", None
        sample = Sample(*SAMPLE.unpack(payload))
        if sample.generation != self.generation:
            return "wrong_generation", sample
        if sample.quality != 1:
            return "bad_quality", sample

        skipped = 0
        if self.last_sample is not None:
            counter_step = (sample.counter - self.last_sample.counter) % 256
            tick_step = (sample.sample_tick - self.last_sample.sample_tick) % 65536
            if counter_step == 0:
                return "duplicate_counter", sample
            if counter_step >= 128:
                return "older_or_ambiguous_counter", sample
            if tick_step == 0 or tick_step >= 32768:
                return "sample_tick_not_advancing", sample
            skipped = counter_step - 1

        previous_status = self.status
        self.last_sample = sample
        self.deadline_ns = now_ns + EXPIRES_NS
        self.status = "fresh"
        if previous_status == "awaiting":
            return "first_valid_sample", sample
        if previous_status == "stale":
            return "freshness_restored", sample
        if skipped:
            return f"accepted_{skipped}_missing", sample
        return "accepted", sample


def replay_cases():
    """Run every case at its declared time, through memory or SocketCAN."""
    yield 20, TRAINING_ID, Sample(17, 254, 1, 372, 65520).encode()
    yield 120, TRAINING_ID, Sample(17, 255, 1, 370, 84).encode()
    yield 220, TRAINING_ID, Sample(17, 0, 1, -35, 184).encode()
    yield 320, TRAINING_ID, Sample(17, 0, 1, -35, 184).encode()
    yield 370, 0x422, b""
    yield 395, TRAINING_ID, b"\0\0"
    yield 420, TRAINING_ID, Sample(17, 1, 0, 450, 284).encode()
    yield 520, TRAINING_ID, Sample(17, 1, 1, 450, 184).encode()
    yield 620, TRAINING_ID, Sample(17, 255, 1, 390, 484).encode()
    yield 720, TRAINING_ID, Sample(17, 1, 1, 460, 684).encode()
    yield 820, TRAINING_ID, Sample(17, 3, 1, 470, 784).encode()
    yield 900, None, 18
    yield 920, TRAINING_ID, Sample(17, 4, 1, 480, 884).encode()
    yield 1020, TRAINING_ID, Sample(18, 0, 1, 120, 10).encode()
    yield 1120, TRAINING_ID, Sample(18, 1, 1, 135, 110).encode()


def csv_trace(output, transmit=None):
    monitor = Monitor()
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(("ms_from_start", "event", "state", "can_id", "payload",
                     "generation", "counter", "quality", "rpm", "source_tick_ms"))
    start = time.monotonic_ns() if transmit is not None else 0

    def record(at, event, can_id=None, payload=b"", sample=None):
        header = [round((at - start) / MS, 3), event, monitor.status,
                  "" if can_id is None else f"{can_id:03X}", payload.hex().upper()]
        decoded = [] if sample is None else [sample.generation, sample.counter, sample.quality,
                                              sample.speed_tenths_rpm / 10, sample.sample_tick]
        writer.writerow(header + (decoded or [""] * 5))

    def advance(at):
        if transmit is not None:
            time.sleep(max(0, at - time.monotonic_ns()) / 1e9)
            return time.monotonic_ns()
        return at

    def expire_before(at):
        if monitor.deadline_ns is not None and monitor.deadline_ns <= at:
            now = advance(monitor.deadline_ns)
            if monitor.expire(now):
                record(now, "freshness_expired")

    record(start, "arm_generation_17")
    for planned_ms, can_id, payload in replay_cases():
        target = start + planned_ms * MS
        expire_before(target)
        now = advance(target)
        if can_id is None:
            monitor.arm(payload)
            record(now, f"arm_generation_{payload}")
            continue
        if transmit is not None:
            can_id, payload = transmit(can_id, payload)
            now = time.monotonic_ns()
        if monitor.expire(now):
            record(now, "freshness_expired")
        event, sample = monitor.observe(can_id, payload, now)
        record(now, event, can_id, payload, sample)
    if monitor.deadline_ns is not None:
        expire_before(monitor.deadline_ns)


def socketcan_trace(output):
    with (socket.socket(socket.AF_CAN, socket.SOCK_RAW, socket.CAN_RAW) as sender,
          socket.socket(socket.AF_CAN, socket.SOCK_RAW, socket.CAN_RAW) as receiver):
        receiver.bind((INTERFACE,))
        receiver.settimeout(0.25)
        sender.bind((INTERFACE,))

        def transmit(can_id, payload):
            frame = CAN_FRAME.pack(can_id, len(payload), payload)
            if sender.send(frame) != CAN_FRAME.size:
                raise RuntimeError("Incomplete CAN frame write")
            incoming = receiver.recv(CAN_FRAME.size)
            received_id, length, data = CAN_FRAME.unpack(incoming)
            if incoming != frame:
                raise RuntimeError("Expected an isolated vcan0 with no other transmitter")
            return received_id, data[:length]

        csv_trace(output, transmit)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("transport", choices=("replay", "vcan"))
    options = parser.parse_args()
    if options.transport == "vcan":
        socketcan_trace(sys.stdout)
    else:
        csv_trace(sys.stdout)


if __name__ == "__main__":
    main()
