/* 2026-11-14 우정·모임 '모임 방'.
   - 방장(로그인 + 내 정보 저장): 우정·모임 패널의 링크 버튼 → 방 이름 입력 → 방 화면에서 링크 공유, 참여자 확인, '결과 공개하기'.
   - 링크를 받은 사람(?room=코드): 로그인 없이 이름·성별·생년월일(·시각)과 동의로 참여한다. 결과는 방장이 공개하면 모두에게 한 번에 보인다.
   - 서버(worker roomRoute)는 방을 만든 지 14일 뒤 방과 참여자 정보를 지운다. 결과는 참여자(방 토큰 또는 로그인한 참여자)만 받는다. */
(()=>{
const $=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const API=()=>typeof INVITE_API!=='undefined'?INVITE_API:'https://oracle-api.stvzn123.workers.dev';
const tokenKey='oracle-room-tokens';
const tokens=()=>{try{return JSON.parse(localStorage.getItem(tokenKey)||'{}')}catch(_){return {}}};
const setToken=(code,t)=>{try{const m=tokens();m[code]=t;localStorage.setItem(tokenKey,JSON.stringify(m))}catch(_){}};
const ERR={room_not_found:'방을 찾을 수 없어요. 만든 지 14일이 지나 사라졌거나 잘못된 링크예요.',room_full:'이 방은 인원이 가득 찼어요.',room_closed:'이미 결과가 공개된 방이라 새로 참여할 수 없어요.',consent_required:'정보 이용에 동의해 주세요.',input:'입력한 정보를 다시 확인해 주세요.',room_too_small:'아직 인원이 부족해요.',forbidden:'이 방에 참여한 사람만 볼 수 있어요.',unauthorized:'로그인이 필요해요.',profile_required:'먼저 내 출생 정보를 저장해 주세요.',room_limit:'오늘은 방을 더 만들 수 없어요. 내일 다시 만들어 주세요.'};
async function api(path,body){const h={};const t=typeof accountToken!=='undefined'?accountToken:'';if(t)h.Authorization='Bearer '+t;if(body)h['Content-Type']='application/json';
 const r=await fetch(API()+path,{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});let d={};try{d=await r.json()}catch(_){}
 if(!r.ok){const e=new Error(ERR[d.error]||'잠시 뒤 다시 시도해 주세요.');e.code=d.error;throw e}return d}
const roomUrl=code=>(typeof SHARE_URL!=='undefined'?SHARE_URL:location.origin+'/')+'?room='+code;
const kindName=k=>k==='group'?'모임':'우정';
const dLeft=ms=>Math.max(0,Math.ceil((ms-Date.now())/864e5));

/* 방 화면 */
let page=null,cur=null,timer=null;
function ensurePage(){if(page)return page;page=document.createElement('section');page.id='roomPage';page.className='room-page';page.hidden=true;page.setAttribute('role','dialog');page.setAttribute('aria-modal','true');page.setAttribute('aria-labelledby','roomTitle');
 page.innerHTML='<div class="rp-in"><button type="button" class="rp-close">← 운명탐정으로</button><div class="rp-main"></div></div>';document.body.append(page);
 page.querySelector('.rp-close').onclick=closeRoom;page.addEventListener('keydown',e=>{if(e.key==='Escape')closeRoom()});return page}
function closeRoom(){clearInterval(timer);timer=null;cur=null;if(page)page.hidden=true;document.documentElement.classList.remove('room-open')}
async function openRoom(code){ensurePage();cur={code};page.hidden=false;document.documentElement.classList.add('room-open');page.scrollTop=0;page.querySelector('.rp-main').innerHTML='<p class="rp-wait">방을 불러오는 중이에요…</p>';await refresh(true);
 clearInterval(timer);timer=setInterval(()=>{if(!document.hidden&&cur&&!cur.shown)refresh(false)},5000)}
async function refresh(first){if(!cur)return;const main=page.querySelector('.rp-main');let info;
 try{info=await api('/room/info',{code:cur.code,token:tokens()[cur.code]||undefined})}catch(e){if(first)main.innerHTML='<p class="rp-err">'+esc(e.message)+'</p>';return}
 const prev=cur.info;cur.info=info;if(info.revealed&&info.joined){if(!cur.shown)showResult(info);return}
 if(!first&&prev&&prev.count===info.count&&prev.joined===info.joined&&prev.revealed===info.revealed)return;
 main.innerHTML=headHTML(info)+(info.owner?ownerHTML(info):info.joined?'<p class="rp-wait">참여했어요! 방장이 결과를 공개하면 모두의 캐릭터가 한 번에 나와요. 이 화면을 열어 두면 자동으로 바뀌어요.</p>':info.revealed?'<p class="rp-err">결과가 공개된 방이에요. 참여한 사람만 볼 수 있어요.</p>':info.count>=info.max?'<p class="rp-err">이 방은 인원이 가득 찼어요.</p>':joinHTML(info));
 bind(info)}
function headHTML(info){const slots=[...info.names.map(n=>'<li class="on"><span aria-hidden="true">✦</span>'+esc(n)+'</li>'),...Array(info.revealed?0:Math.max(0,(info.kind==='group'?Math.min(info.max,Math.max(info.min,info.count+1)):info.max)-info.count)).fill('<li><span aria-hidden="true">?</span>비어 있어요</li>')].join('');
 return '<p class="rp-kind">'+kindName(info.kind)+' 방 · '+info.count+'명 · '+dLeft(info.expires)+'일 뒤 자동 삭제</p><h2 id="roomTitle">'+esc(info.name)+'</h2><ul class="rp-slots">'+slots+'</ul>'}
function ownerHTML(info){const ready=info.count>=info.min,url=roomUrl(info.code);
 return '<div class="rp-box"><b>친구들에게 링크를 보내 주세요</b><p class="rp-sub">로그인 없이 이름·생년월일만 넣으면 이 방에 들어와요. 모두 모이면 결과를 한 번에 공개하세요.</p><p class="rp-link"><input type="text" readonly value="'+esc(url)+'" aria-label="방 링크"></p><div class="rp-btns"><button type="button" data-rshare>링크 보내기</button><button type="button" data-rcopy>복사</button></div><p class="rp-msg" role="status"></p></div>'+
  '<button type="button" class="rp-reveal" data-rreveal'+(ready?'':' disabled')+'>'+(ready?'결과 공개하기 · '+info.count+'명':(info.min-info.count)+'명 더 들어오면 공개할 수 있어요')+'</button><p class="rp-sub rp-center">공개하면 새 참여는 닫히고, 모두의 캐릭터가 한 번에 나와요.</p><button type="button" class="rp-del" data-rdel>방 지우기</button>'}
function joinHTML(info){const p=(typeof accountUser!=='undefined'&&accountUser&&accountUser.profile)||null;
 return '<form class="rp-form" novalidate><b>이 방에 참여하기</b><label>이름<input name="name" maxlength="20" value="'+esc(p?p.name:'')+'" autocomplete="name"></label>'+
  '<fieldset class="rp-sex"><legend>성별</legend><label><input type="radio" name="sex" value="f"'+(p&&p.sex==='f'?' checked':'')+'>여</label><label><input type="radio" name="sex" value="m"'+(p&&p.sex==='m'?' checked':'')+'>남</label></fieldset>'+
  '<label>생년월일 (양력 8자리)<input name="date" inputmode="numeric" maxlength="8" placeholder="예: 20010228" value="'+esc(p?p.date.replace(/-/g,''):'')+'"></label>'+
  '<label>태어난 시각 (선택)<input name="time" inputmode="numeric" maxlength="5" placeholder="예: 09:30" value="'+esc(p&&!p.notime?p.time:'')+'"></label>'+
  '<label class="rp-chk"><input type="checkbox" name="consent"><span><b>(필수)</b> 입력한 이름·성별·생년월일(·시각)을 이 방의 캐릭터 분석에 쓰고, 결과가 공개되면 이 방에 참여한 사람들에게 보이는 데 동의해요. 정보는 방을 만든 날부터 14일 뒤 자동으로 삭제돼요.</span></label>'+
  '<label class="rp-chk"><input type="checkbox" name="allow"><span>(선택) 방의 다른 사람이 내 생년월일을 자기 저장 목록에 저장해도 돼요.</span></label>'+
  '<button type="submit" class="rp-join">참여하기</button><p class="rp-msg" role="alert"></p></form>'}
function guestProfile(f){const name=f.name.value.trim(),sex=(f.querySelector('[name=sex]:checked')||{}).value,ymd=f.date.value.replace(/\D/g,''),tm=f.time.value.trim();
 if(!name)return '이름을 입력해 주세요.';if(!sex)return '성별을 골라 주세요.';if(!/^\d{8}$/.test(ymd))return '생년월일 8자리를 입력해 주세요.';
 const y=+ymd.slice(0,4),m=+ymd.slice(4,6),d=+ymd.slice(6,8),dt=new Date(Date.UTC(y,m-1,d));if(y<1920||y>2026||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return '생년월일을 다시 확인해 주세요.';
 let time='12:00',notime=true;if(tm){const t=tm.replace(/\D/g,'');if(!/^\d{3,4}$/.test(t))return '시각은 예: 09:30처럼 적어 주세요.';const hh=+t.slice(0,t.length-2),mm=+t.slice(-2);if(hh>23||mm>59)return '시각을 다시 확인해 주세요.';time=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');notime=false}
 let roman='';try{roman=typeof romanize==='function'?romanize(name):''}catch(_){}if(!/[a-z]/i.test(roman))roman='friend';
 return {name,roman,sex,cal:'s',leap:false,ly:y,lm:m,ld:d,date:ymd.slice(0,4)+'-'+ymd.slice(4,6)+'-'+ymd.slice(6,8),time,notime,place:{name:'출생지 미선택',none:true,kr:true,lat:null,lon:127.5,tz:9},relationship:'private'}}
function bind(info){const main=page.querySelector('.rp-main'),msg=main.querySelector('.rp-msg');
 const form=main.querySelector('.rp-form');if(form){form.date.addEventListener('input',()=>{form.date.value=form.date.value.replace(/\D/g,'').slice(0,8)});
  form.addEventListener('submit',async e=>{e.preventDefault();const p=guestProfile(form);if(typeof p==='string'){msg.textContent=p;return}if(!form.consent.checked){msg.textContent='정보 이용에 동의해야 참여할 수 있어요.';return}
   const b=form.querySelector('.rp-join');b.disabled=true;b.textContent='참여하는 중…';
   try{const r=await api('/room/join',{code:info.code,profile:p,consent:true,allowSave:form.allow.checked,token:tokens()[info.code]||undefined});if(r.token)setToken(info.code,r.token);try{window.track&&track('room_join',{kind:info.kind})}catch(_){}cur.info=null;refresh(true)}
   catch(err){msg.textContent=err.message;b.disabled=false;b.textContent='참여하기'}})}
 const sh=main.querySelector('[data-rshare]'),cp=main.querySelector('[data-rcopy]'),url=roomUrl(info.code);
 if(sh)sh.onclick=async()=>{const text=info.name+' · 운명탐정 '+kindName(info.kind)+' 방에 초대해요. 생년월일만 넣으면 우리 캐릭터 조합이 한 번에 나와요!';if(navigator.share){try{await navigator.share({title:'운명탐정',text,url});return}catch(e){if(e&&e.name==='AbortError')return}}try{await navigator.clipboard.writeText(url);msg.textContent='링크를 복사했어요. 카카오톡에 붙여 넣어 보내 주세요.'}catch(_){msg.textContent='링크를 길게 눌러 복사해 주세요.'}};
 if(cp)cp.onclick=async()=>{try{await navigator.clipboard.writeText(url);msg.textContent='링크를 복사했어요.'}catch(_){const i=main.querySelector('.rp-link input');i.focus();i.select();msg.textContent='링크를 선택했어요. 복사해 주세요.'}};
 const rv=main.querySelector('[data-rreveal]');if(rv)rv.onclick=async()=>{if(!confirm('지금 결과를 공개할까요? 공개하면 새 참여는 닫혀요.'))return;rv.disabled=true;rv.textContent='공개하는 중…';try{await api('/room/reveal',{code:info.code});try{window.track&&track('room_reveal',{kind:info.kind,count:info.count})}catch(_){}cur.info=null;refresh(true)}catch(e){rv.disabled=false;rv.textContent='결과 공개하기';alert(e.message)}};
 const del=main.querySelector('[data-rdel]');if(del)del.onclick=async()=>{if(!confirm('이 방과 참여자 정보를 지금 지울까요? 되돌릴 수 없어요.'))return;try{await api('/room/delete',{code:info.code});closeRoom();roomsPaint(true)}catch(e){alert(e.message)}};
}
async function showResult(info){const main=page.querySelector('.rp-main');cur.shown=true;main.innerHTML=headHTML(info)+'<p class="rp-wait">모두의 다섯 점술을 함께 분석하고 있어요…</p>';
 let d;try{d=await api('/room/result',{code:info.code,token:tokens()[info.code]||undefined})}catch(e){main.innerHTML=headHTML(info)+'<p class="rp-err">'+esc(e.message)+'</p>';return}
 const ms=d.members.slice().sort((a,b)=>(b.me?1:0)-(a.me?1:0));let charts;
 try{charts=ms.map(m=>buildChart(Object.assign({},m.profile,{name:m.profile.name||m.name})))}catch(e){main.innerHTML=headHTML(info)+'<p class="rp-err">결과를 계산하지 못했어요.</p>';return}
 main.innerHTML=headHTML(info)+'<div class="rp-result">'+socialResultHTML(charts)+'</div>'+(info.owner?'<button type="button" class="rp-del" data-rdel>방 지우기</button>':'');
 {const del=main.querySelector('[data-rdel]');if(del)del.onclick=async()=>{if(!confirm('이 방과 참여자 정보를 지금 지울까요? 되돌릴 수 없어요.'))return;try{await api('/room/delete',{code:info.code});closeRoom();roomsPaint(true)}catch(e){alert(e.message)}}}
 /* 저장을 허락한 사람만, 로그인한 경우 내 저장 목록에 더한다 */
 try{if(typeof accountUser!=='undefined'&&accountUser&&typeof partnerSave==='function'){const have=partnerList();for(const m of ms){if(m.me||!m.allowSave)continue;const p=m.profile;if(have.some(x=>x.name===p.name&&x.date===p.date))continue;await partnerSave({name:p.name,roman:p.roman||'',sex:p.sex,date:p.date,time:p.notime?'':p.time,notime:!!p.notime,pi:null})}}}catch(_){}}

/* 방장: 우정·모임 패널의 링크 버튼을 방 만들기로 바꾼다 */
document.addEventListener('click',e=>{const b=e.target.closest('[data-pmake]');if(!b||typeof CMPKIND==='undefined'||CMPKIND==='love')return;e.preventDefault();e.stopImmediatePropagation();
 if(typeof requireSavedProfile==='function'&&!requireSavedProfile())return;const out=b.closest('.cmp-form')?.querySelector('.cmp-pair')||b.parentNode;
 out.innerHTML='<form class="rp-make"><label>방 이름<input name="rname" maxlength="30" placeholder="'+(CMPKIND==='group'?'예: 동아리 3기':'예: 나랑 지민')+'"></label><button type="submit">방 만들기</button><p class="rp-msg" role="status"></p></form>';
 const f=out.querySelector('form');f.rname.focus();f.onsubmit=async ev=>{ev.preventDefault();const name=f.rname.value.trim();if(!name){f.querySelector('.rp-msg').textContent='방 이름을 입력해 주세요.';return}
  const sb=f.querySelector('button');sb.disabled=true;try{const r=await api('/room',{kind:CMPKIND==='group'?'group':'friend',name});try{window.track&&track('room_create',{kind:CMPKIND})}catch(_){}out.innerHTML='';openRoom(r.code);roomsPaint(true)}catch(err){f.querySelector('.rp-msg').textContent=err.message;sb.disabled=false}}},true);

/* 우정·모임 패널 맨 위 '내 모임 방' 목록 */
let roomsCache=null;
async function roomsPaint(force){const tab=$('tab-match');if(!tab||typeof CMPKIND==='undefined'||CMPKIND==='love'||typeof accountUser==='undefined'||!accountUser)return;
 const host=CMPKIND==='group'?$('cmpGroup'):$('cmpOne');if(!host)return;let box=host.querySelector('.rp-rooms');
 if(!box){box=document.createElement('section');box.className='rp-rooms';host.prepend(box);force=true}if(!force&&box.dataset.kind===CMPKIND)return;box.dataset.kind=CMPKIND;
 try{if(force||!roomsCache)roomsCache=(await api('/rooms')).rooms||[]}catch(_){roomsCache=roomsCache||[]}
 const list=roomsCache.filter(r=>r.kind===(CMPKIND==='group'?'group':'friend'));
 box.innerHTML=list.length?'<h4>내 '+kindName(CMPKIND)+' 방</h4><div class="rp-cards">'+list.map(r=>'<button type="button" class="rp-card" data-room="'+esc(r.code)+'"><b>'+esc(r.name)+'</b><small>'+r.count+'명 · '+(r.revealed?'결과 공개됨':'모이는 중')+' · '+dLeft(r.expires)+'일 남음</small></button>').join('')+'</div>':''}
document.addEventListener('click',e=>{const b=e.target.closest('[data-room]');if(b)openRoom(b.dataset.room)});
new MutationObserver(()=>roomsPaint(false)).observe(document.body,{childList:true,subtree:true});

/* 링크로 들어온 경우: ?room=코드 */
try{const q=new URLSearchParams(location.search),code=q.get('room');if(code&&/^[a-f0-9]{12}$/.test(code)){q.delete('room');history.replaceState(history.state,'',location.pathname+(q.toString()?'?'+q:'')+location.hash);
 const go=()=>openRoom(code);document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()}}catch(_){}
})();
