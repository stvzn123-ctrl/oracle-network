/* 2026-11-13: 새로고침해도 보던 화면(하단 탭·결과 탭·주제·스크롤)을 그대로 유지한다.
   이 탭에서만(sessionStorage 'oracle-view') 보던 화면과 계산에 쓴 입력을 잠시 기억하고, 탭을 닫으면 사라진다.
   화면 복원은 navigation-history.js의 popstate 처리(oracleNav)를 그대로 쓴다. 예시(운탐정) 화면은 입력을 기억하지 않는다. */
(()=>{"use strict";
const KEY='oracle-view',B=document.body;
function save(){try{
 const v=history.state&&history.state.oracleNav;if(!v)return;
 const inp=(!B.classList.contains('demo')&&!B.classList.contains('fresh')&&typeof CH!=='undefined'&&CH&&CH.inp)?CH.inp:null;
 sessionStorage.setItem(KEY,JSON.stringify({v:{...v,dialog:null,report:false},inp,y:scrollY}))}catch(_){}}
let t;const later=()=>{clearTimeout(t);t=setTimeout(save,120)};
addEventListener('click',later,true);addEventListener('popstate',later);addEventListener('scroll',later,{passive:true});addEventListener('pagehide',save);
let saved=null;try{saved=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(_){}
if(!saved||!saved.v||saved.v.route==='landing')return;
let touched=false;['pointerdown','keydown'].forEach(e=>addEventListener(e,()=>{touched=true},{once:true,capture:true}));
function apply(){if(touched)return;try{
 if(saved.inp&&typeof run==='function'&&(B.classList.contains('demo')||B.classList.contains('fresh')||!CH||JSON.stringify(CH.inp)!==JSON.stringify(saved.inp))){
  let ok=false;try{if(typeof restoreSavedResult==='function')ok=restoreSavedResult(saved.inp)}catch(_){}
  if(!ok){run(saved.inp,false);B.classList.remove('fresh')}}
 history.replaceState({...history.state,oracleNav:saved.v},'',location.href);
 dispatchEvent(new PopStateEvent('popstate',{state:history.state}));
 const y=saved.y||0;requestAnimationFrame(()=>requestAnimationFrame(()=>scrollTo({top:y,behavior:'instant'})));
}catch(_){}}
/* 예시 계산·로그인 정보 불러오기가 끝난 뒤에 한 번 더 맞춘다. */
const go=()=>{setTimeout(apply,60);setTimeout(apply,1600)};
if(document.readyState==='complete')go();else addEventListener('load',go,{once:true});
})();
