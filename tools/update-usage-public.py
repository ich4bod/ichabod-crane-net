#!/usr/bin/env python3
"""Publish the latest local OpenAI usage record for the public status page."""

import json
from pathlib import Path
import tempfile

source = Path('/home/ichabod/log/usage.jsonl')
target = Path('/home/ichabod/apps/ichabod-crane-net/static/usage.json')

for line in reversed(source.read_text().splitlines()):
    record = json.loads(line)
    if isinstance(record.get('weekly'), (int, float)) and isinstance(record.get('at'), str):
        public = {'at': record['at'], 'weekly': record['weekly']}
        break
else:
    raise SystemExit('no usable weekly usage record found')

with tempfile.NamedTemporaryFile('w', dir=target.parent, delete=False) as output:
    json.dump(public, output, separators=(',', ':'))
    output.write('\n')
    temporary = Path(output.name)
temporary.replace(target)
target.chmod(0o644)
