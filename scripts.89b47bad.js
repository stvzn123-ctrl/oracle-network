/* ==== relationship-context.js ==== */
/* Relationship context changes interpretation, never birth-chart scores. */
(() => {
  const OPTIONS = {married:'결혼', dating:'연애 중', crush:'썸·호감', single:'혼자예요', private:'고르고 싶지 않음'};
  const normalize = value => Object.hasOwn(OPTIONS,value) ? value : 'private';
  const storageKey = () => accountUser ? 'oracle-relationship-v1:'+accountUser.id : null;
  function savedRelationship(){try{return normalize(localStorage.getItem(storageKey()))}catch(_){return 'private'}}
  function context(ch){return normalize(ch?.inp?.relationship ?? (accountUser ? savedRelationship() : 'private'))}
  const originalRead=readForm, originalFill=fillForm, originalAPI=accountAPI;
  readForm=function(){return {...originalRead(),relationship:normalize($('in-relationship').value)}};
  fillForm=function(value){originalFill(value);$('in-relationship').value=normalize(value.relationship ?? (accountUser?savedRelationship():'private'))};
  accountAPI=async function(path,body){
    const key=storageKey();const result=await originalAPI(path,body);
    if(key&&path==='/profile')try{if(body?.profile)localStorage.setItem(key,normalize(body.profile.relationship));else localStorage.removeItem(key)}catch(_){}
    return result;
  };
  const COPY={
    married:{title:'함께하는 사랑과 결혼 생활',question:'함께하는 관계에서 중요한 것은?',answer:'서로의 생활 방식과 기대를 이해하고, 작은 약속을 꾸준히 지키는 데서 신뢰가 쌓여요.',action:'생활비·가사·휴식 중 한 가지를 골라 서로 원하는 분담을 이야기해 보세요.',next:'함께 세울 다음 계획',detail:'함께 세운 계획이 있다면 비용과 역할, 서로 양보할 수 있는 부분을 구체적으로 이야기해 보세요.'},
    dating:{title:'지금 사랑의 발전과 결실',question:'지금 사랑이 결실을 맺을 시기는?',answer:'지금 만나는 사람과 관계를 깊게 하고 미래 계획을 이야기할 흐름을 살펴봐요.',action:'서로 생각하는 관계의 다음 단계를 묻고, 결혼·동거·장거리 등 실제 조건을 함께 확인해 보세요.',next:'우리 관계의 다음 단계',detail:'관계를 진전시키고 싶다면 두 사람의 의사와 준비를 먼저 확인해 보세요. 현재 상대와의 궁합은 상대의 출생 정보를 함께 넣었을 때 별도로 살펴볼 수 있어요.'},
    crush:{title:'설렘에서 관계로 이어지는 사랑',question:'호감이 관계로 발전할 흐름은?',answer:'새로운 상대를 예고하기보다, 지금의 호감을 확인하고 대화와 만남을 자연스럽게 넓힐 흐름을 살펴봐요.',action:'부담 없는 만남을 한 번 제안하고 상대가 편하게 응답할 여지를 주세요.',next:'서로의 마음을 확인하는 과정',detail:'상대의 반응과 경계를 존중하며 연락과 만남이 서로 이어지는지 살펴보세요. 내 차트만으로 상대의 마음이나 관계의 성사를 단정하지 않아요.'},
    single:{title:'새로운 만남과 사랑의 시작',question:'새로운 인연을 만날 흐름은?',answer:'새로운 사람을 알아가고 내게 맞는 관계를 시작할 흐름을 살펴봐요.',action:'내가 편안한 모임이나 활동 하나를 정하고 새로운 대화를 시작해 보세요.',next:'내게 맞는 만남 준비',detail:'만남의 기회와 함께 내가 원하는 관계의 기준을 정리해 보세요. 연애를 서두르기보다 대화와 실제 경험으로 잘 맞는지 확인하는 과정이 중요해요.'},
    private:{title:'사랑과 관계의 흐름',question:'사랑과 관계에서 주목할 시기는?',answer:'현재 관계 상태를 가정하지 않고, 애정을 표현하고 관계를 돌보는 흐름을 중심으로 읽어요.',action:'지금 나에게 중요한 관계에서 고마운 점과 바라는 점을 하나씩 정리해 보세요.',next:'나에게 맞는 관계의 방향',detail:'새로운 만남을 원하는지, 현재 관계를 깊게 하고 싶은지에 따라 같은 흐름을 다르게 활용할 수 있어요. 원하면 내 정보에서 관계 상태를 바꿀 수 있어요.'}
  };
  function flowTiming(ch){
    const c=COPY[context(ch)];
    if(context(ch)==='single')return partnerFirstMeeting(ch)+' '+c.answer;
    const years=(typeof RY!=='undefined'&&RY?RY:[]).map((r,i)=>({year:horizonDate(i+1).y,score:D(r[1].mean)}));
    const peak=years.sort((a,b)=>b.score-a.score)[0];
    return peak?peak.year+'년은 앞으로 10년의 애정 흐름에서 주목할 해예요. '+c.answer:c.answer;
  }
  /* 2026-11-13: 무료 연인 화면의 문장도 관계 상태에 맞춘다(혼자인데 '오래 만났다는' 같은 문장이 나오지 않게). */
  const STYLE_TAIL={married:'함께 사는 일상에서 이 방식으로 마음을 전하면 서로 더 편안해져요.',dating:'지금 만나는 사람에게 이 방식으로 마음을 전하면 관계가 한층 깊어져요.',crush:'호감을 표현할 때 이 방식을 쓰면 부담 없이 자연스럽게 전해져요.',single:'새로운 사람을 만날 때 이 방식이 나의 매력으로 드러나요.',private:'가까운 관계에서 이 방식으로 마음을 전해 보세요.'};
  const CAUTION={
    couple:['내가 정한 속도로 관계를 이끌면 상대의 망설임을 놓칠 수 있어요. 중요한 일을 정하기 전에 상대의 생각을 먼저 물어보세요.','서운할 때 바로 꺼낸 말은 마음보다 강하게 전달될 수 있어요. 감정이 가라앉은 뒤 사실과 바라는 행동을 나누어 말해 보세요.','오래 함께했다는 이유만으로 마음이 전해지지는 않아요. 표현을 줄이고 있지는 않은지 살피고, 고마운 점과 바라는 점을 말로 확인해 주세요.','옳은 말을 하는 것과 관계를 편안하게 만드는 것은 다를 수 있어요. 해결책을 주기 전에 상대가 어떤 마음이었는지 먼저 들어 보세요.','말하지 않은 마음을 상대가 알아주길 기다리면 오해가 길어질 수 있어요. 결론이 나지 않았어도 지금 느끼는 점부터 짧게 나누어 보세요.'],
    crush:['호감이 크면 혼자 속도를 앞서 나가기 쉬워요. 마음을 표현한 다음에는 상대가 답할 시간을 주세요.','작은 반응 하나에 마음이 크게 흔들리기 쉬워요. 답이 늦어도 바로 결론 내리지 말고 다음 만남의 분위기를 살펴보세요.','좋아하는 마음을 참고만 있으면 상대는 관심이 없다고 느낄 수 있어요. 함께할 약속을 하나 먼저 제안해 보세요.','상대를 판단하는 기준을 먼저 세우면 설렘이 줄어들 수 있어요. 맞고 틀림보다 함께 있을 때의 기분을 살펴보세요.','생각이 길어지면 표현할 때를 놓치기 쉬워요. 결론이 나지 않았어도 지금 느끼는 호감을 짧게 전해 보세요.'],
    single:['마음에 드는 사람을 만나면 혼자 속도를 내기 쉬워요. 처음 몇 번의 만남은 상대의 속도도 함께 살펴보세요.','첫인상에서 마음이 크게 움직이는 편이에요. 감정이 앞설 때는 한 번 더 만나 본 뒤 판단해 보세요.','익숙한 사람과 장소에만 머물면 새 만남이 잘 생기지 않아요. 한 달에 한 번은 처음 가는 모임이나 활동을 넣어 보세요.','기준이 분명한 만큼 처음부터 조건으로 사람을 거르기 쉬워요. 꼭 필요한 기준 한두 가지만 남기고 대화하며 알아가 보세요.','생각이 길어지면 좋은 사람을 만나도 다가갈 때를 놓치기 쉬워요. 다시 만나고 싶다면 그 마음을 먼저 짧게 전해 보세요.'],
    private:['내가 원하는 속도로 관계를 이끌면 상대의 망설임을 놓칠 수 있어요. 중요한 순간에는 상대의 생각을 먼저 물어보세요.','서운할 때 바로 꺼낸 말은 마음보다 강하게 전달될 수 있어요. 감정이 가라앉은 뒤 사실과 바라는 행동을 나누어 말해 보세요.','마음을 표현하지 않으면 가까운 사람도 알아차리기 어려워요. 고마운 점과 바라는 점을 말로 전해 보세요.','옳은 말을 하는 것과 관계를 편안하게 만드는 것은 다를 수 있어요. 해결책을 주기 전에 상대가 어떤 마음이었는지 먼저 들어 보세요.','말하지 않은 마음을 상대가 알아주길 기다리면 오해가 길어질 수 있어요. 결론이 나지 않았어도 지금 느끼는 점부터 짧게 나누어 보세요.']};
  window.relationshipCaution=function(ch){const st=context(ch),dom=ch.cnt.indexOf(Math.max(...ch.cnt));return (CAUTION[st==='married'||st==='dating'?'couple':st]||CAUTION.private)[dom]};
  window.relationshipState=context;
  function rows(ch){
    const st=context(ch),c=COPY[st];
    return [[c.question,flowTiming(ch)],['사랑을 표현하는 나의 방식',LOVE_STYLE[sign(birthExtraLon('Venus',ch.jd))%4]+' 방식이 차트에 나타나요. '+STYLE_TAIL[st]],[c.next,c.detail],['지금 해 볼 일',c.action]];
  }
  const originalOffer=topicReportHTML;
  topicReportHTML=function(key){
    if(!['love','marry'].includes(key)||!CH)return originalOffer(key);
    const c=COPY[context(CH)];
    return '<section class="topic-offer"><h4>'+c.title+' 리포트</h4><ul><li>'+c.question+'</li><li>나의 관계 성향과 표현 방식</li><li>'+c.next+'</li><li>지금 실천할 대화와 행동</li></ul>'+(context(CH)==='private'?'<p class="relationship-report-note" role="note">운명은 같아도 현재 상태에 따라 해석이 달라질 수 있어요. 내 정보에서 지금 관계 상태를 고르면 내 상황에 맞춘 해석을 볼 수 있어요.</p>':'<p class="relationship-report-note" role="note">지금 관계 상태('+OPTIONS[context(CH)]+')에 맞춰 읽어 드려요. 상태가 바뀌었다면 내 정보에서 바꿔 주세요.</p>')+'<div class="topic-offer-action"><strong>'+LAUNCH_PRICE(TOPIC_REPORT_PRICE)+'</strong><button type="button" data-buy="'+key+'">나의 리포트 보기</button></div><p class="buy-msg" aria-live="polite"></p></section>';
  };
  /* 연애 중·썸이면 미리보기 제목을 '배우자가 될 사람' 대신 차트가 그리는 잘 맞는 사람으로 */
  function previewFor(ch,key){const st=context(ch);let h=spousePreviewHTML(ch,st==='single'?'love':key);
    if(st==='dating'||st==='crush')h=h.replace(/(<h4 id="spouse-preview-title-[a-z]+">)[^<]*/,'$1차트가 그리는 나와 잘 맞는 사람');
    return h}
  const oldTopic=topicHTML;
  topicHTML=function(ch,key){
    if(!['love','marry'].includes(key))return oldTopic(ch,key);
    const c=COPY[context(ch)];
    return '<section class="blk blk-first topic"><header class="topic-intro"><span class="eyebrow">'+topicEsc(OPTIONS[context(ch)])+'</span><h3>'+c.title+'</h3></header>'+previewFor(ch,key)+answerCards(rows(ch))+topicReportHTML(key)+'</section>';
  };
  const originalRich=buildRichReport;
  /* 2026-11-10: 관계 상태는 리포트를 통째로 바꾸지 않고, 기존의 풍부한 장(사랑할 때의 나·인연의 모습·시기·주의·제언)을 그대로 두고
     앞에 '현재 상황에 맞춰 읽는 사랑' 장을 더한다. 결혼·연애 중·썸이면 '새 인연을 만나는 계기' 장은 상황에 맞는 '다음 단계' 장으로 바꾼다. */
  buildRichReport=function(ch,key){
    const data=originalRich(ch,key),state=context(ch),c=COPY[state];
    if(!['love','marry','comprehensive'].includes(key))return data;
    const section={kind:'relationship-context',question:c.question,lead:c.answer,paragraphs:[c.detail],basis:[],action:c.action};
    if(key==='comprehensive'){
      if(state!=='private'){const p=data.sections.find(s=>s.kind==='partner');if(p)p.paragraphs=[c.answer+' '+c.detail,...(p.paragraphs||[])]}
      return data;
    }
    const taken=['married','dating','crush'].includes(state);
    const sections=data.sections.map(s=>{
      if(s.kind==='partner'&&state==='married')return {...s,question:'배우자를 이렇게 읽었어요',lead:'함께하는 배우자를 차트의 상징으로 다시 읽어 본 모습이에요. '+(s.lead||'')};
      if(s.kind==='partner'&&taken)return {...s,question:state==='crush'?'마음이 가는 사람, 차트로 다시 읽기':'지금 곁에 있는 사람, 차트로 다시 읽기',lead:'현재 관계 상태와 별개로, 차트가 그리는 잘 맞는 상대의 모습이에요. 지금 곁의 사람과 겹치는 점을 찾아보세요. '+(s.lead||'')};
      /* 2026-11-12: 만남 장은 buildRichReport가 관계 상태에 맞춰 '언제·어디서 사랑이 깊어질까'로 쓴다. 여기서는 종류만 바꾼다. */
      if(s.kind==='meet'&&taken)return {...s,kind:'relationship-next',question:/언제·어디서/.test(s.question||'')?s.question:c.next,action:c.action};
      return s;
    });
    if(key!=='marry')sections.unshift(section);
    const sumOf=s=>{const seen=[];[s.lead,...(s.paragraphs||[])].filter(Boolean).join(' ').split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean).forEach(x=>{if(seen.length<3&&!seen.includes(x))seen.push(x)});return seen.join(' ')};
    const summary=[...(key==='marry'?[]:[sumOf(section)]),...sections.filter(s=>['core','partner','timing'].includes(s.kind)).slice(0,3).map(sumOf)];
    return {...data,title:(ch.inp.name||'당신')+'님의 '+(key==='marry'?'인연 운명':'연인 운명')+' 리포트',relationshipContext:true,summary,sections};
  };
  // Restored profiles from the current API may not yet include this optional field.
  if(accountUser?.profile)$('in-relationship').value=context(CH);
})();
;
/* ==== navigation.js ==== */
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
  if(key==='account'){paintProfile();document.body.classList.remove('nav-topics','nav-ask');document.body.classList.add('app-entered');select(key);window.scrollTo({top:0,behavior:'instant'});return}
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

/* 2026-11-14 우정·모임 카드 아래 '우정 / 모임' 버튼: 사랑 카드 아래 버튼과 같은 자리. 패널 안의 같은 버튼(.cmp-kind)은 CSS로 숨긴다. */
(()=>{const box=document.querySelector('.friend-tabs');if(!box)return;
 const paint=()=>box.querySelectorAll('[data-friendkind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.friendkind===(typeof CMPKIND!=='undefined'&&CMPKIND==='group'?'group':'friend'))));
 box.addEventListener('click',e=>{const b=e.target.closest('[data-friendkind]');if(!b)return;setTab('friend');cmpSetKind(b.dataset.friendkind);paint()});
 document.addEventListener('click',e=>{if(e.target.closest('#tb-friend-group,.cmp-kind button'))setTimeout(paint,0)});paint()})();

/* 2026-11-14 보안: 모든 기기에서 로그아웃(서버의 내 세션을 모두 지운다). 폰을 잃어버렸거나 공용 기기에서 로그인했을 때 */
(()=>{const b=document.getElementById('accountLogoutAll');if(!b)return;
 const sync=()=>{b.hidden=!(typeof accountUser!=='undefined'&&accountUser)};setInterval(sync,1500);sync();
 b.addEventListener('click',async()=>{if(!confirm('이 기기를 포함해 로그인한 모든 기기에서 로그아웃할까요?'))return;b.disabled=true;
  try{await accountAPI('/auth/logout-all',{})}catch(_){}
  try{['oracle-session','oracle-nick','oracle-admin','oracle-real-admin'].forEach(k=>localStorage.removeItem(k));sessionStorage.removeItem('oracle-pending')}catch(_){}
  location.replace(location.pathname)})})();
;
/* ==== navigation-history.js ==== */
/* Same-document history: back closes overlays and restores the previous view. */
(()=>{
 const nav=document.querySelector('.bottom-nav'),report=document.getElementById('report');
 let applying=false,pending;
 const current=()=>{
  const dialog=Array.from(document.querySelectorAll('dialog[open]')).at(-1);
  const entered=document.body.classList.contains('app-entered');
  const route=document.body.classList.contains('nav-edit')?'edit':document.body.classList.contains('nav-account')?'account':document.body.classList.contains('nav-ask')?'ask':document.body.classList.contains('nav-topics')?'topics':entered?'home':'landing';
  const tab=Array.from(document.querySelectorAll('#result>.tabp, #result .tabp')).find(e=>!e.hidden)?.id.replace('tab-','')||'natal';
  return {route,entered,tab,dialog:dialog?.id||null,report:!report.hidden,saved:route==='account'&&!document.getElementById('savedRecordsPanel').hidden};
 };
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function record(){if(applying)return;const view=current();if(!same(history.state?.oracleNav,view))history.pushState({...history.state,oracleNav:view},'',location.href)}
 function schedule(){clearTimeout(pending);pending=setTimeout(record,40)}
 function placeNav(){
  const modal=Array.from(document.querySelectorAll('dialog[open]')).filter(d=>d.matches(':modal')).at(-1);
  const parent=modal||document.body;if(nav.parentElement!==parent)parent.append(nav);
 }
 document.querySelectorAll('dialog').forEach(d=>{
  new MutationObserver(placeNav).observe(d,{attributes:true,attributeFilter:['open']});
  d.addEventListener('cancel',e=>{if(history.state?.oracleNav?.dialog===d.id){e.preventDefault();history.back()}});
 });
 placeNav();
 const first=current();
 history.replaceState({...history.state,oracleNav:{route:'landing',entered:false,tab:'natal',dialog:null,report:false}},'',location.href);
 history.pushState({...history.state,oracleNav:first},'',location.href);
 addEventListener('popstate',e=>{
  if(!e.state?.oracleNav)return;
  applying=true;clearTimeout(pending);const v=e.state.oracleNav;
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  if(!report.hidden)closeReport();
  if(v.route==='edit')document.getElementById('profileEdit').click();
  else nav.querySelector(`[data-bottom="${v.route==='landing'?'home':v.route}"]`)?.click();
  document.body.classList.toggle('app-entered',v.entered);
  document.body.classList.toggle('nav-topics',v.route==='topics');
  document.body.classList.toggle('nav-ask',v.route==='ask');
  document.body.classList.toggle('nav-edit',v.route==='edit');document.body.classList.toggle('nav-account',v.route==='account'||v.route==='edit');document.getElementById('accountSheet').hidden=!['account','edit'].includes(v.route);
  if(v.route==='account'){document.getElementById('savedRecordsPanel').hidden=!v.saved;if(v.saved)document.getElementById('savedProfileView').click()}
  if(v.entered&&document.getElementById('tab-'+v.tab))setTab(v.tab);
  if(v.report&&report.querySelector('#reportBody')?.hasChildNodes()){report.hidden=false;document.documentElement.classList.add('rep-lock')}
  if(v.dialog){const d=document.getElementById(v.dialog);if(d&&!d.open){if(v.dialog==='accountSheet')nav.querySelector('[data-bottom="account"]').click();else d.showModal()}}
  window.scrollTo({top:0,behavior:'instant'});placeNav();setTimeout(()=>{applying=false},0);
 });
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-bottom],[data-tab],[data-goto],[data-buy],[data-spouse-report],#reportOpen,#reportClose,#savedProfileView,#profileEdit,#share-open,[data-close-account],.brandbar-brand,dialog button'))schedule();
 });
 document.getElementById('result').addEventListener('touchend',schedule,{passive:true});
})();
;
/* ==== input-experience.js ==== */
/* Numeric time entry: canonical HH:mm remains compatible with saved profiles. */
function formatBirthTime(value,complete=false,autoColon=false){
 let hours,minutes;
 const separated=String(value).match(/^(\d{1,2}):(\d{0,2})$/);
 if(separated){hours=separated[1];minutes=separated[2]}
 else{const digits=String(value).replace(/\D/g,'').slice(0,4);hours=digits.slice(0,2);minutes=digits.slice(2)}
 if(!hours)return '';
 if(hours.length===2||complete)hours=String(Math.min(23,Number(hours))).padStart(2,'0');
 if(minutes.length===2)minutes=String(Math.min(59,Number(minutes))).padStart(2,'0');
 if(complete&&minutes.length===1)minutes=minutes.padStart(2,'0');
 return hours+(minutes.length||separated||(autoColon&&hours.length===2)?':'+minutes:'');
}
(()=>{
 const help=document.getElementById('romanHelpToggle'),helpText=document.getElementById('romanHelpText');help.addEventListener('click',()=>{helpText.hidden=!helpText.hidden;help.setAttribute('aria-expanded',String(!helpText.hidden))});
 const time=document.getElementById('in-time');
 time.addEventListener('input',e=>{
  const old=time.value,caret=time.selectionStart??old.length,leftDigits=old.slice(0,caret).replace(/\D/g,'').length;
  const next=formatBirthTime(old,false,!String(e.inputType||'').startsWith('delete'));time.value=next;
  /* 시 두 자리를 다 쳤거나 커서가 이미 ':' 뒤에 있으면 커서를 ':' 뒤(분 자리)에 둔다 */
  const afterColon=next.includes(':')&&(leftDigits>2||(leftDigits===2&&(old.slice(0,caret).includes(':')||!/\d/.test(old.slice(caret)))));
  let pos=leftDigits+(afterColon?1:0);time.setSelectionRange(Math.min(pos,next.length),Math.min(pos,next.length));
 });
 /* 비어 있으면 '예: 15:00' 힌트만 보여 주고, 시를 두 자리 입력하면 ':'가 붙어 분으로 넘어간다 */
 time.addEventListener('blur',()=>{time.value=/\d/.test(time.value)?formatBirthTime(time.value,true):''});
 const notice='카카오에서는 회원 구분용 식별값과 동의한 닉네임만 받아요. 저장한 정보는 언제든 삭제할 수 있어요.';
 const nodes=[];
 ['accountLogin','saveLogin'].forEach(id=>{const button=document.getElementById(id);if(!button)return;const text=document.createElement('p');text.className='kakao-data-notice';text.id=id+'DataNotice';text.textContent=notice;button.after(text);button.setAttribute('aria-describedby',text.id);nodes.push([button,text])});
 const dialog=document.getElementById('loginSaveDialog');document.body.append(dialog);const text=document.createElement('p');text.className='kakao-data-notice';text.id='loginDataNotice';text.textContent=notice;dialog.querySelector('h2').after(text);document.getElementById('loginSaveGo').setAttribute('aria-describedby',text.id);
 let privacyApproved=false;
 document.getElementById('loginSaveGo').addEventListener('click',()=>{privacyApproved=true},{capture:true});
 document.getElementById('accountLogin').addEventListener('click',e=>{
  if(privacyApproved)return;
  e.preventDefault();e.stopImmediatePropagation();
  document.getElementById('loginSaveAgree').checked=sessionStorage.getItem('oracle-save-intent')==='1';
  if(!dialog.open)dialog.showModal();
 },{capture:true});
 const sync=()=>nodes.forEach(([button,text])=>{text.hidden=button.hidden});sync();nodes.forEach(([button])=>new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['hidden']}));
})();
;
/* ==== product-flow.js ==== */
/* One product catalogue drives scope, previews and report explanations. */
(()=>{
 const E=topicEsc;
 const catalog={
  comprehensive:{name:'종합 리포트',question:'나는 어떤 강점을 갖고, 앞으로 무엇에 주목하면 좋을까?',free:'핵심 성향과 강점, 전체 흐름',detail:'타고난 성향의 해석, 분야별 10년 흐름, 전환점과 실천 방법',limit:'전체 방향을 넓게 읽는 상품이에요. 개별 고민은 주제별 리포트에서 더 집중해서 살펴봐요.'},
  marry:{name:'연애·결혼 리포트',question:'현재 내 상황에서 사랑은 어떻게 발전할까?',free:'현재 관계 상태에 맞는 핵심 답과 나의 표현 방식',detail:'관계의 발전 시기, 관계 성향, 다음 단계와 실천 방법',limit:'내 차트를 중심으로 읽어요. 현재 상대와의 비교는 궁합에서 살펴봐요.'},
  money:{name:'재물 리포트',question:'돈을 벌고 관리할 때 나의 강점과 주의점은?',free:'재물 흐름의 핵심 답과 수입·관리 성향',detail:'수입·지출·사업 성향, 10년의 재물 흐름과 시기별 준비',limit:'특정 종목·수익률·매매 시점을 제시하는 상품은 아니에요.'},
  work:{name:'직업 리포트',question:'어떤 일이 맞고, 다음 경력은 어떻게 준비할까?',free:'맞는 일의 방향과 경력의 핵심 흐름',detail:'업무 성향, 취업·이직 준비, 경력 흐름과 실천 방법',limit:'직무 선택과 준비를 돕는 풀이예요. 합격이나 채용 결과를 정하지 않아요.'},
  study:{name:'학업·성취 리포트',question:'나에게 맞는 공부와 목표 준비 방법은?',free:'공부 방식과 준비 흐름의 핵심 답',detail:'학습 강점, 공부·시험 준비의 흐름, 습관과 실행 계획',limit:'실제 학습량과 시험 조건을 함께 살펴봐요.'},
  match:{name:'궁합 리포트',question:'우리 둘은 어디서 잘 맞고, 무엇을 조율하면 좋을까?',free:'두 사람의 관계 성향과 핵심 특징',detail:'두 차트의 공통점·차이, 관계 성향과 대화·조율 방법',limit:'상대의 출생 정보가 필요해요. 상대의 현재 마음을 확인하는 기능은 아니에요.'},
  reunion:{name:'재회 리포트',question:'다시 연락하기 전에 무엇을 확인하고 바꿔야 할까?',free:'두 사람의 재회 흐름과 핵심 특징',detail:'관계의 차이, 연락과 관계 회복의 흐름, 다시 만날 때 조율할 점',limit:'두 사람의 차트를 비교해요. 실제 연락과 재회는 상대의 의사를 존중해야 해요.'},
  friend:{name:'우정 보기',question:'우리 우정의 강점과 편한 거리감은?',free:'두 사람의 캐릭터와 역할 표',detail:'정보 입력 후 바로 캐릭터·이름·역할·강점 확인',limit:'친구의 출생 정보로 비교하며 우정의 깊이나 지속 기간을 예측하지 않아요.'},
  group:{name:'모임 보기',question:'우리 모임의 강점과 조율할 부분은?',free:'구성원 캐릭터와 역할 표',detail:'3~8명 입력 후 바로 캐릭터·이름·역할·강점 확인',limit:'입력한 구성원들의 차트를 함께 비교해요.'},
  ask:{name:'자유질문',question:'내가 처한 구체적인 상황은 어떻게 살펴보면 좋을까?',free:'준비 중',detail:'작성한 고민을 검토하고 차트 결과를 바탕으로 개별 리포트를 이메일로 전달',limit:'즉시 채팅 답변이 아니에요. 접수 순서대로 검토하며 확정된 답변 기한은 아직 안내하지 않고 있어요.'}
 };
 const aliases={love:'marry',invest:'money',property:'money',business:'money',employment:'work',move:'work',exam:'study',cert:'study'};
 function scope(key){return catalog[aliases[key]||key]||catalog.comprehensive}
 function scopeHTML(key){const c=scope(key);return '<section class="product-scope"><h4>'+E(c.question)+'</h4><dl><dt>무료로 먼저 확인</dt><dd>'+E(c.free)+'</dd><dt>리포트에서 더 읽기</dt><dd>'+E(c.detail)+'</dd></dl><p>'+E(c.limit)+'</p></section>'}
 function compareHTML(){return '<details class="product-compare"><summary>종합·주제별·자유질문은 어떻게 다른가요?</summary><div class="product-table"><table><thead><tr><th>상품</th><th>답해 주는 질문과 범위</th><th>정상가</th></tr></thead><tbody>'+[['comprehensive',COMPREHENSIVE_REPORT_PRICE],['marry',TOPIC_REPORT_PRICE],['money',TOPIC_REPORT_PRICE],['work',TOPIC_REPORT_PRICE],['study',TOPIC_REPORT_PRICE],['match',TOPIC_REPORT_PRICE],['friend',TOPIC_REPORT_PRICE],['reunion',TOPIC_REPORT_PRICE],['group',TOPIC_REPORT_PRICE],['ask',FREE_QUESTION_PRICE]].map(([key,price])=>'<tr><th>'+catalog[key].name+'</th><td>'+catalog[key].question+'<br><small>'+catalog[key].detail+'</small></td><td>'+(key==='ask'?'준비 중':price.toLocaleString()+'원')+'</td></tr>').join('')+'</tbody></table></div><p>종합과 주제별 리포트는 같은 차트를 사용해 일부 설명이 겹칠 수 있어요. 종합은 전체 방향, 주제별은 선택한 고민에 집중해요. 주제별 1,000원 · 종합 1,900원 · 전부 열기 2,990원이에요.</p></details>'}
 /* 주제별 안내(scopeHTML)는 리포트 안내 문서로 옮겼고 결과 화면에는 붙이지 않는다. */
 // Short complete answers remain free; the offer names the added depth explicitly.
 function trimPreview(html,key){
  const template=document.createElement('template');template.innerHTML=html;
  for(const list of template.content.querySelectorAll('.topic-answers')){
   [...list.children].slice(2).forEach(node=>node.remove());
  }
  return template.innerHTML;
 }
 const originalTopic=topicHTML,originalMoney=moneyAllHTML;
 topicHTML=function(ch,key){const html=originalTopic(ch,key);return ['match','reunion','ask'].includes(key)?html:trimPreview(html,key)};
 moneyAllHTML=function(ch){return trimPreview(originalMoney(ch),'money')};
 const oldQuestion=freeQuestionHTML;
 freeQuestionHTML=function(){
  const t=document.createElement('template');t.innerHTML=oldQuestion();
  const form=t.content.querySelector('#free-question-form');
  form.insertAdjacentHTML('afterbegin','<p class="question-help" id="questionHelp">현재 상황 → 고민하는 선택 → 알고 싶은 점 순서로 적어주세요. 실명·연락처 등 타인의 개인정보는 질문에 넣지 않아도 돼요.</p>');
  const input=form.querySelector('textarea');input.placeholder='예: 연애 2년 차이고 결혼 이야기를 시작하려 해요. 서로 준비할 점과 관계의 흐름이 궁금해요.';input.setAttribute('aria-describedby','questionHelp');
  form.insertAdjacentHTML('beforeend','<p class="question-help">제출에 성공하면 접수 완료 메시지가 표시돼요. 답변은 입력한 이메일로 보내드려요. 이메일 주소를 한 번 더 확인해 주세요.</p>');
  return t.innerHTML;
 };
 const goalNames={natal:'전체 흐름',marry:'연애',money:'돈',work:'직업'};
 let pending=null;try{const stored=sessionStorage.getItem('oracle-entry-goal');if(Object.hasOwn(goalNames,stored))pending=stored}catch(_){}
 const entryForm=$('ask');
 function route(key){
  if(key==='natal')document.querySelector('[data-bottom="home"]').click();
  else {document.querySelector('[data-bottom="topics"]').click();setTab(key);}
  window.scrollTo({top:0,behavior:'instant'});
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-entry-goal]');if(!button)return;
  pending=button.dataset.entryGoal;try{sessionStorage.setItem('oracle-entry-goal',pending)}catch(_){}
  document.querySelectorAll('[data-entry-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('entryGoalStatus').textContent=goalNames[pending]+' 고민을 선택했어요. 정보를 입력하면 해당 결과부터 보여드려요.';
 });
 function takeGoal(){const target=pending;pending=null;try{sessionStorage.removeItem('oracle-entry-goal')}catch(_){}return target}
 $('landingStart').addEventListener('click',()=>{if(CH&&pending)route(takeGoal())});
 const originalRun=run;
 run=function(value,animate){originalRun(value,animate);if(pending)route(takeGoal())};
/* 2026-11-10: 상품 설명·비교표는 메인에서 빼고 '내 정보 > 안내와 약관 > 리포트 안내'(policy-products)에 모은다. */
 function productsGuideHTML(){
  const rows=[['comprehensive',COMPREHENSIVE_REPORT_PRICE],['marry',TOPIC_REPORT_PRICE],['money',TOPIC_REPORT_PRICE],['work',TOPIC_REPORT_PRICE],['study',TOPIC_REPORT_PRICE],['match',TOPIC_REPORT_PRICE],['friend',TOPIC_REPORT_PRICE],['reunion',TOPIC_REPORT_PRICE],['group',TOPIC_REPORT_PRICE],['ask',FREE_QUESTION_PRICE]];
  return '<p>운명탐정의 리포트는 모두 같은 출생 차트(사주·서양 점성술·베딕 점성술·수비학·마야력)를 바탕으로 쓰여요. <b>종합</b>은 나 전체를 넓게, <b>주제별</b>은 고른 고민 하나를 깊게, <b>자유질문</b>은 내가 적은 상황을 사람이 검토해 이메일로 답해 드려요.</p>'
   +'<h3>한눈에 비교</h3><div class="product-table"><table><thead><tr><th>상품</th><th>답해 주는 질문</th><th>정상가</th></tr></thead><tbody>'+rows.map(([key,price])=>'<tr><th>'+E(catalog[key].name)+'</th><td>'+E(catalog[key].question)+'</td><td>'+(key==='ask'?'준비 중':price.toLocaleString()+'원')+'</td></tr>').join('')+'</tbody></table></div>'
   +'<p>주제별 리포트는 각 1,000원, 종합 리포트는 1,900원, 전부 열기는 2,990원이에요. 자유질문은 준비 중이에요.</p>'
   +rows.map(([key])=>{const c=catalog[key];return '<h3>'+E(c.name)+'</h3><dl class="product-dl"><dt>무료로 먼저 확인</dt><dd>'+E(c.free)+'</dd><dt>리포트에서 더 읽기</dt><dd>'+E(c.detail)+'</dd><dt>범위</dt><dd>'+E(c.limit)+'</dd></dl>'}).join('')
   +'<p>종합과 주제별 리포트는 같은 차트를 쓰기 때문에 일부 설명이 겹칠 수 있어요. 해석은 전통 규칙에 따른 상징 풀이이며, 미래를 보장하거나 예측하지 않아요.</p>';
 }
 const productsTpl=document.getElementById('policy-products');if(productsTpl)productsTpl.innerHTML=productsGuideHTML();
 /* 종합 리포트 안내: 실제 리포트 장 제목과 첫 문장을 보여 주고 바로 아래에 '종합 리포트 보기' 버튼이 오게 한다. */
 function renderReportCTA(){
  const list=document.getElementById('rcPreview');if(!list||typeof CH==='undefined'||!CH)return;
  let data;try{data=buildRichReport(CH,'comprehensive')}catch(_){return}
  const items=(data.sections||[]).filter(s=>!['limit','fun','relationship-context'].includes(s.kind)).map(s=>{
   const text=[s.lead,...(s.paragraphs||[])].filter(Boolean).map(x=>readingParts(x).main).filter(Boolean).join(' ').split(/(?<=[.!?])\s+/)[0]||'';
   const short=text.length>72?text.slice(0,70).replace(/[,\s]+$/,'')+'…':text;
   return '<li><b>'+E(s.question)+'</b><span>'+E(short)+'</span></li>'});
  /* 2026-11-12: 홈이 길어지지 않게 앞 3장만 보이고 나머지는 접어 둔다. */
  if(items.length>=3)list.innerHTML=compactReportHTML(items.slice(0,3).join('')+(items.length>3?'<li class="rc-rest"><details><summary>전체 목차 보기 ('+items.length+'장)</summary><ul class="rc-toc">'+items.slice(3).join('')+'</ul></details></li>':''));
 }
 /* 리포트 미리보기는 종합 리포트 한 권을 만들어야 해서 무겁다(중간급 폰에서 약 0.4초+). 결과 화면을 먼저 그린 뒤 한가할 때 채운다. */
 const idle=window.requestIdleCallback?f=>requestIdleCallback(f,{timeout:1500}):f=>setTimeout(f,60);
 let previewObserver=null,previewGeneration=0;
 const previousRenderAll=renderAll;renderAll=function(){
  const generation=++previewGeneration;
  if(previewObserver){previewObserver.disconnect();previewObserver=null}
  previousRenderAll();
  if(document.body.classList.contains('demo'))return;
  const chart=CH,target=document.getElementById('reportCta');
  const current=()=>generation===previewGeneration&&CH===chart&&!document.body.classList.contains('demo');
  const prepare=()=>idle(()=>{if(!current())return;(typeof ensureReport==='function'?ensureReport():Promise.resolve()).then(()=>{if(current())renderReportCTA()},()=>{})});
  if(target&&'IntersectionObserver' in window){
   previewObserver=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    previewObserver.disconnect();previewObserver=null;prepare();
   },{rootMargin:'200px'});
   previewObserver.observe(target);
  }else prepare();
 };
 // Summary and body share the same section model, rather than separate generated claims.
 const previousRich=buildRichReport;
 buildRichReport=function(ch,key){
  const data=previousRich(ch,key);
  if(['love','marry'].includes(key)&&ch.inp.relationship==='single'){
   const person=partnerProfile(ch),meeting=partnerFirstMeeting(ch);
   for(const section of data.sections){
    /* 2026-11-10: 혼자일 때는 '인연을 만나는 계기' 장 앞에 첫 만남 시기·장소를 더하기만 하고, 인연의 모습 장은 원래의 풍부한 본문을 그대로 둔다. */
    if(section.kind==='meet'){section.lead=meeting;section.paragraphs=[meeting,...(section.paragraphs||[]).filter(p=>p!==meeting)];section.basis=[...(section.basis||[]),'출생 금성의 만남 장소 상징','인연 흐름의 연도·월']}
    if(section.kind==='partner'&&!(section.paragraphs||[]).length){section.lead=person.vibe+' 사람과의 관계를 살펴봐요.';section.paragraphs=[person.vibe+' 사람과 잘 맞는 흐름이에요.','사랑의 표현 방식은 '+person.style+' 모습으로 읽어요.']}
   }
  }
  /* 관계 상태 장(relationship-context.js)을 더한 뒤에도 나이·관계 상태 문장 점검을 한 번 더 한다. */
  if(typeof fitReport==="function")fitReport(data,ch,key);
  /* 핵심 요약은 buildRichReport가 만든 2~3문장짜리를 그대로 쓴다(한 줄 lead만 모으던 덮어쓰기 제거, 2026-11-10). */
  for(const section of data.sections)section.answer=(section.paragraphs||[]).join('\n\n');
  data.body=data.sections.map(s=>s.question+'\n'+s.lead+'\n'+s.answer).join('\n\n');
  return data;
 };
})();

/* Add one concrete caution to self-chart previews; retain pair-comparison flows. */
(()=>{
 const original=topicHTML;
 topicHTML=function(ch,key){const html=original(ch,key);if(['match','friend','group','reunion','ask'].includes(key))return html;
 const area=['love','marry'].includes(key)?'relationship':['money','invest','property','business'].includes(key)?'money':['study','exam','cert'].includes(key)?'study':'work';
 return html.replace('<section class="topic-offer"','<aside class="topic-candid"><h4>함께 살펴볼 점</h4><p>'+topicEsc(area==='relationship'&&window.relationshipCaution?window.relationshipCaution(ch):constructiveCaution(ch,area))+'</p></aside><section class="topic-offer"');};
})();
;
/* ==== topic-timing.js ==== */
/* 2026-11-13: 주제 화면 맨 위 무료 상자 "언제 잘 될까?" — 직업(10년)·학업(3년)·금전(10년)·사랑(10년).
   그래프는 10년 흐름 탭(renderBig)과 같은 모양(.bc-cell 선 그래프). 계산은 기존 값만 읽는다:
   R[i][ci](1~10년 뒤 분야 점수, 표시는 D()), dayFortune(ch,date).sc[ci](그날 분야 점수). ci: 0 금전 · 1 애정 · 2 직업·학업. */
(()=>{"use strict";
const orig=window.topicHTML;if(typeof orig!=='function')return;
const CFG={
 work:{ci:2,n:10,top:2,col:'work',name:'직업 · 앞으로 10년',lead:'앞으로 10년, 일이 가장 잘 풀리는 해',low:'일의 흐름이 10년 중 가장 느려지는 해예요. 무리한 이직·확장은 부담이 커질 수 있어요.',fix:'이 해에는 자격증·포트폴리오처럼 다음 기회를 위한 준비에 힘을 모아 보세요. 밝은 해에 훨씬 크게 돌아와요.',note:'이직·도전·승진 준비는 밝은 해와 달에 맞추면 흐름을 타기 좋아요.',drop:/일이 가장 잘 풀리는 해는\?/},
 study:{ci:2,n:3,top:1,col:'work',name:'학업 · 앞으로 3년',lead:'앞으로 3년, 공부한 만큼 성과가 나는 해',low:'공부한 만큼 결과가 바로 보이지 않을 수 있는 해예요. 조급해지기 쉬워요.',fix:'이 해에는 기초 개념과 오답 정리에 집중해 보세요. 다음 해에 성적으로 이어지기 쉬워요.',note:'시험·자격증·진학 준비는 밝은 해와 달에 맞추면 흐름을 타기 좋아요.',drop:/성과가 나는 해는\?/},
 money:{ci:0,n:10,top:2,col:'money',name:'금전 · 앞으로 10년',lead:'앞으로 10년, 돈이 가장 잘 들어오는 해',low:'돈의 흐름이 10년 중 가장 느려지는 해예요. 큰 지출이나 투자는 부담이 커질 수 있어요.',fix:'이 해에는 새 투자보다 고정비를 줄이고 비상금을 먼저 채워 두세요. 밝은 해에 쓸 여유가 생겨요.',note:'큰 지출·투자 같은 돈의 결정은 밝은 해와 달에 맞추면 흐름을 타기 좋아요.',drop:/돈이 가장 잘 들어오는 해는\?/},
 marry:{ci:1,n:10,top:2,col:'love',name:'애정 · 앞으로 10년',lead:'앞으로 10년, 사랑이 가장 깊어지는 해',low:'마음이 엇갈리기 쉬운 해예요. 서운함이 쌓이면 거리가 생길 수 있어요.',fix:'이 해에는 연락의 양보다 약속 하나를 지키는 데 마음을 써 주세요. 작은 신뢰가 관계를 지켜요.',note:'고백·만남·중요한 대화는 밝은 해와 달에 맞추면 흐름을 타기 좋아요.',drop:null}};
CFG.love=CFG.marry;
/* 2026-11-13: 사랑 상자 문구는 관계 상태(결혼·연애 중·썸·혼자·고르지 않음)에 맞춘다. */
const LOVE_REL={
 married:{lead:'앞으로 10년, 부부 사이가 가장 깊어지는 해',low:'서로 바빠 마음이 엇갈리기 쉬운 해예요. 서운함이 쌓이면 대화가 줄 수 있어요.',fix:'이 해에는 일주일에 한 번 둘만의 대화 시간을 정해 두세요. 작은 약속이 관계를 지켜요.',note:'여행·이사·큰 결정 같은 중요한 대화는 밝은 해와 달에 맞추면 흐름을 타기 좋아요.'},
 dating:{lead:'앞으로 10년, 사랑이 가장 깊어지는 해',low:'마음이 엇갈리기 쉬운 해예요. 서운함이 쌓이면 거리가 생길 수 있어요.',fix:'이 해에는 연락의 양보다 약속 하나를 지키는 데 마음을 써 주세요. 작은 신뢰가 관계를 지켜요.',note:'결혼 이야기·여행 같은 중요한 대화는 밝은 해와 달에 맞추면 흐름을 타기 좋아요.'},
 crush:{lead:'앞으로 10년, 호감이 사랑으로 이어지기 좋은 해',low:'상대의 마음을 읽기 어려워 혼자 서운해지기 쉬운 해예요.',fix:'이 해에는 답을 재촉하기보다 편하게 만날 자리를 한 번 제안해 보세요. 부담이 줄면 마음도 열려요.',note:'고백·데이트 제안은 밝은 해와 달에 맞추면 흐름을 타기 좋아요.'},
 single:{lead:'앞으로 10년, 새 인연을 만나기 좋은 해',low:'새 인연이 잘 보이지 않거나 마음이 쉽게 움직이지 않는 해예요.',fix:'이 해에는 만남을 서두르기보다 나를 돌보고 좋아하는 활동을 넓혀 두세요. 다음 밝은 해에 자연스럽게 사람이 모여요.',note:'새 모임·소개 자리는 밝은 해와 달에 맞추면 흐름을 타기 좋아요.'},
 private:{lead:'앞으로 10년, 애정운이 가장 밝은 해',low:'마음이 엇갈리기 쉬운 해예요. 가까운 사이에서도 서운함이 쌓일 수 있어요.',fix:'이 해에는 고마운 마음을 말로 한 번 더 전해 주세요. 작은 표현이 관계를 지켜요.',note:'중요한 대화와 만남은 밝은 해와 달에 맞추면 흐름을 타기 좋아요.'}};
function cfgFor(ch,k){const c=CFG[k];if(!c||c.ci!==1)return c;const r=(ch&&ch.inp&&ch.inp.relationship)||'private';return Object.assign({},c,LOVE_REL[r]||LOVE_REL.private)}
function months(ch,ci){const now=new Date(),out=[];for(let i=0;i<12;i++){const d0=new Date(now.getFullYear(),now.getMonth()+i,1);let t=0,n=0;for(let dd=1;dd<=28;dd+=3){t+=dayFortune(ch,new Date(d0.getFullYear(),d0.getMonth(),dd,12)).sc[ci];n++}out.push({y:d0.getFullYear(),m:d0.getMonth()+1,v:t/n})}return out}
function chart(S,name,col){const W=220,H=150,L=26,Rr=8,T=12,B=22,n=S.length,x=k=>L+(W-L-Rr)*k/Math.max(1,n-1),y=v=>T+(100-Math.max(60,Math.min(100,v)))/40*(H-T-B);
 let g='',bi=0;S.forEach((s,k)=>{if(s.v>S[bi].v)bi=k});
 [60,80,100].forEach(v=>{g+=`<line x1="${L}" x2="${W-Rr}" y1="${y(v)}" y2="${y(v)}" class="bc-grid"/><text x="${L-5}" y="${y(v)+4}" text-anchor="end" class="bc-t">${v===100?'높음':v===80?'보통':'낮음'}</text>`});
 const ticks=n>4?[0,3,6,9]:S.map((_,k)=>k);ticks.forEach(k=>{g+=`<text x="${x(k)}" y="${H-6}" text-anchor="${k===0?'start':k===n-1?'end':'middle'}" class="bc-t">${S[k].y}년</text>`});
 const p=S.map((s,k)=>[x(k),y(s.v)]),path=typeof smoothPath==='function'?smoothPath(p.map(q=>q.join(',')).join(' ')):'M'+p.map(q=>q.join(' ')).join('L');
 g+=`<path class="bc-line" d="${path}" stroke="var(--${col})"/>`+p.map((q,k)=>`<circle class="bc-pt${k===bi?' top':''}" cx="${q[0]}" cy="${q[1]}" r="${k===bi?5:3}" fill="var(--${col})"><title>${S[k].y}년 ${S[k].v}점</title></circle>`).join('');
 return `<figure class="bc-cell tt-chart"><figcaption><b style="color:var(--${col})">${name}</b><span>가장 밝은 시기 · ${S[bi].y}년</span></figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${name} 흐름">${g}</svg></figure>`}
function timingHTML(ch,k){const c=cfgFor(ch,k);
 if(!c||!R||!R.length)return '';const y0=new Date().getFullYear(),age=y=>y-ch.Y+1;
 const S=R.map((r,i)=>({y:y0+1+i,v:D(r[c.ci].mean)})).slice(0,c.n),srt=S.slice().sort((a,b)=>b.v-a.v||a.y-b.y),top=srt.slice(0,c.top).sort((a,b)=>a.y-b.y),low=srt.at(-1);
 let mm=[];try{mm=months(ch,c.ci)}catch(_){}
 const hiM=mm.slice().sort((a,b)=>b.v-a.v).slice(0,3).sort((a,b)=>a.y-b.y||a.m-b.m),mLab=x=>(x.y!==y0?String(x.y).slice(2)+'년 ':'')+x.m+'월';
 return `<section class="tt-box" aria-label="${c.lead}">
<h4>언제 잘 될까?</h4>
<p class="tt-lead"><span>${c.lead}</span><strong>${top.map(t=>`${t.y}년<small>(${age(t.y)}살)</small>`).join(' · ')}</strong></p>
${chart(S,c.name,c.col)}
<dl class="tt-facts">${hiM.length?`<div><dt>앞으로 12개월 중 밝은 달</dt><dd>${hiM.map(mLab).join(' · ')}</dd></div>`:''}<div><dt>주의할 해</dt><dd>${low.y}년</dd></div></dl>
<p class="tt-fix"><b>${low.y}년</b>은 ${c.low}<br><span>→ ${c.fix}</span></p>
<p class="tt-note">${c.note}</p>
</section>`}
function inject(h,ch,k){const c=CFG[k];if(c&&typeof h==='string'){
 try{const box=timingHTML(ch,k);if(box){h=/<section class="spouse-preview"[^]*?<\/section>/.test(h)?h.replace(/(<section class="spouse-preview"[^]*?<\/section>)/,'$1'+box):h.replace('</header>','</header>'+box);if(c.drop)h=h.replace(new RegExp('<article class="topic-answer"><h4>'+c.drop.source+'</h4>[^]*?</article>'),'')}}catch(_){}}
 return h}
window.topicHTML=function(ch,k){return inject(orig.apply(this,arguments),ch,k)};
/* 금전 탭은 moneyAllHTML로 그린다. */
if(typeof window.moneyAllHTML==='function'){const om=window.moneyAllHTML;window.moneyAllHTML=function(ch){return inject(om.apply(this,arguments),ch,'money')}}
})();
;
/* ==== profile-controls.js ==== */
/* Guest editing and serialized profile mutations. No guest data is persisted. */
(()=>{
 let revisionEpoch=0,tail=Promise.resolve();
 const originalAPI=accountAPI;
 accountAPI=function(path,body){
  if(path!=='/profile'||body===undefined)return originalAPI(path,body);
  const epoch=revisionEpoch,isDelete=body.action==='delete';
  const request=tail.catch(()=>{}).then(async()=>{
   if(!isDelete&&epoch!==revisionEpoch)throw Error('정보가 삭제되어 이전 저장 요청을 취소했어요. 다시 입력해 주세요.');
   const result=await originalAPI(path,{...body,expectedUpdated:accountUser?.updated??null});
   if(accountUser&&Object.hasOwn(result,'updated'))accountUser.updated=result.updated;
   if(isDelete)revisionEpoch++;
   return result;
  });
  tail=request;return request;
 };
 const previousPaint=accountPaint;
 accountPaint=function(){previousPaint();$('guestProfile').hidden=!!accountUser;$('profileDeleteVisible').disabled=!accountUser?.profile||accountBusy;};
 $('guestProfileEdit').onclick=()=>{$('profileEdit').click()};
 $('profileDeleteVisible').onclick=()=>{$('profileDelete').click()};
 const go=$('ask').querySelector('button[type="submit"]'),originalLabel=go?.textContent;
 $('profileEdit').addEventListener('click',()=>{if(go)go.textContent='수정하고 다시 분석하기';$('guestProfile').hidden=true;});
 const previousRun=run;
 run=function(){const editing=document.body.classList.contains('nav-edit');const r=previousRun.apply(this,arguments);if(editing)document.querySelector('[data-bottom="home"]').click();$('reportBody').replaceChildren();if(!$('report').hidden)closeReport();if(go)go.textContent=originalLabel;return r;};
 function clearCurrentProfile(){
  revisionEpoch++;formVersion++;
  if(accountUser)accountUser.profile=null;
  $('profileConsent').checked=false;
  for(const k of ['oracle-pending','oracle-save-intent','oracle-pending-run'])sessionStorage.removeItem(k);
  if(accountUser?.id)localStorage.removeItem('oracle-relationship-v1:'+accountUser.id);
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  if(!$('report').hidden)closeReport();
  CH=null;R=null;RY=null;LY=null;LD=null;LS=null;
  $('ask').reset();place={unset:true};romanTouched=false;$('whoName').textContent='운명을 걷는 사람';$('whoSfx').textContent='님의';$('resTitle').textContent='당신의 운명';$('rcName').textContent='당신의';
  for(const id of ['in-name','in-roman','in-ymd','in-y','in-m','in-d','in-time']){const el=$(id);if(el)el.value='';}
  for(const id of ['reportBody','resIntro','todayBox','weekBox','savedPersonalRecord'])$(id)?.replaceChildren();
  document.querySelectorAll('#result .tabp[id^="tab-"]').forEach(el=>{if(!['tab-natal','tab-flow','tab-today'].includes(el.id))el.replaceChildren()});
  $('askbox').open=true;$('savedRecordsPanel').hidden=true;
  document.body.classList.add('fresh');document.body.classList.remove('app-entered','nav-topics','nav-ask');
  $('landingStart').textContent='나의 운명 알아보기';
  document.querySelector('[data-bottom="account"]').click();
  accountPaint();accountStatus('저장한 내 출생 정보와 현재 분석을 삭제했어요. 계정과 로그인은 유지돼요.');
 }
 function completeProfileDeletion(reload=true){
  revisionEpoch++;formVersion++;
  if(accountUser)accountUser.profile=null;
  for(const k of ['oracle-pending','oracle-save-intent','oracle-pending-run'])sessionStorage.removeItem(k);
  if(accountUser?.id)localStorage.removeItem('oracle-relationship-v1:'+accountUser.id);
  sessionStorage.setItem('oracle-profile-deleted','1');
  // Discard mounted dialogs, navigation history and charts together after server success.
  if(reload)location.reload();
 }
 window.completeProfileDeletion=completeProfileDeletion;
 if(sessionStorage.getItem('oracle-profile-deleted')){sessionStorage.removeItem('oracle-profile-deleted');setTimeout(()=>{document.querySelector('[data-bottom="account"]').click();accountStatus('저장한 내 정보를 삭제했어요. 계정과 로그인은 유지돼요.');},0);}
 window.clearCurrentProfile=clearCurrentProfile;
 accountPaint();
})();
;
/* ==== install-app.js ==== */
(()=>{
 const button=document.getElementById('install-app');if(!button)return;
 const ua=navigator.userAgent,inApp=/KAKAOTALK|NAVER\(|Instagram|FBAN|FBAV|Line\//i.test(ua),ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),android=/Android/i.test(ua);
 const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const url='https://fatedog.co.kr/';let pending=null;
 const dialog=document.createElement('dialog');dialog.id='install-guide';dialog.setAttribute('aria-labelledby','install-title');
 dialog.innerHTML='<header><img src="img/app-icon-192.png" width="58" height="58" alt="돋보기 강아지 앱 아이콘"><div><h2 id="install-title">운명탐정 앱으로 저장하기</h2><p>홈 화면에서 강아지를 눌러 바로 열어요.</p></div><button type="button" id="install-close" aria-label="저장 안내 닫기">×</button></header><p id="install-context" role="status"></p><button type="button" id="install-native" hidden>앱 설치하기</button><section id="install-external" hidden><h3>먼저 외부 브라우저로 열어주세요</h3><p>카카오톡·앱 안의 브라우저에서는 홈 화면 저장이 제한될 수 있어요. 화면의 ⋮ 또는 메뉴에서 <b>다른 브라우저로 열기 / 외부 브라우저로 열기</b>를 선택해 주세요.</p><p>안드로이드는 Chrome, 아이폰은 Safari로 여세요. 메뉴가 없다면 아래 주소를 복사해 해당 브라우저 주소창에 붙여넣어 주세요.</p></section><details id="install-android"><summary>안드로이드에서 저장하기</summary><ol><li>Chrome에서 운명탐정을 열어요.</li><li>주소창 옆 <b>⋮ 메뉴 → 홈 화면에 추가</b>를 눌러요.</li><li><b>설치</b> 또는 <b>추가</b>를 눌러 완료해요.</li></ol><p>삼성 인터넷에서는 메뉴의 ‘현재 페이지 추가 → 홈 화면’을 이용할 수 있어요. 메뉴 이름은 기기에 따라 달라요.</p></details><details id="install-ios"><summary>아이폰·아이패드에서 저장하기</summary><ol><li><b>Safari</b>에서 운명탐정을 열어요.</li><li><b>공유 버튼</b>(네모 위 화살표)을 눌러요. 안 보이면 먼저 ‘…’ 메뉴를 열어요.</li><li><b>홈 화면에 추가</b>를 선택해요.</li><li>‘웹 앱으로 열기’가 보이면 켠 뒤 <b>추가</b>를 눌러요.</li></ol><p>‘홈 화면에 추가’가 없다면 공유 메뉴 아래의 ‘동작 편집’에서 찾아보세요.</p></details><p class="install-note">홈 화면에 저장하는 웹 앱이에요. 로그인·저장 정보·리포트를 사용하려면 인터넷 연결이 필요해요. 설치한 앱에서 로그인이 다시 필요할 수 있어요.</p><div class="install-copy"><input id="install-url" aria-label="사이트 주소" readonly value="'+url+'"><button type="button" id="install-copy">주소 복사</button></div><p id="install-copy-status" role="status"></p>';
 document.body.append(dialog);
 const $=id=>document.getElementById(id);
 function paint(){const has=installed();$('install-context').textContent=has?'지금 홈 화면 앱으로 실행 중이에요.':inApp?'외부 브라우저에서 저장해 주세요.':ios?'Safari의 공유 메뉴에서 홈 화면에 추가할 수 있어요.':pending?'아래 버튼을 눌러 앱을 설치할 수 있어요.':'브라우저 메뉴에서 홈 화면에 저장할 수 있어요.';$('install-native').hidden=has||inApp||ios||!pending;$('install-external').hidden=!inApp;$('install-ios').open=ios;$('install-android').open=android&&!ios;button.setAttribute('aria-label',has?'앱 저장 안내':'앱으로 저장하기')}
 button.addEventListener('click',e=>{e.stopPropagation();paint();dialog.showModal()});dialog.addEventListener('click',e=>e.stopPropagation());$('install-close').onclick=()=>dialog.close();
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pending=e;paint()});window.addEventListener('appinstalled',()=>{pending=null;paint()});
 $('install-native').onclick=async()=>{if(!pending)return;const event=pending;pending=null;$('install-native').disabled=true;try{await event.prompt();const choice=await event.userChoice;$('install-context').textContent=choice.outcome==='accepted'?'설치를 요청했어요. 홈 화면에서 운명탐정을 확인해 주세요.':'설치를 취소했어요. 나중에 브라우저 메뉴에서도 저장할 수 있어요.'}catch{$('install-context').textContent='브라우저 메뉴의 홈 화면에 추가를 이용해 주세요.'}finally{$('install-native').hidden=true;$('install-native').disabled=false}};
 $('install-copy').onclick=async()=>{try{await navigator.clipboard.writeText(url);$('install-copy-status').textContent='주소를 복사했어요. Chrome 또는 Safari에 붙여넣어 주세요.'}catch{$('install-url').focus();$('install-url').select();$('install-copy-status').textContent='주소를 길게 눌러 직접 복사해 주세요.'}};
 if('serviceWorker' in navigator)navigator.serviceWorker.register('./app-sw.js',{scope:'./'}).catch(()=>{});
 paint();
})();
;
/* ==== year-format.js ==== */
/* Only calendar years followed by a month are abbreviated; durations remain unchanged. */
(()=>{
 const format=t=>String(t).replace(/\b((?:19|20|21)\d{2})년(?=\s*\d{1,2}월)/g,(_,y)=>y.slice(2)+'년');
 const skip=n=>n.parentElement?.closest('script,style,textarea,input,[contenteditable="true"]');
 const visit=node=>{
  if(node.nodeType===3){if(!skip(node)){const next=format(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}return;}
  if(node.nodeType!==1&&node.nodeType!==11)return;
  if(node.nodeType===1&&node.matches('script,style,textarea,input,[contenteditable="true"]'))return;
  if(node.nodeType===1)for(const attr of ['title','aria-label']){const value=node.getAttribute(attr);if(value&&format(value)!==value)node.setAttribute(attr,format(value));}
  for(const child of node.childNodes)visit(child);
  if(node.nodeType===1&&node.tagName==='TEMPLATE')visit(node.content);
 };
 visit(document.body);
 new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')visit(r.target);else for(const n of r.addedNodes)visit(n);}}).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
;
/* ==== penguin-social.js ==== */
/* Extend the existing natal/relative-role classification with nine penguins. */
(()=>{
 'use strict';
 const labels=['충전기는 얘한테','기념일 몰래 준비함','덕질 시작하면 밤샘','비밀은 무덤까지','흑역사 봉인 중','단톡 공지 담당','선물에 의미 오백 개','안부 대신 짤 보냄','한 입이 거의 반'];
 const copy=['필요한 물건을 미리 챙겨 두고 조용히 빌려주는 편','기억해 둔 날을 작은 이벤트로 챙기는 편','좋아하는 이야기가 나오면 함께 깊이 파고드는 편','남의 이야기를 쉽게 옮기지 않고 신뢰를 지키는 편','친구의 민망한 순간을 웃음거리로 퍼뜨리지 않는 편','흩어진 일정과 안내를 한곳에 모아 주는 편','선물 하나에도 상대의 취향과 추억을 담는 편','가벼운 웃음과 짤로 먼저 안부를 건네는 편','맛있는 것을 보면 가까운 사람과 나누려는 편'];
 // Same six axes as the existing 36 types: initiative/expression/care/structure/listening/energy.
 const vectors=[[0,-1,1,1,0,0],[0,0,1,1,1,-1],[1,1,0,-1,0,1],[0,-1,1,1,1,-1],[0,-1,0,1,1,0],[1,0,0,1,-1,1],[0,1,1,1,1,0],[1,1,0,-1,0,1],[0,1,1,-1,0,0]];
 labels.forEach((label,i)=>{SOCIAL_DOGS.push(['p',i,label]);SOCIAL_PERSONALITIES.push(vectors[i]);SOCIAL_PERSONALITY_COPY.push(copy[i]);});
 const pools=[[12,13,21,23,28,38],[1,8,11,26,30,32,43],[2,5,10,14,17,20,24,33,34,36,37,42,44],[3,4,6,15,18,22,29,41],[0,7,9,16,19,25,27,31,35,39,40]];
 const roles=[['먼저 판을 벌이는 사람','아이디어와 다음 약속을 먼저 꺼내며 이 조합의 출발을 맡아요.'],['분위기를 띄우는 사람','반응과 표현으로 조용한 자리를 풀어 주는 역할이 상대적으로 잘 보여요.'],['모임을 챙기는 사람','사람들의 상태와 편의를 살피며 함께하는 시간을 안정적으로 이어 가요.'],['정리하고 결정하는 사람','흩어진 의견과 비용·일정을 정리하며 선택의 기준을 잡아 줘요.'],['듣고 중재하는 사람','다른 사람의 말을 살피고 놓친 사정을 짚으며 대화의 균형을 잡아요.']];
 socialContext=function(list){
  if(!list.length)return [];
  const values=list.map(c=>{const total=c.cnt.reduce((a,b)=>a+b,0)||1;return c.cnt.map(v=>v/total)});
  const mean=[0,1,2,3,4].map(k=>values.reduce((n,r)=>n+r[k],0)/list.length);
  // A canonical, sorted signature makes ties independent of member order and today's date.
  const signature=list.map(c=>JSON.stringify([c.inp.date,c.inp.notime?'unknown':c.inp.time||'',c.inp.sex,c.cnt,c.stems.d,Boolean(c.strong)])).sort().join('|');
  let hash=2166136261;for(const ch of signature)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const used=new Set();/* 2026-11-14 한 조합 안에서는 같은 캐릭터가 두 번 나오지 않게: 이미 나온 캐릭터면 같은 역할 무리에서 다음으로 잘 맞는 캐릭터, 무리가 다 쓰이면 전체에서 다음 순위 */
  return list.map((c,i)=>{
   const weights=values[i].map((v,k)=>v-mean[k]+v*.2),field=weights.indexOf(Math.max(...weights)),pool=pools[field];
   const score=id=>SOCIAL_PERSONALITIES[id].slice(0,5).reduce((n,v,k)=>n+v*weights[k],0)+SOCIAL_PERSONALITIES[id][5]*(c.strong?.03:-.03);
   const maximum=Math.max(...pool.map(score)),tied=pool.filter(id=>Math.abs(score(id)-maximum)<1e-9);let id=tied[(hash+mod(c.stems.d,10))%tied.length];
   if(used.has(id)){const rank=ids=>ids.filter(x=>!used.has(x)).sort((x,y)=>score(y)-score(x)||x-y);id=rank(pool)[0]??rank(SOCIAL_DOGS.map((_,k)=>k))[0]??id}
   used.add(id);const dog=SOCIAL_DOGS[id];
   return {field,role:roles[field][0],strength:SOCIAL_PERSONALITY_COPY[id]+'이에요. '+roles[field][1],personality:id,cast:{name:groupName(c,i),sheet:dog[0],index:dog[1],label:dog[2]}};
  });
 };
 const original=socialCastHTML;
 socialCastHTML=function(cast){return '<div class="social-cast">'+cast.map(c=>{
  if(c.sheet!=='p')return original([c]).replace(/^<div class="social-cast">/,'').replace(/<\/div>$/,'');
  const index=Math.max(0,Math.min(8,c.index|0)),label=labels[index];
  return '<figure class="social-dog" data-character-kind="penguin"><figcaption class="social-dog-label">'+topicEsc(label)+'</figcaption><img class="social-penguin-image" src="img/penguins-v1/social-'+String(index+1).padStart(2,'0')+'.webp" width="360" height="360" loading="lazy" decoding="async" alt="'+topicEsc(label)+' 펭귄 캐릭터"><strong class="social-dog-name">'+topicEsc(c.name)+'</strong></figure>';
 }).join('')+'</div>'};
 window.OracleSocialPenguins={version:1,labels,pools};
})();
;
/* ==== social-card.js ==== */
/* Share result-page links; birth information is never included. */
(()=>{
 const original=socialResultHTML,cache=new Map();let serial=0;
 socialResultHTML=function(list){const id='social-card-'+(++serial),fallback=original(list);const cast=socialContext(list).map(x=>({name:x.cast.name,sheet:x.cast.sheet,index:x.cast.index,role:x.role,strength:x.strength}));const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(cast))));const shareUrl=new URL('./',location.href);shareUrl.hash='combo='+encodeURIComponent(encoded);const state={people:cast};cache.set(id,state);
  return '<section class="social-share-card" id="'+id+'"><div class="social-card-content">'+fallback+'</div><button type="button" class="social-share-button" data-social-share="'+id+'">친구에게 공유하기</button><p class="social-share-status" role="status"></p></section>';
 };
 document.addEventListener('click',async e=>{const button=e.target.closest('[data-social-share]');if(!button)return;const box=button.closest('.social-share-card'),status=box.querySelector('.social-share-status'),state=cache.get(button.dataset.socialShare);button.disabled=true;status.textContent='공유 링크를 준비하고 있어요…';try{if(!state.shareUrl){const result=await accountAPI('/shared-result',{title:'우리 캐릭터 조합',sections:[{title:'oracle-social-cast-v2',paragraphs:[JSON.stringify(state.people)]}]});const link=new URL('./',location.href);link.hash='report='+result.code;state.shareUrl=link.href;}const url=state.shareUrl;if(navigator.share){await navigator.share({title:'우리 캐릭터 조합',text:'우리 조합에서는 어떤 캐릭터일까?',url});status.textContent='';}else{await navigator.clipboard.writeText(url);status.textContent='조합 페이지 링크를 복사했어요. 친구에게 보내주세요.';}}catch(err){status.textContent=err.name==='AbortError'?'':err.message||'링크를 공유하지 못했어요. 다시 시도해 주세요.';}finally{button.disabled=false;}});

 function revealShared(html,title){
  const dialog=document.createElement('dialog');dialog.className='shared-result-dialog social-result';dialog.innerHTML='<button type="button" class="shared-result-close">닫기 ×</button><div class="shared-result-content">'+socialRevealHTML()+'</div>';document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();const start=()=>{if(document.documentElement.classList.contains('boot')){setTimeout(start,60);return;}dialog.showModal();setTimeout(()=>{if(!dialog.open)return;const content=dialog.querySelector('.shared-result-content');content.classList.add('shared-result-ready');content.innerHTML='<h2>'+topicEsc(title)+'</h2>'+html+'<a href="'+new URL('./',location.href).href+'">나도 확인하기</a>';},900);};start();
 }
 const originalReport=approvedReportHTML;
 approvedReportHTML=function(data,key,ch){const html=originalReport(data,key,ch);return key==='match'?html+'<button type="button" class="social-share-button" data-share-compat>궁합 리포트 친구에게 공유하기</button><p class="compat-share-status" role="status"></p>':html;};
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-share-compat]');if(!b)return;const root=b.closest('#reportBody'),status=root.querySelector('.compat-share-status');b.disabled=true;try{let url=b.dataset.url;if(!url){const payload={title:root.querySelector('.r-cover h2')?.textContent||'궁합 리포트',sections:[...root.querySelectorAll('section[id^="chapter-"]')].map(s=>({title:s.querySelector('h2')?.textContent||'',paragraphs:[...s.querySelectorAll('p')].map(p=>p.textContent).filter(Boolean)}))};status.textContent='공유 링크를 만들고 있어요…';const result=await accountAPI('/shared-result',payload);const target=new URL('./',location.href);target.hash='report='+result.code;url=target.href;b.dataset.url=url;}if(navigator.share){try{await navigator.share({title:'우리 궁합 리포트',url});status.textContent='';}catch(err){if(err.name==='AbortError'){status.textContent='';return;}await navigator.clipboard.writeText(url);status.textContent='공유 링크를 복사했어요.';}}else{await navigator.clipboard.writeText(url);status.textContent='공유 링크를 복사했어요.';}}catch(err){status.textContent=err.message||'공유 링크를 만들지 못했어요.';}finally{b.disabled=false;}});
 const hash=new URLSearchParams(location.hash.slice(1)),encoded=hash.get('combo');
 if(encoded)try{throw Error('legacy_expired');
  if(encoded.length>12000)throw Error('invalid');const people=JSON.parse(decodeURIComponent(escape(atob(encoded))));
  if(!Array.isArray(people)||people.length<2||people.length>8||people.some(p=>!['a','b','c','d'].includes(p.sheet)||!Number.isInteger(p.index)||p.index<0||p.index>8||typeof p.name!=='string'||p.name.length>40||typeof p.role!=='string'||p.role.length>60||typeof p.strength!=='string'||p.strength.length>300))throw Error('invalid');
  const cast=people.map(p=>({...p,label:SOCIAL_DOGS.find(d=>d[0]===p.sheet&&d[1]===p.index)[2]}));
  revealShared(socialCastHTML(cast)+reportInfoTable('각자 역할',['이름','역할','강점'],people.map(p=>[p.name,p.role,p.strength]),'social-role-table',['25%','30%','45%']),'우리 캐릭터 조합');
 }catch(_){revealShared('<p>이 공유 링크는 만료됐어요. 새 링크를 받아 주세요.</p>','공유 기간 만료');}
 const reportCode=hash.get('report');if(/^[a-f0-9]{32}$/.test(reportCode||''))fetch(INVITE_API+'/shared-result?code='+reportCode).then(r=>{if(!r.ok)throw Error('공유 기간이 끝났거나 없는 리포트예요.');return r.json();}).then(data=>{if(data.title==='우리 캐릭터 조합'&&data.sections?.[0]?.title==='oracle-social-cast-v2'){
 const people=JSON.parse(data.sections[0].paragraphs[0]);
 if(!Array.isArray(people)||people.length<2||people.length>8||people.some(p=>!['a','b','c','d','p'].includes(p.sheet)||!Number.isInteger(p.index)||p.index<0||p.index>8||typeof p.name!=='string'||p.name.length>40||typeof p.role!=='string'||p.role.length>60||typeof p.strength!=='string'||p.strength.length>300))throw Error('공유 정보를 불러오지 못했어요.');
 const cast=people.map(p=>({...p,label:SOCIAL_DOGS.find(d=>d[0]===p.sheet&&d[1]===p.index)[2]}));
 revealShared(socialCastHTML(cast)+reportInfoTable('각자 역할',['이름','역할','강점'],people.map(p=>[p.name,p.role,p.strength]),'social-role-table',['25%','30%','45%']),'우리 캐릭터 조합');return;
 }if(data.kind==='social'){const cast=data.people.map(p=>({...p,label:SOCIAL_DOGS.find(d=>d[0]===p.sheet&&d[1]===p.index)[2]}));revealShared(socialCastHTML(cast)+reportInfoTable('각자 역할',['이름','역할','강점'],data.people.map(p=>[p.name,p.role,p.strength]),'social-role-table',['25%','30%','45%']),'우리 캐릭터 조합');return;}if(!Array.isArray(data.sections))throw Error('리포트를 불러오지 못했어요.');revealShared(data.sections.map(s=>'<section class="shared-report-chapter"><h3>'+topicEsc(s.title)+'</h3>'+s.paragraphs.map(p=>'<p>'+topicEsc(p)+'</p>').join('')+'</section>').join(''),data.title);}).catch(e=>revealShared('<p>'+topicEsc(e.message)+'</p>','공유 리포트'));
})();
;
/* ==== destiny-characters.js ==== */
/* Personality characters v1: natal traits only; no date, random, or storage. */
(()=>{
"use strict";
const names=["단서 탐정","별빛 관측자","지혜의 기록자","직감의 예언자","길찾는 전략가","진실의 해독가","고요한 사색가","호기심 수집가","균형의 판단자","용감한 모험가","길을 여는 개척자","끈기의 등반가","꿈의 항해사","빛나는 선도자","묵묵한 장인","기회의 사냥꾼","변화의 여행자","든든한 수호자","다정한 치유자","마음의 통역사","인연의 연결자","평화의 중재자","따뜻한 안내자","믿음의 동반자","웃음의 전령사","꿈의 응원가","포근한 돌봄이","영감의 예술가","이야기 마법사","리듬의 연주자","반짝이는 발명가","풍요의 정원사","행운의 발견자","꿈짓는 건축가","시간의 조율사","새벽의 몽상가"];
const groups={
 insight:[[1,"achieve"],[2,"free"],[6,"create"],[7,"steady"]],
 achieve:[[5,"pioneer"],[9,"bond"],[15,"steady"],[34,"create"]],
 pioneer:[[10,"free"],[11,"lead"],[12,"steady"],[16,"achieve"]],
 bond:[[20,"insight"],[21,"free"],[22,"help"],[24,"steady"]],
 free:[[8,"insight"],[13,"pioneer"],[17,"bond"],[36,"create"]],
 create:[[28,"bond"],[29,"insight"],[30,"help"],[31,"achieve"]],
 steady:[[3,"insight"],[18,"help"],[32,"create"],[35,"achieve"]],
 lead:[[14,"pioneer"],[25,"bond"],[26,"help"],[33,"free"]],
 help:[[4,"insight"],[19,"steady"],[23,"lead"],[27,"bond"]]
};

const penguins={"37": {"name": "마감 직전 각성형", "description": "시작은 느긋해도 목표가 선명해지면 집중해서 끝내는 모습이에요.", "image": "img/penguins-v1/personal-01.webp"}, "38": {"name": "머릿속 리허설형", "description": "말과 행동을 꺼내기 전에 여러 장면을 마음속에서 그려 보는 모습이에요.", "image": "img/penguins-v1/personal-02.webp"}, "39": {"name": "루틴 고수형", "description": "자기만의 순서와 익숙한 리듬을 지킬 때 편안해지는 모습이에요.", "image": "img/penguins-v1/personal-03.webp"}, "40": {"name": "취향에 진심인 형", "description": "남들이 고른 답보다 직접 고른 취향에 시간과 정성을 쓰는 모습이에요.", "image": "img/penguins-v1/personal-04.webp"}, "41": {"name": "물건에 정드는 형", "description": "익숙한 물건에 추억과 의미를 담아 오래 간직하는 모습이에요.", "image": "img/penguins-v1/personal-05.webp"}, "42": {"name": "칭찬 오래 기억형", "description": "따뜻한 말 한마디를 기억해 두고 다시 힘을 얻는 모습이에요.", "image": "img/penguins-v1/personal-06.webp"}, "43": {"name": "시작 전 장비형", "description": "준비물과 방법을 갖추면서 시작할 자신감을 쌓는 모습이에요.", "image": "img/penguins-v1/personal-07.webp"}, "44": {"name": "작은 성공 수집형", "description": "큰 목표를 작은 성취로 나누고 하나씩 채워 가는 모습이에요.", "image": "img/penguins-v1/personal-08.webp"}, "45": {"name": "은근한 승부욕형", "description": "겉으로는 태연해도 자기 기준을 넘기 위해 조용히 몰입하는 모습이에요.", "image": "img/penguins-v1/personal-09.webp"}};
groups.pioneer.push([37,"create"]);names.push(penguins[37].name);
groups.insight.push([38,"lead"]);names.push(penguins[38].name);
groups.steady.push([39,"free"]);names.push(penguins[39].name);
groups.free.push([40,"achieve"]);names.push(penguins[40].name);
groups.bond.push([41,"achieve"]);names.push(penguins[41].name);
groups.bond.push([42,"create"]);names.push(penguins[42].name);
groups.achieve.push([43,"insight"]);names.push(penguins[43].name);
groups.achieve.push([44,"help"]);names.push(penguins[44].name);
groups.lead.push([45,"achieve"]);names.push(penguins[45].name);
function select(tags){
 if(!tags.length)return {id:1,name:names[0],primary:"insight",secondary:"insight"};
 // Use the existing five-system consensus order, including its stable tie rule.
 const primary=tags[0].k,choices=groups[primary]||groups.insight;
 const strength=Object.fromEntries(tags.map(t=>[t.k,t.n*100+t.ev.length]));
 const ranked=choices.map(([id,secondary],order)=>({id,secondary,order,score:strength[secondary]||0})).sort((a,b)=>b.score-a.score||a.order-b.order);
 const winner=ranked[0];
 return {...winner,name:names[winner.id-1],primary};
}
function html(ch){
 const tags=reportTags(ch),c=select(tags),primary=RTAG[c.primary],secondary=RTAG[c.secondary];
 const index=c.id-1,x=(index%6)*20,y=Math.floor(index/6)*20;
 const penguin=penguins[c.id];
 const art=penguin?'<div class="character-art character-penguin-art"><img src="'+penguin.image+'" width="360" height="360" loading="lazy" decoding="async" alt="'+c.name+' 펭귄 캐릭터"></div>':'<div class="character-art" data-loading role="img" aria-label="'+c.name+'" data-art="'+String(c.id).padStart(2,'0')+'" style="background-image:url(img/characters/'+String(c.id).padStart(2,'0')+'.webp);background-size:contain;background-position:center"></div>';
 const description=penguin?penguin.description:primary.s+'을 가진 당신.<br>'+secondary.t+'.';
 const evidence=tags.find(t=>t.k===c.primary);
 return '<section class="destiny-character" aria-label="나의 운명 캐릭터" data-character-id="'+c.id+'"><p class="character-eyebrow">나의 운명 캐릭터</p>'+art+'<h2>'+c.name+'</h2><p class="character-description">'+description+'</p><div class="character-tags"><span>'+primary.kw+'</span><span>'+secondary.kw+'</span></div><details class="character-basis"><summary>이 캐릭터가 나온 이유</summary>'+fateTraitsHTML(ch)+'<p>'+primary.t+'. '+(evidence?evidence.sys.join(" · ")+"에서 이 성향을 함께 읽었어요.":"")+'</p><p>타고난 성향으로 정해져서, 날짜가 바뀌어도 그대로예요.</p></details></section>';
}
window.OracleCharacters={version:2,select,names,groups,penguins};
/* 2026-11-12: 캐릭터 그림을 받는 동안 칸을 비워 두고 메모하는 강아지를 보여 준 뒤 캐릭터로 바꾼다(우정 캐릭터 확인과 같은 방식). */
let spriteReady=null;
/* 2026-11-13: 36종 시트(351KB) 대신 캐릭터 한 장(img/characters/NN.webp, 약 14KB)만 받는다. */
function loadSprite(n){return new Promise(r=>{if(!n)return r();const i=new Image();i.onload=i.onerror=()=>r();i.src="img/characters/"+n+".webp";});}
function reveal(){const els=[...document.querySelectorAll(".character-art[data-loading]")];if(!els.length)return;Promise.all(els.map(e=>loadSprite(e.dataset.art))).then(()=>els.forEach(e=>e.removeAttribute("data-loading")));}
const original=resultIntroHTML;
resultIntroHTML=function(ch){
 const quadrant=fateTraitsHTML(ch);
 const content=original(ch).split(quadrant).join("");
 const card=html(ch);
 const lead=/(<p class="res-lead">[\s\S]*?<\/p>)/;
 setTimeout(reveal,0);
 return lead.test(content)?content.replace(lead,match=>match+card):content+card;
};
if(typeof CH!=="undefined"&&CH&&CH.inp&&document.getElementById("resIntro"))document.getElementById("resIntro").innerHTML=resultIntroHTML(CH);
})();
;
/* ==== pair-characters.js ==== */
/* Pair scenes interpret existing natal compatibility signals; no score changes. */
(()=>{
'use strict';
const scenes={
 rhythm:{title:'같은 박자로 걷는 우리',copy:'익숙한 생활 방식과 함께하는 리듬에서 공통점을 찾기 쉬운 조합이에요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="50" cy="86" rx="40" ry="5" fill="#e9dfcf" stroke="none"/><path d="M9 74q20-11 42 0t40-1" stroke="#c6b79a" stroke-dasharray="3 4"/><path d="M14 45l8-17 17 4 2 25 11 8q4 9-5 11H13q-9-5-4-13z" fill="#a8b7bd"/><path d="M18 43l19 2m-20 5 21 2m-12-18-3 8m9-7-2 8" stroke="#fff4df" stroke-width="3"/><path d="M10 65q16 6 39 2l1 7H11z" fill="#f5e6cb"/><path d="M58 41l5-17 17 4 2 27 10 8q4 9-5 11H56q-8-4-4-12z" fill="#d4aaa0"/><path d="M62 40l17 3m-18 4 19 3m-11-17-3 8m8-6-2 8" stroke="#fff4df" stroke-width="3"/><path d="M54 63q15 6 36 2l1 7H55z" fill="#f5e6cb"/><path d="M35 16l4-7m10 10 1-9m10 7 5-7" stroke="#d3ab65" stroke-width="2"/></g>'},
 map:{title:'다른 재능, 하나의 방향',copy:'서로 다른 강점이 빈자리를 채워 주는 조합이에요. 잘하는 일을 나누고 고마움을 표현해 보세요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="50" cy="88" rx="39" ry="5" fill="#eadcc8" stroke="none"/><path d="M9 23l26-8 29 9 26-7-3 57-25 10-28-10-24 7z" fill="#fae9c7"/><path d="M35 15l-1 59 28 10 2-60z" fill="#f1d6a3" stroke="none"/><path d="M35 18l-1 53m30-44-2 53" stroke="#bc9862" stroke-dasharray="3 4"/><path d="M19 58q0-18 17-16t18 11q8 10 22-12" stroke="#b97b58" stroke-width="2" stroke-dasharray="3 4"/><path d="M18 30l7-4 5 5-8 5zM18 67l9-5m42-27 10-4 4 6-8 5" stroke="#96a38a"/><circle cx="70" cy="64" r="19" fill="#d4a96b"/><circle cx="70" cy="63" r="15" fill="#fff7e6"/><path d="M70 45v4m0 28v4M52 63h4m28 0h4" stroke="#997751"/><path d="M75 53l-2 13-9 7 3-13z" fill="#b97b69"/><path d="M67 60l6 6" stroke="#fff3dc"/><circle cx="70" cy="63" r="2" fill="#5c4333" stroke="none"/><path d="M13 14l-3-5m77 1 3-4" stroke="#d9aa55"/></g>'},
 umbrella:{title:'네 마음에 우산이 되어',copy:'감정을 나누고 마음을 돌보는 방식에서 조화를 읽었어요. 편안함을 당연하게 여기지 않는 게 좋아요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="52" cy="88" rx="32" ry="4" fill="#e4ddd1" stroke="none"/><path d="M21 14l-3 7m58-5-2 6m15 26-3 7M12 53l-2 5m73 12-2 5" stroke="#a0bac0" stroke-width="3"/><path d="M50 13v58q0 17 11 15 10-2 8-12" stroke="#a47e55" stroke-width="5"/><path d="M50 13v-4" stroke-width="3"/><path d="M9 49q4-31 41-34 35 3 42 34-11-9-21 1-10-10-21 0-10-10-20 0-10-10-21-1z" fill="#a4b7a2"/><path d="M50 15Q31 24 30 50q10-10 20 0 11-10 21 0-3-25-21-35z" fill="#e4c7ae"/><path d="M50 15v35M30 50q0-22 20-35 20 13 21 35" fill="none"/><path d="M18 37q7-13 20-15" stroke="#eff2dc" stroke-width="3"/><path d="M35 65q-5-7-10-3-7 6 10 16 17-10 10-16-5-4-10 3z" fill="#dca497" stroke-width="1.5"/></g>'},
 speech:{title:'표현은 달라도 마음은 가까이',copy:'반응과 표현의 차이를 알아가는 조합이에요. 서로 원하는 말과 행동을 구체적으로 알려 주세요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="51" cy="86" rx="36" ry="4" fill="#eadfce" stroke="none"/><path d="M9 21q0-8 9-8h43q8 0 8 8v29q0 8-8 8H34L21 70V58h-4q-8 0-8-8z" fill="#e5c2b4"/><path d="M38 48q0-7 7-7h38q8 0 8 8v24q0 7-8 7h-9l-1 12-15-12H45q-7 0-7-7z" fill="#b5c4ad"/><path d="M25 30q-4-7-9-3-7 6 9 16 16-10 9-16-5-4-9 3z" fill="#c77f76" stroke-width="1.5"/><path d="M44 26h14m-14 8h9" stroke="#fff3e0" stroke-width="3"/><path d="M52 60l5 5 12-12" stroke="#58735f" stroke-width="3"/><path d="M54 71h21m-2-16h8" stroke="#eef1dc" stroke-width="2.5"/><path d="M82 16l3-6m5 14 5-2" stroke="#d3ab65" stroke-width="2"/></g>'},
 bridge:{title:'차이 사이에 다리를 놓는 우리',copy:'생활 기준이나 감정 반응에 조율할 부분이 보여요. 차이를 없애기보다 함께 지킬 작은 약속을 정해 보세요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="50" cy="87" rx="43" ry="5" fill="#e7dfce" stroke="none"/><path d="M7 77q10-7 21 0t22 0 22 0 21 0m-80 7q9-4 18 0m37 0q10-4 20 0" stroke="#a1bdc2" stroke-width="2"/><path d="M10 65Q50 42 90 65l-1 8Q50 51 11 73z" fill="#caa172"/><path d="M16 63l2 8m9-12 2 9m9-12 1 9m11-10v9m11-8-1 9m12-6-2 9m12-5-2 8" stroke="#856246"/><path d="M14 65V31m72 34V30" stroke="#9b7652" stroke-width="5"/><path d="M14 32q35 36 72-2m-72 9q36 34 72-2" stroke="#b89c73" stroke-width="2.5"/><path d="M25 44v15m12-8v5m13-2v0m13-4v6m12-14v17" stroke="#a08259"/><circle cx="14" cy="29" r="4" fill="#d2b184"/><circle cx="86" cy="28" r="4" fill="#d2b184"/><path d="M4 70l5-13 5 13m74 0 5-11 4 11" fill="#a4b293" stroke-width="1.5"/><path d="M46 24q-4-6-8-2-6 5 8 13 13-8 8-13-4-4-8 2z" fill="#dda99b" stroke-width="1.5"/></g>'},
 stars:{title:'같은 별을 바라보는 우리',copy:'관심과 삶의 방향에서 공통점을 찾을 수 있는 조합이에요. 함께 이루고 싶은 작은 목표를 이야기해 보세요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="49" cy="87" rx="34" ry="5" fill="#e8dfd0" stroke="none"/><path d="M16 74Q8 45 28 27t42 0q21 19 13 47" stroke="#bfb4c9" stroke-dasharray="2 5"/><path d="M49 15l10 22 24 3-18 17 3 24-20-12-21 11 4-24-17-18 25-2z" fill="#edcb83"/><path d="M49 23l6 17 18 4-13 10 1 18-13-9-14 7 3-17-13-12 18-1z" fill="#f6e0a8" stroke="none"/><path d="M37 46l-4 6m28-5 4 5" stroke="#fff9e9" stroke-width="3"/><circle cx="41" cy="54" r="1.5" fill="#70543b" stroke="none"/><circle cx="57" cy="54" r="1.5" fill="#70543b" stroke="none"/><path d="M45 61q4 3 8 0" stroke-width="1.5"/><path d="M12 18l3-7 3 7 7 3-7 3-3 7-3-7-7-3zm72 48 3-6 3 6 6 3-6 3-3 6-3-6-6-3z" fill="#c4b5ce" stroke-width="1.5"/><circle cx="83" cy="17" r="3" fill="#e6bd71" stroke="none"/></g>'},
 chairs:{title:'따로 충전하고 함께 웃는 우리',copy:'각자의 자율성과 자기만의 시간을 소중히 여기는 조합이에요. 편안한 연락과 만남의 간격을 함께 정해 보세요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="27" cy="87" rx="23" ry="4" fill="#e7ddce" stroke="none"/><ellipse cx="75" cy="87" rx="21" ry="4" fill="#e7ddce" stroke="none"/><path d="M9 39l5 36m29-36-5 36M10 47h33M15 75l-3 10m25-10 4 10" stroke="#9a7858" stroke-width="3"/><path d="M13 20q14-4 29 0l-2 40H15z" fill="#aab9a2"/><path d="M18 23l-1 32m19-32-1 32" stroke="#d8dfc9"/><path d="M12 59q14-4 30 0v10H12z" fill="#c2cdb3"/><path d="M58 39l5 36m29-36-5 36M59 47h33M64 75l-3 10m25-10 4 10" stroke="#9a7858" stroke-width="3"/><path d="M63 20q14-4 27 1l-2 39H65z" fill="#c8b4c9"/><path d="M69 24l1 31m13-31-1 31" stroke="#eee0e8"/><path d="M62 59q14-4 28 0v10H62z" fill="#d8c9d8"/><path d="M44 52h13l-1 6H45zM50 58v20" fill="#e4cba4"/><path d="M47 45h7v7h-7zM54 46q6 0 2 4" fill="#f7ecda" stroke-width="1.4"/><path d="M47 39q-3-3 0-6m6 6q-3-3 0-6" stroke="#b5a28d" stroke-width="1.3"/><path d="M48 16l3-5 3 5m-3-5v11" stroke="#d5ac62"/></g>'},
 pause:{title:'서로의 속도로, 천천히',copy:'여러 영역에서 속도를 맞출 여지가 보여요. 결론을 서두르기보다 대화하고 쉴 시간을 함께 마련해 보세요.',icon:'<g stroke="#6a4c38" stroke-width="1.9"><ellipse cx="50" cy="88" rx="39" ry="4" fill="#e7ddce" stroke="none"/><path d="M8 37L50 12l42 25z" fill="#a9b9a5"/><path d="M16 36L50 19l34 17" stroke="#d6dfc8"/><path d="M17 38v44m66-44v44" stroke="#ac845a" stroke-width="5"/><path d="M24 56h52v11H24zm-2 13h57v7H22z" fill="#d9b98e"/><path d="M29 76v9m42-9v9m-33-27v7m25-7v7" stroke="#9e7650"/><path d="M41 48h11v8H41zm11 1q9 0 5 6h-5" fill="#e4c2ae" stroke-width="1.5"/><path d="M44 42q-4-4 0-7m5 7q-3-4 0-7" stroke="#b2a18c" stroke-width="1.4"/><path d="M4 78l5-10 5 10m73 0 5-11 4 11" fill="#9eaf91" stroke-width="1.5"/><path d="M68 18l2-7m6 13 6-4" stroke="#d7b471" stroke-width="2"/></g>'}
};
function selectScene(a,b,res){
 const evidence=[];for(const sys of res?.sys||[])for(const item of sys.items||[])evidence.push({label:item[0].replace(/\((상대→나|나→상대)\)/g,''),value:item[1],system:sys.n});
 const rules={rhythm:/일지 육합|같은 일지|같은 숫자|같은 색 무리/,map:/오행 보완|일간 상생|숫자 보완|태양 보완 원소|맞은편 기호/,umbrella:/달의 조화|달 별자리 조화|달 별자리 1·7|영혼 수 조화/,speech:/태양 원소 차이|달의 차이/,bridge:/일지 충|일간 기준 차이|띠 충/,stars:/같은 인생 수|인생 수 조화|태양 같은 원소|일지 삼합/};
 const candidates=Object.entries(rules).map(([key,re],order)=>{const basis=evidence.filter(e=>re.test(e.label));return {key,order,basis,score:basis.reduce((n,e)=>n+Math.abs(e.value),0)}});
 const negative=evidence.filter(e=>e.value<0);
 if(negative.length>=4)candidates.push({key:'pause',order:6,basis:negative,score:negative.reduce((n,e)=>n+Math.abs(e.value),0)*.65});
 const ac=OracleCharacters.select(reportTags(a)),bc=OracleCharacters.select(reportTags(b));
 if(ac.primary==='free'&&bc.primary==='free')candidates.push({key:'chairs',order:7,basis:[{system:'개인 성향',label:'두 사람 모두 자율·변화 성향',value:0}],score:18});
 candidates.sort((x,y)=>y.score-x.score||x.order-y.order);
 const winner=candidates[0];return winner?.score>0?winner:{key:'stars',basis:[],score:0};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function art(c){const p=OracleCharacters.penguins[c.id];if(p)return '<img class="pair-art" src="'+p.image+'" width="360" height="360" loading="lazy" decoding="async" alt="'+esc(c.name)+'">';const n=c.id-1;return '<div class="pair-art pair-dog" role="img" aria-label="'+esc(c.name)+'" style="background-image:url(img/characters/'+String(n+1).padStart(2,'0')+'.webp);background-size:contain;background-position:center"></div>'}
function renderCard(a,b,scene,names=['나','상대']){const s=scenes[scene.key]||scenes.stars,twin=a.id===b.id;/* 같은 타고난 캐릭터면 닮은꼴로 보여 준다(두 번째는 좌우 반전해 마주 보게) */return '<section class="pair-character'+(twin?' pair-twin':'')+'" aria-label="우리 둘의 관계 캐릭터" data-pair-scene="'+scene.key+'">'+(twin?'<p class="pair-twin-note">두 사람 모두 「'+esc(a.name)+'」, 타고난 결이 닮은 닮은꼴 사이예요. 말하지 않아도 통하는 게 많아요.</p>':'')+'<p class="pair-eyebrow">우리 둘의 관계 캐릭터</p><h3>'+s.title+'</h3><div class="pair-stage"><figure>'+art(a)+'<figcaption><b>'+esc(names[0])+'</b><span>'+esc(a.name)+'</span></figcaption></figure><div class="pair-prop" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+s.icon+'</svg></div><figure>'+art(b)+'<figcaption><b>'+esc(names[1])+'</b><span>'+esc(b.name)+'</span></figcaption></figure></div><p class="pair-description">'+s.copy+'</p><details class="pair-basis"><summary>이 장면이 나온 이유</summary><p>'+ (scene.basis.length?scene.basis.map(x=>esc(x.system+' · '+x.label)).filter((x,i,l)=>l.indexOf(x)===i).join('<br>'):'뚜렷하게 우세한 관계 신호가 없어 함께 방향을 찾아가는 기본 장면을 보여드려요.')+'</p></details></section>'}
function html(a,b,res){return renderCard(OracleCharacters.select(reportTags(a)),OracleCharacters.select(reportTags(b)),selectScene(a,b,res),[a.inp.name||'나',b.inp.name||'상대'])}
window.OraclePairCharacters={version:2,scenes,selectScene,renderCard,html};
if(typeof cmpShowOne==='function'){
 const original=cmpShowOne;
 cmpShowOne=function(...args){original.apply(this,args);if(!COMPAT||COMPAT.mode!=='match'||COMPAT.kind==='friend'||CMPKIND==='group'||!CH)return;const out=document.querySelector('#cmpOne .cmp-out')||document.querySelector('#cmpOne .cmp-result');if(!out)return;out.querySelector('.pair-character')?.remove();out.insertAdjacentHTML('afterbegin',html(CH,COMPAT.b,COMPAT.res));};
}
})();
;
/* ==== pair-share.js ==== */
/* 2026-11-13: 궁합 관계 캐릭터 카드(.pair-character)를 이미지로 저장·공유한다.
   출생 정보는 넣지 않는다(이름·캐릭터·장면 문구만). 휴대폰은 시스템 공유 창, 안 되면 PNG 내려받기. */
(()=>{"use strict";
const W=1080,F="'IBM Plex Sans KR',sans-serif",J="MemomentKkukkukk,'IBM Plex Sans KR',sans-serif";
const load=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
function lines(g,t,max){const out=[];let line='';for(const w of t.split(/\s+/)){const s2=line?line+' '+w:w;if(g.measureText(s2).width>max&&line){out.push(line);line=w}else line=s2}if(line)out.push(line);return out}
function wrap(g,text,x,y,max,lh){const out=[];let line='';for(const w of text.split(/\s+/)){const t=line?line+' '+w:w;if(g.measureText(t).width>max&&line){out.push(line);line=w}else line=t}if(line)out.push(line);out.forEach((l,i)=>g.fillText(l,x,y+i*lh));return out.length}
async function sprite(g,el,x,y,s){const cs=getComputedStyle(el),url=(cs.backgroundImage.match(/url\(["']?([^"')]+)/)||[])[1];if(!url)return;const img=await load(url);
 if(!/%/.test(cs.backgroundSize)){g.drawImage(img,x,y,s,s);return}const [sx,sy]=cs.backgroundSize.split(' ').map(v=>parseFloat(v)/100),[px,py]=cs.backgroundPosition.split(' ').map(v=>parseFloat(v)/100);
 const cw=img.width/sx,chh=img.height/sy,ox=px*(img.width-cw),oy=py*(img.height-chh);g.drawImage(img,ox,oy,cw,chh,x,y,s,s)}
async function render(card){
 const F="MemomentKkukkukk,'IBM Plex Sans KR',sans-serif",J=F,habits=[...card.querySelectorAll('.tc-list li')].map(li=>[li.querySelector('b')?.textContent||'',li.querySelector('small')?.textContent||'']);
 try{await Promise.all([(window.loadMemoment?await window.loadMemoment():0),document.fonts.load('60px MemomentKkukkukk',(card.querySelector('h3')?.textContent||'')+'운명탐정 '+(card.querySelector('.tc-head')?.textContent||'')+'123'),document.fonts.load('34px MemomentKkukkukk',card.textContent.slice(0,400))])}catch(_){}
 await document.fonts?.ready;const compact=habits.length>0,H=compact?1440:1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#FFF9F4';g.fillRect(0,0,W,H);
 g.fillStyle='#FDF1DF';g.strokeStyle='#E9D3B0';g.lineWidth=3;g.beginPath();g.roundRect(60,60,W-120,H-200,48);g.fill();g.stroke();
 g.textAlign='center';g.fillStyle='#8A5A1E';g.font='32px '+F;g.fillText(card.querySelector('.pair-eyebrow')?.textContent||'우리 둘의 관계 캐릭터',W/2,compact?140:170);
 g.fillStyle='#4A352B';g.font=(compact?'58px ':'64px ')+J;wrap(g,card.querySelector('h3')?.textContent||'',W/2,compact?215:260,W-220,70);
 const figs=[...card.querySelectorAll('.pair-stage figure')],S=compact?250:360,top=compact?250:360,pos=[[compact?150:110,top],[W-(compact?150:110)-S,top]];
 for(let i=0;i<2&&i<figs.length;i++){const art=figs[i].querySelector('.pair-art');try{await sprite(g,art,pos[i][0],pos[i][1],S)}catch(_){}
  g.fillStyle='#4A352B';g.font=(compact?'700 38px ':'700 46px ')+F;g.fillText(figs[i].querySelector('b')?.textContent||'',pos[i][0]+S/2,pos[i][1]+S+(compact?44:60));
  g.fillStyle='#7a6457';g.font=(compact?'28px ':'34px ')+F;g.fillText(figs[i].querySelector('span')?.textContent||'',pos[i][0]+S/2,pos[i][1]+S+(compact?82:108))}
 const svg=card.querySelector('.pair-prop svg');if(svg){try{const cp=svg.cloneNode(true);cp.setAttribute('xmlns','http://www.w3.org/2000/svg');const z=compact?130:180;cp.setAttribute('width',z);cp.setAttribute('height',z);const im=await load('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(cp)));g.drawImage(im,W/2-z/2,top+S/2-z/2,z,z)}catch(_){}}
 g.fillStyle='#4A352B';g.font=(compact?'32px ':'38px ')+F;const dl=wrap(g,card.querySelector('.pair-description')?.textContent||'',W/2,compact?680:960,W-240,compact?48:60);
 if(compact){let y=680+dl*48+30;g.fillStyle='#8A5A1E';g.font='34px '+J;g.fillText(card.querySelector('.tc-head')?.textContent||'',W/2,y);y+=26;g.textBaseline='middle';
  habits.forEach((x,i)=>{g.font='30px '+F;const a=lines(g,x[0],W-380);g.font='26px '+F;const b=lines(g,x[1],W-380);const rows=[...a.map(t=>[t,'600 30px '+F,'#4A352B',42]),...b.map(t=>[t,'26px '+F,'#9a6a5c',38])],h=Math.max(96,rows.reduce((s,r)=>s+r[3],0)+28),cy=y+h/2;
   g.fillStyle='#FFFFFF';g.beginPath();g.roundRect(120,y,W-240,h,24);g.fill();g.textAlign='center';g.fillStyle='#D0587A';g.font='36px '+J;g.fillText(String(i+1),168,cy);g.textAlign='left';
   let ty=y+14;rows.forEach(([t,f,col,lh])=>{g.font=f;g.fillStyle=col;g.fillText(t,210,ty+lh/2);ty+=lh});y+=h+12});g.textBaseline='alphabetic';g.textAlign='center'}
 g.fillStyle='#8A5A1E';g.font='40px '+J;g.fillText('운명탐정',W/2,H-80);g.fillStyle='#9a8576';g.font='28px '+F;g.fillText('fatedog.co.kr',W/2,H-38);
 return toBlob(c)}
/* 2026-11-14 우정(두 사람) 캐릭터 조합(.social-share-card)도 같은 틀로 그린다: 캐릭터 별명·그림·이름·역할 */
async function renderSocial(box){
 /* 2026-11-14 b 우정(두 사람): 오려 둔 캐릭터 두 마리를 나란히 세운다(상자 없이). 위에 별명, 아래에 이름·역할 */
 const F="MemomentKkukkukk,'IBM Plex Sans KR',sans-serif",dogs=[...box.querySelectorAll('.social-dog')].slice(0,2),roles={};
 box.querySelectorAll('.social-role-table tbody tr').forEach(tr=>{const td=tr.querySelectorAll('th,td');if(td.length>1)roles[td[0].textContent.trim()]=td[1].textContent.trim()});
 try{if(window.loadMemoment)await window.loadMemoment();await document.fonts.load('60px MemomentKkukkukk',box.textContent.slice(0,400)+'우리 둘의 캐릭터 조합 운명탐정')}catch(_){}
 const imgs=await Promise.all(dogs.map(async d=>{const pg=d.querySelector('.social-penguin-image'),sp=d.querySelector('.social-dog-sprite'),k=sp?cutKey(sp):null;try{return await load(pg?pg.getAttribute('src'):'img/social-cut/'+k+'.webp')}catch(_){return null}}));
 const H=1150,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#FFF6EA';g.fillRect(0,0,W,H);const rnd=seeded(dogs.map(d=>d.textContent).join('|'));
 for(let i=0;i<18;i++){const x=60+rnd()*(W-120),y=230+rnd()*(H-400),r=6+rnd()*9;g.fillStyle=i%3?'rgba(242,196,90,.55)':'rgba(255,134,176,.35)';g.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*0.38:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill()}
 g.textAlign='center';g.fillStyle='#4A352B';g.font='60px '+F;g.fillText('우리 둘의 캐릭터 조합',W/2,150);
 const box2=400,feet=740,cx=[W/2-240,W/2+240];
 for(let i=0;i<dogs.length;i++){const d=dogs[i],im=imgs[i],x=cx[i],name=d.querySelector('.social-dog-name')?.textContent.trim()||'';
  g.fillStyle='#8A5A1E';g.font='36px '+F;wrap(g,d.querySelector('.social-dog-label')?.textContent.trim()||'',x,300,box2,44);
  if(im){const sc=Math.min(box2/im.width,box2/im.height),w=im.width*sc,h=im.height*sc;g.save();g.shadowColor='rgba(74,53,43,.18)';g.shadowBlur=14;g.shadowOffsetY=6;g.drawImage(im,x-w/2,feet-h,w,h);g.restore()}
  g.fillStyle='#4A352B';g.font='700 48px '+F;g.fillText(name,x,feet+80);
  if(roles[name]){g.fillStyle='#B0613F';g.font='32px '+F;wrap(g,roles[name],x,feet+130,box2,42)}}
 g.fillStyle='#8A5A1E';g.font='40px '+F;g.fillText('운명탐정',W/2,H-80);g.fillStyle='#9a8576';g.font='28px '+F;g.fillText('fatedog.co.kr',W/2,H-38);
 return toBlob(c)}
/* 2026-11-14 모임(3~8명) 단체 사진: 배경을 오려 낸 캐릭터(img/social-cut/<시트><번호>.webp)를 줄줄이 겹쳐 세우고(뒤로 갈수록 작게),
   크기·기울기·위치를 이름으로 정한 무작위로 살짝 흔든다(같은 모임이면 같은 배치). 나(첫 사람)는 앞줄 가운데. 별명은 화살표로 가리킨다. */
function cutKey(el){const cs=getComputedStyle(el),m=cs.backgroundImage.match(/social-dogs-([a-d])-/);if(!m)return null;const [px,py]=cs.backgroundPosition.split(' ').map(v=>Math.round(parseFloat(v)/50));return m[1]+(py*3+px)}
function seeded(str){let h=1779033703;for(const ch of str)h=Math.imul(h^ch.charCodeAt(0),3432918353),h=h<<13|h>>>19;return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^=h>>>16)>>>0)/4294967296}}
function arrow(g,x1,y1,x2,y2,bend){const mx=(x1+x2)/2+bend,my=(y1+y2)/2;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(mx,my,x2,y2);g.stroke();const a=Math.atan2(y2-my,x2-mx);g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-16*Math.cos(a-0.45),y2-16*Math.sin(a-0.45));g.moveTo(x2,y2);g.lineTo(x2-16*Math.cos(a+0.45),y2-16*Math.sin(a+0.45));g.stroke()}
async function renderGroup(box){
 const F="MemomentKkukkukk,'IBM Plex Sans KR',sans-serif",dogs=[...box.querySelectorAll('.social-dog')].slice(0,8),n=dogs.length;
 try{if(window.loadMemoment)await window.loadMemoment();await document.fonts.load('60px MemomentKkukkukk',box.textContent.slice(0,800)+'우리 모임 단체 사진 명의 캐릭터 조합 운명탐정')}catch(_){}
 const people=await Promise.all(dogs.map(async d=>{/* 펭귄은 이미 투명 배경 그림(img.social-penguin-image), 강아지·고양이는 오려 둔 그림 */const pg=d.querySelector('.social-penguin-image'),sp=d.querySelector('.social-dog-sprite'),k=sp?cutKey(sp):null;let img=null;try{img=await load(pg?pg.getAttribute('src'):'img/social-cut/'+k+'.webp')}catch(_){}return {name:d.querySelector('.social-dog-name')?.textContent.trim()||'',nick:d.querySelector('.social-dog-label')?.textContent.trim()||'',img}}));
 const rnd=seeded(people.map(p=>p.name).join('|')),H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#FFF6EA';g.fillRect(0,0,W,H);
 for(let i=0;i<26;i++){const x=60+rnd()*(W-120),y=260+rnd()*(H-420),r=6+rnd()*10;g.fillStyle=i%3?'rgba(242,196,90,.55)':'rgba(255,134,176,.35)';g.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*0.38:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill()}
 g.textAlign='center';g.fillStyle='#4A352B';g.font='64px '+F;g.fillText('우리 모임 단체 사진',W/2,150);g.fillStyle='#8A5A1E';g.font='32px '+F;g.fillText(n+'명의 캐릭터 조합',W/2,200);
 const plan={3:[1,2],4:[2,2],5:[2,3],6:[3,3],7:[3,4],8:[4,4]}[n]||[n],R=plan.length,front=plan[R-1];
 /* 줄마다 사람 배치: 나는 앞줄 가운데 */
 const others=people.slice(1),rows=plan.map(k=>Array(k).fill(null)),mid=Math.floor((front-1)/2);rows[R-1][mid]=people[0];let q=0;for(let r=R-1;r>=0;r--)for(let i=0;i<rows[r].length;i++)if(!rows[r][i])rows[r][i]=others[q++];
 const base=Math.min(n<=3?430:n<=4?380:340,(W-120)/front*1.2),items=[];let feet=0;
 for(let r=R-1;r>=0;r--){const sz=base*Math.pow(0.86,R-1-r),k=rows[r].length,step=(W-150)/k;
  rows[r].forEach((p,i)=>{const s=sz*(0.94+rnd()*0.12),ar=p.img?p.img.height/p.img.width:1,w=ar>1?s/ar:s,h=ar>1?s:s*ar,cx=75+step*(i+0.5)+(rnd()-0.5)*40+(r<R-1&&k===plan[r+1]?step*0.25:0);
   items.push({p,r,cx,feet:feet+(rnd()-0.5)*24,w,h,rot:(rnd()-0.5)*0.22})});feet-=sz*0.52}
 const top=Math.min(...items.map(t=>t.feet-t.h))-110,bottom=110,span=bottom-top,area=[250,1150],sc=Math.min(1,(area[1]-area[0])/span),oy=area[0]-top*sc+((area[1]-area[0])-span*sc)/2;
 for(const t of items){t.w*=sc;t.h*=sc;t.feet=oy+t.feet*sc;t.cx=W/2+(t.cx-W/2)*Math.min(1,sc*1.05);t.cx=Math.max(30+t.w/2,Math.min(W-30-t.w/2,t.cx))}
 for(let r=0;r<R;r++)for(const t of items.filter(t=>t.r===r)){if(!t.p.img)continue;g.save();g.translate(t.cx,t.feet);g.rotate(t.rot);g.shadowColor='rgba(74,53,43,.18)';g.shadowBlur=14;g.shadowOffsetY=6;g.drawImage(t.p.img,-t.w/2,-t.h,t.w,t.h);g.restore()}
 /* 별명 + 이름, 화살표로 가리키기: 앞줄은 발밑, 나머지는 머리 위 */
 g.lineCap='round';g.lineJoin='round';
 for(const t of items){const below=t.r===R-1,k4=items.filter(u=>u.r===t.r).length>=4;let lx=Math.max(120,Math.min(W-120,t.cx+(below||k4?0:(t.cx<W/2?-30:30))));const ly=below?t.feet+64:t.feet-t.h-58;
  g.font=(k4?'26px ':'30px ')+F;{const hw=g.measureText(t.p.nick).width/2+14;lx=Math.max(70+hw,Math.min(W-70-hw,lx))}g.lineWidth=9;g.strokeStyle='#FFF6EA';g.strokeText(t.p.nick,lx,ly);g.fillStyle='#4A352B';g.fillText(t.p.nick,lx,ly);
  g.font=(k4?'600 23px ':'600 26px ')+F;g.strokeText(t.p.name,lx,ly+(below?34:-36));g.fillStyle='#B0613F';g.fillText(t.p.name,lx,ly+(below?34:-36));
  g.strokeStyle='#8A5A1E';g.lineWidth=3.5;below?arrow(g,lx+(lx<t.cx?20:-20),ly-34,t.cx+(t.cx<W/2?-10:10),t.feet-t.h*0.18,lx<W/2?-30:30):arrow(g,lx,ly+12,t.cx+(t.cx<W/2?8:-8),t.feet-t.h*0.86,t.cx<W/2?-24:24)}
 g.fillStyle='#8A5A1E';g.font='40px '+F;g.fillText('운명탐정',W/2,H-80);g.fillStyle='#9a8576';g.font='28px '+F;g.fillText('fatedog.co.kr',W/2,H-38);
 return toBlob(c)}
/* 아이폰 사파리는 누른 직후에만 공유 창을 연다. 그래서 이미지를 미리 만들어 두고(prep), 누르면 바로 navigator.share를 부른다.
   미리 만들기가 덜 끝났으면 만든 뒤 '한 번 더 눌러 주세요'로 바꾸고, 공유가 막히면 화면에 이미지를 띄워 길게 눌러 저장하게 한다. */
const ready=new WeakMap();
function toBlob(c){return new Promise(ok=>{try{c.toBlob(b=>{if(b)return ok(b);fetch(c.toDataURL('image/png')).then(r=>r.blob()).then(ok,()=>ok(null))},'image/png')}catch(_){ok(null)}})}
function cardOf(btn){return btn.closest('.pair-character')||btn.closest('.social-share-card')}
function build(card){return card.matches('.social-share-card')?(card.querySelectorAll('.social-dog').length>2?renderGroup(card):renderSocial(card)):render(card)}
function prep(card){if(!ready.has(card))ready.set(card,build(card).then(blob=>{if(!blob)throw Error('blob 없음');let file=null;try{file=new File([blob],card.querySelectorAll('.social-dog').length>2?'운명탐정-우리모임.png':'운명탐정-우리둘.png',{type:'image/png'})}catch(_){}return {blob,file}}).catch(e=>{ready.delete(card);card.dataset.psErr=String(e&&e.message||e).slice(0,80);card.classList.add('ps-fail');try{console.error('share image',e)}catch(_){}return null}));return ready.get(card)}
/* 무료 화면에 이미지 자체를 효과와 함께 보여 준다(우정·모임 카드). 기존 칸 그림(.social-cast)은 숨긴다 */
function inline(box,r){if(!r||box.querySelector('.ps-inline'))return;const img=new Image();img.className='ps-inline';img.alt='우리 캐릭터 조합 이미지';img.src=URL.createObjectURL(r.blob);(box.querySelector('.social-cast')||box.firstElementChild).before(img);box.classList.add('ps-has-img')}
function showImage(blob){const url=URL.createObjectURL(blob),d=document.createElement('dialog');d.className='ps-view';d.innerHTML='<p>이미지를 길게 눌러 저장하거나 공유해 주세요.</p><img alt="공유 이미지"><div><a download="운명탐정.png">사진 저장하기</a><button type="button">닫기</button></div>';d.querySelector('img').src=url;d.querySelector('a').href=url;document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.addEventListener('close',()=>{URL.revokeObjectURL(url);d.remove()});d.showModal()}
function share(btn){const card=cardOf(btn);if(!card||btn.disabled)return;const p=ready.get(card);let res=null;
 p&&p.then(r=>{res=r});
 /* 이미 만들어졌으면 같은 탭 안에서 바로 공유 */
 const go=r=>{if(r.file&&navigator.canShare&&navigator.canShare({files:[r.file]})){navigator.share({files:[r.file]}).then(()=>{try{window.oracleShared&&oracleShared('pair')}catch(_){}}).catch(e=>{if(!e||e.name!=='AbortError')showImage(r.blob)})}else showImage(r.blob)};
 if(btn.dataset.ready==='1'&&btn._r){go(btn._r);return}
 const old=btn.dataset.label||btn.textContent;btn.dataset.label=old;btn.disabled=true;btn.textContent='이미지 만드는 중…';
 prep(card).then(r=>{btn.disabled=false;if(!r){btn.textContent=old;alert('이미지를 만들지 못했어요. 다시 시도해 주세요.'+(card.dataset.psErr?' ('+card.dataset.psErr+')':''));return}btn._r=r;btn.dataset.ready='1';btn.textContent='이미지 준비 완료 · 눌러서 공유하기'})}
function add(root){for(const box of root.querySelectorAll?root.querySelectorAll('.social-share-card'):[]){if(box.querySelector('.pair-share')||box.querySelectorAll('.social-dog').length<2)continue;const b=document.createElement('button');b.type='button';b.className='pair-share fd-cta fd-cta-sub';b.textContent='이미지로 저장·공유하기';box.querySelector('.social-share-button')?.before(b);setTimeout(()=>prep(box).then(r=>{if(r){b._r=r;b.dataset.ready='1';inline(box,r)}}),300)}
 for(const card of root.querySelectorAll?root.querySelectorAll('.pair-character'):[]){if(card.querySelector('.pair-share'))continue;const b=document.createElement('button');b.type='button';b.className='pair-share fd-cta fd-cta-sub';b.textContent='이미지로 저장·공유하기';(card.querySelector('.tc-wrap')||card.querySelector('.pair-description'))?.after(b);setTimeout(()=>prep(card).then(r=>{if(r){b._r=r;b.dataset.ready='1'}}),600)}}
document.addEventListener('click',e=>{const b=e.target.closest('.pair-share');if(b)share(b)});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches?.('.pair-character,.social-share-card'))add(n.parentNode);else add(n)}}).observe(document.body,{childList:true,subtree:true});
add(document);
})();
;
/* ==== character-share.js ==== */
/* 2026-11-13: '나의 운명 캐릭터' 카드를 인스타 스토리 크기(1080×1920) 이미지로 저장·공유한다.
   출생 정보는 넣지 않는다. 이름은 '이름 넣기'를 켰을 때만. 시스템 공유(files) → 안 되면 내려받기.
   분석: GA4 'share_character'·Clarity 이벤트(사이트 도메인에서만 수집됨). */
(()=>{"use strict";
/* 공유 이미지 공통 글꼴: 메모먼트 꾹꾹체(KS 완성형 2,350자 + 영문·숫자 woff2 약 1.8MB, 사용자 허락으로 변환·서브셋). 공유 버튼을 누를 때만 받는다. 없는 글자는 IBM Plex로 대신 그린다. */
window.loadMemoment=window.loadMemoment||(()=>{let p=null;return()=>p||(p=(async()=>{try{const ff=new FontFace('MemomentKkukkukk','url(img/fonts/memoment-kkukkukk-ks.woff2)');await ff.load();document.fonts.add(ff);window.__mmFont=1}catch(_){p=null}})())})();
const W=1080,H=1920,INK='#4A352B',GOLD='#8A5A1E',SUB='#7a6253',LINE='#ecd6a8';
const track=(n,p)=>{try{window.track&&window.track(n,p||{})}catch(_){}};
function inject(sec){if(!sec||sec.querySelector('.cs-share'))return;
 const box=document.createElement('div');box.className='cs-share';
 box.innerHTML='<button type="button" class="cs-btn" aria-label="캐릭터 이미지 저장·공유" title="이미지 저장·공유"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg><span>공유</span></button><p class="cs-status" role="status"></p>';
 sec.prepend(box)}
new MutationObserver(ms=>{document.querySelectorAll('.destiny-character').forEach(inject);if(document.body.classList.contains('demo'))return;for(const m of ms)for(const n of m.addedNodes){const d=n.nodeType===1&&(n.matches('.destiny-character')?n:n.querySelector&&n.querySelector('.destiny-character'));if(d&&!d.dataset.revealed){d.dataset.revealed='1';d.classList.add('cs-reveal')}}}).observe(document.body,{childList:true,subtree:true});
document.querySelectorAll('.destiny-character').forEach(inject);
const img=src=>new Promise((ok,no)=>{const i=new Image();i.decoding='async';i.onload=()=>ok(i);i.onerror=no;i.src=src});
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function bbox(im){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return x1>x0?[x0,y0,x1-x0+1,y1-y0+1]:[0,0,c.width,c.height]}
function wrap(c,t,max){const out=[];let line='';for(const w of t.split(' ')){const s=line?line+' '+w:w;if(c.measureText(s).width>max&&line){out.push(line);line=w}else line=s}if(line)out.push(line);return out}
async function draw(sec,withName){
 const name=withName?(document.body.classList.contains('demo')?'운탐정':((typeof CH!=='undefined'&&CH&&CH.inp&&CH.inp.name)||'')).trim():'';
 const title=(sec.querySelector('h2')||{}).textContent||'';
 const descEl=sec.querySelector('.character-description');
 const desc=descEl?descEl.innerHTML.split(/<br\s*\/?>/i).map(s=>s.replace(/<[^>]+>/g,'').trim()).filter(Boolean).map(s=>s.replace(/당신/g,name?name+'님':'나')):[];
 const art=sec.querySelector('.character-art img')||sec.querySelector('.character-art');
 const src=art?(art.tagName==='IMG'?art.src:(getComputedStyle(art).backgroundImage.match(/url\("?([^")]+)"?\)/)||[])[1]):null;
 await window.loadMemoment();
 const allText='운명탐정입니다님은나는'+name+title+desc.join('')+'사주·서양점성술베딕수비학마야력다섯가지점술로읽은운명캐릭터fatedog.co.kr';
 try{await Promise.all([document.fonts.load('40px MemomentKkukkukk',allText),document.fonts.load('40px MemomentKkukkukk',allText),document.fonts.load('40px MemomentKkukkukk',allText),document.fonts.load('40px MemomentKkukkukk',allText)])}catch(_){}
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const bg=c.createRadialGradient(W/2,H*.45,0,W/2,H*.45,H*.7);bg.addColorStop(0,'#fff3d6');bg.addColorStop(.5,'#fff9f4');bg.addColorStop(1,'#fbeee2');c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.fillStyle='rgba(232,185,100,.18)';for(let y=27;y<H;y+=54)for(let x=27;x<W;x+=54){c.beginPath();c.arc(x,y,3,0,7);c.fill()}
 /* 카드 상자 */
 const CX=70,CW=W-140,R=250;c.font='40px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';const nLines=desc.reduce((t,p)=>t+wrap(c,p,CW-120).length,0);const CH2=40+90+118+80+2*R+84+62*nLines+30+150+70,CY=Math.max(120,Math.round((H-CH2)/2)-30);c.save();c.shadowColor='rgba(138,90,30,.14)';c.shadowBlur=60;c.shadowOffsetY=20;rr(c,CX,CY,CW,CH2,56);c.fillStyle='rgba(255,255,255,.82)';c.fill();c.restore();rr(c,CX,CY,CW,CH2,56);c.lineWidth=3;c.strokeStyle=LINE;c.stroke();
 c.textAlign='center';c.textBaseline='alphabetic';
 let mascot=null;try{mascot=await img('img/mascot.webp')}catch(_){}
 const py=CY+40;
 /* 제목 */
 let y=py+90;c.fillStyle=SUB;c.font='46px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';c.fillText(name?name+'님은':'나는',W/2,y);
 y+=118;let fs=104;c.font=fs+'px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';const tail='입니다';
 const fit=()=>{c.font=fs+'px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';const a=c.measureText(title).width;c.font='46px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';return a+12+c.measureText(tail).width};
 while(fit()>CW-100&&fs>60)fs-=4;
 const total=fit();c.font=fs+'px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';const tw=c.measureText(title).width,sx=W/2-total/2;
 c.textAlign='left';c.fillStyle=INK;c.fillText(title,sx,y);c.font='46px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';c.fillStyle=SUB;c.fillText(tail,sx+tw+12,y);c.textAlign='center';
 /* 캐릭터 원 */
 const cy=y+80+R;c.save();c.shadowColor='rgba(138,90,30,.16)';c.shadowBlur=70;c.shadowOffsetY=24;c.beginPath();c.arc(W/2,cy,R,0,7);c.fillStyle='#fff';c.fill();c.restore();
 c.fillStyle='#e8b964';c.font='58px MemomentKkukkukk, sans-serif';c.fillText('✦',W/2-R-30,cy-R+70);c.fillText('✦',W/2+R+20,cy+R-50);
 if(src){try{const im=await img(src),[bx,by,bw2,bh]=bbox(im),s=Math.min(360/bw2,360/bh);c.drawImage(im,bx,by,bw2,bh,W/2-bw2*s/2,cy-bh*s/2,bw2*s,bh*s)}catch(_){}}
 /* 소개 */
 y=cy+R+84;c.fillStyle=INK;c.font='40px MemomentKkukkukk, \"IBM Plex Sans KR\", sans-serif';
 for(const p of desc)for(const l of wrap(c,p,CW-120)){c.fillText(l,W/2,y);y+=62}
 /* 근거·링크 */
 const by2=y+30;c.strokeStyle=LINE;c.lineWidth=2;c.beginPath();c.moveTo(W/2-200,by2-58);c.lineTo(W/2+200,by2-58);c.stroke();c.fillStyle=SUB;c.font='30px MemomentKkukkukk, \"IBM Plex Sans KR\", sans-serif';c.fillText('사주 · 서양 점성술 · 베딕 점성술 · 수비학 · 마야력',W/2,by2);
 c.fillStyle='#8c7565';c.font='30px MemomentKkukkukk, \"IBM Plex Sans KR\", sans-serif';c.fillText('다섯 가지 점술로 읽은 운명 캐릭터',W/2,by2+46);
 /* 운명탐정 표시(상자 없이 마스코트 + 글자) */
 c.font='58px MemomentKkukkukk, "IBM Plex Sans KR", sans-serif';const bwd=c.measureText('운명탐정').width,mw=mascot?96:0,gx=W/2-(bwd+mw+(mascot?16:0))/2,gy=by2+150;
 if(mascot)c.drawImage(mascot,gx,gy-74,mw,mw);c.textAlign='left';c.fillStyle=GOLD;c.fillText('운명탐정',gx+mw+(mascot?16:0),gy);c.textAlign='center';
 c.fillStyle=GOLD;c.font='32px MemomentKkukkukk, \"IBM Plex Sans KR\", sans-serif';c.fillText('fatedog.co.kr',W/2,CY+CH2+70);
 return new Promise(ok=>cv.toBlob(ok,'image/jpeg',.9))}
document.addEventListener('click',async e=>{const b=e.target.closest('.cs-btn');if(!b)return;const sec=b.closest('.destiny-character'),st=sec.querySelector('.cs-status'),withName=true;
 b.disabled=true;st.textContent='로딩 중…';
 try{const blob=await draw(sec,withName),title=(sec.querySelector('h2')||{}).textContent||'캐릭터',file=new File([blob],'운명탐정-'+title.replace(/\s+/g,'')+'.jpg',{type:'image/jpeg'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});st.textContent='공유했어요.';track('share_character',{method:'share',character:title});try{window.oracleShared&&oracleShared('character')}catch(_){}}catch(err){st.textContent=err&&err.name==='AbortError'?'':'공유하지 못했어요. 다시 시도해 주세요.'}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);st.textContent='이미지를 저장했어요.';track('share_character',{method:'download',character:title})}
 }catch(_){st.textContent='이미지를 만들지 못했어요. 다시 시도해 주세요.'}finally{b.disabled=false}});
})();
;
/* ==== share-reward.js ==== */
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
;
/* ==== touch-card.js ==== */
/* 2026-11-13: 연인 궁합의 관계 캐릭터 카드(.pair-character) 안, 장면 문구 아래에 '우리 관계를 위한 조언' 3줄.
   - 낭만 2개: 여자(남녀가 아니면 나)의 금성 원소가 고르는 세트(ROM) 중, 남자(상대)의 금성 원소에 맞는 표현 2개.
   - 오래가는 1개: 여자(나)의 일지 오행(LAST).
   근거는 카드 접기 '왜 이런 결과가 나왔을까?' 안에, 끝에 '더 자세히 보기 →'(같은 결과의 [data-cmp-open]).
   이미지 공유는 pair-share.js가 이 목록까지 그린다. 출생 정보는 넣지 않는다. */
(()=>{"use strict";
const ROM=[
 [["뜬금없는 날, 꽃 한 송이를 건네 보세요.","아무 날도 아닌 날의 꽃 한 송이가 더 오래 기억될 수도 있어요!"],["\"지금 바다 보러 갈래?\"","가끔은 계획 없는 드라이브가 최고의 데이트가 될 수 있어요!"],["친구들 앞에서 슬쩍 자랑해 주세요.","생각보다 그 한마디를 오래 기억할지도 몰라요!"]],
 [["지나가듯 말한 \"이거 맛있겠다\"를 기억해 두세요.","다음 데이트에 데려가면 그날의 주인공이 될 수 있어요!"],["가방에 짧은 쪽지 하나 몰래 넣어 보세요.","몇 년이 지나도 꺼내 보는 보물이 될 수도 있어요!"],["집에서 같이 요리하는 저녁 어때요?","화려한 레스토랑보다 더 설레는 날이 될 수 있어요!"]],
 [["둘만 아는 별명 하나 만들어 보세요.","부를 때마다 괜히 웃음이 날 수도 있어요!"],["처음 가 보는 동네나 전시를 같이 골라 보세요.","새로운 곳에서 서로의 새로운 모습을 발견할 수 있어요!"],["자기 전에 \"오늘 제일 웃겼던 일\"을 물어봐 주세요.","짧은 대화가 하루의 마무리가 될 수 있어요!"]],
 [["처음 만난 곳에 다시 가 보세요.","그날의 설렘이 다시 찾아올지도 몰라요!"],["비 오는 날, 같이 듣고 싶은 노래 한 곡을 보내 보세요.","말보다 더 많은 게 전해질 수 있어요!"],["\"요즘 마음은 어때?\" 가끔 먼저 물어봐 주세요.","그 한마디에 마음이 스르르 열릴 수 있어요!"]]];
/* 각 세트의 3개는 [깜짝·행동형, 활동·함께형, 말·표현형] 순서. 상대 금성 원소(불·흙·바람·물)가 잘하는 표현부터 고른다. */
const FIT=[[0,1,2],[1,0,2],[1,2,0],[2,0,1]];
const LAST=[["\"넌 잘할 거야\" 한마디 해 주세요.","생각보다 큰 힘이 될 수 있어요!"],["바쁜 날에도 \"밥 먹었어?\" 한 줄이면 충분해요.","그 한 줄이 하루를 바꿀 수 있어요!"],["가끔은 \"우리 나중에 어디서 살까?\" 같은 이야기도 나눠 보세요.","함께 그리는 미래가 든든함이 될 수 있어요!"],["약속 시간 5분 전 도착!","작은 약속을 지키는 모습이 제일 멋져 보일 수 있어요!"],["연락이 잠깐 뜸해도 재촉하지 않기!","그 여유가 오히려 더 가까워지는 비결이 될 수 있어요!"]];
const ELN5=['목(木)','화(火)','토(土)','금(金)','수(水)'],VEL=['불','흙','바람','물'];
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ven=ch=>sign(birthExtraLon('Venus',ch.jd));
function pick(her,him){const hv=ven(her)%4,mv=him&&him.jd?ven(him)%4:hv,set=ROM[hv],o=FIT[mv];return [set[o[0]],set[o[1]],LAST[SE[BMAIN[her.brs.d]]]]}
function attach(card){try{
 if(!card.closest('#tab-match')||!COMPAT||COMPAT.kind==='friend'||!CH||card.querySelector('.tc-list'))return;
 const wrapEl=card.parentNode;if(/재회/.test(wrapEl.textContent))return;
 const other=COMPAT.b,names=card.querySelectorAll('.pair-stage figcaption b'),meN=(names[0]?.textContent||'나').trim(),otN=(names[1]?.textContent||'상대').trim();
 const swap=CH.inp&&CH.inp.sex==='m'&&other&&other.inp&&other.inp.sex==='f',her=swap?other:CH,him=swap?CH:other,herN=swap?otN:meN,himN=swap?meN:otN;
 const list=pick(her,him);
 card.querySelector('.pair-description')?.insertAdjacentHTML('afterend','<div class="tc-wrap"><p class="tc-head">우리 관계를 위한 조언</p><ol class="tc-list">'+list.map(x=>'<li><b>'+E(x[0])+'</b><small>'+E(x[1])+'</small></li>').join('')+'</ol></div>');
 const det=card.querySelector('.pair-basis');if(det){const sum=det.querySelector('summary');if(sum)sum.textContent='왜 이런 결과가 나왔을까?';
  const hv=ven(her),mv=him&&him.jd?ven(him):null;
  det.insertAdjacentHTML('beforeend','<p class="tc-why"><b>우리 관계를 위한 조언</b><br>'+E(herN)+'님 금성 '+SIGNWORD[hv]+'자리('+VEL[hv%4]+') · 사랑을 느끼는 방식'+(mv!=null?'<br>'+E(himN)+'님 금성 '+SIGNWORD[mv]+'자리('+VEL[mv%4]+') · 잘 맞는 표현 방식':'')+'<br>'+E(herN)+'님 사주 배우자 자리 '+ELN5[SE[BMAIN[her.brs.d]]]+' · 오래 함께하고 싶은 모습</p><button type="button" class="fd-cta fd-cta-sub tc-more">더 자세히 보기 →</button>')}
 }catch(_){}}
document.addEventListener('click',e=>{const b=e.target.closest('.tc-more');if(!b)return;b.closest('.cmp-out,.cmp-result,.cmp-wrap')?.querySelector('[data-cmp-open]')?.click()});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)(n.matches?.('.pair-character')?[n]:n.querySelectorAll?.('.pair-character')||[]).forEach(attach)}).observe(document.body,{childList:true,subtree:true});
})();
;
/* ==== week-pass.js ==== */
/* 2026-11-14 이번 주 탭: 일주일 그래프는 무료. '오늘의 조언 카드'는 오늘 것만 무료로 바로 보여 주고(공유 가능),
   지나간 3일·다가올 3일 조언은 '잠금 해제하기' → 영구 해제 1,000원(서버 키 week) 또는 전부 열기(all, 2,990원). 예전 cards30(30일)도 인정.
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
   }
  }

 const fmt=d=>(d.getMonth()+1)+'월 '+d.getDate()+'일 ('+'일월화수목금토'[d.getDay()]+')';
 function advOf(d){const f=dayFortune(CH,d),box=document.createElement('div');box.innerHTML=todayAdvice(f,false);return {f,h:(box.querySelector('b')||{}).textContent||'',t:(box.querySelector('p')||{}).textContent||''}}

 async function buy(key){key=key||'week';const st=document.querySelector('#dayBuyDialog .dm-st');track('click_cards_pass',{report_key:key});
  if(typeof requireSavedProfile==='function'&&!requireSavedProfile()){$('dayBuyDialog')?.close();return}
  st&&(st.textContent='결제창을 준비하고 있어요…');
  try{const [o]=await Promise.all([accountAPI('/pay/start',{key}),loadPayApp()]);
   try{sessionStorage.setItem('oracle-paying',JSON.stringify({o:o.orderId,k:key,p:o.price,t:Date.now()}))}catch(_){}
   track('begin_checkout',{value:Number(o.price)||0,currency:'KRW',report_key:key});
   PayApp.setDefault('userid',o.userid);PayApp.setDefault('shopname',o.shopname);PayApp.setTarget('_self');
   PayApp.payrequest({goodname:o.goodname,price:String(o.price),var1:o.orderId,feedbackurl:o.feedbackurl,checkretry:'y',smsuse:'n',redirectpay:'1',returnurl:o.returnurl,redirect:'self'});
  }catch(e){st&&(st.textContent='결제를 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.')}}
 async function check(){if(!user()){open=false;return}
  try{const a=await accountAPI('/access');open=!!(a.isAdmin||a.reports.includes('all')||a.reports.includes('cards30')||a.reports.includes('week'))}catch(_){open=false}const sel=document.querySelector('#weekBox .wk-pt.sel');if(open&&document.querySelector('#todayBox .day-lock')&&sel)pickWeekDay(+sel.dataset.wkday)}

 /* 공유 이미지 1080×1350: 날짜 · 오늘의 조언 · 문장 · 운명탐정 */
 const img=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
 function wrapT(c,t,max){const out=[];let line='';for(const ch of t.split(' ')){const s=line?line+' '+ch:ch;if(c.measureText(s).width>max&&line){out.push(line);line=ch}else line=s}if(line)out.push(line);return out}
 async function share(){const b=document.querySelector('.dcard-share'),st=document.querySelector('.dcard-st');if(!CH)return;b.disabled=true;st.textContent='로딩 중…';
  try{const head=$('todayHead'),parts=(head.dataset.adviceDate||'').split('-').map(Number),d=parts.length===3?new Date(parts[0],parts[1]-1,parts[2],12):new Date(),a={h:head.querySelector('.td-adv b')?.textContent||'',t:head.querySelector('.td-adv p')?.textContent||''},h=a.h.replace(/[“”"]/g,''),F='MemomentKkukkukk,"IBM Plex Sans KR",sans-serif';
   if(window.loadMemoment)await window.loadMemoment();try{await document.fonts.load('40px MemomentKkukkukk','오늘의조언운명탐정'+h+a.t+fmt(d)+'fatedog.co.kr')}catch(_){}
   const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
   const g=c.createRadialGradient(W/2,H*.4,0,W/2,H*.4,H*.8);g.addColorStop(0,'#fff3d6');g.addColorStop(1,'#fbeee2');c.fillStyle=g;c.fillRect(0,0,W,H);
   const X=90,Y=110,CW=W-180,CHh=H-260;c.fillStyle='#fff';c.strokeStyle='#e6cf9f';c.lineWidth=4;c.beginPath();c.roundRect(X,Y,CW,CHh,40);c.fill();c.stroke();
   c.textAlign='center';c.font='92px '+F;const hl=wrapT(c,h,CW-120);c.font='44px '+F;const tl=wrapT(c,a.t,CW-150);
   const blockH=50+70+40+hl.length*112+50+tl.length*66,top=Y+40+Math.max(40,((CHh-230)-blockH)/2);let y=top+40;
   c.fillStyle='#7a6253';c.font='40px '+F;c.fillText(fmt(d),W/2,y);y+=74;
   c.fillStyle='#8A5A1E';c.font='46px '+F;c.fillText(d.toDateString()===new Date().toDateString()?'오늘의 조언':'이날의 조언',W/2,y);y+=40+92;
   c.fillStyle='#4A352B';c.font='92px '+F;hl.forEach(l=>{c.fillText(l,W/2,y);y+=112});y+=30;
   c.fillStyle='#5b463a';c.font='44px '+F;tl.forEach(l=>{c.fillText(l,W/2,y);y+=66});
   c.strokeStyle='#ecd6a8';c.lineWidth=2;c.beginPath();c.moveTo(W/2-200,Y+CHh-170);c.lineTo(W/2+200,Y+CHh-170);c.stroke();
   try{const m=await img('img/mascot.webp');c.drawImage(m,W/2-215,Y+CHh-152,124,124*m.naturalHeight/m.naturalWidth)}catch(_){}
   c.fillStyle='#8A5A1E';c.font='58px '+F;c.textAlign='left';c.fillText('운명탐정',W/2-80,Y+CHh-72);
   c.textAlign='center';c.fillStyle='#8A5A1E';c.font='38px '+F;c.fillText('fatedog.co.kr',W/2,H-80);
   const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.92)),file=new File([blob],'운명탐정-조언-'+[d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')+'.jpg',{type:'image/jpeg'});
   if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});track('share_daily_card',{method:'share'});window.oracleShared&&window.oracleShared('daily-card')}catch(_){}}
   else{const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=file.name;document.body.append(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4e3);track('share_daily_card',{method:'download'})}
   st.textContent=''}catch(e){st.textContent='이미지를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.'}finally{b.disabled=false}}

 /* 잠금 해제 창: 일주일 운세 영구 해제(week) 1,000원 / 모든 기능 전부 열기(all) 2,990원. 예전 cards30 구매자도 계속 열림. */
 window.weekPassOpen=()=>open;
 function unlockDialog(){let d=$('dayBuyDialog');if(!d){d=document.createElement('dialog');d.id='dayBuyDialog';d.className='day-buy';d.setAttribute('aria-labelledby','dayBuyTitle');
   d.innerHTML='<h2 id="dayBuyTitle">운세 카드 잠금 해제</h2><p>지나간 날과 다가올 날의 조언과 풀이, 계산 근거를 볼 수 있어요.</p><div class="db-opts"><button type="button" data-buykey="week"><span>영구적으로 해제</span><b>1,000원</b></button><button type="button" data-buykey="all"><span>모든 기능 전부 열기</span><b>2,990원</b></button></div><small class="dm-st" aria-live="polite"></small><button type="button" class="db-close" data-dayclose>닫기</button>';
   document.body.append(d);d.addEventListener('click',e=>{const b=e.target.closest('[data-buykey]');if(b){buy(b.dataset.buykey);return}if(e.target===d||e.target.closest('[data-dayclose]'))d.close()})}
  d.querySelector('.dm-st').textContent='';track('view_paywall',{source_page:'week'});d.showModal()}
 document.addEventListener('click',e=>{if(e.target.closest('[data-dayunlock]'))unlockDialog()});
 function paint(){order();card()}
 const previousSetTab=window.setTab;window.setTab=function(){const r=previousSetTab.apply(this,arguments);if(!$("tab-today").hidden)paint();return r};
 const ra=window.renderAll;
 window.renderAll=function(){const r=ra.apply(this,arguments);paint();if(weekFirst())setTab('today');else if(saved())setTimeout(markSeen,3000);check();return r};
 document.addEventListener('click',e=>{if(e.target.closest('[data-bottom=home]')&&weekFirst()&&typeof CH!=='undefined'&&CH)setTimeout(()=>setTab('today'),0);if(e.target.closest('#tb-today'))check()});
 let pay=null;try{pay=JSON.parse(sessionStorage.getItem('oracle-paying')||'null')}catch(_){}
 if(pay&&(pay.k==='week'||pay.k==='cards30'||pay.k==='all')){let n=0;const t=setInterval(()=>{if(++n>12||open){clearInterval(t);return}if(typeof CH!=='undefined'&&CH)check()},2500)}
 let was=null;setInterval(()=>{const s=saved();if(s!==was){was=s;order();if(s&&weekFirst()&&typeof CH!=='undefined'&&CH&&!document.querySelector('.res-tabs [aria-selected=true]:not(#tb-natal)'))setTab('today');if(s&&!seen()&&typeof CH!=='undefined'&&CH)setTimeout(markSeen,3000);if(typeof CH!=='undefined'&&CH)check()}},1000);
})();
;
/* ==== room.js ==== */
/* 2026-11-14 우정·모임 '모임 방'.
   - 방장(로그인 + 내 정보 저장): 방 이름(모임은 인원수도)을 정해 방을 만들고, 방 화면에서 링크 공유·인원 조절·직접 추가·빼기·'결과 공개하기'.
   - 링크를 받은 사람(?room=코드): 로그인 없이 자기 이름·성별·생년월일(·시각)만 넣고 동의하면 참여한다.
   - 결과는 방장이 공개할 때 방장 화면에서 한 번만 계산해 서버에 '이름·캐릭터·역할'만 저장하고, 참여자들은 그 결과만 받는다(서로의 출생 정보는 받지 않는다).
   - 서버(worker roomRoute)는 방을 만든 지 14일 뒤 방과 참여자 정보를 지운다. */
(()=>{
const $=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const API=()=>typeof INVITE_API!=='undefined'?INVITE_API:'https://oracle-api.stvzn123.workers.dev';
const tokenKey='oracle-room-tokens';
const tokens=()=>{try{return JSON.parse(localStorage.getItem(tokenKey)||'{}')}catch(_){return {}}};
const setToken=(code,t)=>{try{const m=tokens();m[code]=t;localStorage.setItem(tokenKey,JSON.stringify(m))}catch(_){}};
const ERR={room_not_found:'방을 찾을 수 없어요. 만든 지 14일이 지나 사라졌거나 잘못된 링크예요.',room_full:'정한 인원이 다 찼어요.',room_closed:'이미 결과가 공개된 방이라 새로 참여할 수 없어요.',consent_required:'정보 이용 동의가 필요해요.',input:'입력한 정보를 다시 확인해 주세요.',room_too_small:'아직 인원이 부족해요.',forbidden:'이 방에 참여한 사람만 볼 수 있어요.',unauthorized:'로그인이 필요해요.',profile_required:'먼저 내 출생 정보를 저장해 주세요.',room_limit:'오늘은 방을 더 만들 수 없어요. 내일 다시 만들어 주세요.',too_many:'이 기기에서는 이 방에 더 참여할 수 없어요.'};
async function api(path,body){const h={};const t=typeof accountToken!=='undefined'?accountToken:'';if(t)h.Authorization='Bearer '+t;if(body)h['Content-Type']='application/json';
 const r=await fetch(API()+path,{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});let d={};try{d=await r.json()}catch(_){}
 if(!r.ok){const e=new Error(ERR[d.error]||'잠시 뒤 다시 시도해 주세요.');e.code=d.error;throw e}return d}
const roomUrl=code=>(typeof SHARE_URL!=='undefined'?SHARE_URL:location.origin+'/')+'?room='+code;
const kindName=k=>k==='group'?'모임':'우정';
const dLeft=ms=>Math.max(0,Math.ceil((ms-Date.now())/864e5));

/* 이름·성별·생년월일·시각 입력칸(참여 폼과 방장의 직접 추가에 같이 쓴다) */
function personFields(p){return '<label>이름<input name="name" maxlength="20" value="'+esc(p?p.name:'')+'" autocomplete="off"></label>'+
 '<fieldset class="rp-sex"><legend>성별</legend><label><input type="radio" name="sex" value="f"'+(p&&p.sex==='f'?' checked':'')+'>여</label><label><input type="radio" name="sex" value="m"'+(p&&p.sex==='m'?' checked':'')+'>남</label></fieldset>'+
 '<label>생년월일 (양력 8자리)<input name="date" inputmode="numeric" maxlength="8" placeholder="예: 20010228" value="'+esc(p?p.date.replace(/-/g,''):'')+'"></label>'+
 '<label>태어난 시각 (선택)<input name="time" inputmode="numeric" maxlength="5" placeholder="예: 09:30" value="'+esc(p&&!p.notime?p.time:'')+'"></label>'}
function readPerson(f){const name=f.name.value.trim(),sex=(f.querySelector('[name=sex]:checked')||{}).value,ymd=f.date.value.replace(/\D/g,''),tm=f.time.value.trim();
 if(!name)return '이름을 입력해 주세요.';if(!sex)return '성별을 골라 주세요.';if(!/^\d{8}$/.test(ymd))return '생년월일 8자리를 입력해 주세요.';
 const y=+ymd.slice(0,4),m=+ymd.slice(4,6),d=+ymd.slice(6,8),dt=new Date(Date.UTC(y,m-1,d));if(y<1920||y>2026||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return '생년월일을 다시 확인해 주세요.';
 let time='12:00',notime=true;if(tm){const t=tm.replace(/\D/g,'');if(!/^\d{3,4}$/.test(t))return '시각은 예: 09:30처럼 적어 주세요.';const hh=+t.slice(0,t.length-2),mm=+t.slice(-2);if(hh>23||mm>59)return '시각을 다시 확인해 주세요.';time=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');notime=false}
 let roman='';try{roman=typeof romanize==='function'?romanize(name):''}catch(_){}if(!/[a-z]/i.test(roman))roman='friend';
 return {name,roman,sex,cal:'s',leap:false,ly:y,lm:m,ld:d,date:ymd.slice(0,4)+'-'+ymd.slice(4,6)+'-'+ymd.slice(6,8),time,notime,place:{name:'출생지 미선택',none:true,kr:true,lat:null,lon:127.5,tz:9},relationship:'private'}}
/* 방장의 '직접 추가'에서 내 저장 목록(궁합·우정에 저장한 사람)에서 골라 칸을 채운다. 이미 방에 있는 이름은 뺀다 */
const savedList=()=>{try{return typeof partnerList==='function'?(partnerList()||[]).filter(p=>p&&p.name&&p.date):[]}catch(_){return []}};
function savedPickHTML(info){const L=savedList();if(!L.length)return '';const inRoom=new Set(info.names||[]);const opts=L.map((p,i)=>inRoom.has(p.name)?'':'<option value="'+i+'">'+esc(p.name)+' · '+esc(String(p.date).slice(0,4))+'년생</option>').join('');if(!opts)return '';return '<label>저장한 사람에서 고르기<select name="saved"><option value="">직접 입력할게요</option>'+opts+'</select></label>'}
const digitsOnly=f=>f.date.addEventListener('input',()=>{f.date.value=f.date.value.replace(/\D/g,'').slice(0,8)});

/* 방 화면 */
let page=null,cur=null,timer=null;
function ensurePage(){if(page)return page;page=document.createElement('section');page.id='roomPage';page.className='room-page';page.hidden=true;page.setAttribute('role','dialog');page.setAttribute('aria-modal','true');page.setAttribute('aria-labelledby','roomTitle');
 page.innerHTML='<div class="rp-in"><button type="button" class="rp-close">← 운명탐정으로</button><div class="rp-main"></div></div>';document.body.append(page);
 page.querySelector('.rp-close').onclick=closeRoom;page.addEventListener('keydown',e=>{if(e.key==='Escape')closeRoom()});return page}
function closeRoom(){clearInterval(timer);timer=null;cur=null;if(page)page.hidden=true;document.documentElement.classList.remove('room-open')}
async function openRoom(code){ensurePage();cur={code};page.hidden=false;document.documentElement.classList.add('room-open');page.scrollTop=0;page.querySelector('.rp-main').innerHTML='<p class="rp-wait">방을 불러오는 중이에요…</p>';await refresh(true);
 clearInterval(timer);timer=setInterval(()=>{if(!document.hidden&&cur&&!cur.shown&&!cur.editing)refresh(false)},5000)}
async function refresh(first){if(!cur)return;const main=page.querySelector('.rp-main');let info;
 try{info=await api('/room/info',{code:cur.code,token:tokens()[cur.code]||undefined})}catch(e){if(first)main.innerHTML='<p class="rp-err">'+esc(e.message)+'</p>';return}
 const prev=cur.info;cur.info=info;if(info.revealed&&info.joined){if(!cur.shown)showResult(info);return}
 if(!first&&prev&&prev.count===info.count&&prev.max===info.max&&prev.joined===info.joined&&prev.revealed===info.revealed)return;
 main.innerHTML=headHTML(info)+(info.owner?ownerHTML(info):info.joined?'<p class="rp-wait">참여했어요! 방장이 결과를 공개하면 모두의 캐릭터가 한 번에 나와요. 이 화면을 열어 두면 자동으로 바뀌어요.</p><p class="rp-sub rp-center">다른 참여자에게 내 생년월일은 보이지 않아요.</p>':info.revealed?'<p class="rp-err">결과가 공개된 방이에요. 참여한 사람만 볼 수 있어요.</p>':info.count>=info.max?'<p class="rp-err">정한 인원이 다 찼어요.</p>':joinHTML(info));
 bind(info)}
function headHTML(info){const chips=info.names.map((n,i)=>{const p=info.people&&info.people[i];return '<li class="on"><span aria-hidden="true">✦</span>'+esc(n)+(p&&!p.self&&!info.revealed?'<button type="button" class="rp-x" data-rremove="'+esc(p.mid)+'" aria-label="'+esc(n)+' 빼기">×</button>':'')+'</li>'});
 const empty=info.revealed?0:Math.max(0,info.max-info.count);
 return '<p class="rp-kind">'+kindName(info.kind)+' 방 · '+info.count+'/'+info.max+'명 · '+dLeft(info.expires)+'일 뒤 자동 삭제</p><h2 id="roomTitle">'+esc(info.name)+'</h2><ul class="rp-slots">'+chips.join('')+'<li>?</li>'.repeat(empty).replace(/<li>\?<\/li>/g,'<li><span aria-hidden="true">?</span>비어 있어요</li>')+'</ul>'}
function ownerHTML(info){const ready=info.count>=info.min,url=roomUrl(info.code),full=info.count>=info.max;
 return (info.kind==='group'?'<div class="rp-size"><span>인원</span><button type="button" data-rsize="-1" aria-label="인원 줄이기"'+(info.max<=Math.max(info.min,info.count)?' disabled':'')+'>−</button><b>'+info.max+'명</b><button type="button" data-rsize="1" aria-label="인원 늘리기"'+(info.max>=info.limit?' disabled':'')+'>+</button></div>':'')+
  '<div class="rp-box"><b>친구들에게 링크를 보내 주세요</b><p class="rp-sub">링크를 받은 사람은 로그인 없이 자기 이름·생년월일만 넣으면 이 방에 들어와요. 서로의 생년월일은 보이지 않아요.</p><p class="rp-link"><input type="text" readonly value="'+esc(url)+'" aria-label="방 링크"></p><div class="rp-btns"><button type="button" data-rshare>링크 보내기</button><button type="button" data-rcopy>복사</button></div><p class="rp-msg" role="status"></p></div>'+
  (full?'':'<details class="rp-add"><summary>내가 직접 추가하기</summary><form class="rp-form rp-addform" novalidate>'+savedPickHTML(info)+personFields(null)+'<label class="rp-chk"><input type="checkbox" name="consent"><span><b>(필수)</b> 이 사람에게 이 방에서 캐릭터 분석에 정보를 쓰는 것에 동의를 받았어요. 정보는 방을 만든 날부터 14일 뒤 자동으로 삭제돼요.</span></label><button type="submit" class="rp-join">추가하기</button><p class="rp-msg" role="alert"></p></form></details>')+
  '<button type="button" class="rp-reveal" data-rreveal'+(ready?'':' disabled')+'>'+(ready?'결과 공개하기 · '+info.count+'명':(info.min-info.count)+'명 더 모이면 공개할 수 있어요')+'</button><p class="rp-sub rp-center">공개하면 새 참여는 닫히고, 모두의 캐릭터가 한 번에 나와요.</p><button type="button" class="rp-del" data-rdel>방 지우기</button>'}
function joinHTML(info){const p=(typeof accountUser!=='undefined'&&accountUser&&accountUser.profile)||null;
 return '<form class="rp-form" novalidate><b>내 정보로 참여하기</b><p class="rp-note">🔒 내 정보만 입력하면 돼요. 다른 참여자에게 내 생년월일은 보이지 않고, 결과로는 캐릭터와 역할만 함께 보여요.</p>'+personFields(p)+
  '<label class="rp-chk"><input type="checkbox" name="consent"><span><b>(필수)</b> 입력한 이름·성별·생년월일(·시각)을 이 방의 캐릭터 분석에 쓰고, 결과(이름·캐릭터·역할)가 이 방에 참여한 사람들에게 보이는 데 동의해요. 정보는 방을 만든 날부터 14일 뒤 자동으로 삭제돼요.</span></label>'+
  '<label class="rp-chk"><input type="checkbox" name="allow"><span>(선택) 방장이 내 생년월일을 자기 저장 목록에 저장해도 돼요.</span></label>'+
  '<button type="submit" class="rp-join">참여하기</button><p class="rp-msg" role="alert"></p></form>'}
function bind(info){const main=page.querySelector('.rp-main'),msg=main.querySelector('.rp-box .rp-msg')||main.querySelector('.rp-msg');
 const form=main.querySelector('.rp-form:not(.rp-addform)');if(form){digitsOnly(form);
  form.addEventListener('submit',async e=>{e.preventDefault();const m=form.querySelector('.rp-msg'),p=readPerson(form);if(typeof p==='string'){m.textContent=p;return}if(!form.consent.checked){m.textContent='정보 이용에 동의해야 참여할 수 있어요.';return}
   const b=form.querySelector('.rp-join');b.disabled=true;b.textContent='참여하는 중…';
   try{const r=await api('/room/join',{code:info.code,profile:p,consent:true,allowSave:form.allow.checked,token:tokens()[info.code]||undefined});if(r.token)setToken(info.code,r.token);try{window.track&&track('room_join',{kind:info.kind})}catch(_){}cur.info=null;refresh(true)}
   catch(err){m.textContent=err.message;b.disabled=false;b.textContent='참여하기'}})}
 const add=main.querySelector('.rp-addform');if(add){digitsOnly(add);const det=add.closest('details');det.addEventListener('toggle',()=>{cur.editing=det.open});
  const pick=add.querySelector('[name=saved]');if(pick)pick.onchange=()=>{const s=savedList()[+pick.value];if(!s)return;add.name.value=s.name||'';add.querySelectorAll('[name=sex]').forEach(r=>r.checked=r.value===s.sex);add.date.value=String(s.date||'').replace(/\D/g,'');add.time.value=s.notime?'':(s.time||'')};
  add.addEventListener('submit',async e=>{e.preventDefault();const m=add.querySelector('.rp-msg'),p=readPerson(add);if(typeof p==='string'){m.textContent=p;return}if(!add.consent.checked){m.textContent='그 사람의 동의를 받았는지 확인해 주세요.';return}
   const b=add.querySelector('.rp-join');b.disabled=true;try{await api('/room/add',{code:info.code,profile:p,consent:true});cur.editing=false;cur.info=null;refresh(true)}catch(err){m.textContent=err.message;b.disabled=false}})}
 main.querySelectorAll('[data-rremove]').forEach(x=>x.onclick=async()=>{if(!confirm('이 사람을 방에서 뺄까요? 입력한 정보도 지워져요.'))return;try{await api('/room/remove',{code:info.code,mid:x.dataset.rremove});cur.info=null;refresh(true)}catch(e){alert(e.message)}});
 main.querySelectorAll('[data-rsize]').forEach(x=>x.onclick=async()=>{x.disabled=true;try{await api('/room/size',{code:info.code,size:info.max+(+x.dataset.rsize)});cur.info=null;refresh(true)}catch(e){alert(e.message);x.disabled=false}});
 const sh=main.querySelector('[data-rshare]'),cp=main.querySelector('[data-rcopy]'),url=roomUrl(info.code);
 if(sh)sh.onclick=async()=>{const text=info.name+' · 운명탐정 '+kindName(info.kind)+' 방에 초대해요. 내 생년월일만 넣으면 우리 캐릭터 조합이 한 번에 나와요!';if(navigator.share){try{await navigator.share({title:'운명탐정',text,url});return}catch(e){if(e&&e.name==='AbortError')return}}try{await navigator.clipboard.writeText(url);msg.textContent='링크를 복사했어요. 카카오톡에 붙여 넣어 보내 주세요.'}catch(_){msg.textContent='링크를 길게 눌러 복사해 주세요.'}};
 if(cp)cp.onclick=async()=>{try{await navigator.clipboard.writeText(url);msg.textContent='링크를 복사했어요.'}catch(_){const i=main.querySelector('.rp-link input');i.focus();i.select();msg.textContent='링크를 선택했어요. 복사해 주세요.'}};
 const rv=main.querySelector('[data-rreveal]');if(rv)rv.onclick=()=>reveal(info,rv);
 const del=main.querySelector('[data-rdel]');if(del)del.onclick=()=>removeRoom(info)}
async function removeRoom(info){if(!confirm('이 방과 참여자 정보를 지금 지울까요? 되돌릴 수 없어요.'))return;try{await api('/room/delete',{code:info.code});closeRoom();roomsPaint(true)}catch(e){alert(e.message)}}
/* 방장 화면에서 한 번만 계산해 '이름·캐릭터·역할'만 저장한다 */
async function reveal(info,rv){if(!confirm('지금 결과를 공개할까요? 공개하면 새 참여는 닫혀요.'))return;rv.disabled=true;rv.textContent='모두의 다섯 점술을 분석하는 중…';
 try{const d=await api('/room/profiles',{code:info.code});const charts=d.members.map(m=>buildChart(Object.assign({},m.profile,{name:m.profile.name||m.name})));
  const ctx=socialContext(charts),casts=ctx.map((x,i)=>({mid:d.members[i].mid,name:d.members[i].name,sheet:x.cast.sheet,index:x.cast.index,label:x.cast.label,role:x.role,strength:x.strength}));
  await api('/room/reveal',{code:info.code,result:{casts}});try{window.track&&track('room_reveal',{kind:info.kind,count:info.count})}catch(_){}
  /* 저장을 허락한 참여자만 방장의 저장 목록에 더한다 */
  cur.info=null;refresh(true);
  /* 저장은 결과 화면을 막지 않고 뒤에서 */
  (async()=>{try{if(typeof partnerSave==='function'){const have=partnerList();for(const m of d.members){if(m.self||!m.allowSave)continue;const p=m.profile;if(have.some(x=>x.name===p.name&&x.date===p.date))continue;await partnerSave({name:p.name,roman:p.roman||'',sex:p.sex,date:p.date,time:p.notime?'':p.time,notime:!!p.notime,pi:null})}}}catch(_){}})()}catch(e){rv.disabled=false;rv.textContent='결과 공개하기';alert(e.message||'결과를 공개하지 못했어요.')}}
function resultHTML(casts){return '<section class="social-share-card"><div class="social-card-content"><div class="social-result">'+socialCastHTML(casts)+reportInfoTable('각자 역할',['이름','역할','강점'],casts.map(c=>[c.name,c.role,c.strength]),'social-role-table',['25%','30%','45%'])+'</div></div></section>'}
async function showResult(info){const main=page.querySelector('.rp-main');cur.shown=true;main.innerHTML=headHTML(info)+'<p class="rp-wait">결과를 불러오는 중이에요…</p>';
 let d;try{d=await api('/room/result',{code:info.code,token:tokens()[info.code]||undefined})}catch(e){main.innerHTML=headHTML(info)+'<p class="rp-err">'+esc(e.message)+'</p>';return}
 const casts=d.casts.slice().sort((a,b)=>(b.mid===d.me?1:0)-(a.mid===d.me?1:0));
 main.innerHTML=headHTML(info)+'<div class="rp-result">'+resultHTML(casts)+'</div>'+(info.owner?'<button type="button" class="rp-del" data-rdel>방 지우기</button>':'');
 const del=main.querySelector('[data-rdel]');if(del)del.onclick=()=>removeRoom(info)}

/* 방 만들기: 우정은 이름만, 모임은 이름과 인원수 */
function makeFormHTML(kind){return '<form class="rp-make"><label>방 이름<input name="rname" maxlength="30" placeholder="'+(kind==='group'?'예: 동아리 3기':'예: 나랑 지민')+'"></label>'+(kind==='group'?'<label>인원수<select name="rsize">'+[3,4,5,6,7,8].map(n=>'<option value="'+n+'"'+(n===4?' selected':'')+'>'+n+'명</option>').join('')+'</select></label>':'')+'<button type="submit">'+kindName(kind)+' 방 만들기</button><p class="rp-msg" role="status"></p></form>'}
function bindMake(f,kind){f.onsubmit=async ev=>{ev.preventDefault();if(typeof requireSavedProfile==='function'&&!requireSavedProfile())return;const name=f.rname.value.trim();if(!name){f.querySelector('.rp-msg').textContent='방 이름을 입력해 주세요.';return}
  const sb=f.querySelector('button');sb.disabled=true;try{const r=await api('/room',{kind,name,size:f.rsize?+f.rsize.value:2});try{window.track&&track('room_create',{kind})}catch(_){}f.reset();openRoom(r.code);roomsPaint(true)}catch(err){f.querySelector('.rp-msg').textContent=err.message}finally{sb.disabled=false}}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pmake]');if(!b||typeof CMPKIND==='undefined'||CMPKIND==='love')return;e.preventDefault();e.stopImmediatePropagation();
 if(typeof requireSavedProfile==='function'&&!requireSavedProfile())return;const out=b.closest('.cmp-form')?.querySelector('.cmp-pair')||b.parentNode,kind=CMPKIND==='group'?'group':'friend';
 out.innerHTML=makeFormHTML(kind);const f=out.querySelector('form');f.rname.focus();bindMake(f,kind)},true);

/* 우정·모임 패널 맨 위: 내 방 목록. 모임은 방 만들기가 먼저 보이고, 예전 직접 입력 폼은 숨긴다 */
let roomsCache=null;
async function roomsPaint(force){const tab=$('tab-match');if(!tab||typeof CMPKIND==='undefined'||CMPKIND==='love')return;
 const kind=CMPKIND==='group'?'group':'friend',host=kind==='group'?$('cmpGroup'):$('cmpOne');if(!host)return;let box=host.querySelector('.rp-rooms');
 if(!box){box=document.createElement('section');box.className='rp-rooms';host.prepend(box);force=true}if(!force&&box.dataset.kind===kind)return;box.dataset.kind=kind;
 host.classList.toggle('room-first',kind==='group');
 const logged=typeof accountUser!=='undefined'&&accountUser;
 if(logged){try{if(force||!roomsCache)roomsCache=(await api('/rooms')).rooms||[]}catch(_){roomsCache=roomsCache||[]}}
 const list=logged?(roomsCache||[]).filter(r=>r.kind===kind):[];
 box.innerHTML=(kind==='group'?'<div class="rp-create"><h4>모임 방 만들기</h4><p class="rp-sub">방을 만들고 링크를 보내면, 각자 자기 정보만 넣어요. 모두 모이면 한 번에 결과를 공개해요.</p>'+makeFormHTML('group')+'</div>':'')+
  (list.length?'<h4>내 '+kindName(kind)+' 방</h4><div class="rp-cards">'+list.map(r=>'<button type="button" class="rp-card" data-room="'+esc(r.code)+'"><b>'+esc(r.name)+'</b><small>'+r.count+'명 · '+(r.revealed?'결과 공개됨':'모이는 중')+' · '+dLeft(r.expires)+'일 남음</small></button>').join('')+'</div>':'');
 const f=box.querySelector('.rp-make');if(f)bindMake(f,'group')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-room]');if(b)openRoom(b.dataset.room)});
/* DOM이 바뀔 때마다 부르지 않고 한 프레임에 한 번만 */
let rpQ=0;new MutationObserver(()=>{if(rpQ)return;rpQ=requestAnimationFrame(()=>{rpQ=0;roomsPaint(false)})}).observe(document.body,{childList:true,subtree:true});

/* 링크로 들어온 경우: ?room=코드 */
try{const q=new URLSearchParams(location.search),code=q.get('room');if(code&&/^[a-f0-9]{12}$/.test(code)){q.delete('room');history.replaceState(history.state,'',location.pathname+(q.toString()?'?'+q:'')+location.hash);
 const go=()=>openRoom(code);document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()}}catch(_){}
})();
;
/* ==== admin-test.js ==== */
/* 2026-11-14 관리자 테스트 도구: 내 정보 화면 맨 아래(진짜 관리자에게만). 폰에서 결제·잠금·첫 방문 흐름을 직접 확인하려고 만든다.
   - 일반 회원처럼 보기: accountAPI가 화면에 isAdmin=false로 알린다(app.js). 서버의 관리자 권한은 그대로라 아래 도구는 계속 쓸 수 있다.
   - 내 구매 권한 지우기: /admin/permission revoke로 내 계정의 권한을 하나씩 지워 결제를 다시 시험한다.
   - 이 기기 기록 지우기: 로그인은 두고 '처음 본 결과'·공유 대기·결제 대기 같은 기록만 지운다. */
(function(){
 const $=id=>document.getElementById(id),sheet=$('accountSheet');if(!sheet)return;
 const ls={get:k=>{try{return localStorage.getItem(k)}catch(_){return null}},set:(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(_){}}};
 const NAMES={all:'모든 기능 전부 열기',week:'일주일 운세 영구 해제',cards30:'한 달 조언 카드(예전)',comprehensive:'종합 리포트'};
 const LOCAL=['oracle-seen-natal','oracle-card','oracle-share-pending','oracle-tx-sent','oracle-paying','oracle-entry-goal','oracle-profile-deleted','oracle-pair-request'];
 const box=document.createElement('section');box.id='adminTest';box.className='admin-test';box.hidden=true;sheet.append(box);
 const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function paint(){
  const real=ls.get('oracle-real-admin')==='1'&&typeof accountUser!=='undefined'&&accountUser;box.hidden=!real;if(!real)return;
  const on=ls.get('oracle-test-member')==='1';
  box.innerHTML=`<h3>관리자 테스트 도구</h3><p class="at-note">이 기기에서만 적용돼요. 나에게만 보여요.</p>
  <label class="at-row"><input type="checkbox" id="atMember"${on?' checked':''}><span><b>일반 회원처럼 보기</b><small>켜면 잠금·결제 창이 일반 회원과 똑같이 보여요. 지금: ${on?'일반 회원 화면':'관리자 화면(모두 열림)'}</small></span></label>
  <div class="at-block"><b>내 구매 권한</b><small>지우면 그 결제를 다시 시험할 수 있어요.</small><ul id="atGrants"><li>불러오는 중…</li></ul></div>
  <div class="at-block"><b>최근 결제 5건</b><ul id="atPays"><li>불러오는 중…</li></ul></div>
  <div class="at-block"><b>이 기기 기록 지우기</b><small>로그인은 그대로 두고 처음 본 결과·오늘 카드·공유/결제 대기 기록을 지워요.</small><button type="button" id="atLocal">기록 지우고 새로고침</button></div>
  <p class="at-note" id="atMsg" role="status"></p>`;
  $('atMember').onchange=e=>{ls.set('oracle-test-member',e.target.checked?'1':null);location.reload()};
  $('atLocal').onclick=()=>{LOCAL.forEach(k=>ls.set(k,null));try{sessionStorage.clear()}catch(_){}location.reload()};
  load()}
 async function load(){
  const g=$('atGrants'),p=$('atPays'),msg=$('atMsg');
  try{const a=await accountAPI('/access');const keys=a.reports||[];
   g.innerHTML=keys.length?keys.map(k=>`<li><span>${esc(NAMES[k]||k)}${k==='cards30'&&a.cardsUntil?' · '+new Date(a.cardsUntil).toLocaleDateString('ko-KR')+'까지':''}</span><button type="button" data-revoke="${esc(k)}">지우기</button></li>`).join(''):'<li>구매 권한이 없어요.</li>';
   g.onclick=async e=>{const b=e.target.closest('[data-revoke]');if(!b)return;const k=b.dataset.revoke;
    if(k!=='all'&&keys.includes('all')){msg.textContent="'모든 기능 전부 열기'를 먼저 지워야 해요.";return}
    if(!confirm((NAMES[k]||k)+' 권한을 지울까요? 결제 내역은 남아요.'))return;b.disabled=true;
    try{await accountAPI('/admin/permission',{userId:a.id,key:k,action:'revoke'});msg.textContent='지웠어요. 새로고침하면 잠금 화면부터 다시 볼 수 있어요.';load()}catch(err){msg.textContent=err.message||'지우지 못했어요.';b.disabled=false}}
  }catch(err){g.innerHTML='<li>불러오지 못했어요.</li>'}
  try{const s=await accountAPI('/pay/status'),o=s.orders||[];
   p.innerHTML=o.length?o.map(x=>`<li><span>${esc(NAMES[x.report_key]||x.report_key)} · ${Number(x.price).toLocaleString()}원</span><em>${esc({paid:'결제 완료',ready:'결제 전(창만 열림)',canceled:'취소됨','check:price':'금액 불일치'}[x.status]||x.status)} · ${new Date(x.created).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</em></li>`).join(''):'<li>결제 기록이 없어요.</li>'}catch(_){p.innerHTML='<li>불러오지 못했어요.</li>'}}
 /* 내 정보 화면이 열릴 때마다 다시 그린다 */
 new MutationObserver(()=>{if(!sheet.hidden)paint()}).observe(sheet,{attributes:true,attributeFilter:['hidden']});
 /* 로그인 응답이 늦게 오거나 이미 열린 내 정보를 다시 누를 때도 그린다 */
 document.addEventListener('click',e=>{if(e.target.closest('[data-bottom=account]'))setTimeout(()=>{if(!sheet.hidden)paint()},50)});
 let tries=0;const t=setInterval(()=>{if(++tries>20||(typeof accountUser!=='undefined'&&accountUser)){clearInterval(t);if(!sheet.hidden)paint()}},500);
})();
;
/* ==== demo-home.js ==== */
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
 if(busy||!B.classList.contains('fresh')||typeof run0!=='function')return;
 /* 모임 방 링크로 들어오면 방 화면이 가리므로 예시 계산(폰에서 1초 넘게 멈춤)은 방을 닫은 뒤에 한다 */
 if(document.documentElement.classList.contains('room-open')){const o=new MutationObserver(()=>{if(!document.documentElement.classList.contains('room-open')){o.disconnect();showDemo()}});o.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return}
 busy=true;
 try{B.classList.add('demo');const snapP=document.querySelector('#resIntro .res-lead');window.run(DEMO,false);personalize();
 /* 2026-11-13: HTML에 미리 그려 둔 첫 문장(LCP)이 그대로면 원래 요소를 되돌려 놓아, 다시 그린 시점이 LCP로 잡히지 않게 한다. */
 try{const nowP=document.querySelector('#resIntro .res-lead');if(snapP&&nowP&&snapP!==nowP&&snapP.textContent===nowP.textContent)nowP.replaceWith(snapP)}catch(_){}
 const ab=$('askbox');if(ab)ab.open=false;const ws=$('whoSum');if(ws)ws.innerHTML='<span>내 정보 입력하기</span>'}
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
;
/* ==== demo-ui.js ==== */
/* 2026-11-13: 예시(운탐정) 결과를 보는 동안 위에 '예시' 띠를 띄운다. 버튼은 demo-home.js의 data-open-ask로 입력 폼을 연다. */
(()=>{const B=document.body,res=document.getElementById('result');if(!res)return;
const r=document.createElement('div');r.className='demo-ribbon';r.setAttribute('role','note');
r.innerHTML='<span>👀 예시 · 운탐정의 결과예요</span><button type="button" data-open-ask>내 결과 보기 →</button>';B.append(r);
const upd=()=>{const t=res.getBoundingClientRect();B.classList.toggle('dui-show',t.top<60&&t.bottom>200)};
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
})();
;
/* ==== purchase-first.js ==== */
/* 2026-11-13: 가격은 '리포트 보기'를 누른 뒤 구매 화면에서만 보여 준다(버튼 옆 가격은 CSS로 숨김).
   로그인 전·출생 정보 저장 전·예시(운탐정) 상태에서도 누르면 먼저 구매 화면(showReportPurchase)을 띄운다.
   이때 구매 화면의 결제 버튼은 로그인/정보 입력으로 안내한다(requireSavedProfile, 예시면 demo-home.js가 입력 폼을 연다).
   로그인 + 정보 저장 상태는 기존 흐름(requestReport → 권한 있으면 리포트, 없으면 구매 화면) 그대로다. */
(()=>{"use strict";
const B=document.body;let guest=false;
const ready=()=>{try{return !B.classList.contains('demo')&&!!accountUser&&!!accountUser.profile}catch(_){return false}};
function keyOf(b){
 if(b.matches('[data-buy]'))return b.dataset.buy;
 if(b.id==='reportOpen')return 'comprehensive';
 if(b.matches('[data-gopen]'))return 'group';
 if(b.matches('[data-cmp-open]')){if(/재회/.test(b.textContent))return 'reunion';try{return COMPAT&&COMPAT.kind==='friend'?'friend':'match'}catch(_){return 'match'}}
 return null}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-buy]:not([data-buy="ask"]),#reportOpen,[data-gopen],[data-cmp-open]');
 if(!b||ready()||typeof showReportPurchase!=='function')return;
 const k=keyOf(b);if(!k)return;
 e.preventDefault();e.stopImmediatePropagation();
 try{guest=true;showReportPurchase(k,b);const st=document.getElementById('purchaseStatus');if(st)st.textContent=B.classList.contains('demo')?'내 정보를 넣으면 나의 리포트를 구매할 수 있어요.':'구매하려면 카카오 로그인과 내 정보 저장이 필요해요.'}catch(_){guest=false}
},true);
document.addEventListener('click',e=>{
 const b=e.target.closest('#reportCheckout,#reportCheckoutAll');if(!b||!guest||ready())return;
 e.preventDefault();e.stopImmediatePropagation();
 const d=document.getElementById('reportPurchase');if(d&&d.open)d.close();guest=false;
 try{requireSavedProfile()}catch(_){}
},true);
document.getElementById('reportPurchase')?.addEventListener('close',()=>{guest=false});
})();
;
/* ==== report-toc.js ==== */
/* 2026-11-13: 리포트 미리보기(주제 화면의 '○○ 리포트에서 볼 내용' 목록, 구매 화면 목록)를 실제 리포트 목차에서 만든다.
   buildRichReport(CH,key)의 장 제목(limit·fun 제외)을 그대로 쓴다. 연인 궁합은 COMPAT가 있으면 compatReportData의 장 제목.
   재회(상대 포함)·우정·모임은 상대 정보가 있어야 목차가 정해져서 기존 목록을 둔다. */
(()=>{"use strict";
const cache=new Map();
const clean=t=>String(t||'').replace(/^.{1,12}님에게 전하는 이야기$/,'나에게 전하는 이야기').replace(/^.{1,12}님의 /,'나의 ').trim();
/* 2026-11-13 b: 실제 리포트를 approvedReportHTML로 그려 그 목차(.rv3-toc)를 그대로 읽는다. 장을 나누거나 더하는 변환까지 같아진다. */
function realToc(data,key){const d=document.createElement('div');d.innerHTML=approvedReportHTML(data,key,CH);return [...d.querySelectorAll('.rv3-toc li a')].map(a=>{const b=a.querySelector('b');return (b?a.textContent.slice(b.textContent.length):a.textContent).trim()}).filter(Boolean)}
function toc(key){try{
 if(typeof CH==='undefined'||!CH)return null;
 let id=key+'|'+(CH.inp&&CH.inp.date)+'|'+(CH.inp&&CH.inp.name)+'|'+(CH.inp&&CH.inp.relationship);
 let data=null;
 if(key==='match'){if(typeof COMPAT==='undefined'||!COMPAT||COMPAT.kind==='friend'||typeof compatReportData!=='function')return null;id+='|'+(COMPAT.b&&COMPAT.b.inp&&COMPAT.b.inp.date);if(!cache.has(id))data=compatReportData(CH,COMPAT.b,COMPAT.res)}
 else if(['friend','group','reunion','ask'].includes(key))return null;
 else if(!cache.has(id))data=buildRichReport(CH,key);
 if(data&&!cache.has(id)){let list=[];try{list=realToc(data,key)}catch(_){}
  if(!list.length)list=(data.sections||[]).filter(s=>!['limit','fun'].includes(s.kind)).map(s=>clean(s.question||s.title)).filter(Boolean);
  cache.set(id,list.filter((t,i)=>list.indexOf(t)===i))}
 return cache.get(id)}catch(_){return null}}
function fill(ul,list){ul.replaceChildren(...list.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));ul.classList.add('toc-real')}
function patchOffers(root){(root.querySelectorAll?root:document).querySelectorAll('.topic-offer').forEach(sec=>{const b=sec.querySelector('[data-buy]'),ul=sec.querySelector('ul');if(!b||!ul||ul.dataset.toc===b.dataset.buy+(CH&&CH.inp&&CH.inp.date))return;const list=toc(b.dataset.buy);if(!list||!list.length)return;fill(ul,list);ul.dataset.toc=b.dataset.buy+(CH&&CH.inp&&CH.inp.date);const h=sec.querySelector('h4');if(h&&!/목차/.test(h.textContent))h.textContent=h.textContent.replace(/에서 볼 내용$/,' 목차').replace(/ 리포트$/,' 리포트 목차')})}
const orig=window.showReportPurchase;
if(typeof orig==='function')window.showReportPurchase=function(key){const r=orig.apply(this,arguments);try{const list=key==='comprehensive'?toc('comprehensive'):toc(key),ul=document.getElementById('purchaseContents');if(list&&list.length&&ul)fill(ul,list)}catch(_){}try{const ul=document.getElementById('purchaseContents'),c=document.getElementById('purchaseCount'),d=ul&&ul.closest('details');if(c&&ul)c.textContent=ul.children.length?'('+ul.children.length+'장)':'';if(d)d.open=false}catch(_){}return r};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&(n.matches?.('.topic-offer')||n.querySelector?.('.topic-offer')))patchOffers(n.parentNode||document)}).observe(document.body,{childList:true,subtree:true});
patchOffers(document);
addEventListener('oracle-report-ready',()=>{cache.clear();patchOffers(document)});
})();

/* 2026-11-13: 결제 화면에서 '전부 열기'의 값어치를 실제 합계로 보여 준다(앵커링).
   합계 = 메뉴에서 따로 살 수 있는 리포트의 실제 가격 합: 종합 + 주제·관계 7종(재물·연인·직업·학업·궁합·재회·우정). 자유질문은 별도라 넣지 않는다. */
(()=>{"use strict";
const ITEMS=['재물','연인','직업','학업','궁합','재회','우정'];
function sums(){try{const all=typeof ALL_ACCESS_PRICE!=='undefined'?ALL_ACCESS_PRICE:2990,c=typeof COMPREHENSIVE_REPORT_PRICE!=='undefined'?COMPREHENSIVE_REPORT_PRICE:1900,t=typeof TOPIC_REPORT_PRICE!=='undefined'?TOPIC_REPORT_PRICE:1000;const total=c+t*ITEMS.length;return {all,total,pct:Math.floor((1-all/total)*100)}}catch(_){return null}}
const w=n=>n.toLocaleString()+'원';
function paint(key){const s=sums(),btn=document.getElementById('reportCheckoutAll'),st=document.getElementById('purchaseStatus');if(!s||!btn)return;
 const one=document.getElementById('reportCheckout'),pp=document.getElementById('purchasePrice');if(one&&pp&&pp.textContent.trim())one.innerHTML='이 리포트 열기 <b>'+pp.textContent.trim()+'</b>';
 btn.innerHTML='<span class="ba-tag">'+s.pct+'% 할인</span><span class="ba-main">전부 열기 <s>'+w(s.total)+'</s> <b>'+w(s.all)+'</b></span>';
 btn.setAttribute('aria-label','전부 열기, 따로 사면 '+w(s.total)+'인데 '+w(s.all));
 if(st&&/전부 열기\(2,990원\)/.test(st.textContent)||st&&!st.textContent)st.innerHTML='종합 리포트와 '+ITEMS.join('·')+' 리포트를 따로 사면 <b>'+w(s.total)+'</b>이에요. 전부 열기로 한 번에 모두 볼 수 있어요.'}
const orig=window.showReportPurchase;
if(typeof orig==='function')window.showReportPurchase=function(){const r=orig.apply(this,arguments);try{paint(arguments[0])}catch(_){}return r};
})();
;
/* ==== refresh-keep.js ==== */
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
;
/* ==== analytics.js ==== */
/* 2026-11-13 Clarity 화면 기록에서 개인 정보가 보이는 영역은 가린다(입력칸·결과·리포트·내 정보·궁합 상대). */
(function(){var SEL='#askbox,#result,#report,#accountSheet,#savedRecordsPanel,#guestProfile,.cmp-wrap,#tab-match,#loginSaveDialog,#pairConsentDialog,.demo-note';
 function m(){document.querySelectorAll(SEL).forEach(function(e){if(!e.hasAttribute('data-clarity-mask'))e.setAttribute('data-clarity-mask','true')})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',m);else m();
 var q=0;try{new MutationObserver(function(){if(q)return;q=setTimeout(function(){q=0;m()},500)}).observe(document.body||document.documentElement,{childList:true,subtree:true})}catch(_){}})();
/* 2026-11-13 공통 이벤트 헬퍼: GA4 + Clarity(녹화 필터용). 개인정보(이름·생년월일 등)는 넣지 않는다. */
window.track=function(name,params){params=params||{};try{if(window.gtag)gtag('event',name,params)}catch(_){}
 try{if(window.clarity){clarity('event',name);Object.keys(params).forEach(function(k){clarity('set',k,String(params[k]))})}}catch(_){}};
/* 캐릭터 이름(36종 중 하나, 개인정보 아님). 결과 전이면 빈 값 */
window.oracleCharType=function(){var h=document.querySelector('.destiny-character h2');return h?h.textContent.trim().slice(0,30):''};
(function(){
 /* view_paywall: 결제 화면이 열릴 때마다 1번(열린 상태에서 다시 그려져도 다시 보내지 않음) */
 function src(){try{return typeof purchaseReportKey!=='undefined'&&purchaseReportKey||''}catch(_){return ''}}
 function hook(){var d=document.getElementById('reportPurchase');if(!d){return}var was=d.open;
  new MutationObserver(function(){if(d.open&&!was){track('view_paywall',{character_type:oracleCharType(),source_page:src()})}was=d.open}).observe(d,{attributes:true,attributeFilter:['open']})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#reportCheckoutAll'))track('click_unlock_all',{character_type:oracleCharType(),source_page:src()})},true);
})();
// 방문 분석: Microsoft Clarity(히트맵·세션 녹화) + Google Analytics 4(방문·체류시간·유입).
// 입력값(이름·생년월일 등)은 보내지 않는다. 클릭 이벤트에는 버튼 문구/ID만 담는다.
(function () {
  var host = location.hostname;
  if (host !== 'fatedog.co.kr' && host !== 'www.fatedog.co.kr') return; // 로컬·미리보기에서는 수집하지 않음

  var CLARITY_ID = 'zcqov2wjsi';
  var GA_ID = 'G-PZ3TL06NMV';

  function load(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  /* 2026-11-13: 첫 화면 로딩과 겹치지 않게 load 뒤 2.5초(또는 첫 스크롤·터치)에 시작한다. */
  var started=false;function start(){if(started)return;started=true;
  // Clarity
  window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
  load('https://www.clarity.ms/tag/' + CLARITY_ID);

  // GA4
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
  load('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);

  }
  ['pointerdown','scroll','keydown'].forEach(function(ev){addEventListener(ev,start,{once:true,passive:true})});
  if(document.readyState==='complete')setTimeout(start,2500);else addEventListener('load',function(){setTimeout(start,2500)});

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // 버튼·링크 클릭 추적 (입력 필드 값은 절대 담지 않음)
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('button, a, [role="button"]');
    if (!el || el.closest('[data-analytics-ignore]')) return;
    var label = (el.getAttribute('data-track') || el.getAttribute('aria-label') || el.textContent || '')
      .replace(/\s+/g, ' ').trim().slice(0, 60);
    var params = { click_label: label, click_id: (el.id || '').slice(0, 60) };
    if (el.tagName === 'A' && el.href) params.link_url = el.href.split('?')[0].slice(0, 100);
    gtag('event', 'ui_click', params);
  }, true);
})();
