/* 2026-11-13: 예시(운탐정) 결과를 보는 동안 위에 '예시' 띠를 띄운다. 버튼은 demo-home.js의 data-open-ask로 입력 폼을 연다. */
(()=>{const B=document.body,res=document.getElementById('result');if(!res)return;
const r=document.createElement('div');r.className='demo-ribbon';r.setAttribute('role','note');
r.innerHTML='<span>👀 예시 · 운탐정의 결과예요</span><button type="button" data-open-ask>내 결과 보기 →</button>';B.append(r);
const upd=()=>{const t=res.getBoundingClientRect();B.classList.toggle('dui-show',t.top<60&&t.bottom>200)};
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
})();
