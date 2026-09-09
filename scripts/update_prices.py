import json, re, urllib.request
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'prices.json'
URL='https://pegadaian.co.id/harga-emas'

req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 GoldAdvisor/3.0'})
html=urllib.request.urlopen(req,timeout=30).read().decode('utf-8','ignore')
text=re.sub(r'\\s+',' ',html)
# Do not guess. Search several explicit representations for Galeri24 1 gram.
patterns=[
    r'Galeri24.{0,700}?1\\s*gram.{0,700}?Rp\\s*([0-9][0-9\\.]*)',
    r'1\\s*gram.{0,700}?Galeri24.{0,700}?Rp\\s*([0-9][0-9\\.]*)',
    r'Galeri24.{0,700}?1\\s*gram.{0,700}?([0-9]{1,3}(?:\\.[0-9]{3}){2,})'
]
price=None
for pat in patterns:
    m=re.search(pat,text,re.I)
    if m:
        val=int(m.group(1).replace('.',''))
        if 500_000 <= val <= 10_000_000:
            price=val; break
if price is None:
    raise SystemExit('No confident Galeri24 1 gram price found; refusing to write unverified data.')

data=json.loads(OUT.read_text())
entry={'date':str(date.today()),'sell':price,'buyback':None}
prices=[p for p in data.get('prices',[]) if p.get('date')!=entry['date']]
prices.append(entry)
data['prices']=sorted(prices,key=lambda x:x['date'])[-366:]
data['updated_at']=entry['date']
data['source']='Pegadaian price page (automation feed)'
OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'Updated {entry["date"]}: Rp{price:,}')
