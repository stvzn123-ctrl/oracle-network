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
