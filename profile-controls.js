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
