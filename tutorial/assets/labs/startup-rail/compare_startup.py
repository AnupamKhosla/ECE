"""Run the same two-wheel load with six training power paths."""

import argparse
import csv
from pathlib import Path
import re
from statistics import fmean
import subprocess
import sys


CASES = {
    "baseline": {},
    "more_capacitance": {"bus_cap": "4700u"},
    "logic_upstream": {"logic_tap": "1"},
    "staggered_start": {"b_start": "40m"},
    "connector_fixed": {"connector_r": "0.055"},
    "weak_source": {"connector_r": "0.055", "source_r": "0.46", "source_v": "5.1"},
}


def duration_below(times, signal, threshold):
    duration = 0.0
    for (time0, value0), (time1, value1) in zip(zip(times, signal), zip(times[1:], signal[1:])):
        low_before, low_after = value0 < threshold, value1 < threshold
        if low_before and low_after:
            duration += time1 - time0
        elif low_before or low_after:
            fraction = (threshold - value0) / (value1 - value0)
            duration += (time1 - time0) * (fraction if low_before else 1 - fraction)
    return duration


def run_case(case, settings, model, root):
    folder = root / case
    folder.mkdir()
    for name, value in settings.items():
        pattern = rf"\b{name}=[\w.]+"
        model, replacements = re.subn(pattern, f"{name}={value}", model)
        if replacements != 1:
            raise ValueError(f"Expected one '{name}' declaration")
    (folder / "startup_rail.cir").write_text(model, encoding="utf-8")
    run = subprocess.run(["ngspice", "-b", "startup_rail.cir"], cwd=folder,
                         capture_output=True, text=True, check=True, timeout=15)
    (folder / "ngspice.log").write_text(run.stdout + run.stderr, encoding="utf-8")
    with (folder / "trace.txt").open(encoding="utf-8") as output:
        names = output.readline().split()
        rows = [tuple(map(float, line.split())) for line in output]
    expected = ["time", "pack_v", "bus_v", "controller_v",
                "positive_drop_v", "return_drop_v", "source_current_a"]
    if names != expected or not rows or any(len(row) != len(expected) for row in rows):
        raise ValueError(f"Unexpected trace shape in {case}")
    times, pack, bus, logic, positive, returned, current = zip(*rows)
    if any(abs(src - p - n - rail) > 1e-6 for src, p, n, rail in zip(pack, positive, returned, bus)):
        raise ValueError(f"The voltage readings do not reconcile in {case}")
    at_sag = bus.index(min(bus))
    stable_logic = fmean(logic[-10:])
    return (case, pack[at_sag], bus[at_sag], min(logic), positive[at_sag], returned[at_sag],
            current[at_sag], 1000 * duration_below(times, bus, 4.0),
            1000 * duration_below(times, logic, 3.05), stable_logic)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("work", type=Path, help="New folder for generated traces")
    options = parser.parse_args()
    options.work.mkdir()
    source = Path(__file__).with_name("startup_rail.cir").read_text(encoding="utf-8")
    writer = csv.writer(sys.stdout, lineterminator="\n")
    writer.writerow(("case", "pack_at_sag_v", "min_bridge_v", "min_logic_v", "positive_drop_v",
                     "return_drop_v", "source_at_sag_a", "bridge_below_4v_ms",
                     "logic_below_3p05v_ms", "end_logic_v"))
    for name, parameters in CASES.items():
        label, *values = run_case(name, parameters, source, options.work)
        writer.writerow([label, *(f"{v:.6f}" for v in values)])


if __name__ == "__main__":
    main()
