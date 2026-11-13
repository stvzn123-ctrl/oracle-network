/* 2026-11-13: 가격은 '리포트 보기'를 누른 뒤 구매 화면에서만 보여 준다(버튼 옆 가격은 CSS로 숨김).
   로그인 전·출생 정보 저장 전·예시(운탐정) 상태에서도 누르면 먼저 구매 화면(showReportPurchase)을 띄운다.
   이때 구매 화면의 결제 버튼은 로그인/정보 입력으로 안내한다(requireSavedProfile, 예시면 demo-home.js가 입력 폼을 연다).
   로그인 + 정보 저장 상태는 기존 흐름(requestReport → 권한 있으면 리포트, 없으면 구매 화면) 그대로다. */
(()=>{"use strict";
const B=document.body;let guest=false;
const ready=()=>{try{return !B.classList.contains('demo')&&!!accountUser&&!!accountUser.profile}catch(_){return false}};
function keyOf(b){
 if(b.matches('[data-buy]'))return b.dataset.buy;
 if(b.id==='reportOpen')return 'comprehensive';
 if(b.matches('[data-gopen]'))return 'group';
 if(b.matches('[data-cmp-open]')){if(/재회/.test(b.textContent))return 'reunion';try{return COMPAT&&COMPAT.kind==='friend'?'friend':'match'}catch(_){return 'match'}}
 return null}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-buy]:not([data-buy="ask"]),#reportOpen,[data-gopen],[data-cmp-open]');
 if(!b||ready()||typeof showReportPurchase!=='function')return;
 const k=keyOf(b);if(!k)return;
 e.preventDefault();e.stopImmediatePropagation();
 try{guest=true;showReportPurchase(k,b);const st=document.getElementById('purchaseStatus');if(st)st.textContent=B.classList.contains('demo')?'내 정보를 넣으면 나의 리포트를 구매할 수 있어요.':'구매하려면 카카오 로그인과 내 정보 저장이 필요해요.'}catch(_){guest=false}
},true);
document.addEventListener('click',e=>{
 const b=e.target.closest('#reportCheckout,#reportCheckoutAll');if(!b||!guest||ready())return;
 e.preventDefault();e.stopImmediatePropagation();
 const d=document.getElementById('reportPurchase');if(d&&d.open)d.close();guest=false;
 try{requireSavedProfile()}catch(_){}
},true);
document.getElementById('reportPurchase')?.addEventListener('close',()=>{guest=false});
})();
