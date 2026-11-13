/* 2026-11-13: 리포트 미리보기(주제 화면의 '○○ 리포트에서 볼 내용' 목록, 구매 화면 목록)를 실제 리포트 목차에서 만든다.
   buildRichReport(CH,key)의 장 제목(limit·fun 제외)을 그대로 쓴다. 연인 궁합은 COMPAT가 있으면 compatReportData의 장 제목.
   재회(상대 포함)·우정·모임은 상대 정보가 있어야 목차가 정해져서 기존 목록을 둔다. */
(()=>{"use strict";
const cache=new Map();
const clean=t=>String(t||'').replace(/^.{1,12}님에게 전하는 이야기$/,'나에게 전하는 이야기').replace(/^.{1,12}님의 /,'나의 ').trim();
function toc(key){try{
 if(typeof CH==='undefined'||!CH)return null;
 let secs=null,id=key+'|'+(CH.inp&&CH.inp.date)+'|'+(CH.inp&&CH.inp.name)+'|'+(CH.inp&&CH.inp.relationship);
 if(key==='match'){if(typeof COMPAT==='undefined'||!COMPAT||COMPAT.kind==='friend'||typeof compatReportData!=='function')return null;id+='|'+(COMPAT.b&&COMPAT.b.inp&&COMPAT.b.inp.date);if(!cache.has(id))cache.set(id,(compatReportData(CH,COMPAT.b,COMPAT.res).sections||[]))}
 else if(['friend','group','reunion','ask'].includes(key))return null;
 else if(!cache.has(id))cache.set(id,(buildRichReport(CH,key).sections||[]));
 secs=cache.get(id);
 const list=secs.filter(s=>!['limit','fun'].includes(s.kind)).map(s=>clean(s.question||s.title)).filter(Boolean);
 return list.filter((t,i)=>list.indexOf(t)===i)}catch(_){return null}}
function fill(ul,list){ul.replaceChildren(...list.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));ul.classList.add('toc-real')}
function patchOffers(root){(root.querySelectorAll?root:document).querySelectorAll('.topic-offer').forEach(sec=>{const b=sec.querySelector('[data-buy]'),ul=sec.querySelector('ul');if(!b||!ul||ul.dataset.toc===b.dataset.buy+(CH&&CH.inp&&CH.inp.date))return;const list=toc(b.dataset.buy);if(!list||!list.length)return;fill(ul,list);ul.dataset.toc=b.dataset.buy+(CH&&CH.inp&&CH.inp.date);const h=sec.querySelector('h4');if(h&&!/목차/.test(h.textContent))h.textContent=h.textContent.replace(/에서 볼 내용$/,' 목차').replace(/ 리포트$/,' 리포트 목차')})}
const orig=window.showReportPurchase;
if(typeof orig==='function')window.showReportPurchase=function(key){const r=orig.apply(this,arguments);try{const list=key==='comprehensive'?toc('comprehensive'):toc(key),ul=document.getElementById('purchaseContents');if(list&&list.length&&ul)fill(ul,list)}catch(_){}return r};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&(n.matches?.('.topic-offer')||n.querySelector?.('.topic-offer')))patchOffers(n.parentNode||document)}).observe(document.body,{childList:true,subtree:true});
patchOffers(document);
})();
