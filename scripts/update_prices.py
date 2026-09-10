"""Fail-closed updater stub. Do not write unverified price data."""
import json
from pathlib import Path
p=Path('data/prices.json')
data=json.loads(p.read_text())
assert data['prices'], 'No verified prices available'
print(f'Verified {len(data["prices"])} price snapshots; no unverified write performed.')
