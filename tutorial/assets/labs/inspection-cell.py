"""Evaluate an inspection worksheet without connecting to any equipment."""

import argparse
import csv
import math
from pathlib import Path


def decision(case):
    """Return an inspection request or the first reason to hold."""
    if case["permit"] != "1":
        return "hold: simulator permit"
    if case["fixture_ready"] != "1":
        return "hold: fixture not ready"
    if case["frame_id"] != case["fixture_id"]:
        return "hold: frame belongs to another part"
    age = int(case["age_ms"])
    if not 0 <= age <= 250:
        return "hold: frame age"
    depth = float(case["depth_mm"])
    if case["depth_valid"] != "1" or not math.isfinite(depth):
        return "hold: invalid depth"
    if not 725 <= depth <= 775:
        return "hold: target outside depth window"
    confidence = float(case["model_score"])
    label = case["model_label"]
    if not 0.85 <= confidence <= 1 or label not in {"normal", "defect"}:
        return "review: model evidence"
    if label == "defect":
        return "request inspection reject"
    return "request simulated pick"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "cases",
        type=Path,
        nargs="?",
        default=Path(__file__).with_name("inspection-cell-cases.csv"),
        help="CSV worksheet with inspection cases and optional expected results",
    )
    args = parser.parse_args()
    failed = 0
    try:
        stream = args.cases.open(encoding="utf-8", newline="")
    except OSError as error:
        parser.error(str(error))
    with stream:
        cases = csv.DictReader(stream)
        required = {
            "fixture_id", "frame_id", "age_ms", "depth_mm", "depth_valid",
            "model_label", "model_score", "fixture_ready", "permit",
        }
        missing = required.difference(cases.fieldnames or [])
        if missing:
            parser.error("missing columns: " + ", ".join(sorted(missing)))
        for line, case in enumerate(cases, 2):
            try:
                actual = decision(case)
            except (TypeError, ValueError) as error:
                parser.error(f"row {line}: {error}")
            expected = case.get("expected")
            print(f"{case['fixture_id']}: {actual}")
            if expected and actual != expected:
                failed += 1
                print(f"  expected {expected}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
