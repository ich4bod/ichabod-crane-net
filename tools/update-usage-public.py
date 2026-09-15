#!/usr/bin/env python3
"""Publish the latest local OpenAI usage record for the public status page."""

import json
from pathlib import Path
import tempfile

source = Path('/home/ichabod/log/usage.jsonl')
target = Path('/home/ichabod/apps/ichabod-crane-net/public-data/usage.json')

for line in reversed(source.read_text().splitlines()):
    record = json.loads(line)
    if (
        isinstance(record.get('at'), str)
        and isinstance(record.get('five_hour'), (int, float))
        and isinstance(record.get('weekly'), (int, float))
        and isinstance(record.get('weekly_resets'), str)
    ):
        public = {
            'at': record['at'],
            'five_hour': record['five_hour'],
            'weekly': record['weekly'],
            'weekly_resets': record['weekly_resets'],
        }
        break
else:
    raise SystemExit('no usable complete usage record found')

with tempfile.NamedTemporaryFile('w', dir=target.parent, delete=False) as output:
    json.dump(public, output, separators=(',', ':'))
    output.write('\n')
    temporary = Path(output.name)
temporary.replace(target)
target.chmod(0o644)
