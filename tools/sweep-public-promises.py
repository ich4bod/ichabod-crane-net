#!/usr/bin/env python3
"""Check every live creation's public URL and declared source promise.

The report is intentionally strict: a source URL must resolve publicly and a
creation's revision must be a full Git SHA, represented by that same SHA in a
GitHub ``/tree/<sha>`` source URL. Missing provenance is reported as a failure,
not silently treated as an unchecked entry.
"""

import argparse
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

import yaml

FULL_SHA = re.compile(r"^[0-9a-f]{40}$")
GITHUB_TREE = re.compile(r"^https://github\.com/[^/]+/[^/]+/tree/([0-9a-f]{40})(?:/|$)")
USER_AGENT = "ichabod-crane-public-promise-sweep/1.0"


def check_url(url: str, timeout: float) -> tuple[bool, str]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT}, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = response.status
            final = response.url
            return 200 <= status < 400, f"HTTP {status} {final}"
    except urllib.error.HTTPError as error:
        return False, f"HTTP {error.code} {error.url}"
    except (urllib.error.URLError, TimeoutError, ValueError) as error:
        return False, f"ERROR {error}"


def source_problem(entry: dict) -> str | None:
    source = entry.get("source")
    revision = entry.get("revision")
    if not isinstance(source, str) or not source:
        return "missing source URL"
    if not isinstance(revision, str) or not FULL_SHA.fullmatch(revision):
        return "missing or non-immutable revision (need a 40-character Git SHA)"
    match = GITHUB_TREE.match(source)
    if not match:
        return "source URL is not a GitHub immutable /tree/<40-character-sha> link"
    if match.group(1) != revision:
        return "source URL revision does not match the declared revision"
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inventory", type=Path)
    parser.add_argument("--timeout", type=float, default=20)
    args = parser.parse_args()
    try:
        entries = yaml.safe_load(args.inventory.read_text())
    except (OSError, yaml.YAMLError) as error:
        print(f"ERROR reading inventory: {error}", file=sys.stderr)
        return 2
    if not isinstance(entries, list):
        print("ERROR: inventory root must be a list", file=sys.stderr)
        return 2

    failures = 0
    checked = 0
    for entry in entries:
        if not isinstance(entry, dict) or entry.get("state") != "live":
            continue
        name = entry.get("name", "unnamed entry")
        checked += 1
        url = entry.get("url")
        if not isinstance(url, str):
            print(f"FAIL {name}: missing public URL")
            failures += 1
        else:
            ok, result = check_url(url, args.timeout)
            print(f"{'OK' if ok else 'FAIL'} {name}: public URL — {result}")
            failures += not ok

        source = entry.get("source")
        if not isinstance(source, str) or not source:
            print(f"FAIL {name}: source URL — missing source URL")
            failures += 1
        else:
            ok, result = check_url(source, args.timeout)
            print(f"{'OK' if ok else 'FAIL'} {name}: source URL — {result}")
            failures += not ok

        problem = source_problem(entry)
        if problem:
            print(f"FAIL {name}: source provenance — {problem}")
            failures += 1

    print(f"SUMMARY: {checked} live entries checked; {failures} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
