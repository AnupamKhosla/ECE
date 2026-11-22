from pathlib import Path
from xml.etree import ElementTree

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, LogInfo, OpaqueFunction
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue


def make_lab_nodes(context):
    lab_dir = Path(__file__).resolve().parent
    model = ElementTree.parse(lab_dir / "two-joint.urdf")
    freeze_feedback = LaunchConfiguration("freeze_feedback").perform(context)
    feedback_option = model.find("./ros2_control/hardware/param[@name='disable_commands']")
    feedback_option.text = freeze_feedback
    description = ElementTree.tostring(model.getroot(), encoding="unicode")
    actions = []
    controller_arguments = []
    if freeze_feedback == "true":
        actions.append(LogInfo(msg="Mock feedback is frozen at the initial positions."))
        controller_arguments = ["--ros-args", "--log-level", "controller_manager.hardware_component.system.TwoAxisMock:=error"]

    return actions + [
        Node(
            package="robot_state_publisher",
            executable="robot_state_publisher",
            parameters=[{"robot_description": ParameterValue(description, value_type=str)}],
            output="screen",
        ),
        Node(
            package="controller_manager",
            executable="ros2_control_node",
            arguments=controller_arguments,
            parameters=[str(lab_dir / "controllers.yaml")],
            output="screen",
        ),
    ]


def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument(
            "freeze_feedback",
            default_value="false",
            choices=["false", "true"],
            description="Stop the mock hardware from copying commands into its position feedback.",
        ),
        OpaqueFunction(function=make_lab_nodes),
    ])
