/* 2026-11-13: 리포트 미리보기(주제 화면의 '○○ 리포트에서 볼 내용' 목록, 구매 화면 목록)를 실제 리포트 목차에서 만든다.
   buildRichReport(CH,key)의 장 제목(limit·fun 제외)을 그대로 쓴다. 연인 궁합은 COMPAT가 있으면 compatReportData의 장 제목.
   재회(상대 포함)·우정·모임은 상대 정보가 있어야 목차가 정해져서 기존 목록을 둔다. */
(()=>{"use strict";
const cache=new Map();
const clean=t=>String(t||'').replace(/^.{1,12}님에게 전하는 이야기$/,'나에게 전하는 이야기').replace(/^.{1,12}님의 /,'나의 ').trim();
/* 2026-11-13 b: 실제 리포트를 approvedReportHTML로 그려 그 목차(.rv3-toc)를 그대로 읽는다. 장을 나누거나 더하는 변환까지 같아진다. */
function realToc(data,key){const d=document.createElement('div');d.innerHTML=approvedReportHTML(data,key,CH);return [...d.querySelectorAll('.rv3-toc li a')].map(a=>{const b=a.querySelector('b');return (b?a.textContent.slice(b.textContent.length):a.textContent).trim()}).filter(Boolean)}
function toc(key){try{
 if(typeof CH==='undefined'||!CH)return null;
 let id=key+'|'+(CH.inp&&CH.inp.date)+'|'+(CH.inp&&CH.inp.name)+'|'+(CH.inp&&CH.inp.relationship);
 let data=null;
 if(key==='match'){if(typeof COMPAT==='undefined'||!COMPAT||COMPAT.kind==='friend'||typeof compatReportData!=='function')return null;id+='|'+(COMPAT.b&&COMPAT.b.inp&&COMPAT.b.inp.date);if(!cache.has(id))data=compatReportData(CH,COMPAT.b,COMPAT.res)}
 else if(['friend','group','reunion','ask'].includes(key))return null;
 else if(!cache.has(id))data=buildRichReport(CH,key);
 if(data&&!cache.has(id)){let list=[];try{list=realToc(data,key)}catch(_){}
  if(!list.length)list=(data.sections||[]).filter(s=>!['limit','fun'].includes(s.kind)).map(s=>clean(s.question||s.title)).filter(Boolean);
  cache.set(id,list.filter((t,i)=>list.indexOf(t)===i))}
 return cache.get(id)}catch(_){return null}}
function fill(ul,list){ul.replaceChildren(...list.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));ul.classList.add('toc-real')}
function patchOffers(root){(root.querySelectorAll?root:document).querySelectorAll('.topic-offer').forEach(sec=>{const b=sec.querySelector('[data-buy]'),ul=sec.querySelector('ul');if(!b||!ul||ul.dataset.toc===b.dataset.buy+(CH&&CH.inp&&CH.inp.date))return;const list=toc(b.dataset.buy);if(!list||!list.length)return;fill(ul,list);ul.dataset.toc=b.dataset.buy+(CH&&CH.inp&&CH.inp.date);const h=sec.querySelector('h4');if(h&&!/목차/.test(h.textContent))h.textContent=h.textContent.replace(/에서 볼 내용$/,' 목차').replace(/ 리포트$/,' 리포트 목차')})}
const orig=window.showReportPurchase;
if(typeof orig==='function')window.showReportPurchase=function(key){const r=orig.apply(this,arguments);try{const list=key==='comprehensive'?toc('comprehensive'):toc(key),ul=document.getElementById('purchaseContents');if(list&&list.length&&ul)fill(ul,list)}catch(_){}try{const ul=document.getElementById('purchaseContents'),c=document.getElementById('purchaseCount'),d=ul&&ul.closest('details');if(c&&ul)c.textContent=ul.children.length?'('+ul.children.length+'장)':'';if(d)d.open=false}catch(_){}return r};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&(n.matches?.('.topic-offer')||n.querySelector?.('.topic-offer')))patchOffers(n.parentNode||document)}).observe(document.body,{childList:true,subtree:true});
patchOffers(document);
})();

/* 2026-11-13: 결제 화면에서 '전부 열기'의 값어치를 실제 합계로 보여 준다(앵커링).
   합계 = 메뉴에서 따로 살 수 있는 리포트의 실제 가격 합: 종합 + 주제·관계 7종(재물·연인·직업·학업·궁합·재회·우정). 자유질문은 별도라 넣지 않는다. */
(()=>{"use strict";
const ITEMS=['재물','연인','직업','학업','궁합','재회','우정'];
function sums(){try{const all=typeof ALL_ACCESS_PRICE!=='undefined'?ALL_ACCESS_PRICE:2990,c=typeof COMPREHENSIVE_REPORT_PRICE!=='undefined'?COMPREHENSIVE_REPORT_PRICE:1900,t=typeof TOPIC_REPORT_PRICE!=='undefined'?TOPIC_REPORT_PRICE:1000;const total=c+t*ITEMS.length;return {all,total,pct:Math.floor((1-all/total)*100)}}catch(_){return null}}
const w=n=>n.toLocaleString()+'원';
function paint(key){const s=sums(),btn=document.getElementById('reportCheckoutAll'),st=document.getElementById('purchaseStatus');if(!s||!btn)return;
 btn.innerHTML='<span class="ba-tag">'+s.pct+'% 할인</span><span class="ba-main">전부 열기 <s>'+w(s.total)+'</s> <b>'+w(s.all)+'</b></span>';
 btn.setAttribute('aria-label','전부 열기, 따로 사면 '+w(s.total)+'인데 '+w(s.all));
 if(st&&/전부 열기\(2,990원\)/.test(st.textContent)||st&&!st.textContent)st.innerHTML='종합 리포트와 '+ITEMS.join('·')+' 리포트를 따로 사면 <b>'+w(s.total)+'</b>이에요. 전부 열기로 한 번에 모두 볼 수 있어요.'}
const orig=window.showReportPurchase;
if(typeof orig==='function')window.showReportPurchase=function(){const r=orig.apply(this,arguments);try{paint(arguments[0])}catch(_){}return r};
})();
