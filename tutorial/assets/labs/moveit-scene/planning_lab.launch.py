from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from moveit_configs_utils import MoveItConfigsBuilder


def generate_launch_description():
    config = (
        MoveItConfigsBuilder("moveit_resources_panda")
        .robot_description(file_path="config/panda.urdf.xacro")
        .robot_description_semantic(file_path="config/panda.srdf")
        .planning_pipelines(default_planning_pipeline="ompl", pipelines=["ompl"])
        .to_moveit_configs()
    )
    ready = {
        "panda_joint1": 0.0,
        "panda_joint2": -0.785,
        "panda_joint3": 0.0,
        "panda_joint4": -2.356,
        "panda_joint5": 0.0,
        "panda_joint6": 1.571,
        "panda_joint7": 0.785,
        "panda_finger_joint1": 0.035,
    }
    return LaunchDescription([
        DeclareLaunchArgument("edge_fraction", default_value="0.001"),
        Node(package="robot_state_publisher", executable="robot_state_publisher",
             parameters=[config.robot_description]),
        Node(package="joint_state_publisher", executable="joint_state_publisher",
             parameters=[{"zeros": ready, "rate": 20}]),
        Node(package="tf2_ros", executable="static_transform_publisher",
             arguments=["--frame-id", "world", "--child-frame-id", "panda_link0"]),
        Node(package="moveit_ros_move_group", executable="move_group", output="screen",
             parameters=[config.to_dict(), {
                 "allow_trajectory_execution": False,
                 "disable_capabilities": (
                     "move_group/MoveGroupMoveAction move_group/MoveGroupExecuteTrajectoryAction"
                 ),
                 "ompl.panda_arm.longest_valid_segment_fraction": ParameterValue(
                     LaunchConfiguration("edge_fraction"), value_type=float
                 ),
             }]),
    ])
