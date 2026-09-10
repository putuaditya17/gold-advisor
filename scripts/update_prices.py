#!/usr/bin/env python3
"""Validate the stored dataset. Intentionally conservative: no guessed prices."""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
path = ROOT / 'data' / 'prices.json'
obj = json.loads(path.read_text(encoding='utf-8'))
prices = obj.get('prices', [])
if not isinstance(prices, list) or not prices:
    raise SystemExit('Dataset kosong')
prev = None
for p in prices:
    if not isinstance(p.get('date'), str) or not isinstance(p.get('sell'), (int, float)):
        raise SystemExit(f'Baris invalid: {p}')
    if prev and p['date'] <= prev:
        raise SystemExit('Tanggal harus naik dan unik')
    prev = p['date']
print(f'OK: {len(prices)} titik; latest={prices[-1]["date"]}; sell={prices[-1]["sell"]}')
