"""Analyse a balanced crossed gauge study, with lengths stored in micrometres."""

import argparse
from collections import defaultdict
import csv
from decimal import Decimal
from itertools import product
import math
from statistics import mean


LOWER_UM = 19_850
UPPER_UM = 20_150
GUARD_UM = 25


def micrometres(value):
    scaled = Decimal(value) * 1000
    if not scaled.is_finite() or scaled != scaled.to_integral_value():
        raise ValueError(f"Expected a length in whole micrometres, got {value}")
    return int(scaled)


def read_study(source):
    fixtures = defaultdict(dict)
    references = {}
    for row in csv.DictReader(source):
        fixture = row["fixture"]
        part = row["part"]
        reference = micrometres(row["reference_mm"])
        if reference != references.setdefault(part, reference):
            raise ValueError(f"Reference changed for {part}")
        key = (part, row["operator"], int(row["repeat"]))
        if key in fixtures[fixture]:
            raise ValueError(f"Duplicate measurement for {fixture} {key}")
        fixtures[fixture][key] = micrometres(row["measured_mm"])
    if not fixtures:
        raise ValueError("The study contains no measurements")
    first_keys = next(iter(fixtures.values())).keys()
    if any(cells.keys() != first_keys for cells in fixtures.values()):
        raise ValueError("Fixture comparisons must use the same test combinations")
    return fixtures, references


def crossed_variances(cells):
    """Method-of-moments variance estimates for a balanced random-effects model."""
    parts, operators, repeats = (sorted(set(labels)) for labels in zip(*cells))
    p, o, r = len(parts), len(operators), len(repeats)
    if min(p, o, r) < 2 or len(cells) != p * o * r:
        raise ValueError("Expected all part, operator and repeat combinations")
    grand = mean(cells.values())
    groups = {(i, j): mean(cells[i, j, k] for k in repeats)
              for i, j in product(parts, operators)}
    part_means = {i: mean(groups[i, j] for j in operators) for i in parts}
    operator_means = {j: mean(groups[i, j] for i in parts) for j in operators}

    ss_within = sum((value - groups[i, j]) ** 2 for (i, j, k), value in cells.items())
    ss_interaction = r * sum(
        (value - part_means[i] - operator_means[j] + grand) ** 2
        for (i, j), value in groups.items()
    )
    ss_operator = p * r * sum((value - grand) ** 2 for value in operator_means.values())
    ss_part = o * r * sum((value - grand) ** 2 for value in part_means.values())

    ms_within = ss_within / (p * o * (r - 1))
    ms_interaction = ss_interaction / ((p - 1) * (o - 1))
    ms_operator = ss_operator / (o - 1)
    ms_part = ss_part / (p - 1)
    return {
        "repeatability": ms_within,
        "interaction": (ms_interaction - ms_within) / r,
        "operator": (ms_operator - ms_interaction) / (p * r),
        "part": (ms_part - ms_interaction) / (o * r),
    }


def classify(value, guarded):
    if not guarded:
        return "accept" if LOWER_UM <= value <= UPPER_UM else "reject"
    if value < LOWER_UM - GUARD_UM or value > UPPER_UM + GUARD_UM:
        return "reject"
    if LOWER_UM + GUARD_UM <= value <= UPPER_UM - GUARD_UM:
        return "accept"
    return "review"


def decision_counts(cells, references, guarded):
    false_accept = false_reject = review = 0
    for (part, _, _), measurement in cells.items():
        decision = classify(measurement, guarded)
        inside = LOWER_UM <= references[part] <= UPPER_UM
        false_accept += decision == "accept" and not inside
        false_reject += decision == "reject" and inside
        review += decision == "review"
    return false_accept, false_reject, review


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("measurements", type=argparse.FileType("r", encoding="utf-8"))
    options = parser.parse_args()
    with options.measurements as source:
        fixtures, references = read_study(source)
    for label, cells in fixtures.items():
        variances = crossed_variances(cells)
        repeat = math.sqrt(variances["repeatability"])
        reproducibility = math.sqrt(max(0, variances["operator"])
                                    + max(0, variances["interaction"]))
        percent_tolerance = 100 * 6 * math.hypot(repeat, reproducibility) / (UPPER_UM - LOWER_UM)
        bias = mean(value - references[key[0]] for key, value in cells.items())
        print(f"{label}: {len(cells)} readings, repeat {repeat:.3f} µm, "
              f"between-operator/part {reproducibility:.3f} µm, "
              f"6-sigma/tolerance {percent_tolerance:.2f}%, mean bias {bias:+.3f} µm")
        print("  variance (µm²): " + ", ".join(f"{k}={v:.3f}" for k, v in variances.items()))
        for guarded in (False, True):
            accept, reject, review = decision_counts(cells, references, guarded)
            policy = "guarded" if guarded else "binary"
            print(f"  {policy}: {accept} false accepts, {reject} false rejects, {review} reviews")


if __name__ == "__main__":
    main()
