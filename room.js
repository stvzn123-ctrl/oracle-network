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
const ERR={room_not_found:'방을 찾을 수 없어요. 만든 지 14일이 지나 사라졌거나 잘못된 링크예요.',room_full:'정한 인원이 다 찼어요.',room_closed:'이미 결과가 공개된 방이라 새로 참여할 수 없어요.',consent_required:'정보 이용 동의가 필요해요.',input:'입력한 정보를 다시 확인해 주세요.',room_too_small:'아직 인원이 부족해요.',forbidden:'이 방에 참여한 사람만 볼 수 있어요.',unauthorized:'로그인이 필요해요.',profile_required:'먼저 내 출생 정보를 저장해 주세요.',room_limit:'오늘은 방을 더 만들 수 없어요. 내일 다시 만들어 주세요.'};
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
  (full?'':'<details class="rp-add"><summary>내가 직접 추가하기</summary><form class="rp-form rp-addform" novalidate>'+personFields(null)+'<label class="rp-chk"><input type="checkbox" name="consent"><span><b>(필수)</b> 이 사람에게 이 방에서 캐릭터 분석에 정보를 쓰는 것에 동의를 받았어요. 정보는 방을 만든 날부터 14일 뒤 자동으로 삭제돼요.</span></label><button type="submit" class="rp-join">추가하기</button><p class="rp-msg" role="alert"></p></form></details>')+
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
  try{if(typeof partnerSave==='function'){const have=partnerList();for(const m of d.members){if(m.self||!m.allowSave)continue;const p=m.profile;if(have.some(x=>x.name===p.name&&x.date===p.date))continue;await partnerSave({name:p.name,roman:p.roman||'',sex:p.sex,date:p.date,time:p.notime?'':p.time,notime:!!p.notime,pi:null})}}}catch(_){}
  cur.info=null;refresh(true)}catch(e){rv.disabled=false;rv.textContent='결과 공개하기';alert(e.message||'결과를 공개하지 못했어요.')}}
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
new MutationObserver(()=>roomsPaint(false)).observe(document.body,{childList:true,subtree:true});

/* 링크로 들어온 경우: ?room=코드 */
try{const q=new URLSearchParams(location.search),code=q.get('room');if(code&&/^[a-f0-9]{12}$/.test(code)){q.delete('room');history.replaceState(history.state,'',location.pathname+(q.toString()?'?'+q:'')+location.hash);
 const go=()=>openRoom(code);document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()}}catch(_){}
})();
