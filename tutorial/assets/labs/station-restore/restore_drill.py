"""Rehearse recovery of a fictional robot cell and its SQLite journal."""

import argparse
from contextlib import closing
import csv
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3
import sys

from journal import apply_event, open_journal, read_events


# These values model independent copies held by commissioning and production.
APPROVED = {
    "cell": "CELL4",
    "release": "CELL4-R12",
    "plc_program": "PLC-P09",
    "robot_program": "ROBOT-P14",
    "fixture": "FIXTURE-V3",
    "camera_transform": "CAM-CELL4-FIXTURE3-C17",
}
BACKUP_CUT = {
    "last_event": "robot-205",
    "parts": ["PART-042", "PART-043"],
}
CURRENT_CUT = {
    "last_event": "robot-206",
    "parts": ["PART-042", "PART-043", "PART-044"],
}
FILES = ("configuration.json", "journal.sqlite")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_events(path):
    with path.open(encoding="utf-8", newline="") as stream:
        return list(read_events(stream))


def inspect(db):
    with db:
        db.execute("BEGIN")
        checks = [row[0] for row in db.execute("PRAGMA integrity_check")]
        if checks != ["ok"] or db.execute("PRAGMA foreign_key_check").fetchone():
            raise ValueError("SQLite integrity or foreign-key check failed")
        # The fixed lab transcript has insertion-only event history. A real
        # integration should use its explicit durable event sequence.
        last = db.execute("SELECT event_id FROM events ORDER BY rowid DESC LIMIT 1").fetchone()
        parts = [row[0] for row in db.execute("SELECT part FROM good_parts ORDER BY part")]
    return {"last_event": last[0] if last else None, "parts": parts}


def inspect_file(path):
    with closing(sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)) as db:
        return inspect(db)


def snapshot_to(source, path):
    with closing(sqlite3.connect(path)) as target:
        source.backup(target)
        # Produce a self-contained exercise artifact once the copy is done.
        mode = target.execute("PRAGMA journal_mode=DELETE").fetchone()[0]
        if mode != "delete":
            raise ValueError("The backup did not switch to a standalone journal file")


def write_manifest(bundle, cutoff):
    write_json(bundle / "manifest.json", {
        "sha256": {name: digest(bundle / name) for name in FILES},
        "cutoff": cutoff,
    })


def check_bundle(bundle):
    manifest = read_json(bundle / "manifest.json")
    hashes = {name: digest(bundle / name) for name in FILES}
    if manifest.get("sha256") != hashes:
        raise ValueError("bundle hash mismatch")
    config = read_json(bundle / "configuration.json")
    changed = [key for key, expected in APPROVED.items() if config.get(key) != expected]
    if changed:
        raise ValueError("commissioned identity mismatch for " + ", ".join(changed))
    observed = inspect_file(bundle / "journal.sqlite")
    if manifest.get("cutoff") != observed or observed != BACKUP_CUT:
        raise ValueError("retained history differs from the approved backup cutoff")
    return observed


def demonstrate(work, history, suffix, output):
    work.mkdir()
    rows = csv.writer(output, lineterminator="\n")
    rows.writerow(("check", "decision", "last_recorded_event", "good_serials", "detail"))

    def record(check, decision, state=None, detail=""):
        state = state or {"last_event": "", "parts": []}
        rows.writerow((check, decision, state["last_event"], "|".join(state["parts"]), detail))

    # Put the first good part in the main file. Leave the remaining committed
    # history in the WAL until after the deliberately incomplete copy.
    after_first = next((i for i, row in enumerate(history, start=1)
                        if row["event_id"] == "fixture-302"), None)
    if after_first is None:
        raise ValueError("Initial transcript is missing the fixture-302 checkpoint")
    live_path = work / "live.sqlite"
    bundle = work / "backup"
    bundle.mkdir()
    with closing(open_journal(live_path, create=True)) as live:
        mode = live.execute("PRAGMA journal_mode=WAL").fetchone()[0]
        if mode != "wal":
            raise ValueError("The exercise requires SQLite WAL mode on a local filesystem")
        live.execute("PRAGMA wal_autocheckpoint=0")
        for event in history[:after_first]:
            apply_event(live, event)
        live.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        for event in history[after_first:]:
            apply_event(live, event)

        current = inspect(live)
        if current != BACKUP_CUT:
            raise ValueError(f"Expected the approved history at backup, got {current}")
        record("live_at_backup", "observed", current)
        incomplete = work / "main-file-only.sqlite"
        shutil.copyfile(live_path, incomplete)
        incomplete_cut = inspect_file(incomplete)
        if incomplete_cut != {"last_event": "fixture-302", "parts": ["PART-042"]}:
            raise ValueError(f"Expected the deliberate WAL omission, got {incomplete_cut}")
        record("main_file_only", "hold", incomplete_cut,
               "SQLite integrity passes but committed WAL history is absent")

        write_json(bundle / "configuration.json", APPROVED)
        snapshot_to(live, bundle / "journal.sqlite")
        write_manifest(bundle, current)
        record("sqlite_backup_api", "cutoff_verified", check_bundle(bundle))

        for event in suffix:
            apply_event(live, event)
        current = inspect(live)
        if current != CURRENT_CUT:
            raise ValueError(f"Expected the external current history, got {current}")
        record("live_after_backup", "observed", current)

    wrong = work / "wrong-calibration"
    shutil.copytree(bundle, wrong)
    write_json(wrong / "configuration.json", {
        **APPROVED, "camera_transform": "CAM-CELL3-FIXTURE3-C17",
    })
    for label, expected in (("changed_bytes", "bundle hash mismatch"),
                            ("valid_hash_wrong_release", "commissioned identity mismatch")):
        if label == "valid_hash_wrong_release":
            write_manifest(wrong, BACKUP_CUT)
        try:
            check_bundle(wrong)
        except ValueError as error:
            if not str(error).startswith(expected):
                raise
            record(label, "hold", detail=str(error))
        else:
            raise ValueError(f"Expected the restore gate to hold {label}")

    restored = work / "restored"
    shutil.copytree(bundle, restored)
    restored_cut = check_bundle(restored)
    record("restore_without_suffix", "hold", restored_cut,
           "Verified backup is behind the independent production record")
    with closing(open_journal(restored / "journal.sqlite", create=False)) as recovered:
        for event in suffix:
            apply_event(recovered, event)
        after_one_replay = inspect(recovered)
        repeated = sum(apply_event(recovered, event)[1] for event in suffix)
        final_cut = inspect(recovered)
        if after_one_replay != CURRENT_CUT or final_cut != CURRENT_CUT or repeated != len(suffix):
            raise ValueError("Replay did not reproduce the expected identities and history")
        record("restore_plus_replayed_suffix", "ready_for_offline_checks", final_cut,
               f"All {repeated} repeated deliveries returned stored outcomes")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("work_directory", type=Path, help="New directory for generated artifacts")
    parser.add_argument("initial_events", type=Path)
    parser.add_argument("post_backup_events", type=Path)
    options = parser.parse_args()
    try:
        history = load_events(options.initial_events)
        suffix = load_events(options.post_backup_events)
        demonstrate(options.work_directory, history, suffix, sys.stdout)
    except (OSError, sqlite3.Error, ValueError) as error:
        parser.exit(1, f"Restore drill stopped: {error}\n")


if __name__ == "__main__":
    main()
