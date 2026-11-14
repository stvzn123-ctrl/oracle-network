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
