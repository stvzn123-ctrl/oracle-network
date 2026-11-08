/* Bottom navigation reuses the existing login and profile actions. */
(()=>{
 const sheet=document.getElementById('accountSheet');
 const nav=document.querySelector('.bottom-nav');
 function paintProfile(){
  if(typeof accountPaint==='function')accountPaint();
  let el=document.getElementById('savedProfileSummary');
  if(!el){el=document.createElement('dl');el.id='savedProfileSummary';document.getElementById('savedProfileView').after(el)}
  el.replaceChildren();el.hidden=true;document.getElementById('profileDelete').hidden=true;
  const user=typeof accountUser==='undefined'?null:accountUser;
  let p=user?.profile;if(typeof p==='string'){try{p=JSON.parse(p)}catch{p=null}}
  const rows=p?[['이름',p.name],['생년월일',p.date],['출생 시각',p.notime?'시간 모름':p.time],['출생지',p.place?.name||'선택 안 함']]:[['안내',user?'저장된 출생 정보가 없어요. 정보 수정에서 입력한 뒤 저장해 주세요.':'카카오 로그인 후 저장한 정보를 확인할 수 있어요.']];
  rows.forEach(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value||'미입력';el.append(dt,dd)});
 }


 const icons={home:'<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/>',topics:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.6 2.6 0 0 1 5 1c0 2-2.5 2-2.5 4M12 17h.01"/>',account:'<circle cx="12" cy="7" r="4"/><path d="M4 22c0-9 16-9 16 0"/>'};
 nav.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-label',b.textContent.trim());b.title=b.textContent.trim();b.innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[b.dataset.bottom]+'</svg>'});
 document.getElementById('savedProfileView').onclick=()=>{const el=document.getElementById('savedProfileSummary');el.hidden=!el.hidden;document.getElementById('profileDelete').hidden=el.hidden};
 document.getElementById('accountWithdraw').onclick=async()=>{
  if(!confirm('탈퇴하면 저장한 출생 정보, 궁합 정보, 리포트와 열람 권한이 삭제됩니다. 탈퇴할까요?'))return;
  const b=document.getElementById('accountWithdraw'),status=document.getElementById('accountMenuStatus');b.disabled=true;
  try{await accountAPI('/auth/withdraw',{});localStorage.removeItem('oracle-session');localStorage.removeItem('oracle-admin');sessionStorage.removeItem('oracle-pending');location.replace(location.pathname)}catch(e){status.textContent=e.message;b.disabled=false}
 };
 let swipe=null;const result=document.getElementById('result'),order=['natal','flow','today'];
 result.addEventListener('touchstart',e=>{if(e.touches.length!==1||document.body.classList.contains('nav-topics')||e.target.closest('input,select,textarea,button,a,summary,.feng-explorer,.mapwrap')){swipe=null;return}const p=e.touches[0];swipe={x:p.clientX,y:p.clientY,time:Date.now()}},{passive:true});
 result.addEventListener('touchend',e=>{if(!swipe)return;const p=e.changedTouches[0],dx=p.clientX-swipe.x,dy=p.clientY-swipe.y,elapsed=Date.now()-swipe.time;swipe=null;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.7||elapsed>900)return;const active=order.findIndex(k=>!document.getElementById('tab-'+k).hidden);if(active<0)return;const next=active+(dx<0?1:-1);if(next<0||next>=order.length)return;setTab(order[next]);result.scrollIntoView({block:'start',behavior:'auto'});},{passive:true});
 result.addEventListener('touchcancel',()=>{swipe=null},{passive:true});
 function select(key){nav.querySelectorAll('button').forEach(b=>{if(b.dataset.bottom===key)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
 nav.addEventListener('click',e=>{
  const b=e.target.closest('[data-bottom]');if(!b)return;
  const key=b.dataset.bottom;
  if(key==='account'){paintProfile();if(!sheet.open)sheet.showModal();return}
  document.body.classList.toggle('nav-topics',key==='topics');select(key);
  if(key==='home'){
   if(typeof CH!=='undefined'&&CH){setTab('natal');document.body.classList.add('app-entered')}
   else document.body.classList.remove('app-entered');
  }else{
   document.body.classList.add('app-entered');
   document.getElementById('topicFold').open=true;
  }
  window.scrollTo({top:0,behavior:'instant'});
 });
 sheet.querySelector('[data-close-account]').onclick=()=>sheet.close();
 sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.close();document.getElementById('accountMember').open=true});
 document.getElementById('topicFold').addEventListener('click',e=>{
  if(e.target.closest('[data-tab]')&&(typeof CH==='undefined'||!CH)){
   e.preventDefault();e.stopImmediatePropagation();document.body.classList.remove('nav-topics');document.getElementById('askbox').open=true;select('home');document.getElementById('err').textContent='생년월일 등 출생 정보를 입력하면 선택한 주제의 운세를 볼 수 있어요.';document.getElementById('in-name').focus();
  }
 },true);
 document.getElementById('profileEdit').addEventListener('click',()=>{
  sheet.close();document.body.classList.remove('nav-topics');document.body.classList.add('app-entered');
  document.getElementById('askbox').open=true;select('home');document.getElementById('in-name').focus();
 });
})();
