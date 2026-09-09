import datetime as dt, json, os, re, sys
from pathlib import Path
import requests
from bs4 import BeautifulSoup

OUT=Path('data/prices.json')
HEADERS={'User-Agent':'Mozilla/5.0 (GoldAdvisor daily updater; GitHub Actions)'}
SOURCES=[
 ('Galeri24 official', 'https://galeri24.co.id/harga-emas'),
 ('Galeri24 official static', 'https://www.ecorp-images.galeri24.co.id/harga-emas'),
]

def money(s):
    return int(re.sub(r'[^0-9]','',s))

def parse(text):
    soup=BeautifulSoup(text,'html.parser')
    flat=' '.join(soup.stripped_strings)
    # First match for the Galeri24 1 gram row. We intentionally require both a 1g marker and a rupiah value.
    patterns=[
      r'GALERI 24\s+Berat\s+Harga Jual\s+Harga Buyback\s+0\.5\s+Rp[0-9.]+\s+Rp[0-9.]+\s+1\s+Rp([0-9.]+)\s+Rp([0-9.]+)',
      r'Harga GALERI 24.*?0\.5\s+Rp[0-9.]+\s+Rp[0-9.]+.*?1\s+Rp([0-9.]+)\s+Rp([0-9.]+)'
    ]
    for p in patterns:
        m=re.search(p,flat,re.I|re.S)
        if m:return money(m.group(1)),money(m.group(2))
    raise ValueError('Galeri24 1g row not found')

def main():
    today=dt.date.today().isoformat(); errors=[]; result=None; source_used=None
    for name,url in SOURCES:
        try:
            r=requests.get(url,headers=HEADERS,timeout=30); r.raise_for_status(); result=parse(r.text); source_used=name; break
        except Exception as e: errors.append(f'{name}: {e}')
    if result is None:
        print('\n'.join(errors), file=sys.stderr); raise SystemExit(1)
    price,buyback=result
    data=json.loads(OUT.read_text()) if OUT.exists() else []
    row={'date':today,'price':price,'buyback':buyback,'note':f'Automatic daily fetch • {source_used}'}
    if data and data[-1].get('date')==today:data[-1]=row
    else:data.append(row)
    data.sort(key=lambda x:x.get('date',''))
    OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f'updated {today}: {price=} {buyback=} source={source_used}')
if __name__=='__main__':main()
