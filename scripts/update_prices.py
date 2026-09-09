import json, re
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from pathlib import Path

URL='https://galeri24.co.id/harga-emas'
OUT=Path(__file__).resolve().parents[1]/'data/prices.json'

def fetch():
    req=Request(URL,headers={'User-Agent':'Mozilla/5.0 (GoldAdvisor bot)'})
    with urlopen(req,timeout=30) as r:
        return r.read().decode('utf-8','ignore')

def parse(html):
    text=re.sub(r'<[^>]+>',' ',html)
    text=re.sub(r'\s+',' ',text)
    # Target the first Galeri 24 1 gram row. Currency separators are stripped.
    patterns=[
        r'GALERI 24.*?Berat.*?Harga Jual.*?Harga Buyback.*?0\.5.*?Rp\s*([\d\.]+).*?Rp\s*([\d\.]+).*?1\s*Rp\s*([\d\.]+).*?Rp\s*([\d\.]+)',
        r'GALERI 24.*?1\s*Rp\s*([\d\.]+).*?Rp\s*([\d\.]+)'
    ]
    for p in patterns:
        m=re.search(p,text,re.I)
        if m:
            if len(m.groups())==4:
                return int(m.group(3).replace('.','')),int(m.group(4).replace('.',''))
            return int(m.group(1).replace('.','')),int(m.group(2).replace('.',''))
    raise RuntimeError('Could not confidently parse Galeri24 1g sell/buyback price')

def main():
    sell,buyback=parse(fetch())
    data=json.loads(OUT.read_text())
    today=datetime.now(timezone.utc).astimezone().strftime('%Y-%m-%d')
    data=[x for x in data if x.get('date')!=today]
    data.append({'date':today,'sell':sell,'buyback':buyback,'source':'Galeri24 official automated update'})
    data=sorted(data,key=lambda x:x['date'])
    OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f'{today}: sell={sell}, buyback={buyback}')

if __name__=='__main__':
    main()
