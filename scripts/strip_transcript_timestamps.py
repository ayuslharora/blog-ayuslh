#!/usr/bin/env python3
"""Strip tactiq.io timestamp lines (HH:MM:SS.mmm prefixes) from a transcript .txt file.

Usage: python3 scripts/strip_transcript_timestamps.py <path/to/chN.txt>
Writes the cleaned transcript back to the same file in place.
"""

import re
import sys

TIMESTAMP_RE = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}\s*")


def strip_timestamps(text: str) -> str:
    lines = [TIMESTAMP_RE.sub("", line) for line in text.splitlines()]
    return "\n".join(lines) + "\n"


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: strip_transcript_timestamps.py <path/to/chN.txt>", file=sys.stderr)
        sys.exit(1)

    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    with open(path, "w", encoding="utf-8") as f:
        f.write(strip_timestamps(content))

    print(f"Stripped timestamps in {path}")


if __name__ == "__main__":
    main()
