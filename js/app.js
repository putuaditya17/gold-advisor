const rupiah = n => n == null ? '—' : new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const pct = n => n == null || Number.isNaN(n) ? '—' : `${n>=0?'+':''}${n.toFixed(2)}%`;
const $ = s => document.querySelector(s);
let db=null;

function sma(arr,n){ if(arr.length<n) return null; return arr.slice(-n).reduce((a,b)=>a+b,0)/n; }
function calc(prices){
  const sells=prices.map(x=>x.sell).filter(Boolean), last=sells.at(-1), prev7=sells[Math.max(0,sells.length-2)], prev30=sells[Math.max(0,sells.length-5)], first=sells[0], peak=Math.max(...sells), trough=Math.min(...sells);
  const dd=(last/peak-1)*100, yoy=(last/first-1)*100, m7=(last/prev7-1)*100, m30=(last/prev30-1)*100;
  const ma5=sma(sells,5), ma10=sma(sells,10), maTrend=ma5&&ma10 ? (ma5<ma10?-1:1):0;
  let score=50;
  score += dd<=-20?18:dd<=-15?12:dd<=-10?8:dd<=-5?4:0;
  score += m30<0?8:m30>4?-8:0;
  score += m7<0?6:m7>2?-4:0;
  score += yoy>20?3:yoy<0?-3:0;
  score += maTrend<0?4:-2;
  score=Math.max(0,Math.min(100,Math.round(score)));
  const label=score>=80?'STRONG BUY':score>=62?'BUY / ACCUMULATE':score>=45?'STAGGER / WATCH':'WAIT';
  const confidence = prices.length>=20?'lebih kuat':'sementara — data masih jarang';
  const zones={
    starter:Math.round(peak*0.80),
    aggressive:Math.round(peak*0.75),
    extreme:Math.round(peak*0.68)
  };
  const buyback=prices.at(-1).buyback, spread=buyback?((last-buyback)/last)*100:null, beUp=buyback?((last/buyback)-1)*100:null;
  return {last,peak,trough,dd,yoy,m7,m30,score,label,ma5,ma10,maTrend,confidence,zones,buyback,spread,beUp};
}

function sparkline(points,w,h,pad=10){
  if(points.length<2) return '';
  const min=Math.min(...points), max=Math.max(...points); const sx=(w-2*pad)/(points.length-1); const sy=(h-2*pad)/((max-min)||1);
  return points.map((v,i)=>`${pad+i*sx},${h-pad-(v-min)*sy}`).join(' ');
}
function chart(){
  const svg=$('#chart'); if(!db) return; const vals=db.prices.map(x=>x.sell); const w=900,h=330;
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`); svg.innerHTML=`<polyline fill="none" stroke="currentColor" stroke-width="5" points="${sparkline(vals,w,h,24)}"/>`;
}
function render(){
  const d=calc(db.prices); window._analysis=d;
  $('#price').textContent=rupiah(d.last);
  $('#updated').textContent=`Update data: ${db.updated_at}`;
  $('#score').textContent=d.score;
  $('#label').textContent=d.label;
  $('#scoreRing').style.setProperty('--score', `${d.score*3.6}deg`);
  $('#m7').textContent=pct(d.m7); $('#m30').textContent=pct(d.m30); $('#yoy').textContent=pct(d.yoy); $('#dd').textContent=pct(d.dd);
  $('#peak').textContent=rupiah(d.peak); $('#trough').textContent=rupiah(d.trough);
  $('#zone1').textContent=rupiah(d.zones.starter); $('#zone2').textContent=rupiah(d.zones.aggressive); $('#zone3').textContent=rupiah(d.zones.extreme);
  $('#buyback').textContent=rupiah(d.buyback); $('#buybackDecision').textContent=rupiah(d.buyback); $('#spread').textContent=d.spread==null?'—':`${d.spread.toFixed(2)}%`; $('#be').textContent=d.beUp==null?'—':`${d.beUp.toFixed(2)}%`;
  $('#reason').textContent=`Harga sekitar ${Math.abs(d.dd).toFixed(1)}% di bawah peak dataset. Momentum 7/30 hari ${d.m7<0?'melemah':'menguat'}, sementara perubahan 1 tahun masih ${d.yoy>=0?'positif':'negatif'}. Ini mendukung akumulasi bertahap, bukan all-in.`;
  $('#confidence').textContent=`Kualitas sinyal: ${d.confidence}.`;
  $('#rows').innerHTML=db.prices.slice(-8).reverse().map(x=>`<tr><td>${x.date}</td><td>${rupiah(x.sell)}</td><td>${rupiah(x.buyback)}</td></tr>`).join('');
  chart();
}
async function init(){ try{ db=await fetch('./data/prices.json',{cache:'no-store'}).then(r=>r.json()); render(); } catch(e){ $('#status').textContent='Data gagal dimuat. Cek data/prices.json'; } }

function nav(){ document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); document.querySelectorAll('.page').forEach(p=>p.hidden=true); $(`#page-${a.dataset.page}`).hidden=false; document.querySelectorAll('.nav-link').forEach(n=>n.classList.remove('active')); a.classList.add('active'); history.replaceState(null,'',`#${a.dataset.page}`); })); const h=location.hash.replace('#','')||'dashboard'; const target=document.querySelector(`[data-page="${h}"]`)||document.querySelector('[data-page="dashboard"]'); target.click(); }
function sim(){ $('#calcBtn').onclick=()=>{ const budget=+$('#budget').value||0; const alloc=(+$('#alloc').value||25)/100; const d=window._analysis; const now=budget*alloc; const grams=now/d.last; $('#simNow').textContent=rupiah(now); $('#simGram').textContent=grams.toFixed(4)+' g'; $('#simRemain').textContent=rupiah(budget-now); }; }
init().then(()=>{nav();sim();});
