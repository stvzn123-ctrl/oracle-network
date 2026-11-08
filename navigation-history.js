/* Same-document history: back closes overlays and restores the previous view. */
(()=>{
 const nav=document.querySelector('.bottom-nav'),report=document.getElementById('report');
 let applying=false,pending;
 const current=()=>{
  const dialog=Array.from(document.querySelectorAll('dialog[open]')).at(-1);
  const entered=document.body.classList.contains('app-entered');
  const route=document.body.classList.contains('nav-ask')?'ask':document.body.classList.contains('nav-topics')?'topics':entered?'home':'landing';
  const tab=Array.from(document.querySelectorAll('#result>.tabp, #result .tabp')).find(e=>!e.hidden)?.id.replace('tab-','')||'natal';
  return {route,entered,tab,dialog:dialog?.id||null,report:!report.hidden};
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
  if(v.route!=='landing')nav.querySelector(`[data-bottom="${v.route}"]`)?.click();
  document.body.classList.toggle('app-entered',v.entered);
  document.body.classList.toggle('nav-topics',v.route==='topics');
  document.body.classList.toggle('nav-ask',v.route==='ask');
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
