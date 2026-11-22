#!/usr/bin/env python3
"""Reconcile a simulated robot cell's inspection and production window."""
import argparse
from collections import Counter
import csv
from dataclasses import dataclass
import math
from pathlib import Path


FIELDS = {
    "start_ms", "end_ms", "interval", "recipe", "lot", "serial", "result", "placement", "reason"
}
STOPS = {"starved", "blocked", "repair", "changeover", "excluded"}
RECIPES = ("A", "B")
TRIAL_WINDOW_MS = 4_200_000
PLANNED_EXCLUSION_MS = 600_000
MIN_THROUGHPUT = 320
MAX_P95_MS = 9500
MAX_PLACEMENT_BOUND = 0.01


@dataclass(frozen=True)
class Cycle:
    duration_ms: int
    recipe: str
    lot: str
    serial: str
    result: str
    placement: str


def read_trial(path):
    totals_ms = Counter()
    cycles = []
    serials = set()
    previous_end = 0
    with path.open(newline="", encoding="utf-8") as source:
        rows = csv.DictReader(source)
        if rows.fieldnames is None or len(rows.fieldnames) != len(FIELDS) or set(rows.fieldnames) != FIELDS:
            raise ValueError("CSV header differs from the trial schema")
        for row in rows:
            if None in row or None in row.values():
                raise ValueError(f"Line {rows.line_num}: wrong number of columns")
            try:
                start_ms, end_ms = int(row["start_ms"]), int(row["end_ms"])
            except ValueError as exc:
                raise ValueError(f"Line {rows.line_num}: use integer millisecond times") from exc
            if start_ms != previous_end or end_ms <= start_ms:
                raise ValueError(f"Line {rows.line_num}: time gap, overlap or empty interval")
            kind = row["interval"]
            duration_ms = end_ms - start_ms
            previous_end = end_ms
            totals_ms[kind] += duration_ms
            if kind == "cycle":
                if (
                    row["recipe"] not in RECIPES or not row["lot"] or not row["serial"]
                    or row["result"] not in {"good", "reject"}
                    or row["placement"] not in {"pass", "fail", "unchecked"}
                ):
                    raise ValueError(f"Line {rows.line_num}: incomplete cycle evidence")
                if row["serial"] in serials:
                    raise ValueError(f"Line {rows.line_num}: duplicate serial {row['serial']}")
                serials.add(row["serial"])
                cycles.append(Cycle(duration_ms, row["recipe"], row["lot"], row["serial"],
                                    row["result"], row["placement"]))
            elif kind not in STOPS or not row["reason"]:
                raise ValueError(f"Line {rows.line_num}: missing or unknown stop classification")
            elif any(row[field] for field in ("recipe", "lot", "serial", "result", "placement")):
                raise ValueError(f"Line {rows.line_num}: production evidence on a stop interval")
    if previous_end != TRIAL_WINDOW_MS:
        raise ValueError("Timeline does not cover the agreed 70-minute trial window")
    if totals_ms["excluded"] != PLANNED_EXCLUSION_MS:
        raise ValueError("Excluded time differs from the agreed ten-minute break")
    if not cycles:
        raise ValueError("No measured cycles")
    return totals_ms, cycles


def binomial_upper(failures, trials, alpha=0.05):
    """One-sided exact binomial bound for independent trials with one common rate."""
    if trials == 0:
        return None
    if failures == 0:
        return -math.expm1(math.log(alpha) / trials)
    if failures == trials:
        return 1.0

    log_coefficients = [0.0]
    for rank in range(1, failures + 1):
        log_coefficients.append(log_coefficients[-1] + math.log(trials - rank + 1) - math.log(rank))
    log_alpha = math.log(alpha)
    lower, upper = 0.0, 1.0
    for _ in range(50):
        p = (lower + upper) / 2
        log_p, log_q = math.log(p), math.log1p(-p)
        terms = [
            coefficient + rank * log_p + (trials - rank) * log_q
            for rank, coefficient in enumerate(log_coefficients)
        ]
        largest = max(terms)
        log_cdf = largest + math.log(math.fsum(math.exp(term - largest) for term in terms))
        if log_cdf > log_alpha:
            lower = p
        else:
            upper = p
    return upper


def summarize_group(label, cycles):
    if not cycles:
        print(f"{label}: HOLD | no cycles")
        return False

    # Nearest rank, counting from 1. Every completed cycle is eligible.
    ordered = sorted(cycles, key=lambda cycle: cycle.duration_ms)
    p95 = ordered[(95 * len(ordered) + 99) // 100 - 1]
    audited = sum(cycle.placement != "unchecked" for cycle in cycles)
    failed = sum(cycle.placement == "fail" for cycle in cycles)
    bound = binomial_upper(failed, audited)
    if bound is None:
        bound_text = "unavailable"
    else:
        bound_text = f"{bound:.3%}"
    lots = ", ".join(sorted({cycle.lot for cycle in cycles}))
    missed = [cycle.serial for cycle in cycles if cycle.placement == "fail"]
    print(f"{label}: cycles {len(cycles)} | lots {lots}")
    print(f"  Cycle P95 {p95.duration_ms / 1000:.3f} s (serial {p95.serial})")
    print(f"  Placement failures {failed}/{audited} audited | upper bound {bound_text}")
    if missed:
        print(f"  Failed placement serials {', '.join(missed)}")
    checks_pass = audited == len(cycles) and bound is not None and bound <= MAX_PLACEMENT_BOUND
    return p95.duration_ms <= MAX_P95_MS and checks_pass


def print_report(totals_ms, cycles):
    wall_ms = sum(totals_ms.values())
    planned_ms = wall_ms - totals_ms["excluded"]
    good = sum(cycle.result == "good" for cycle in cycles)
    rate = good * 3_600_000 / planned_ms
    print(f"Window {wall_ms / 60000:.2f} min wall | {planned_ms / 60000:.2f} min planned")
    print(f"Running {totals_ms['cycle'] / 60000:.2f} min | good {good}/{len(cycles)}")
    for kind in sorted(STOPS):
        if totals_ms[kind]:
            print(f"  {kind} {totals_ms[kind] / 1000:.3f} s")
    print(f"Good units per planned hour {rate:.2f} | {'PASS' if rate >= MIN_THROUGHPUT else 'HOLD'}")
    summarize_group("Pooled diagnostic (shared-rate assumption)", cycles)
    decisions = []
    for recipe in RECIPES:
        passes = summarize_group(f"Recipe {recipe}", [cycle for cycle in cycles if cycle.recipe == recipe])
        decisions.append(passes)
        print(f"  Recipe evidence {'PASS' if passes else 'HOLD'}")
    passed = rate >= MIN_THROUGHPUT and all(decisions)
    print(f"Exercise disposition {'PASS' if passed else 'HOLD'}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("trial", type=Path)
    args = parser.parse_args()
    try:
        print_report(*read_trial(args.trial))
    except (OSError, ValueError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
