#!/usr/bin/env python3
"""Fetch one daily Galeri24 1g sell/buyback observation.
Conservative: one request, no login/bypass, no write if parser is uncertain.
"""
from __future__ import annotations
import json,re,sys,time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"data/prices.json"
URL="https://galeri24.co.id/harga-emas/"
UA="GoldAdvisor/1.0 (personal research; low-frequency price snapshot)"

def rupiah_num(text:str):
    m=re.search(r"Rp\s*([0-9.]+)", text.replace("\xa0"," "))
    if not m:return None
    return int(m.group(1).replace('.',''))

def main():
    session=requests.Session(); session.headers.update({"User-Agent":UA,"Accept":"text/html,application/xhtml+xml"})
    r=session.get(URL,timeout=30); r.raise_for_status()
    soup=BeautifulSoup(r.text,"html.parser")
    # Find the GALERI 24 vendor section and its table.
    target=None
    for el in soup.find_all(string=re.compile(r"Harga\s+GALERI\s*24",re.I)):
        target=el.parent
        break
    if target is None: raise RuntimeError("Vendor section GALERI 24 tidak ditemukan")
    table=target.find_next("table")
    if table is None: raise RuntimeError("Tabel harga GALERI 24 tidak ditemukan")
    rowdata=None
    for tr in table.find_all("tr"):
        cells=[c.get_text(" ",strip=True) for c in tr.find_all(["th","td"])]
        if not cells: continue
        if cells[0].replace(',','.') in {"1","1.0"} or re.fullmatch(r"1(?:\.0+)?",cells[0].strip()):
            rowdata=cells; break
    if rowdata is None or len(rowdata)<3: raise RuntimeError("Baris berat 1 gram tidak ditemukan")
    sell=rupiah_num(rowdata[1]); buyback=rupiah_num(rowdata[2])
    if not sell or not buyback: raise RuntimeError("Harga jual/buyback 1g tidak terbaca dengan yakin")
    # Read page update date if present; fallback to UTC date.
    txt=soup.get_text(" ",strip=True)
    m=re.search(r"Diperbarui\s+([^•|]+?)(?:Harga GALERI|Harga DINAR|Harga ANTAM)",txt,re.I)
    obs_date=datetime.now(timezone.utc).date().isoformat()
    payload=json.loads(DATA.read_text(encoding="utf-8"))
    prices=payload.get("prices",[])
    existing=next((p for p in prices if p.get("date")==obs_date),None)
    point={"date":obs_date,"sell":sell,"buyback":buyback,"source_url":URL,"fetched_at":datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')}
    if existing: existing.update(point)
    else: prices.append(point)
    prices=sorted(prices,key=lambda x:x["date"])
    payload["schema_version"]=2; payload["source_url"]=URL; payload["updated_at"]=obs_date; payload["prices"]=prices
    DATA.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Updated {obs_date}: sell={sell} buyback={buyback}")

if __name__=='__main__':
    try: main()
    except Exception as e:
        print(f"Collector stopped safely: {e}",file=sys.stderr); sys.exit(1)
