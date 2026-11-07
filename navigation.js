/* Bottom navigation reuses the existing login and profile actions. */
(()=>{
 const sheet=document.getElementById('accountSheet');
 const nav=document.querySelector('.bottom-nav');
 function paintProfile(){
  if(typeof accountPaint==='function')accountPaint();
  let el=document.getElementById('savedProfileSummary');
  if(!el){el=document.createElement('dl');el.id='savedProfileSummary';sheet.querySelector('header').after(el)}
  el.replaceChildren();
  const user=typeof accountUser==='undefined'?null:accountUser;
  let p=user?.profile;if(typeof p==='string'){try{p=JSON.parse(p)}catch{p=null}}
  const rows=p?[['이름',p.name],['생년월일',p.date],['출생 시각',p.notime?'시간 모름':p.time],['출생지',p.place?.name||'선택 안 함']]:[['안내',user?'저장된 출생 정보가 없어요. 정보 수정에서 입력한 뒤 저장해 주세요.':'카카오 로그인 후 저장한 정보를 확인할 수 있어요.']];
  rows.forEach(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value||'미입력';el.append(dt,dd)});
 }

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
