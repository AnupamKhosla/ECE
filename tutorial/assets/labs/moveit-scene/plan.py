#!/usr/bin/env python3
"""Compare straight flange interpolation and a joint-space detour in a mock Panda scene."""
import argparse
from copy import deepcopy
import csv
from pathlib import Path
import time

from geometry_msgs.msg import Pose
from moveit_msgs.msg import (
    CollisionObject, Constraints, JointConstraint, MoveItErrorCodes,
    PlanningScene, PlanningSceneComponents, RobotState,
)
from moveit_msgs.srv import (
    ApplyPlanningScene, GetCartesianPath, GetMotionPlan, GetPlanningScene,
    GetPositionFK, GetStateValidity,
)
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from shape_msgs.msg import SolidPrimitive


BASE = "panda_link0"
TOOL = "panda_link8"
GROUP = "panda_arm"
FIXTURE = "ece_training_fixture"
TARGET_MOVE_M = 0.28


class Planner(Node):
    def __init__(self):
        super().__init__("ece_planning_trial")
        self.lab_clients = {
            service.Request: self.create_client(service, name)
            for service, name in (
                (GetPositionFK, "/compute_fk"),
                (GetCartesianPath, "/compute_cartesian_path"),
                (GetStateValidity, "/check_state_validity"),
                (GetMotionPlan, "/plan_kinematic_path"),
                (ApplyPlanningScene, "/apply_planning_scene"),
                (GetPlanningScene, "/get_planning_scene"),
            )
        }
        self.joints = None
        self.create_subscription(JointState, "/joint_states", self.receive_joints, 10)

    def receive_joints(self, message):
        self.joints = message

    def call(self, request):
        service = self.lab_clients[type(request)]
        if not service.wait_for_service(timeout_sec=10):
            raise RuntimeError(f"Missing service {service.srv_name}")
        reply = service.call_async(request)
        rclpy.spin_until_future_complete(self, reply, timeout_sec=12)
        if not reply.done() or reply.result() is None:
            raise RuntimeError(f"No reply from {service.srv_name}")
        return reply.result()

    def initial_state(self):
        limit = time.monotonic() + 10
        while self.joints is None and time.monotonic() < limit:
            rclpy.spin_once(self, timeout_sec=0.15)
        if self.joints is None:
            raise RuntimeError("No joint feedback from mock state publisher")
        return RobotState(joint_state=deepcopy(self.joints))

    def fk(self, state):
        request = GetPositionFK.Request(robot_state=state, fk_link_names=[TOOL])
        request.header.frame_id = BASE
        response = self.call(request)
        if response.error_code.val != MoveItErrorCodes.SUCCESS or len(response.pose_stamped) != 1:
            raise RuntimeError(f"FK failed with code {response.error_code.val}")
        return response.pose_stamped[0].pose

    def straight_path(self, start, goal):
        request = GetCartesianPath.Request(start_state=start, group_name=GROUP, link_name=TOOL)
        request.header.frame_id = BASE
        request.waypoints = [goal]
        request.max_step = 0.01
        request.avoid_collisions = True
        request.max_velocity_scaling_factor = 0.2
        request.max_acceleration_scaling_factor = 0.2
        return self.call(request)

    def validity(self, state):
        return self.call(GetStateValidity.Request(robot_state=state))

    def world_ids(self):
        request = GetPlanningScene.Request(
            components=PlanningSceneComponents(components=PlanningSceneComponents.WORLD_OBJECT_NAMES)
        )
        return {obj.id for obj in self.call(request).scene.world.collision_objects}

    def set_fixture(self, geometry):
        scene = PlanningScene(is_diff=True)
        scene.robot_state.is_diff = True
        scene.world.collision_objects = [geometry]
        if not self.call(ApplyPlanningScene.Request(scene=scene)).success:
            raise RuntimeError("Planning scene change was rejected")

    def detour(self, start, goal, joint_names):
        request = GetMotionPlan.Request()
        plan = request.motion_plan_request
        plan.start_state = start
        plan.group_name = GROUP
        plan.pipeline_id = "ompl"
        plan.planner_id = "RRTConnectkConfigDefault"
        plan.num_planning_attempts = 1
        plan.allowed_planning_time = 4.0
        plan.max_velocity_scaling_factor = 0.2
        plan.max_acceleration_scaling_factor = 0.2
        positions = dict(zip(goal.joint_state.name, goal.joint_state.position))
        plan.goal_constraints = [Constraints(joint_constraints=[
            JointConstraint(joint_name=name, position=positions[name], weight=1.0,
                            tolerance_above=0.0001, tolerance_below=0.0001)
            for name in joint_names
        ])]
        return self.call(request).motion_plan_response


def with_joints(start, joint_names, positions):
    state = deepcopy(start)
    values = dict(zip(joint_names, positions))
    state.joint_state.position = [
        values.get(name, old) for name, old in zip(state.joint_state.name, state.joint_state.position)
    ]
    return state


def fixture_at(pose):
    midpoint = Pose()
    midpoint.position.x = pose.position.x
    midpoint.position.y = pose.position.y + TARGET_MOVE_M / 2
    midpoint.position.z = pose.position.z
    midpoint.orientation.w = 1.0
    fixture = CollisionObject(id=FIXTURE, operation=CollisionObject.ADD)
    fixture.header.frame_id = BASE
    fixture.pose.orientation.w = 1.0
    fixture.primitives = [SolidPrimitive(type=SolidPrimitive.BOX, dimensions=[0.05, 0.05, 0.08])]
    fixture.primitive_poses = [midpoint]
    return fixture


def record_path(planner, label, start, trajectory, output):
    joint_path = trajectory.joint_trajectory
    invalid = []
    for index, point in enumerate(joint_path.points):
        state = with_joints(start, joint_path.joint_names, point.positions)
        location = planner.fk(state).position
        validity = planner.validity(state)
        seconds = point.time_from_start.sec + 1e-9 * point.time_from_start.nanosec
        output.writerow([label, index, f"{seconds:.6f}", f"{location.x:.6f}",
                         f"{location.y:.6f}", f"{location.z:.6f}", str(validity.valid).lower()])
        if not validity.valid:
            invalid.append(index)
    if invalid:
        print(f"  {label} invalid sampled point indices {invalid}")


def run_trial(planner, output):
    if planner.world_ids():
        raise RuntimeError("The planning world is occupied. Start a fresh planning-only lab.")
    start = planner.initial_state()
    first = planner.fk(start)
    goal = deepcopy(first)
    goal.position.y += TARGET_MOVE_M
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(["path", "point", "time_s", "flange_x_m", "flange_y_m", "flange_z_m", "state_valid"])
    clear = planner.straight_path(start, goal)
    if clear.error_code.val != MoveItErrorCodes.SUCCESS or clear.fraction < 1.0 - 1e-6:
        raise RuntimeError(f"Baseline Cartesian path incomplete, fraction {clear.fraction:.3f}")
    print(f"Clear Cartesian: code {clear.error_code.val}, fraction {clear.fraction:.3f}")
    record_path(planner, "clear_cartesian", start, clear.solution, writer)
    joint_path = clear.solution.joint_trajectory
    target = with_joints(start, joint_path.joint_names, joint_path.points[-1].positions)
    middle = with_joints(start, joint_path.joint_names,
                         joint_path.points[len(joint_path.points) // 2].positions)
    fixture = fixture_at(first)
    planner.set_fixture(fixture)
    try:
        if FIXTURE not in planner.world_ids():
            raise RuntimeError("Fixture missing from the monitored scene")
        first_valid, last_valid = planner.validity(start), planner.validity(target)
        print(f"With fixture: start valid {first_valid.valid}, goal valid {last_valid.valid}")
        through_fixture = planner.validity(middle)
        contacts = sorted({f"{pair.contact_body_1} / {pair.contact_body_2}" for pair in through_fixture.contacts})
        print(f"With fixture: middle of former line valid {through_fixture.valid}")
        for pair in contacts:
            print(f"  Contact {pair}")
        blocked = planner.straight_path(start, goal)
        print(f"With fixture Cartesian: code {blocked.error_code.val}, fraction {blocked.fraction:.3f}")
        record_path(planner, "blocked_cartesian", start, blocked.solution, writer)
        route = planner.detour(start, target, joint_path.joint_names)
        print(f"With fixture RRTConnect: code {route.error_code.val}, "
              f"{len(route.trajectory.joint_trajectory.points)} trajectory points")
        label = "fixture_rrtconnect" if route.error_code.val == MoveItErrorCodes.SUCCESS else "rejected_rrtconnect"
        record_path(planner, label, start, route.trajectory, writer)
    finally:
        planner.set_fixture(CollisionObject(id=FIXTURE, operation=CollisionObject.REMOVE))
    recovered = planner.straight_path(start, goal)
    print(f"Cleared Cartesian: code {recovered.error_code.val}, fraction {recovered.fraction:.3f}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="new CSV path for returned trajectory samples")
    args = parser.parse_args()
    rclpy.init()
    planner = Planner()
    try:
        with args.output.open("x", newline="", encoding="utf-8") as output:
            run_trial(planner, output)
    except (OSError, RuntimeError) as error:
        parser.exit(1, f"{error}\n")
    finally:
        planner.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
