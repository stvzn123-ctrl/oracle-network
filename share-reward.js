/* 2026-11-13 공유 혜택(계정마다 한 번): 공유를 마치면(이미지·링크 공유 완료) 또는 공유 링크로 들어와 정보를 저장하면
   주제 리포트 1개(종합·자유질문·우정·모임 제외)를 무료로 열 수 있다. 서버 /reward, /reward/claim, /reward/use.
   로그인 전 공유는 localStorage 'oracle-share-pending'에 두었다가 로그인·정보 저장 뒤 받는다. */
(()=>{"use strict";
const FREE_KEYS=["money","marry","love","reunion","work","match","study","employment","move","invest","property","business","exam","cert"];
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(_){return null}};
const SS=(k,v)=>{try{if(v===undefined)return sessionStorage.getItem(k);if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(_){return null}};
const user=()=>{try{return accountUser||null}catch(_){return null}};
const api=(p,b)=>{try{return accountAPI(p,b)}catch(e){return Promise.reject(e)}};
let state=null;
function toast(msg){let t=document.getElementById('srToast');if(!t){t=document.createElement('div');t.id='srToast';t.className='sr-toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=msg;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),4200)}
async function claim(reason){const r=await api('/reward/claim',{reason});state=r;if(r.first)toast(reason==='invited'?'친구가 보낸 링크로 들어와서, 주제 리포트 1개를 무료로 볼 수 있어요.':'공유해 줘서 고마워요! 주제 리포트 1개를 무료로 볼 수 있어요.');return r}
window.oracleShared=function(method){try{window.track&&track('share_done',{method:method||'',character_type:window.oracleCharType?oracleCharType():''})}catch(_){}
 if(document.body.classList.contains('demo'))return;
 const u=user();if(u&&u.profile){claim('share').catch(()=>{LS('oracle-share-pending','1')});return}
 LS('oracle-share-pending','1');toast('로그인하고 내 정보를 저장하면 주제 리포트 1개를 무료로 볼 수 있어요.')};
/* 로그인·정보 저장이 끝나면 미뤄 둔 혜택을 받는다 */
let tries=0;const tick=setInterval(()=>{const u=user();if(++tries>400){clearInterval(tick);return}if(!u||!u.profile)return;
 const reason=LS('oracle-share-pending')?'share':SS('oracle-invited')?'invited':null;clearInterval(tick);
 if(!reason){api('/reward').then(r=>state=r).catch(()=>{});return}
 claim(reason).then(()=>{LS('oracle-share-pending',null);SS('oracle-invited',null)}).catch(()=>{})},1500);
/* 공유 완료 지점 연결: 링크 공유(afterShare) */
if(typeof window.afterShare==='function'){const o=window.afterShare;window.afterShare=function(){const r=o.apply(this,arguments);try{oracleShared('link')}catch(_){}return r}}
/* 결제 화면: 혜택이 있으면 '공유 혜택으로 무료로 열기' */
const orig=window.showReportPurchase;
if(typeof orig==='function')window.showReportPurchase=function(key,trigger){const r=orig.apply(this,arguments);try{paint(key,trigger)}catch(_){}return r};
async function paint(key,trigger){const box=document.querySelector('#reportPurchase .purchase-buttons');if(!box)return;box.querySelector('.sr-free')?.remove();
 const u=user();if(!u||!u.profile||document.body.classList.contains('demo')||!FREE_KEYS.includes(key))return;
 try{if(!state)state=await api('/reward')}catch(_){return}
 if(!state||!state.available)return;
 const b=document.createElement('button');b.type='button';b.className='sr-free';b.innerHTML='공유 혜택으로 <b>무료로 열기</b>';
 const note=document.createElement('p');note.className='sr-note';note.textContent='공유 혜택은 한 번, 주제 리포트 1개에 쓸 수 있어요.';
 const wrap=document.createElement('div');wrap.className='sr-free';wrap.append(b,note);box.prepend(wrap);
 b.addEventListener('click',async()=>{b.disabled=true;try{await api('/reward/use',{key});state={...state,available:false,used:key};const d=document.getElementById('reportPurchase');if(d&&d.open)d.close();try{window.track&&track('share_reward_used',{report_key:key})}catch(_){}requestReport(key,trigger)}catch(e){b.disabled=false;toast('무료로 열지 못했어요. 잠시 뒤 다시 시도해 주세요.')}})}
})();
