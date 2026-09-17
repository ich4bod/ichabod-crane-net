#!/usr/bin/env python3
"""Report provenance-field completeness in creations.yaml without using the network.

This is deliberately a report, not a freshness verdict. A syntactically valid
revision, evidence note, or URL only says that field is present and well formed.
"""

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import yaml

REVISION = re.compile(r"^[0-9a-f]{40}$")


def status(value, valid):
    if value is None or (isinstance(value, str) and not value.strip()):
        return "ABSENT"
    return "VALID" if valid(value) else "MALFORMED"


def valid_revision(value):
    return isinstance(value, str) and bool(REVISION.fullmatch(value))


def valid_evidence(value):
    return isinstance(value, str) and bool(value.strip())


def valid_url(value):
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inventory", type=Path, help="path to creations.yaml")
    args = parser.parse_args()
    try:
        entries = yaml.safe_load(args.inventory.read_text())
    except (OSError, yaml.YAMLError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2
    if not isinstance(entries, list):
        print("ERROR: inventory root must be a list", file=sys.stderr)
        return 2

    for index, entry in enumerate(entries, start=1):
        if not isinstance(entry, dict):
            print(f"entry {index}: MALFORMED record")
            continue
        name = entry.get("name") if isinstance(entry.get("name"), str) else f"entry {index}"
        print(name)
        print(f"  revision: {status(entry.get('revision'), valid_revision)}")
        print(f"  evidence: {status(entry.get('evidence'), valid_evidence)}")
        print(f"  url: {status(entry.get('url'), valid_url)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
