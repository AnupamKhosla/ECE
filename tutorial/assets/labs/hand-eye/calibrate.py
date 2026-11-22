#!/usr/bin/env python3
"""Recover a simulated robot-camera mount from projected target corners."""
import argparse

import cv2
import numpy as np


IMAGE_SIZE = (1280, 1280)
CAMERA_MATRIX = np.array([[655.0, 0, 640], [0, 650, 640], [0, 0, 1]])
DISTORTION = np.array([-0.08, 0.012, 0.001, -0.0007, 0.0])
BOARD = np.array(
    [[0.028 * col, 0.028 * row, 0.0] for row in range(-2, 3) for col in range(-3, 4)]
)
FIT_COUNT = 12
CHECK_COUNT = 6


def transform(rotation, translation):
    matrix = np.eye(4)
    matrix[:3, :3] = rotation
    matrix[:3, 3] = np.asarray(translation).reshape(3)
    return matrix


def pose(rotation_vector_degrees, translation):
    rotation, _ = cv2.Rodrigues(np.deg2rad(rotation_vector_degrees))
    return transform(rotation, translation)


def inverse(matrix):
    rotation = matrix[:3, :3].T
    return transform(rotation, -rotation @ matrix[:3, 3])


def observe_target(camera_from_target, rng, frames):
    rotation, _ = cv2.Rodrigues(camera_from_target[:3, :3])
    projection, _ = cv2.projectPoints(
        BOARD, rotation, camera_from_target[:3, 3], CAMERA_MATRIX, DISTORTION
    )
    pixels = projection.reshape(-1, 2)
    depths = (BOARD @ camera_from_target[:3, :3].T + camera_from_target[:3, 3])[:, 2]
    if np.any(depths <= 0) or np.any(pixels < 0) or np.any(pixels >= IMAGE_SIZE):
        raise ValueError("A generated target lies outside the camera view")

    noise = rng.normal(0, 0.16, (frames, *pixels.shape))
    observed = pixels + noise.mean(axis=0)
    ok, vector, offset = cv2.solvePnP(BOARD, observed, CAMERA_MATRIX, DISTORTION)
    if not ok:
        raise ValueError("solvePnP could not recover the target")
    fitted_rotation, _ = cv2.Rodrigues(vector)
    projected, _ = cv2.projectPoints(BOARD, vector, offset, CAMERA_MATRIX, DISTORTION)
    pixel_error = np.sqrt(np.mean(np.sum((projected.reshape(-1, 2) - observed) ** 2, axis=1)))
    return transform(fitted_rotation, offset), pixel_error


def generate(mount, scenario, frames):
    if mount == "wrist":
        true_mount = pose([3.5, -4, 7], [0.041, -0.026, 0.054])  # tool from camera
        target = pose([4, -3, 8], [0.022, 0.016, 0.685])        # base from target
        tool_height = 0.12
    else:
        true_mount = pose([-3, 4, -5], [0.032, 0.022, 0.085])   # base from camera
        target = pose([-4, 7, 2], [0.024, -0.014, 0.065])       # tool from target
        tool_height = 0.60

    motion_rng = np.random.default_rng(410)
    image_rng = np.random.default_rng(520)
    robot_poses, target_poses, pixel_errors = [], [], []
    for index in range(FIT_COUNT + CHECK_COUNT):
        rotation = motion_rng.uniform(-15, 15, 3)
        translation = motion_rng.uniform([-0.09, -0.075, -0.055], [0.09, 0.075, 0.055])
        translation[2] += tool_height
        if scenario == "single-axis" and index < FIT_COUNT:
            rotation[:2] = 0
        base_from_tool = pose(rotation, translation)
        robot_transform = base_from_tool if mount == "wrist" else inverse(base_from_tool)
        # In either setup: robot_transform @ true_mount @ camera_from_target = target.
        camera_from_target = inverse(robot_transform @ true_mount) @ target
        estimated_target, pixel_error = observe_target(camera_from_target, image_rng, frames)
        robot_poses.append(robot_transform)
        target_poses.append(estimated_target)
        pixel_errors.append(pixel_error)
    return true_mount, target, robot_poses, target_poses, pixel_errors


def rotation_axis_ratio(robot_poses):
    anchor = inverse(robot_poses[0])
    vectors = [cv2.Rodrigues((anchor @ pose)[:3, :3])[0].ravel() for pose in robot_poses[1:]]
    singular_values = np.linalg.svd(vectors, compute_uv=False)
    largest, second = singular_values[:2]
    return second / largest if largest else 0.0


def pose_error(reference, measured):
    delta = inverse(reference) @ measured
    angle = np.arccos(np.clip((np.trace(delta[:3, :3]) - 1) / 2, -1, 1))
    return 1000 * np.linalg.norm(delta[:3, 3]), np.rad2deg(angle)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mount", choices=("wrist", "fixed"), default="wrist")
    parser.add_argument(
        "--scenario", choices=("aligned", "mismatched", "single-axis"), default="aligned"
    )
    parser.add_argument("--frames", type=int, choices=(1, 4), default=1)
    args = parser.parse_args()

    true_mount, target, robot, camera, pixels = generate(args.mount, args.scenario, args.frames)
    print(f"Camera {args.mount} | observations {args.scenario} | {args.frames} image(s) per pose")
    print(f"Fit image reprojection RMS, median {np.median(pixels[:FIT_COUNT]):.3f} px")
    fit_robot = robot[:FIT_COUNT]
    ratio = rotation_axis_ratio(fit_robot)
    print(f"Relative rotation axis spread (second / first singular value) {ratio:.3f}")
    if ratio < 0.05:
        print("HOLD | gather fit poses that rotate around another axis")
        return

    fit_camera = camera[:FIT_COUNT]
    if args.scenario == "mismatched":
        fit_camera[0], fit_camera[7] = fit_camera[7], fit_camera[0]
    rotation, translation = cv2.calibrateHandEye(
        [matrix[:3, :3] for matrix in fit_robot],
        [matrix[:3, 3].reshape(3, 1) for matrix in fit_robot],
        [matrix[:3, :3] for matrix in fit_camera],
        [matrix[:3, 3].reshape(3, 1) for matrix in fit_camera],
        method=cv2.CALIB_HAND_EYE_PARK,
    )
    if not np.isfinite(translation).all() or not (
        np.allclose(rotation.T @ rotation, np.eye(3), atol=1e-6)
        and np.isclose(np.linalg.det(rotation), 1)
    ):
        print("HOLD | solver returned an invalid rigid transform")
        return
    estimate = transform(rotation, translation)
    mount_mm, mount_deg = pose_error(true_mount, estimate)
    print(f"Mount error against simulation truth {mount_mm:.2f} mm, {mount_deg:.3f} deg")
    print("Pose,held-out target error mm,held-out target error deg,reprojection RMS px")
    errors = []
    for index in range(FIT_COUNT, len(robot)):
        target_rebuilt = robot[index] @ estimate @ camera[index]
        error_mm, error_deg = pose_error(target, target_rebuilt)
        errors.append((error_mm, error_deg))
        print(f"{index + 1},{error_mm:.2f},{error_deg:.3f},{pixels[index]:.3f}")
    worst_mm, worst_deg = np.max(errors, axis=0)
    accepted = worst_mm <= 5.0 and worst_deg <= 0.50
    print(f"{'PASS' if accepted else 'HOLD'} | held-out maxima {worst_mm:.2f} mm, {worst_deg:.3f} deg")


if __name__ == "__main__":
    main()
