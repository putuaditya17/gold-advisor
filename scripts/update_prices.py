#!/usr/bin/env python3
"""Refresh price history. This updater is intentionally fail-closed."""
import json,re,datetime,urllib.request
from pathlib import Path
URL='https://www.ecorp-images.galeri24.co.id/harga-emas'
OUT=Path(__file__).resolve().parents[1]/'data'/'prices.json'

def fetch():
    req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 GoldAdvisor/1.0'})
    with urllib.request.urlopen(req,timeout=20) as r:return r.read().decode('utf-8','ignore')

def rupiah(s):
    m=re.search(r'Rp\s*([0-9\.]+)',s or '')
    return int(m.group(1).replace('.','')) if m else None

def main():
    html=fetch()
    # Look for common Galeri24 1 gram pricing rows around page text.
    clean=re.sub(r'\s+',' ',html)
    sell=None
    patterns=[r'1 gram.{0,500}?Rp\s*([0-9\.]+)',r'1 Gram.{0,500}?Rp\s*([0-9\.]+)']
    for p in patterns:
        m=re.search(p,clean,re.I)
        if m:
            sell=int(m.group(1).replace('.',''));break
    if not sell or sell<500000:return 2
    data=json.loads(OUT.read_text())
    today=datetime.date.today().isoformat()
    rows=data['prices']
    latest=rows[-1] if rows else None
    if latest and latest.get('date')==today:
        latest['sell']=sell
    else:
        rows.append({'date':today,'sell':sell,'buyback':None})
    data['updated_at']=today
    OUT.write_text(json.dumps(data,indent=2))
    return 0

if __name__=='__main__':raise SystemExit(main())
