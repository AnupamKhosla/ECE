"""Replay synthetic station evidence against a local SQLite database."""

import argparse
from contextlib import closing
import csv
import json
import os
from pathlib import Path
import sqlite3
import sys


EVENT_SOURCE = {
    "register": "plc",
    "inspection_good": "camera",
    "placement_proved": "fixture",
    "result_good": "robot",
    "link_lost": "plc",
    "reviewed": "operator",
}
EVIDENCE_COLUMN = {
    "inspection_good": "inspection_event",
    "placement_proved": "placement_event",
    "result_good": "result_event",
}
CSV_FIELDS = ["event_id", "source", "kind", "job", "part", "recipe", "generation", "source_ms"]


def open_journal(path, create):
    uri = Path(path).resolve().as_uri() + ("?mode=rwc" if create else "?mode=rw")
    db = sqlite3.connect(uri, uri=True, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("PRAGMA synchronous = EXTRA")
    if create:
        db.executescript("""
        BEGIN IMMEDIATE;
        CREATE TABLE IF NOT EXISTS events (
            event_id TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            decision TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS jobs (
            job TEXT PRIMARY KEY,
            part TEXT NOT NULL,
            recipe TEXT NOT NULL,
            generation INTEGER NOT NULL,
            phase TEXT NOT NULL CHECK(phase IN ('open', 'hold', 'duplicate_part', 'complete')),
            inspection_event TEXT REFERENCES events(event_id),
            placement_event TEXT REFERENCES events(event_id),
            result_event TEXT REFERENCES events(event_id)
        );
        CREATE TABLE IF NOT EXISTS good_parts (
            part TEXT PRIMARY KEY,
            job TEXT NOT NULL UNIQUE REFERENCES jobs(job),
            inspection_event TEXT NOT NULL REFERENCES events(event_id),
            placement_event TEXT NOT NULL REFERENCES events(event_id),
            result_event TEXT NOT NULL REFERENCES events(event_id)
        );
        COMMIT;
        """)
    return db


def read_events(stream):
    reader = csv.DictReader(stream)
    if reader.fieldnames != CSV_FIELDS:
        raise ValueError("Unexpected CSV headings")
    for row in reader:
        if None in row or any(not value or not value.strip() for value in row.values()):
            raise ValueError(f"Missing or extra field at CSV line {reader.line_num}")
        event = {key: row[key].strip() for key in CSV_FIELDS}
        event["generation"] = int(event["generation"])
        event["source_ms"] = int(event["source_ms"])
        if event["generation"] < 1 or event["source_ms"] < 0:
            raise ValueError(f"Invalid generation or timestamp at CSV line {reader.line_num}")
        yield event


def advance_job(db, event):
    source, kind = event["source"], event["kind"]
    job, part, recipe = event["job"], event["part"], event["recipe"]
    generation = event["generation"]
    if EVENT_SOURCE.get(kind) != source:
        return "reject_source"

    current = db.execute("SELECT * FROM jobs WHERE job = ?", (job,)).fetchone()
    if current and (part, recipe) != (current["part"], current["recipe"]):
        return "reject_identity"
    if kind == "register":
        if current:
            return "already_registered"
        if generation != 1:
            return "reject_generation"
        db.execute("INSERT INTO jobs(job, part, recipe, generation, phase) VALUES (?, ?, ?, 1, 'open')",
                   (job, part, recipe))
        return "registered"
    if current is None:
        return "reject_unknown_job"
    if generation != current["generation"]:
        return "reject_generation"
    if current["phase"] in ("complete", "duplicate_part"):
        return "already_final"

    if kind == "link_lost":
        db.execute("""
            UPDATE jobs SET phase = 'hold', inspection_event = NULL,
                placement_event = NULL, result_event = NULL WHERE job = ?
        """, (job,))
        return "hold_for_review"
    if kind == "reviewed":
        if current["phase"] != "hold":
            return "review_not_required"
        db.execute("UPDATE jobs SET phase = 'open', generation = generation + 1 WHERE job = ?", (job,))
        return "reviewed_require_new_evidence"
    if current["phase"] == "hold":
        return "held_for_review"

    column = EVIDENCE_COLUMN[kind]
    db.execute(f"UPDATE jobs SET {column} = COALESCE({column}, ?) WHERE job = ?", (event["event_id"], job))
    evidence = db.execute("""
        SELECT inspection_event, placement_event, result_event FROM jobs WHERE job = ?
    """, (job,)).fetchone()
    if not all(evidence):
        return "evidence_saved"

    if db.execute("SELECT 1 FROM good_parts WHERE part = ?", (part,)).fetchone():
        db.execute("UPDATE jobs SET phase = 'duplicate_part' WHERE job = ?", (job,))
        return "hold_part_already_counted"
    db.execute("INSERT INTO good_parts VALUES (?, ?, ?, ?, ?)", (part, job, *evidence))
    db.execute("UPDATE jobs SET phase = 'complete' WHERE job = ?", (job,))
    return "committed_good_part"


def apply_event(db, event, crash_stage=None):
    event_id = event["event_id"]
    payload = json.dumps(event, sort_keys=True)
    with db:
        # Serialize writers before checking whether this event is already recorded.
        db.execute("BEGIN IMMEDIATE")
        previous = db.execute("SELECT payload, decision FROM events WHERE event_id = ?", (event_id,)).fetchone()
        if previous:
            if previous["payload"] != payload:
                raise ValueError(f"Event ID {event_id} was reused with different data")
            return previous["decision"], True

        db.execute("INSERT INTO events VALUES (?, ?, 'pending')", (event_id, payload))
        decision = advance_job(db, event)
        db.execute("UPDATE events SET decision = ? WHERE event_id = ?", (decision, event_id))
        if crash_stage == "before-commit":
            print(f"Simulated process exit before committing {event_id}", file=sys.stderr, flush=True)
            os._exit(90)
    if crash_stage == "after-commit":
        print(f"Simulated process exit after committing {event_id}, before replying", file=sys.stderr, flush=True)
        os._exit(91)
    return decision, False


def report(db):
    with db:
        db.execute("BEGIN")
        good_parts = [dict(row) for row in db.execute("SELECT * FROM good_parts ORDER BY part")]
        jobs = [dict(row) for row in db.execute("SELECT job, part, recipe, generation, phase FROM jobs ORDER BY job")]
        decisions = dict(db.execute("SELECT decision, COUNT(*) FROM events GROUP BY decision ORDER BY decision"))
    print(json.dumps({"good_count": len(good_parts), "good_parts": good_parts,
                      "jobs": jobs, "event_decisions": decisions}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    apply = commands.add_parser("apply", help="Apply a CSV of synthetic events")
    apply.add_argument("database")
    apply.add_argument("events")
    apply.add_argument("--crash-event")
    apply.add_argument("--crash-stage", choices=("before-commit", "after-commit"))
    commands.add_parser("report", help="Read the retained station history").add_argument("database")
    args = parser.parse_args()
    if args.command == "apply" and bool(args.crash_event) != bool(args.crash_stage):
        parser.error("--crash-event and --crash-stage are used together")

    try:
        with closing(open_journal(args.database, create=args.command == "apply")) as db:
            if args.command == "report":
                report(db)
            else:
                with open(args.events, encoding="utf-8", newline="") as source:
                    for event in read_events(source):
                        stage = args.crash_stage if event["event_id"] == args.crash_event else None
                        decision, repeated = apply_event(db, event, stage)
                        marker = " (replayed)" if repeated else ""
                        print(f"{event['event_id']} {decision}{marker}", flush=True)
    except (OSError, sqlite3.Error, ValueError) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
