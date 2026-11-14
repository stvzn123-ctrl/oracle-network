/* 2026-11-14 이번 주 탭: 일주일 그래프는 무료. '오늘의 조언 카드'는 오늘 것만 무료로 바로 보여 주고(공유 가능),
   앞으로 30일 카드 보기는 1,000원(서버 키 cards30, 결제일부터 30일) 또는 전부 열기(all, 2,990원)로 연다.
   로그인 + 저장 정보가 있는 사람은 탭 순서를 이번 주 - 앞으로 10년 - 나의 운명으로 바꾸고 이번 주부터 보여 준다. */
(function(){
 const $=id=>document.getElementById(id);
 const user=()=>typeof accountUser!=='undefined'?accountUser:null;
 const isDemo=()=>document.body.classList.contains('demo');
 const saved=()=>!!(user()&&user().profile)&&!isDemo();
 /* 처음 저장하고 본 결과는 '나의 운명'부터. 그다음 방문부터 '이번 주'부터. */
 const seen=()=>{try{return localStorage.getItem('oracle-seen-natal')==='1'}catch(_){return true}};
 const markSeen=()=>{try{localStorage.setItem('oracle-seen-natal','1')}catch(_){}};
 const weekFirst=()=>saved()&&seen();
 const track=(n,p)=>{try{window.track&&window.track(n,p||{})}catch(_){}};
 let open=false;

 function order(){const box=document.querySelector('.res-tabs');if(!box)return;(weekFirst()?['tb-today','tb-flow','tb-natal']:['tb-natal','tb-flow','tb-today']).forEach(id=>{const b=$(id);if(b)box.append(b)})}

 /* 오늘의 조언 카드(바로 보기) + 공유 */
 function card(){const head=$('todayHead');if(!head||!head.firstElementChild)return;
  let wrap=document.querySelector('.dcard');
  if(!wrap){wrap=document.createElement('section');wrap.className='dcard';wrap.setAttribute('aria-labelledby','dcardTitle');
   wrap.innerHTML='<div class="dcard-top"><h3 class="blk-h" id="dcardTitle">오늘의 조언 카드</h3><button type="button" class="dcard-share" aria-label="오늘의 조언 카드 이미지 저장·공유"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>공유</button></div><div class="dcard-front"></div><div class="dcard-st" aria-live="polite"></div>';
   head.before(wrap);wrap.querySelector('.dcard-front').append(head);
   wrap.querySelector('.dcard-share').addEventListener('click',share);
   const dm=document.createElement('section');dm.className='blk dmonth';const tr=document.querySelector('#tab-today .to-report');tr?tr.before(dm):$('tab-today').append(dm);
   }
  month()}

 const fmt=d=>(d.getMonth()+1)+'월 '+d.getDate()+'일 ('+'일월화수목금토'[d.getDay()]+')';
 function advOf(d){const f=dayFortune(CH,d),box=document.createElement('div');box.innerHTML=todayAdvice(f,false);return {f,h:(box.querySelector('b')||{}).textContent||'',t:(box.querySelector('p')||{}).textContent||''}}
 function month(){const m=document.querySelector('.dmonth');if(!m||typeof CH==='undefined'||!CH)return;
  const days=[];for(let i=1;i<=30;i++){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);days.push(d)}
  if(open){m.innerHTML='<h4 class="dm-h">앞으로 30일의 조언 카드</h4><ol class="dm-list">'+days.map(d=>{const a=advOf(d);return '<li><span class="dm-d">'+fmt(d)+'</span><b>'+a.h+'</b><p>'+a.t+'</p></li>'}).join('')+'</ol>';return}
  const pv=days.slice(0,3).map(d=>{const a=advOf(d);return '<li aria-hidden="true"><span class="dm-d">'+fmt(d)+'</span><b>'+a.h+'</b><p>'+a.t+'</p></li>'}).join('');
  m.innerHTML='<h4 class="dm-h">앞으로 30일의 조언 카드</h4><div class="dm-lock"><ol class="dm-list dm-blur" inert>'+pv+'</ol><div class="dm-gate"><button type="button" class="dl-open" data-dayunlock><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>잠금 해제하기</button></div></div>'}

 async function buy(key){key=key||'cards30';const st=document.querySelector('#dayBuyDialog .dm-st');track('click_cards_pass',{report_key:key});
  if(typeof requireSavedProfile==='function'&&!requireSavedProfile())return;
  st&&(st.textContent='결제창을 준비하고 있어요…');
  try{const [o]=await Promise.all([accountAPI('/pay/start',{key}),loadPayApp()]);
   try{sessionStorage.setItem('oracle-paying',JSON.stringify({o:o.orderId,k:key,p:o.price,t:Date.now()}))}catch(_){}
   track('begin_checkout',{value:Number(o.price)||0,currency:'KRW',report_key:key});
   PayApp.setDefault('userid',o.userid);PayApp.setDefault('shopname',o.shopname);PayApp.setTarget('_self');
   PayApp.payrequest({goodname:o.goodname,price:String(o.price),var1:o.orderId,feedbackurl:o.feedbackurl,checkretry:'y',smsuse:'n',redirectpay:'1',returnurl:o.returnurl,redirect:'self'});
  }catch(e){st&&(st.textContent='결제를 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.')}}
 async function check(){if(!user()){open=false;month();return}
  try{const a=await accountAPI('/access');open=!!(a.isAdmin||a.reports.includes('all')||a.reports.includes('cards30'))}catch(_){open=false}month();const sel=document.querySelector('#weekBox .wk-pt.sel');if(open&&document.querySelector('#todayBox .day-lock')&&sel)pickWeekDay(+sel.dataset.wkday)}

 /* 공유 이미지 1080×1350: 날짜 · 오늘의 조언 · 문장 · 운명탐정 */
 const img=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
 function wrapT(c,t,max){const out=[];let line='';for(const ch of t.split(' ')){const s=line?line+' '+ch:ch;if(c.measureText(s).width>max&&line){out.push(line);line=ch}else line=s}if(line)out.push(line);return out}
 async function share(){const b=document.querySelector('.dcard-share'),st=document.querySelector('.dcard-st');if(!CH)return;b.disabled=true;st.textContent='로딩 중…';
  try{const d=new Date(),a=advOf(d),h=a.h.replace(/[“”"]/g,''),F='MemomentKkukkukk,"IBM Plex Sans KR",sans-serif';
   if(window.loadMemoment)await window.loadMemoment();try{await document.fonts.load('40px MemomentKkukkukk','오늘의조언운명탐정'+h+a.t+fmt(d)+'fatedog.co.kr')}catch(_){}
   const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
   const g=c.createRadialGradient(W/2,H*.4,0,W/2,H*.4,H*.8);g.addColorStop(0,'#fff3d6');g.addColorStop(1,'#fbeee2');c.fillStyle=g;c.fillRect(0,0,W,H);
   const X=90,Y=110,CW=W-180,CHh=H-260;c.fillStyle='#fff';c.strokeStyle='#e6cf9f';c.lineWidth=4;c.beginPath();c.roundRect(X,Y,CW,CHh,40);c.fill();c.stroke();
   c.textAlign='center';c.font='92px '+F;const hl=wrapT(c,h,CW-120);c.font='44px '+F;const tl=wrapT(c,a.t,CW-150);
   const blockH=50+70+40+hl.length*112+50+tl.length*66,top=Y+40+Math.max(40,((CHh-230)-blockH)/2);let y=top+40;
   c.fillStyle='#7a6253';c.font='40px '+F;c.fillText(fmt(d),W/2,y);y+=74;
   c.fillStyle='#8A5A1E';c.font='46px '+F;c.fillText('오늘의 조언',W/2,y);y+=40+92;
   c.fillStyle='#4A352B';c.font='92px '+F;hl.forEach(l=>{c.fillText(l,W/2,y);y+=112});y+=30;
   c.fillStyle='#5b463a';c.font='44px '+F;tl.forEach(l=>{c.fillText(l,W/2,y);y+=66});
   c.strokeStyle='#ecd6a8';c.lineWidth=2;c.beginPath();c.moveTo(W/2-200,Y+CHh-170);c.lineTo(W/2+200,Y+CHh-170);c.stroke();
   try{const m=await img('img/mascot.webp');c.drawImage(m,W/2-215,Y+CHh-152,124,124*m.naturalHeight/m.naturalWidth)}catch(_){}
   c.fillStyle='#8A5A1E';c.font='58px '+F;c.textAlign='left';c.fillText('운명탐정',W/2-80,Y+CHh-72);
   c.textAlign='center';c.fillStyle='#8A5A1E';c.font='38px '+F;c.fillText('fatedog.co.kr',W/2,H-80);
   const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.92)),file=new File([blob],'운명탐정-오늘의-조언.jpg',{type:'image/jpeg'});
   if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});track('share_daily_card',{method:'share'});window.oracleShared&&window.oracleShared('daily-card')}catch(_){}}
   else{const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=file.name;document.body.append(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4e3);track('share_daily_card',{method:'download'})}
   st.textContent=''}catch(e){st.textContent='이미지를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.'}finally{b.disabled=false}}

 /* 잠금 해제 창: 한 달 열기(cards30, 결제일부터 30일) 1,000원 / 영구적으로 전부 열기(all) 2,990원 */
 window.weekPassOpen=()=>open;
 function unlockDialog(){let d=$('dayBuyDialog');if(!d){d=document.createElement('dialog');d.id='dayBuyDialog';d.className='day-buy';d.setAttribute('aria-labelledby','dayBuyTitle');
   d.innerHTML='<h2 id="dayBuyTitle">운세 카드 잠금 해제</h2><p>지나간 날과 다가올 날의 조언과 풀이, 계산 근거를 볼 수 있어요.</p><div class="db-opts"><button type="button" data-buykey="cards30"><span>한 달 동안 열기</span><b>1,000원</b></button><button type="button" data-buykey="all"><span>영구적으로 열기 · 전부 포함</span><b>2,990원</b></button></div><small class="dm-st" aria-live="polite"></small><button type="button" class="db-close" data-dayclose>닫기</button>';
   document.body.append(d);d.addEventListener('click',e=>{const b=e.target.closest('[data-buykey]');if(b){buy(b.dataset.buykey);return}if(e.target===d||e.target.closest('[data-dayclose]'))d.close()})}
  d.querySelector('.dm-st').textContent='';track('view_paywall',{source_page:'week'});d.showModal()}
 document.addEventListener('click',e=>{if(e.target.closest('[data-dayunlock]'))unlockDialog()});
 function paint(){order();card()}
 const ra=window.renderAll;
 window.renderAll=function(){const r=ra.apply(this,arguments);paint();if(weekFirst())setTab('today');else if(saved())setTimeout(markSeen,3000);check();return r};
 document.addEventListener('click',e=>{if(e.target.closest('[data-bottom=home]')&&weekFirst()&&typeof CH!=='undefined'&&CH)setTimeout(()=>setTab('today'),0);if(e.target.closest('#tb-today'))check()});
 let pay=null;try{pay=JSON.parse(sessionStorage.getItem('oracle-paying')||'null')}catch(_){}
 if(pay&&(pay.k==='cards30'||pay.k==='all')){let n=0;const t=setInterval(()=>{if(++n>12||open){clearInterval(t);return}if(typeof CH!=='undefined'&&CH)check()},2500)}
 let was=null;setInterval(()=>{const s=saved();if(s!==was){was=s;order();if(s&&weekFirst()&&typeof CH!=='undefined'&&CH&&!document.querySelector('.res-tabs [aria-selected=true]:not(#tb-natal)'))setTab('today');if(s&&!seen()&&typeof CH!=='undefined'&&CH)setTimeout(markSeen,3000);if(typeof CH!=='undefined'&&CH)check()}},1000);
})();
