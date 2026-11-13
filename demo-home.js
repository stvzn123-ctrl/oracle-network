/* 2026-11-12: 입력 전(로그인 안 함·정보 없음)에는 결과 화면에 예시 인물 '운탐정'의 실제 계산 결과를 보여 준다.
   - body.demo 동안: 결과 위 '예시' 안내, 공유 잠금 영역 대신 '내 정보로 확인하기' 안내. 리포트·궁합·구매는 막고 입력 폼을 연다.
   - 예시 동안에도 body.fresh(입력 전)는 유지한다(fresh가 빠지면 첫 화면 CSS가 바뀌어 화면이 밀린다). #result만 보이게 한다.
   - 사용자가 자기 정보로 run()을 하면 demo가 풀린다. 다시 fresh가 되면(정보 삭제 등) 예시를 다시 보여 준다.
   - 예시 계산은 저장하지 않는다(저장은 폼 제출·저장 버튼에서 폼 값으로만 한다). */
(()=>{"use strict";
const DEMO=Object.freeze({name:'운탐정',roman:'UN TAMJEONG',sex:'f',cal:'s',ly:2000,lm:11,ld:22,leap:false,date:'2000-11-22',time:'09:15',notime:false,relationship:'private',place:{name:'서울',lat:37.57,lon:126.98,tz:9,kr:true}});
const B=document.body,$=id=>document.getElementById(id),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDemo=()=>B.classList.contains('demo');
let busy=false;
const run0=window.run;
if(typeof run0==='function')window.run=function(v){if(v!==DEMO)B.classList.remove('demo');return run0.apply(this,arguments)};
function showDemo(){
 if(busy||!B.classList.contains('fresh')||typeof run0!=='function')return;busy=true;
 try{B.classList.add('demo');window.run(DEMO,false);personalize();const ab=$('askbox');if(ab)ab.open=false;const ws=$('whoSum');if(ws)ws.innerHTML='<span>내 정보 입력하기</span>'}
 catch(_){B.classList.remove('demo');const ab=$('askbox');if(ab)ab.open=true}
 finally{busy=false}
}
/* 예시 결과의 '당신'은 읽는 사람이 아니라 운탐정이므로 이름으로 바꾼다. */
function personalize(){const lead=document.querySelector('#resIntro .res-lead');if(lead)lead.innerHTML=lead.innerHTML.replace(/^(\s*)당신은/,'$1운탐정은');const cd=document.querySelector('#resIntro .character-description');if(cd)cd.innerHTML=cd.innerHTML.replace('가진 당신.','가진 운탐정.')}
function openAsk(msg){
 B.classList.add('app-entered');const ab=$('askbox'),form=$('ask');if(!ab||!form)return;ab.open=true;
 const err=$('err');if(err)err.textContent=msg||'';
 form.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
 setTimeout(()=>{const n=$('in-name');if(n)n.focus({preventScroll:true})},reduce?0:350);
}
const NEED='지금은 예시 인물 운탐정의 결과예요. 내 정보를 넣으면 나의 리포트와 궁합을 볼 수 있어요.';
document.addEventListener('click',e=>{const b=e.target.closest('[data-open-ask]');if(!b)return;e.preventDefault();openAsk('')});
// 예시 상태에서 리포트·구매·궁합을 시작하지 않는다.
for(const name of ['requireSavedProfile','showLaunchReport','openGroupReport']){const f=window[name];if(typeof f!=='function')continue;window[name]=function(){if(isDemo()){openAsk(NEED);return false}return f.apply(this,arguments)}}
document.addEventListener('submit',e=>{if(isDemo()&&e.target.dataset&&e.target.dataset.mode){e.preventDefault();e.stopImmediatePropagation();openAsk(NEED)}},true);
new MutationObserver(()=>{if(B.classList.contains('fresh')&&!isDemo())setTimeout(showDemo,0)}).observe(B,{attributes:true,attributeFilter:['class']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showDemo);else showDemo();
})();
