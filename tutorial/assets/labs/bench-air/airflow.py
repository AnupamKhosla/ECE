"""Estimate installed operating points from a fan curve and example restrictions."""

from bisect import bisect_right
import csv
import sys


# Approximate readings from Delta BFB1012M-A's published 12 V graph.
# These are in cubic metres/minute and millimetres of water respectively.
CURVE = ((0.0, 22.68), (0.2, 20), (0.3, 18), (0.4, 16),
         (0.5, 13), (0.6, 10), (0.7, 5), (0.777, 0.0))
MM_WATER_TO_PA = 9.80665
FLOW = [flow * 60 for flow, _ in CURVE]
PRESSURE = [pressure * MM_WATER_TO_PA for _, pressure in CURVE]
REFERENCE_FLOW = 35.0
# Example drops for the complete installed path at the reference flow.
PATH_DROPS = {"guarded_nozzle": 45.0, "clean_filter": 65.0, "simulated_loaded_filter": 150.0}


def fan_pressure(flow):
    if not FLOW[0] <= flow <= FLOW[-1]:
        raise ValueError("Flow outside the fan curve")
    index = min(len(FLOW) - 2, bisect_right(FLOW, flow) - 1)
    normal = (flow - FLOW[index]) / (FLOW[index + 1] - FLOW[index])
    return PRESSURE[index] + normal * (PRESSURE[index + 1] - PRESSURE[index])


def path_pressure(flow, reference_drop):
    return reference_drop * (flow / REFERENCE_FLOW) ** 2


def operating_point(reference_drop):
    if reference_drop < 0:
        raise ValueError("Pressure drop cannot be negative")
    left, right = FLOW[0], FLOW[-1]
    for _ in range(45):
        flow = (left + right) / 2
        if fan_pressure(flow) > path_pressure(flow, reference_drop):
            left = flow
        else:
            right = flow
    flow = (left + right) / 2
    return flow, path_pressure(flow, reference_drop)


def main():
    writer = csv.writer(sys.stdout, lineterminator="\n")
    writer.writerow(("case", "drop_at_35_m3_per_h_pa", "installed_m3_per_h", "installed_drop_pa"))
    for label, drop in PATH_DROPS.items():
        flow, pressure = operating_point(drop)
        writer.writerow((label, f"{drop:.1f}", f"{flow:.3f}", f"{pressure:.3f}"))


if __name__ == "__main__":
    main()
