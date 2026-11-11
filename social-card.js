/* Local-only image cards: no birth information is included in exported images. */
(()=>{
 const original=socialResultHTML,cache=new Map();let serial=0;
 const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('캐릭터 이미지를 불러오지 못했어요.'));im.src=src;});
 const wrap=(ctx,text,width)=>{const lines=[];let line='';for(const char of String(text)){if(ctx.measureText(line+char).width>width&&line){lines.push(line);line=char;}else line+=char;}if(line)lines.push(line);return lines;};
 async function draw(list){
  if(document.fonts?.ready)await document.fonts.ready;
  const people=socialContext(list),cols=people.length===2?2:3,W=1080,pad=60,gap=24,cw=(W-pad*2-gap*(cols-1))/cols;
  const sheets=await Promise.all(['a','b','c','d'].map(k=>load('img/social-dogs-'+k+'-v4.png')));
  const canvas=document.createElement('canvas');canvas.width=W;let ctx=canvas.getContext('2d');ctx.font='26px "Malgun Gothic",sans-serif';
  const rows=people.map(p=>({person:p,name:wrap(ctx,p.cast.name,180),role:wrap(ctx,p.role,230),detail:wrap(ctx,p.strength,450)}));
  const heights=rows.map(r=>Math.max(r.name.length,r.role.length,r.detail.length)*38+44);
  const tableY=160+Math.ceil(people.length/cols)*(cw+90)+40;canvas.height=tableY+100+heights.reduce((a,b)=>a+b,0)+100;
  ctx=canvas.getContext('2d');ctx.fillStyle='#fcf8ef';ctx.fillRect(0,0,W,canvas.height);ctx.fillStyle='#163448';ctx.font='bold 46px "Malgun Gothic",sans-serif';ctx.fillText(people.length===2?'우리 둘의 캐릭터 조합':'우리 모임의 캐릭터 조합',pad,85);
  people.forEach((p,i)=>{const x=pad+(i%cols)*(cw+gap),y=150+Math.floor(i/cols)*(cw+90),im=sheets['abcd'.indexOf(p.cast.sheet)],sw=im.width/3,sh=im.height/3;ctx.drawImage(im,p.cast.index%3*sw,Math.floor(p.cast.index/3)*sh,sw,sh,x,y,cw,cw);ctx.fillStyle='#163448';ctx.font='bold 28px "Malgun Gothic",sans-serif';ctx.textAlign='center';wrap(ctx,p.cast.name,cw).slice(0,2).forEach((line,j)=>ctx.fillText(line,x+cw/2,y+cw+38+j*34));});ctx.textAlign='left';
  ctx.font='bold 32px "Malgun Gothic",sans-serif';ctx.fillText('각자 역할',pad,tableY);let y=tableY+62;ctx.font='bold 26px "Malgun Gothic",sans-serif';ctx.fillStyle='#946020';['이름','역할','강점'].forEach((t,i)=>ctx.fillText(t,[pad,280,540][i],y));y+=26;
  rows.forEach((r,i)=>{ctx.strokeStyle='#ded3c4';ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke();ctx.fillStyle='#163448';ctx.font='26px "Malgun Gothic",sans-serif';[r.name,r.role,r.detail].forEach((lines,k)=>lines.forEach((t,j)=>ctx.fillText(t,[pad,280,540][k],y+42+j*38)));y+=heights[i];});
  ctx.fillStyle='#8a7762';ctx.font='22px "Malgun Gothic",sans-serif';ctx.fillText('운명탐정 · '+new URL('./',location.href).host,pad,canvas.height-38);
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('카드 이미지를 만들지 못했어요.')),'image/png'));
 }
 socialResultHTML=function(list){const id='social-card-'+(++serial),fallback=original(list);const state={};cache.set(id,state);state.promise=Promise.resolve().then(()=>draw(list)).then(blob=>{state.blob=blob;state.url=URL.createObjectURL(blob);const box=document.getElementById(id);if(box){const img=document.createElement('img');img.src=state.url;img.alt='캐릭터 조합과 각자 역할 카드';img.className='social-card-image';box.querySelector('.social-card-content').replaceChildren(img);}return blob;}).catch(e=>{state.error=e;return null;});
  return '<section class="social-share-card" id="'+id+'"><div class="social-card-content">'+fallback+'</div><button type="button" class="social-share-button" data-social-share="'+id+'">친구에게 공유하기</button><p class="social-share-status" role="status"></p></section>';
 };
 document.addEventListener('click',async e=>{const button=e.target.closest('[data-social-share]');if(!button)return;const box=button.closest('.social-share-card'),status=box.querySelector('.social-share-status'),state=cache.get(button.dataset.socialShare);button.disabled=true;status.textContent='공유 이미지를 준비하고 있어요…';try{const blob=await state.promise;if(!blob)throw state.error;const file=new File([blob],'우리-캐릭터-조합.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'우리 캐릭터 조합'});status.textContent='';}else{const a=document.createElement('a');a.href=state.url;a.download=file.name;a.click();status.textContent='이미지 저장을 시작했어요. 저장한 카드를 친구나 SNS에 공유해 주세요.';}}catch(err){status.textContent=err.name==='AbortError'?'':err.message||'이미지를 공유하지 못했어요. 다시 시도해 주세요.';}finally{button.disabled=false;}});
})();
