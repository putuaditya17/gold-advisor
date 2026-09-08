import os, re, json, datetime, requests
from bs4 import BeautifulSoup
URL=os.environ.get('PRICE_SOURCE_URL','https://pegadaian.co.id/harga-emas')
path='data/prices.json'
r=requests.get(URL,timeout=30,headers={'User-Agent':'Mozilla/5.0'})
r.raise_for_status()
html=r.text
text=BeautifulSoup(html,'html.parser').get_text(' ',strip=True)
# Pegadaian page is dynamic; exact selectors may change. This script intentionally fails rather than writing guessed data.
# Search common currency patterns around Galeri24; customize selectors here after inspecting the live DOM/JSON feed.
patterns=[r'Galeri24.{0,250}?1\s*gram.{0,80}?Rp\s*([0-9.]+)',r'1\s*gram.{0,80}?Rp\s*([0-9.]+).{0,200}?Galeri24']
price=None
for p in patterns:
    m=re.search(p,text,re.I|re.S)
    if m:
        price=int(m.group(1).replace('.',''));break
if price is None:
    raise SystemExit('Could not safely extract a Galeri24 1g price from the current Pegadaian page. Inspect the live page/API and update this parser; no data was written.')
with open(path) as f: data=json.load(f)
date=datetime.date.today().isoformat()
if data and data[-1]['date']==date:
    data[-1]['price']=price
else:
    data.append({'date':date,'price':price,'buyback':None,'note':'Automatic daily fetch; verify buyback feed if available.'})
with open(path,'w') as f: json.dump(data,f,ensure_ascii=False,indent=2)
print('updated',date,price)
