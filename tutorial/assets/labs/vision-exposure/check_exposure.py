"""Model exposure and row timing on a moving synthetic inspection target."""

import argparse
import csv
from dataclasses import dataclass
from pathlib import Path
import sys

import cv2
import numpy as np


WIDTH, HEIGHT = 240, 180
PIXELS_PER_MM = 4.0
DARK_THRESHOLD = 120.0
REJECT_PIXELS = 5
REFERENCE_TOP, REFERENCE_BOTTOM = 52, 132
DEFECT_X, DEFECT_Y = 148, 91
ROI = (slice(80, 102), slice(132, 164))


@dataclass(frozen=True)
class Capture:
    name: str
    speed_mm_s: float
    exposure_ms: float
    row_time_us: float = 0.0

    @property
    def speed_px_s(self):
        return self.speed_mm_s * PIXELS_PER_MM

    @property
    def smear_px(self):
        return self.speed_px_s * self.exposure_ms / 1000

    @property
    def shear_px_per_row(self):
        return self.speed_px_s * self.row_time_us / 1_000_000


CASES = (
    Capture("stationary_global", 0, 8),
    Capture("short_global", 400, 2),
    Capture("long_global", 400, 8),
    Capture("short_rolling", 400, 2, 35),
)


def coupon(with_defect, x_shift, plate_level):
    base = np.full((HEIGHT, WIDTH), 90, dtype=np.float32)
    cv2.rectangle(base, (54 + x_shift, 30), (188 + x_shift, 149), plate_level, -1)
    for y in (REFERENCE_TOP, REFERENCE_BOTTOM):
        cv2.circle(base, (80 + x_shift, y), 5, 42, -1)
    if with_defect:
        cv2.circle(base, (DEFECT_X + x_shift, DEFECT_Y), 3, 60, -1)
    return base


def expose(base, mode, rng):
    total = np.zeros_like(base)
    # Equally spaced sub-exposures centered around the middle-row timestamp.
    # The shear shifts the same feature further in rows sampled later.
    samples = 41
    shear = mode.shear_px_per_row
    for offset in (np.arange(samples) + 0.5) / samples - 0.5:
        shift = offset * mode.smear_px - shear * (HEIGHT - 1) / 2
        transform = np.float32([[1, shear, shift], [0, 1, 0]])
        total += cv2.warpAffine(base, transform, (WIDTH, HEIGHT),
                                flags=cv2.INTER_LINEAR, borderValue=90)
    noise = rng.normal(0, 2.0, total.shape)
    return np.clip(total / samples + noise, 0, 255).astype(np.uint8)


def reference_center(image, row):
    xs = np.arange(59, 102)
    tile = image[row - 8:row + 9, xs].astype(np.float64)
    weights = np.maximum(170 - tile, 0)
    return float((weights * xs).sum() / weights.sum())


def collect(mode, folder, writer):
    # The same simulated coupons and noise realizations recur in each condition.
    rng = np.random.default_rng(487)
    for number in range(12):
        defective = number >= 6
        plate_level = float(rng.integers(194, 207))
        shift = int(rng.integers(-2, 3))
        image = expose(coupon(defective, shift, plate_level), mode, rng)
        top = reference_center(image, REFERENCE_TOP)
        bottom = reference_center(image, REFERENCE_BOTTOM)
        dark_pixels = int(np.count_nonzero(image[ROI] < DARK_THRESHOLD))
        decision = "reject" if dark_pixels >= REJECT_PIXELS else "accept"
        shear_mm = (bottom - top) / PIXELS_PER_MM
        writer.writerow((mode.name, number + 1, "defect" if defective else "clean",
                         mode.speed_mm_s, mode.exposure_ms, mode.row_time_us,
                         f"{mode.smear_px:.3f}", dark_pixels, decision,
                         f"{top:.5f}", f"{bottom:.5f}", f"{shear_mm:.5f}"))
        if number == 6:
            if not cv2.imwrite(str(folder / f"{mode.name}.png"), image):
                raise OSError(f"Could not save {mode.name}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("example_images", type=Path, help="New folder for the example images")
    args = parser.parse_args()
    args.example_images.mkdir()
    cv2.setNumThreads(1)
    writer = csv.writer(sys.stdout, lineterminator="\n")
    writer.writerow(("condition", "coupon", "truth", "speed_mm_s", "exposure_ms", "row_us",
                     "smear_px", "dark_pixels", "decision", "top_reference_x_px",
                     "bottom_reference_x_px", "measured_shear_mm"))
    for mode in CASES:
        collect(mode, args.example_images, writer)


if __name__ == "__main__":
    main()
