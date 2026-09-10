(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const rupiah = (n) => n == null || !Number.isFinite(Number(n)) ? '—' : new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)).replace('Rp ','Rp ');
  const pct = (n) => n == null || !Number.isFinite(Number(n)) ? '—' : `${n>=0?'+':''}${Number(n).toFixed(2)}%`;
  const dateFmt = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));
  let db = null, A = null, selectedPeriod = 365;

  // Embedded fallback means the site still renders useful data even if GitHub Pages
  // temporarily fails to fetch /data/prices.json. The daily workflow keeps JSON fresh.
  const EMBEDDED = window.GOLD_ADVISOR_DATA || null;

  function setText(id, value){ const el = document.getElementById(id); if(el) el.textContent = value; }
  function setHTML(id, value){ const el = document.getElementById(id); if(el) el.innerHTML = value; }
  function validPoint(p){ return p && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Number.isFinite(Number(p.sell)); }
  function normalize(x){
    const prices = Array.isArray(x?.prices) ? x.prices.filter(validPoint).map(p=>({date:p.date,sell:Number(p.sell),buyback:Number.isFinite(Number(p.buyback))?Number(p.buyback):null})) : [];
    prices.sort((a,b)=>a.date.localeCompare(b.date));
    if(!prices.length) throw new Error('Dataset kosong atau format tidak valid');
    return {asset:x.asset||'Galeri24 1 gram', source:x.source||'Gold Advisor', updated_at:x.updated_at||'', prices};
  }
  function findAtOrBefore(arr,date,days){
    const target = new Date(`${date}T00:00:00`); target.setDate(target.getDate()-days);
    let best = null;
    for(const p of arr){ if(new Date(`${p.date}T00:00:00`) <= target) best=p; else break; }
    return best;
  }
  function pctFromDate(arr,last,days){ const ref=findAtOrBefore(arr,last.date,days); return ref ? (last.sell/ref.sell-1)*100 : null; }
  function calc(prices){
    const sells=prices.map(p=>p.sell).filter(Number.isFinite); const last=prices[prices.length-1];
    const sell=last.sell; const peak=Math.max(...sells); const low=Math.min(...sells);
    const peakPoint=prices.find(p=>p.sell===peak), lowPoint=prices.find(p=>p.sell===low);
    const dd=(sell/peak-1)*100;
    const m7=pctFromDate(prices,last,7),m30=pctFromDate(prices,last,30),m90=pctFromDate(prices,last,90),yoy=pctFromDate(prices,last,365);
    const prior=prices.length>1?prices[prices.length-2]:null;
    const step=prior?(sell/prior.sell-1)*100:null;
    const buyback=last.buyback;
    const spread=buyback?((sell-buyback)/sell)*100:null;
    const be=buyback?((sell/buyback)-1)*100:null;
    const drawScore=dd<=-30?25:dd<=-25?22:dd<=-20?18:dd<=-15?13:dd<=-10?8:dd<=-5?4:0;
    const momScore=(m30==null?3:(m30<0?9:m30<2?4:m30>8?-7:0))+(m7==null?1:(m7<0?4:m7>4?-3:0));
    const trendScore=yoy==null?3:(yoy>20?5:yoy>10?3:yoy>0?1:-4);
    const spreadScore=spread==null?0:(spread<=4?3:spread<=6?1:-2);
    const dataConf=clamp(Math.round(Math.min(100,(prices.length/60)*100)),15,100);
    const score=clamp(Math.round(50+drawScore+momScore+trendScore+spreadScore),0,100);
    const label=score>=80?'STRONG BUY':score>=65?'BUY / ACCUMULATE':score>=50?'WATCH / STAGGER':'WAIT';
    const alloc=score>=85?50:score>=75?40:score>=65?25:score>=55?15:0;
    const zones={starter:Math.round(peak*.80),aggressive:Math.round(peak*.75),extreme:Math.round(peak*.68)};
    const next=sell<=zones.aggressive?zones.extreme:zones.aggressive;
    const confidence=Math.round(dataConf*.65+Math.min(100,prices.length/30*100)*.35);
    return {last,sell,peak,low,peakPoint,lowPoint,dd,m7,m30,m90,yoy,step,buyback,spread,be,score,label,alloc,zones,next,confidence,dataConf,drawScore,momScore,trendScore,spreadScore};
  }
  function allocationText(){
    return A.score>=80?'Momentum dan posisi harga mendukung akumulasi, tetapi tetap bertahap.':A.score>=65?'Kondisinya cukup menarik untuk mulai akumulasi, tetapi belum alasan untuk all-in.':A.score>=50?'Belum cukup kuat untuk agresif. Simpan porsi terbesar untuk level yang lebih menarik.':'Belum ada margin of safety yang cukup. Lebih baik menunggu.';
  }
  function updateDashboard(){
    const l=A.last; setText('heroDate',dateFmt(l.date)); setText('topUpdated',`Update ${dateFmt(l.date)}`); setText('sourceLabel',A.sourceLabel||'Sumber: dataset Gold Advisor');
    setText('price',rupiah(A.sell)); setText('buybackDash',rupiah(A.buyback)); setText('todayMove',pct(A.step));
    const pill=$('#todayMove'); if(pill) pill.className='trend-pill '+(A.step!=null&&A.step>0?'up':'down');
    setHTML('miniNote',`<b>${dateFmt(l.date)}</b> · ${A.step==null?'Belum ada titik pembanding sebelumnya.':`harga ${A.step<0?'turun':'naik'} ${Math.abs(A.step).toFixed(2)}% dari titik sebelumnya.`}`);
    setText('score',A.score); setText('scoreBadge',A.label); setText('decisionHeadline',A.label); setText('decisionText',allocationText());
    const fill=$('#scoreMeterFill'); if(fill) fill.style.width=`${A.score}%`;
    setText('allocPct',`${A.alloc}%`); setText('allocationReason',allocationText()); setText('actionLabel',A.alloc===0?'TUNGGU':`${A.alloc}% SEKARANG`);
    setText('allocExample',rupiah(5000000*A.alloc/100)); setText('allocGram',`${(5000000*A.alloc/100/A.sell).toFixed(3)} g`);
    setText('quickDd',pct(A.dd)); setText('quick30',pct(A.m30)); setText('quickYoy',pct(A.yoy)); setText('quickSpread',pct(A.spread));
    setText('insightCorrection',`Sekarang ${Math.abs(A.dd).toFixed(1)}% di bawah peak ${rupiah(A.peak)}.`);
    setText('insightMomentum',A.m30==null?'Data 30 hari belum cukup pada dataset ini.':`30 hari: ${pct(A.m30)}${A.m30<0?' · masih koreksi':' · masih menguat'}.`);
    setText('insightSpread',A.spread==null?'Buyback belum tersedia pada snapshot terakhir.':`Spread jual–buyback sekitar ${A.spread.toFixed(2)}%; harga perlu naik untuk impas.`);
    const ladder=[['starter','Cicil',A.zones.starter,'Mulai'],['aggressive','Agresif',A.zones.aggressive,'Tambah'],['extreme','Ekstrem',A.zones.extreme,'Tambah banyak']];
    setHTML('ladderRows',ladder.map(([cls,label,price,act])=>`<div class="ladder-row"><span class="ladder-badge ${cls}">${label}</span><div><b>${rupiah(price)}</b><span>${act} saat harga menyentuh area ini</span></div><b>${price<=A.sell?'sudah lewat':'+'}</b></div>`).join(''));
  }
  function drawMini(){ const el=$('#miniChart'); if(el) drawChart(el,db.prices.slice(-12),true,'#3e68ff','#f0f4ff','#152338'); }
  function drawChart(svg,subset,mini=false,lineColor='#2764ff',areaColor='#edf3ff'){
    if(!svg||!subset.length) return;
    const W=mini?700:1200,H=mini?180:520,p=mini?24:60; const vals=subset.map(x=>x.sell); const min=Math.min(...vals),max=Math.max(...vals),range=(max-min)||1;
    const sx=(W-2*p)/Math.max(vals.length-1,1),sy=(H-2*p)/range; const pts=vals.map((v,i)=>[p+i*sx,H-p-(v-min)*sy]);
    const path=pts.map((q,i)=>(i?'L':'M')+q[0]+','+q[1]).join(' '); let html='';
    if(!mini){for(let i=0;i<5;i++){const y=p+i*(H-2*p)/4,v=Math.round(max-range*i/4);html+=`<line x1="${p}" x2="${W-p}" y1="${y}" y2="${y}" stroke="#e8edf5"/><text x="8" y="${y+4}" fill="#7f8da0" font-size="12">${rupiah(v)}</text>`;}}
    const area=`M ${p} ${H-p} ${pts.map(q=>q.join(' ')).join(' L ')} L ${pts[pts.length-1][0]} ${H-p} Z`;
    html+=`<path d="${area}" fill="${areaColor}" opacity=".95"/><path d="${path}" fill="none" stroke="${lineColor}" stroke-width="${mini?4:5}" stroke-linecap="round" stroke-linejoin="round"/>`;
    pts.forEach((q,i)=>{const d=subset[i];html+=`<circle class="data-point" data-i="${i}" cx="${q[0]}" cy="${q[1]}" r="${mini?4.5:6}" fill="#fff" stroke="${lineColor}" stroke-width="${mini?3:4}" tabindex="0"><title>${dateFmt(d.date)} · ${rupiah(d.sell)}${d.buyback!=null?' · Buyback '+rupiah(d.buyback):''}</title></circle>`;});
    const pi=vals.indexOf(max),q=pts[pi]; if(!mini) html+=`<circle cx="${q[0]}" cy="${q[1]}" r="8" fill="#f3ae26"/><text x="${Math.min(q[0]+12,W-220)}" y="${Math.max(24,q[1]-14)}" fill="#a96e00" font-size="12" font-weight="800">Peak ${rupiah(max)}</text>`;
    if(!mini){const labels=[0,Math.floor((subset.length-1)/2),subset.length-1]; labels.forEach((i,j)=>html+=`<text x="${pts[i][0]}" y="${H-14}" text-anchor="${j===0?'start':j===2?'end':'middle'}" fill="#7f8da0" font-size="12">${dateFmt(subset[i].date)}</text>`);}
    svg.innerHTML=html;
  }
  function chartData(period){
    const cutoff=new Date(`${A.last.date}T00:00:00`); cutoff.setDate(cutoff.getDate()-period);
    const subset=db.prices.filter(p=>new Date(`${p.date}T00:00:00`)>=cutoff); return subset.length?subset:db.prices.slice(Math.max(0,db.prices.length-8));
  }
  function showTip(pt,mini){
    const target=$(mini?'#miniTip':'#mainTooltip'); if(!target) return;
    const idx=Number(pt.dataset.i); const subset=mini?db.prices.slice(-12):chartData(selectedPeriod); const d=subset[idx]; if(!d)return;
    const prev=idx>0?subset[idx-1]:null; const delta=prev?((d.sell/prev.sell)-1)*100:null;
    target.innerHTML=`<b>${dateFmt(d.date)}</b><br><strong>Harga jual</strong> ${rupiah(d.sell)}<br><strong>Buyback</strong> ${d.buyback==null?'Belum tersedia':rupiah(d.buyback)}${delta==null?'':`<br><strong>Perubahan</strong> ${pct(delta)}`}`;
    target.hidden=false; target.style.left='16px'; target.style.top='16px';
  }
  function bindChartTooltips(){
    const bind=(selector,mini)=>$$(`${selector} .data-point`).forEach(pt=>{pt.addEventListener('pointerenter',()=>showTip(pt,mini));pt.addEventListener('focus',()=>showTip(pt,mini));pt.addEventListener('click',()=>showTip(pt,mini));});
    bind('#mainChart',false); bind('#miniChart',true);
  }
  function renderMarket(period=365){
    selectedPeriod=period; const subset=chartData(period); drawChart($('#mainChart'),subset,false); bindChartTooltips();
    $$('#periodTabs button').forEach(b=>b.classList.toggle('active',Number(b.dataset.period)===period));
    setText('chartTitle',period>=365?'Pergerakan 1 tahun':`Pergerakan ${period} hari`);
    setText('marketCurrent',rupiah(A.sell)); setText('marketDate',dateFmt(A.last.date)); setText('peak',rupiah(A.peak)); setText('peakDate',dateFmt(A.peakPoint.date)); setText('trough',rupiah(A.low)); setText('troughDate',dateFmt(A.lowPoint.date)); setText('marketDd',pct(A.dd)); setText('historyCount',`${db.prices.length} snapshot`);
    const ref=period>=365?A.yoy:period>=90?A.m90:A.m30;
    const trend=ref==null?'data belum cukup untuk membandingkan periode kalender':`${ref<0?'turun':'naik'} ${Math.abs(ref).toFixed(2)}% dari titik pembanding periode ini`;
    setHTML('chartReading',`<b>${dateFmt(A.last.date)}:</b> harga jual ${rupiah(A.sell)}. Harga berada <b>${Math.abs(A.dd).toFixed(1)}%</b> di bawah peak dan ${trend}. <br>${A.m30==null?'Snapshot historis belum harian penuh, jadi momentum 7/30/90 hari memiliki confidence terbatas.':A.m30<0?'Data terbaru masih menunjukkan koreksi.':'Data terbaru menunjukkan tekanan koreksi mulai mereda.'}`);
    setHTML('historyRows',[...db.prices].reverse().map((d,i,arr)=>{const prev=arr[i+1];const delta=prev?((d.sell/prev.sell)-1)*100:null;const status=delta==null?'Baseline':delta<0?'Turun':'Naik';return `<tr><td>${dateFmt(d.date)}</td><td>${rupiah(d.sell)}</td><td>${rupiah(d.buyback)}</td><td class="${delta<0?'change-down':'change-up'}">${pct(delta)}</td><td><span class="status-pill">${status}</span></td></tr>`}).join(''));
  }
  function updateDecision(){
    setText('decisionChip',A.label);setText('bigSignal',A.label);setText('bigSignalText',allocationText());setText('dScore',A.score);setText('dConfidence',`${A.confidence}%`);setText('dBuy',rupiah(A.sell));setText('dBb',rupiah(A.buyback));setText('dSpread',pct(A.spread));setText('dBe',A.buyback?rupiah(Math.round(A.sell*(1+A.be/100))):'—');
    setText('beText',A.buyback?`Dari harga beli ${rupiah(A.sell)}, buyback terakhir ${rupiah(A.buyback)}. Harga perlu naik sekitar ${A.be.toFixed(2)}% untuk menyamai buyback saat ini.`:'Buyback belum tersedia pada snapshot terakhir.');
    const factors=[['Koreksi',clamp(Math.round(50+A.drawScore*2),0,100),`Drawdown ${A.dd.toFixed(1)}% dari peak.`],['Momentum',clamp(50+A.momScore*4,0,100),A.m30==null?'Data 30 hari belum cukup.':`30 hari ${pct(A.m30)}.`],['Tren 1 tahun',clamp(50+A.trendScore*7,0,100),A.yoy==null?'Data 1 tahun belum cukup.':`Perubahan 1 tahun ${pct(A.yoy)}.`],['Spread',clamp(50+A.spreadScore*10,0,100),A.spread==null?'Buyback belum tersedia.':`Spread ${A.spread.toFixed(2)}%.`]];
    setHTML('factorGrid',factors.map(([n,s,t])=>`<article class="factor-card"><div class="factor-top"><b>${n}</b><span class="factor-score">${s}</span></div><div class="factor-bar"><div class="factor-fill" style="width:${s}%"></div></div><p>${t}</p></article>`).join(''));
    const scenarios=[['Jika turun 5%',A.sell*.95],['Jika turun 10%',A.sell*.90],['Jika kembali ke peak',A.peak],['Entry agresif',A.zones.aggressive]];
    setHTML('scenarioBoxes',scenarios.map(([l,v])=>`<div class="scenario-box"><span>${l}</span><b>${rupiah(Math.round(v))}</b></div>`).join(''));
  }
  function updateSimulator(){
    const budget=Math.max(0,Number($('#budget')?.value)||0), alloc=Math.max(0,Number($('#allocInput')?.value)||0); setText('allocValue',`${alloc}%`);setText('engineAlloc',`${A.alloc}%`);
    const now=budget*alloc/100,grams=A.sell?now/A.sell:0; setText('simHeadline',alloc===0?'Tahan dana untuk level berikutnya':`Beli ${rupiah(now)} sekarang`);
    setText('simText',alloc===A.alloc?`Ini sesuai porsi engine saat ini. Sisa dana menunggu area ${rupiah(A.zones.aggressive)} dan ${rupiah(A.zones.extreme)}.`:'Porsi kamu berbeda dari engine; slider dapat dipakai untuk menguji skenario.');
    setText('simNow',rupiah(now));setText('simGram',`${grams.toFixed(3)} g`);setText('simRemain',rupiah(budget-now));
    const rows=[{name:'Sekarang',price:A.sell,pct:alloc},{name:'Tambah 1',price:A.zones.aggressive,pct:Math.min(100-alloc,30)},{name:'Tambah 2',price:A.zones.extreme,pct:Math.max(0,100-alloc-Math.min(100-alloc,30))}];
    setHTML('planRows',rows.map((r,i)=>`<div class="plan-row"><span class="plan-step">${i===0?'MASUK':i===1?'TAMBAH':'CADANGAN'}</span><div><b>${rupiah(r.price)}</b><span>${r.name}</span></div><span>${r.pct}% budget</span><b>${rupiah(budget*r.pct/100)}</b></div>`).join(''));
  }
  function updateMethod(){ setText('methodDataNote',`Dataset berisi ${db.prices.length} snapshot dari ${dateFmt(db.prices[0].date)} sampai ${dateFmt(db.prices[db.prices.length-1].date)}. Karena historinya belum harian penuh, periode 7/30/90 hari hanya dihitung bila ada titik sebelum target tanggal; confidence diturunkan saat data tidak lengkap.`); }
  function showPage(id){ const target=id||'dashboard'; $$('.page').forEach(p=>p.hidden=p.id!==`page-${target}`); $$('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.page===target)); if(target==='market' && db) renderMarket(selectedPeriod); if(target==='simulator'&&A) updateSimulator(); }
  async function loadData(){
    const url = new URL('data/prices.json', window.location.href);
    try{ const r=await fetch(url.toString(),{cache:'no-store'}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return normalize(await r.json()); }
    catch(err){ if(EMBEDDED) return normalize(EMBEDDED); throw err; }
  }
  async function init(){
    try{
      db=await loadData(); A=calc(db.prices); A.sourceLabel=`Sumber: ${db.source}`;
      updateDashboard(); drawMini(); renderMarket(); updateDecision(); updateSimulator(); updateMethod();
    }catch(err){
      console.error('Gold Advisor load error',err); const banner=document.createElement('div'); banner.className='load-error'; banner.textContent='Data harga tidak dapat dimuat. Periksa koneksi atau struktur file data/prices.json.'; document.body.prepend(banner);
      ['price','score','decisionHeadline'].forEach(id=>setText(id,'Data gagal dimuat'));
    }
    $$('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const id=a.dataset.page;history.replaceState(null,'',`#${id}`);showPage(id);window.scrollTo({top:0,behavior:'smooth'});}));
    const periodTabs=$('#periodTabs'); if(periodTabs) periodTabs.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&db)renderMarket(Number(b.dataset.period));});
    const ai=$('#allocInput'),bi=$('#budget'),cb=$('#calcBtn'); if(ai) ai.addEventListener('input',updateSimulator);if(bi)bi.addEventListener('input',updateSimulator);if(cb)cb.addEventListener('click',updateSimulator);
    window.addEventListener('hashchange',()=>showPage(location.hash.replace('#','')||'dashboard')); showPage(location.hash.replace('#','')||'dashboard');
  }
  window.addEventListener('DOMContentLoaded',init);
})();
