/* 2026-11-14 이번 주 탭: 무료 = 오늘의 조언 카드(뽑기 연출, 같은 날이면 같은 카드) + 오늘 풀이.
   유료(990원, 서버 키 week-YYYYMMDD = 그 주 월요일) = 일주일 흐름 그래프·다른 요일 풀이.
   로그인 + 저장 정보가 있는 사람은 탭 순서를 이번 주 - 앞으로 10년 - 나의 운명으로 바꾸고 이번 주부터 보여 준다. */
(function(){
 const $=id=>document.getElementById(id);
 const ymd=d=>d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
 const weekKey=()=>'week-'+ymd(weekDays()[0]);
 const user=()=>typeof accountUser!=='undefined'?accountUser:null;
 const saved=()=>!!(user()&&user().profile)&&!document.body.classList.contains('demo');
 const isDemo=()=>document.body.classList.contains('demo');
 let open=null; // null = 확인 전

 /* 탭 순서 */
 function order(){const box=document.querySelector('.res-tabs');if(!box)return;const ids=saved()?['tb-today','tb-flow','tb-natal']:['tb-natal','tb-flow','tb-today'];ids.forEach(id=>{const b=$(id);if(b)box.append(b)})}

 /* 오늘의 조언 카드 */
 function card(){const head=$('todayHead');if(!head||!head.firstElementChild)return;
  let wrap=document.querySelector('.dcard');
  if(!wrap){wrap=document.createElement('section');wrap.className='dcard';wrap.setAttribute('aria-label','오늘의 조언 카드');
   wrap.innerHTML='<h3 class="blk-h dcard-h">오늘의 조언 카드</h3><div class="dcard-in"><button type="button" class="dcard-back" aria-label="오늘의 카드 뽑기"><span class="dcard-mark" aria-hidden="true"></span><b>오늘의 카드 뽑기</b><small>하루에 한 장, 매일 새 카드가 나와요</small></button><div class="dcard-front"></div></div>';
   head.before(wrap);wrap.querySelector('.dcard-front').append(head);
   wrap.querySelector('.dcard-back').addEventListener('click',()=>{try{localStorage.setItem('oracle-card',ymd(new Date()))}catch(_){}wrap.classList.add('flip');try{window.track&&track('draw_daily_card',{})}catch(_){}setTimeout(()=>wrap.querySelector('.dcard-front').focus?.(),400)});
   wrap.querySelector('.dcard-front').tabIndex=-1}
  let drawn=false;try{drawn=localStorage.getItem('oracle-card')===ymd(new Date())}catch(_){}
  wrap.classList.toggle('flip',drawn||isDemo())}

 /* 일주일 흐름 잠금 */
 function lock(){const box=$('weekBox');if(!box)return;const unlocked=isDemo()||open===true;
  box.classList.toggle('wk-locked',!unlocked);const svg=box.querySelector('svg');if(svg)svg.toggleAttribute('inert',!unlocked);
  let o=box.querySelector('.wk-gate');
  if(unlocked){o&&o.remove();return}
  if(!o){o=document.createElement('div');o.className='wk-gate';o.innerHTML='<p><b>이번 주 7일의 흐름</b>가장 좋은 날과 쉬어 갈 날, 요일마다의 조언을 볼 수 있어요.</p><button type="button" class="wk-buy">이번 주 흐름 열기 · 990원</button><small class="wk-st" aria-live="polite"></small>';box.append(o);
   o.querySelector('.wk-buy').addEventListener('click',buy)}}
 async function buy(){const st=document.querySelector('.wk-st');try{window.track&&track('click_week_pass',{})}catch(_){}
  if(!user()){needLogin();return}if(!requireSavedProfile())return;
  const key=weekKey();st.textContent='결제창을 준비하고 있어요…';
  try{const [o]=await Promise.all([accountAPI('/pay/start',{key}),loadPayApp()]);
   try{sessionStorage.setItem('oracle-paying',JSON.stringify({o:o.orderId,k:key,p:o.price,t:Date.now()}))}catch(_){}
   try{window.track&&track('begin_checkout',{value:Number(o.price)||0,currency:'KRW',report_key:'week'})}catch(_){}
   PayApp.setDefault('userid',o.userid);PayApp.setDefault('shopname',o.shopname);PayApp.setTarget('_self');
   PayApp.payrequest({goodname:o.goodname,price:String(o.price),var1:o.orderId,feedbackurl:o.feedbackurl,checkretry:'y',smsuse:'n',redirectpay:'1',returnurl:o.returnurl,redirect:'self'});
  }catch(e){st.textContent='결제를 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.'}}
 async function check(){if(!user()){open=false;lock();return}
  try{const a=await accountAPI('/access');open=!!(a.isAdmin||a.reports.includes(weekKey()))}catch(_){open=false}lock()}

 function paint(){order();card();lock()}
 const ra=window.renderAll;
 window.renderAll=function(){const r=ra.apply(this,arguments);paint();if(saved())setTab('today');check();return r};
 document.addEventListener('click',e=>{if(e.target.closest('[data-bottom=home]')&&saved()&&typeof CH!=='undefined'&&CH)setTimeout(()=>setTab('today'),0);if(e.target.closest('#tb-today'))check()});
 /* 결제 후 돌아오면 권한이 들어올 때까지 몇 번 다시 확인 */
 let pay=null;try{pay=JSON.parse(sessionStorage.getItem('oracle-paying')||'null')}catch(_){}
 if(pay&&/^week-/.test(pay.k)){let n=0;const t=setInterval(()=>{if(++n>12||open){clearInterval(t);return}if(typeof CH!=='undefined'&&CH)check()},2500)}
 let was=null;setInterval(()=>{const s=saved();if(s!==was){was=s;order();if(s&&typeof CH!=='undefined'&&CH&&!document.querySelector('.res-tabs [aria-selected=true]:not(#tb-natal)'))setTab('today');if(typeof CH!=='undefined'&&CH)check()}},1000);
})();
