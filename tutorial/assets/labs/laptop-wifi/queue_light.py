"""Send a laptop's queue status to the ECE ESP32 queue light."""

import argparse
from pathlib import Path
import secrets
import socket
import time


BOARD_ADDRESS = "192.168.4.1"
BOARD_PORT = 4210
REPLY_TIMEOUT = 1.0
LIGHT_STATES = ("green", "red", "off")


def send_command(connection, command):
    request_id = secrets.token_hex(4)
    connection.settimeout(REPLY_TIMEOUT)
    connection.send(f"{request_id} {command}".encode("ascii"))
    deadline = time.monotonic() + REPLY_TIMEOUT
    while time.monotonic() < deadline:
        connection.settimeout(max(0.001, deadline - time.monotonic()))
        reply = connection.recv(64).decode("ascii", errors="replace")
        reply_id, _, state = reply.partition(" ")
        if reply_id != request_id:
            continue
        if state == "error":
            raise ValueError(f"The ESP32 rejected {command!r}.")
        if state in LIGHT_STATES and (command == "status" or state == command):
            return state
        raise ValueError(f"Unexpected board response for {command!r}.")
    raise TimeoutError("No matching ESP32 acknowledgement.")


def watch_queue(connection, path):
    previous_count = None
    try:
        while True:
            with path.open(encoding="utf-8-sig") as queue:
                pending = sum(1 for line in queue if line.strip())
            command = "red" if pending else "green"
            state = send_command(connection, command)
            if pending != previous_count:
                print(f"{pending} pending · ESP32: {state}", flush=True)
                previous_count = pending
            time.sleep(1)
    finally:
        try:
            send_command(connection, "off")
        except (OSError, ValueError):
            print("No off acknowledgement. The ESP32 will time out.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default=BOARD_ADDRESS, help="ESP32 IP address")
    commands = parser.add_subparsers(dest="action", required=True)
    set_parser = commands.add_parser("set", help="Set one light for up to five seconds")
    set_parser.add_argument("light", choices=LIGHT_STATES)
    commands.add_parser("status", help="Read the board's software output state")
    watch_parser = commands.add_parser("watch", help="Show red for a nonempty job queue")
    watch_parser.add_argument("file", type=Path, help="UTF-8 text, one pending item per line")
    args = parser.parse_args()

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as connection:
            connection.connect((args.host, BOARD_PORT))
            if args.action == "watch":
                watch_queue(connection, args.file)
            else:
                command = args.light if args.action == "set" else "status"
                print(f"ESP32: {send_command(connection, command)}")
    except KeyboardInterrupt:
        return 130
    except (OSError, ValueError) as error:
        parser.exit(1, f"Queue light: {error}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
