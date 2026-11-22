"""Join a compiled PLC receipt gate to the P102 station journal."""

import argparse
from contextlib import closing
import csv
import ctypes
from pathlib import Path
import subprocess
import sys

from journal import CSV_FIELDS, apply_event, open_journal, read_events


KEY = (7, 42, 42, 1)
OTHER_PART = (7, 42, 41, 1)
GATE_PHASES = ("review", "waiting", "confirmed")


def load_gate(path):
    library = ctypes.CDLL(str(path.resolve()))
    number = ctypes.c_uint32
    words = ctypes.POINTER(number)
    library.reset_gate.argtypes = []
    library.reset_gate.restype = None
    library.scan_gate.argtypes = [number, number, number, number, words, number, words]
    library.scan_gate.restype = number
    return library


def count_good(database):
    with closing(open_journal(database, create=False)) as db:
        return db.execute("SELECT COUNT(*) FROM good_parts").fetchone()[0]


def committed_key(database, event_id):
    with closing(open_journal(database, create=False)) as db:
        row = db.execute("""
            SELECT g.job, g.part, j.generation
            FROM good_parts AS g
            JOIN jobs AS j USING (job)
            JOIN events AS e ON e.event_id = g.placement_event
            WHERE e.event_id = ? AND e.decision = 'committed_good_part'
        """, (event_id,)).fetchone()
    if row is None:
        return None
    cell, session, ordinal = row["job"].split(":")
    if cell != "CELL4" or not row["part"].startswith("PART-"):
        raise ValueError("The exercise expects the training cell and part format")
    return int(session), int(ordinal), int(row["part"][5:]), row["generation"]


def call_journal(database, suffix, crash_stage=None):
    command = [sys.executable, str(Path(__file__).with_name("journal.py")),
               "apply", str(database), str(suffix)]
    if crash_stage:
        command += ["--crash-event", "fixture-302", "--crash-stage", crash_stage]
    completed = subprocess.run(command, capture_output=True, text=True, timeout=5)
    code = completed.returncode
    if code not in (0, 90, 91):
        raise RuntimeError(f"Journal worker failed: {completed.stderr.strip()}")
    if code != 0:
        if completed.stdout:
            raise RuntimeError("A crashed worker emitted a receipt")
        return code, None, "no_reply"
    key = committed_key(database, "fixture-302")
    reply = completed.stdout.strip()
    if not reply.startswith("fixture-302 committed_good_part") or key != KEY:
        raise RuntimeError("The worker did not confirm the exact committed record")
    return code, key, "replayed" if reply.endswith("(replayed)") else "committed"


def run_case(gate, mode, folder, prefix, suffix, writer):
    database = folder / f"{mode}.sqlite"
    with closing(open_journal(database, create=True)) as db:
        for event in prefix:
            apply_event(db, event)
    gate.reset_gate()
    array = ctypes.c_uint32 * 4

    def scan(time_ms, event, expect, *, link=True, review=False,
             candidate=KEY, receipt=None, worker="", recorded=None):
        status = gate.scan_gate(time_ms, link, review, candidate is not None,
                                array(*(candidate or (0, 0, 0, 0))), receipt is not None,
                                array(*(receipt or (0, 0, 0, 0))))
        phase, flags = divmod(status, 4)
        state = (phase, flags & 1, (flags >> 1) & 1)
        good = count_good(database)
        writer.writerow((mode, time_ms, event, GATE_PHASES[phase], state[1], state[2],
                         good, worker))
        if state != expect or (recorded is not None and good != recorded):
            raise RuntimeError(f"{mode} {event}: gate {state}, journal good count {good}")

    held, pending, accepted = (0, 0, 0), (1, 1, 0), (2, 0, 1)
    scan(0, "review held at boot", held, review=True, recorded=0)
    scan(5, "review released", held)
    scan(10, "reviewed candidate", pending, review=True)
    scan(30, "same job with wrong part receipt", pending, receipt=OTHER_PART, recorded=0)

    if mode == "nominal":
        code, receipt, decision = call_journal(database, suffix)
        assert code == 0 and decision == "committed"
        scan(210, "matching reply on deadline", accepted, receipt=receipt,
             worker=decision, recorded=1)
        scan(220, "same robot result still present", accepted, recorded=1)
        scan(230, "part evidence disappears", held, candidate=None, recorded=1)
        return

    code, absent, decision = call_journal(database, suffix, crash_stage=mode)
    assert (code, absent) == ({"before-commit": 90, "after-commit": 91}[mode], None)
    expected_count = int(mode == "after-commit")
    scan(70, "store process exited without reply", pending,
         worker=f"exit_{code}_{decision}", recorded=expected_count)
    scan(210, "receipt timeout", held, recorded=expected_count)
    late = committed_key(database, "fixture-302")
    scan(220, "late status check", held, receipt=late, recorded=expected_count)
    scan(230, "link lost", held, link=False, recorded=expected_count)
    scan(240, "link returns without review", held, receipt=late, recorded=expected_count)
    scan(250, "reviewed same part for retry", pending, review=True, recorded=expected_count)
    code, receipt, decision = call_journal(database, suffix)
    assert code == 0 and decision == ("replayed" if expected_count else "committed")
    scan(260, "receipt from same event retry", accepted, receipt=receipt,
         worker=decision, recorded=1)
    scan(270, "candidate part changes", held, candidate=OTHER_PART, recorded=1)

    if mode == "after-commit":
        scan(280, "review held when healthy link drops", held, link=False, review=True)
        scan(290, "held review when link returns", held, review=True)
        scan(300, "review released", held)
        scan(310, "new candidate generation reviewed", pending,
             review=True, candidate=(7, 42, 42, 2))
        scan(500, "prior generation receipt", pending,
             candidate=(7, 42, 42, 2), receipt=KEY)
        scan(511, "first scan after deadline", held, candidate=(7, 42, 42, 2))
        scan(0xFFFFFFF0, "same part reviewed before wrap", pending, review=True)
        scan(185, "matching receipt 201 ms later across wrap", held, receipt=KEY)
        scan(190, "same part reviewed after wrap", pending, review=True)
        scan(390, "matching receipt exactly 200 ms after review", accepted, receipt=KEY)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("library", type=Path)
    parser.add_argument("events", type=Path)
    parser.add_argument("work_directory", type=Path, help="New folder for training databases")
    options = parser.parse_args()
    options.work_directory.mkdir()
    with options.events.open(encoding="utf-8", newline="") as source:
        events = list(read_events(source))
    final_index = next(i for i, event in enumerate(events) if event["event_id"] == "fixture-302")
    suffix = options.work_directory / "commit-event.csv"
    with suffix.open("w", encoding="utf-8", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerow(events[final_index])

    gate = load_gate(options.library)
    writer = csv.writer(sys.stdout, lineterminator="\n")
    writer.writerow(("case", "scan_ms", "evidence", "phase", "store_request",
                     "consume_ack", "good_parts", "worker_reply"))
    for mode in ("nominal", "before-commit", "after-commit"):
        run_case(gate, mode, options.work_directory, events[:final_index], suffix, writer)


if __name__ == "__main__":
    main()
