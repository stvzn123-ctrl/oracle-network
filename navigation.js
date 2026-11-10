/* Bottom navigation reuses the existing login and profile actions. */
(()=>{
 const sheet=document.getElementById('accountSheet'),guidePage=document.getElementById('guidePage');
 function showGuides(){leaveEditor();document.querySelectorAll('dialog[open]').forEach(d=>d.close());if(!document.getElementById('report').hidden)closeReport();document.body.classList.remove('nav-topics','nav-ask');document.body.classList.add('app-entered','nav-account');sheet.hidden=true;guidePage.hidden=false;select('account');window.scrollTo({top:0,behavior:'instant'})}
 function hideGuides(){guidePage.hidden=true}
 const nav=document.querySelector('.bottom-nav');
 const askbox=document.getElementById('askbox'),formAnchor=document.createComment('birth-form-home');askbox.before(formAnchor);
 const editor=document.createElement('section');editor.id='accountEditor';editor.hidden=true;const editorTitle=document.createElement('h3');editorTitle.textContent='내 정보 수정';editor.append(editorTitle);sheet.append(editor);
 function leaveEditor(){if(askbox.parentElement===editor)formAnchor.after(askbox);editor.hidden=true;document.body.classList.remove('nav-edit')}

 function paintProfile(){if(typeof accountPaint==='function')accountPaint()}
 async function showSavedRecords(){
  const panel=document.getElementById('savedRecordsPanel');panel.hidden=false;
  const personal=document.getElementById('savedPersonalRecord'),list=document.getElementById('savedPartnerRecords'),status=document.getElementById('savedPartnersStatus');
  personal.replaceChildren();list.replaceChildren();status.textContent='저장 정보를 불러오는 중이에요…';
  function card(title,fields){const box=document.createElement('article');box.className='saved-record';const h=document.createElement('h4');h.textContent=title;box.append(h);const dl=document.createElement('dl');for(const [key,value] of fields){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value||'미입력';dl.append(dt,dd)}box.append(dl);return box}
  function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b}
  let p=accountUser?.profile;if(typeof p==='string'){try{p=JSON.parse(p)}catch{p=null}}
  if(p){const box=card('내 출생 정보',[['이름',p.name],['생년월일',p.date],['출생 시각',p.notime?'시간 모름':p.time],['출생지',p.place?.name||'선택 안 함']]);box.append(button('수정하기',()=>{profileFill(p);document.getElementById('profileEdit').click()}),button('삭제',()=>document.getElementById('profileDelete').click()));personal.append(box)}
  else{personal.textContent=accountUser?'저장된 내 출생 정보가 없어요.':'로그인하면 계정에 저장한 정보를 확인할 수 있어요.'}
  try{
   let records;if(accountUser){const d=await accountAPI('/partners');records=Array.isArray(d.partners)?d.partners:[];PSRV=records}else records=partnerLocal();
   status.textContent=records.length?'궁합과 재회에서 함께 사용하는 저장 정보예요.':'저장한 상대 정보가 없어요.';
   records.forEach(p=>{const place=p.pi==null?'선택 안 함':PLACES[p.pi]?.name||'선택 안 함';const box=card(p.name||'저장한 상대',[['생년월일',p.date],['출생 시각',p.notime?'시간 모름':p.time],['출생지',place]]);
    const del=button('삭제',async()=>{if(!confirm((p.name||'상대방')+'님의 저장 정보를 삭제할까요?'))return;del.disabled=true;try{if(accountUser){await accountAPI('/partners',{action:'delete',id:p.id});PSRV=null}else partnerStore(partnerLocal().filter(q=>!(q.name===p.name&&q.date===p.date)));await showSavedRecords();partnerRefresh()}catch(e){status.textContent=e.message;del.disabled=false}});box.append(del);list.append(box)})
  }catch(e){status.textContent=e.message||'저장 정보를 불러오지 못했어요. 다시 눌러주세요.'}
 }

 const icons={ask:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 11h8M8 14h5"/>',home:'<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/>',topics:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.6 2.6 0 0 1 5 1c0 2-2.5 2-2.5 4M12 17h.01"/>',account:'<circle cx="12" cy="7" r="4"/><path d="M4 22c0-9 16-9 16 0"/>'};
 nav.querySelectorAll('button').forEach(b=>{const name={home:'홈',topics:'무엇이 궁금하세요',ask:'자유질문',account:'내 정보'}[b.dataset.bottom];b.setAttribute('aria-label',name);b.title=name;b.innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[b.dataset.bottom]+'</svg>'});
 document.getElementById('savedProfileView').onclick=showSavedRecords;
 const editSave=document.createElement('button');editSave.type='button';editSave.id='saveProfileEdits';editSave.textContent='수정 내용 저장';editSave.hidden=true;editSave.addEventListener('click',()=>document.getElementById('profileSave').click());document.querySelector('#ask .go').append(editSave);
 document.getElementById('accountWithdraw').onclick=async()=>{
  if(!confirm('탈퇴하면 저장한 출생 정보, 궁합 정보, 리포트와 열람 권한이 삭제됩니다. 탈퇴할까요?'))return;
  const b=document.getElementById('accountWithdraw'),status=document.getElementById('accountMenuStatus');b.disabled=true;
  try{await accountAPI('/auth/withdraw',{});localStorage.removeItem('oracle-session');localStorage.removeItem('oracle-nick');localStorage.removeItem('oracle-admin');sessionStorage.removeItem('oracle-pending');location.replace(location.pathname)}catch(e){status.textContent=e.message;b.disabled=false}
 };
 let swipe=null;const result=document.getElementById('result'),order=['natal','flow','today'];
 result.addEventListener('touchstart',e=>{if(e.touches.length!==1||(document.body.classList.contains('nav-topics')||document.body.classList.contains('nav-ask'))||e.target.closest('input,select,textarea,button,a,summary,.feng-explorer,.mapwrap')){swipe=null;return}const p=e.touches[0];swipe={x:p.clientX,y:p.clientY,time:Date.now()}},{passive:true});
 result.addEventListener('touchend',e=>{if(!swipe)return;const p=e.changedTouches[0],dx=p.clientX-swipe.x,dy=p.clientY-swipe.y,elapsed=Date.now()-swipe.time;swipe=null;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.7||elapsed>900)return;const active=order.findIndex(k=>!document.getElementById('tab-'+k).hidden);if(active<0)return;const next=active+(dx<0?1:-1);if(next<0||next>=order.length)return;setTab(order[next]);result.scrollIntoView({block:'start',behavior:'auto'});},{passive:true});
 result.addEventListener('touchcancel',()=>{swipe=null},{passive:true});
 function select(key){nav.querySelectorAll('button').forEach(b=>{if(b.dataset.bottom===key)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
 nav.addEventListener('click',e=>{
  const b=e.target.closest('[data-bottom]');if(!b)return;
  const key=b.dataset.bottom;leaveEditor();hideGuides();
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  if(!document.getElementById('report').hidden)closeReport();
  document.body.classList.toggle('nav-account',key==='account');sheet.hidden=key!=='account';
  if(key==='account'){paintProfile();document.body.classList.add('app-entered');select(key);window.scrollTo({top:0,behavior:'instant'});return}
  document.body.classList.toggle('nav-topics',key==='topics');document.body.classList.toggle('nav-ask',key==='ask');select(key);
  if(key==='home'){
   if(typeof CH!=='undefined'&&CH){setTab('natal');document.body.classList.add('app-entered')}
   else document.body.classList.remove('app-entered');
  }else if(key==='ask'){
   document.body.classList.add('app-entered');
   document.getElementById('tab-ask').innerHTML=freeQuestionHTML();setTab('ask');
  }else{
   document.body.classList.add('app-entered');
   document.getElementById('topicFold').open=true;setTab('marry');
   if(typeof CH==='undefined'||!CH)document.getElementById('tab-marry').innerHTML='<section class="empty-topic"><h3>나의 결혼과 인연 이야기</h3><p>출생 정보를 입력하면 나에게 맞는 인연과 결혼의 흐름을 읽어드려요.</p><button type="button" data-complete-profile>출생 정보 입력하기</button></section>';

  }
  window.scrollTo({top:0,behavior:'instant'});
 });


 document.getElementById('topicFold').addEventListener('click',e=>{
  if(e.target.closest('[data-tab]')&&(typeof CH==='undefined'||!CH)){
   e.preventDefault();e.stopImmediatePropagation();document.body.classList.remove('nav-topics');document.getElementById('askbox').open=true;select('home');document.getElementById('err').textContent='생년월일 등 출생 정보를 입력하면 선택한 주제의 운세를 볼 수 있어요.';document.getElementById('in-name').focus();
  }
 },true);
 document.addEventListener('click',e=>{if(e.target.closest('[data-complete-profile]'))document.getElementById('profileEdit').click();if(e.target.closest('[data-open-guides]'))showGuides();if(e.target.closest('[data-guide-back]')){hideGuides();sheet.hidden=false;paintProfile();window.scrollTo({top:0,behavior:'instant'})}});
 document.getElementById('savedRecordsClose').onclick=()=>{document.getElementById('savedRecordsPanel').hidden=true};
 document.getElementById('profileDeleteDialog').addEventListener('close',()=>{if(!document.getElementById('savedRecordsPanel').hidden)showSavedRecords()});
 new MutationObserver(()=>{if(document.body.classList.contains('nav-edit')){if(!askbox.open)leaveEditor();select('account')}}).observe(askbox,{attributes:true,attributeFilter:['open']});
 document.getElementById('profileEdit').addEventListener('click',()=>{
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());if(!document.getElementById('report').hidden)closeReport();
  hideGuides();document.body.classList.remove('nav-topics','nav-ask');document.body.classList.add('app-entered','nav-account','nav-edit');sheet.hidden=false;editor.hidden=false;editor.append(askbox);
  askbox.open=true;editSave.hidden=!accountUser;select('account');window.scrollTo({top:0,behavior:'instant'});document.getElementById('in-name').focus({preventScroll:true});
 });

})();

/* renderAll()이 질문 탭 내용을 비우므로(로그인 정보가 늦게 도착할 때 등), 질문 화면을 보고 있으면 다시 채운다. */
(()=>{const ra=renderAll;renderAll=function(){const r=ra.apply(this,arguments);if(document.body.classList.contains('nav-ask')){document.getElementById('tab-ask').innerHTML=freeQuestionHTML();setTab('ask')}return r}})();
