/* Share result-page links; birth information is never included. */
(()=>{
 const original=socialResultHTML,cache=new Map();let serial=0;
 socialResultHTML=function(list){const id='social-card-'+(++serial),fallback=original(list);const cast=socialContext(list).map(x=>({name:x.cast.name,sheet:x.cast.sheet,index:x.cast.index,role:x.role,strength:x.strength}));const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(cast))));const shareUrl=new URL('./',location.href);shareUrl.hash='combo='+encodeURIComponent(encoded);const state={shareUrl:shareUrl.href};cache.set(id,state);
  return '<section class="social-share-card" id="'+id+'"><div class="social-card-content">'+fallback+'</div><button type="button" class="social-share-button" data-social-share="'+id+'">친구에게 공유하기</button><p class="social-share-status" role="status"></p></section>';
 };
 document.addEventListener('click',async e=>{const button=e.target.closest('[data-social-share]');if(!button)return;const box=button.closest('.social-share-card'),status=box.querySelector('.social-share-status'),state=cache.get(button.dataset.socialShare);button.disabled=true;status.textContent='공유 링크를 준비하고 있어요…';try{const url=state.shareUrl;if(navigator.share){await navigator.share({title:'우리 캐릭터 조합',text:'우리 조합에서는 어떤 캐릭터일까?',url});status.textContent='';}else{await navigator.clipboard.writeText(url);status.textContent='조합 페이지 링크를 복사했어요. 친구에게 보내주세요.';}}catch(err){status.textContent=err.name==='AbortError'?'':err.message||'링크를 공유하지 못했어요. 다시 시도해 주세요.';}finally{button.disabled=false;}});

 const hash=new URLSearchParams(location.hash.slice(1)),encoded=hash.get('combo');
 if(encoded)try{
  if(encoded.length>12000)throw Error('invalid');const people=JSON.parse(decodeURIComponent(escape(atob(encoded))));
  if(!Array.isArray(people)||people.length<2||people.length>8||people.some(p=>!['a','b','c','d'].includes(p.sheet)||!Number.isInteger(p.index)||p.index<0||p.index>8||typeof p.name!=='string'||p.name.length>40||typeof p.role!=='string'||p.role.length>60||typeof p.strength!=='string'||p.strength.length>300))throw Error('invalid');
  const cast=people.map(p=>({...p,label:SOCIAL_DOGS.find(d=>d[0]===p.sheet&&d[1]===p.index)[2]}));
  const dialog=document.createElement('dialog');dialog.className='shared-result-dialog';dialog.innerHTML='<button type="button" class="shared-result-close">닫기 ×</button><h2>우리 캐릭터 조합</h2>'+socialCastHTML(cast)+reportInfoTable('각자 역할',['이름','역할','강점'],people.map(p=>[p.name,p.role,p.strength]),'social-role-table',['25%','30%','45%'])+'<a href="'+new URL('./',location.href).href+'">나도 확인하기</a>';dialog.classList.add('social-result');document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal();
 }catch(_){/* Invalid links never execute markup or populate birth inputs. */}
})();
