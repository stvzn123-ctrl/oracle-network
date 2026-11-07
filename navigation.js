/* Bottom navigation reuses the existing login and profile actions. */
(()=>{
 const sheet=document.getElementById('accountSheet');
 const nav=document.querySelector('.bottom-nav');
 function select(key){nav.querySelectorAll('button').forEach(b=>{if(b.dataset.bottom===key)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
 nav.addEventListener('click',e=>{
  const b=e.target.closest('[data-bottom]');if(!b)return;
  const key=b.dataset.bottom;
  if(key==='account'){sheet.showModal();document.getElementById('accountMember').open=true;return}
  document.body.classList.toggle('nav-topics',key==='topics');select(key);
  if(key==='home'){
   if(typeof CH!=='undefined'&&CH){setTab('natal');document.body.classList.add('app-entered')}
   else document.body.classList.remove('app-entered');
  }else{
   document.body.classList.add('app-entered');
   if(typeof CH==='undefined'||!CH){document.body.classList.remove('nav-topics');document.getElementById('askbox').open=true;select('home')}
   else document.getElementById('topicFold').open=true;
  }
  window.scrollTo({top:0,behavior:'instant'});
 });
 sheet.querySelector('[data-close-account]').onclick=()=>sheet.close();
 sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.close();document.getElementById('accountMember').open=true});
 document.getElementById('profileEdit').addEventListener('click',()=>{
  sheet.close();document.body.classList.remove('nav-topics');document.body.classList.add('app-entered');
  document.getElementById('askbox').open=true;select('home');document.getElementById('in-name').focus();
 });
})();
