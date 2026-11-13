/* 2026-11-13: '나의 운명 캐릭터' 카드를 인스타 스토리 크기(1080×1920) 이미지로 저장·공유한다.
   출생 정보는 넣지 않는다. 이름은 '이름 넣기'를 켰을 때만. 시스템 공유(files) → 안 되면 내려받기.
   분석: GA4 'share_character'·Clarity 이벤트(사이트 도메인에서만 수집됨). */
(()=>{"use strict";
const W=1080,H=1920,INK='#4A352B',GOLD='#8A5A1E',SUB='#7a6253',LINE='#ecd6a8';
const track=(n,p)=>{try{window.gtag&&gtag('event',n,p||{})}catch(_){}try{window.clarity&&clarity('event',n)}catch(_){}};
function inject(sec){if(!sec||sec.querySelector('.cs-share'))return;const at=sec.querySelector('.character-tags')||sec.querySelector('.character-description');if(!at)return;
 const box=document.createElement('div');box.className='cs-share';
 box.innerHTML='<button type="button" class="cs-btn">이미지로 저장·공유하기</button><label class="cs-name"><input type="checkbox" checked> 이름 넣기</label><p class="cs-status" role="status"></p>';
 at.after(box)}
new MutationObserver(()=>document.querySelectorAll('.destiny-character').forEach(inject)).observe(document.body,{childList:true,subtree:true});
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
 const allText='운명탐정입니다님은나는'+name+title+desc.join('')+'사주·서양점성술베딕수비학마야력다섯가지점술로읽은운명캐릭터fatedog.co.kr';
 try{await Promise.all([document.fonts.load('100px Jua',allText),document.fonts.load('600 40px "IBM Plex Sans KR"',allText),document.fonts.load('500 40px "IBM Plex Sans KR"',allText),document.fonts.load('400 30px "IBM Plex Sans KR"',allText)])}catch(_){}
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const bg=c.createRadialGradient(W/2,H*.45,0,W/2,H*.45,H*.7);bg.addColorStop(0,'#fff3d6');bg.addColorStop(.5,'#fff9f4');bg.addColorStop(1,'#fbeee2');c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.fillStyle='rgba(232,185,100,.18)';for(let y=27;y<H;y+=54)for(let x=27;x<W;x+=54){c.beginPath();c.arc(x,y,3,0,7);c.fill()}
 /* 카드 상자 */
 const CX=70,CY=210,CW=W-140,CH2=1500;c.save();c.shadowColor='rgba(138,90,30,.14)';c.shadowBlur=60;c.shadowOffsetY=20;rr(c,CX,CY,CW,CH2,56);c.fillStyle='rgba(255,255,255,.82)';c.fill();c.restore();rr(c,CX,CY,CW,CH2,56);c.lineWidth=3;c.strokeStyle=LINE;c.stroke();
 c.textAlign='center';c.textBaseline='alphabetic';
 /* 운명탐정 꼬리표 */
 let mascot=null;try{mascot=await img('img/mascot.webp')}catch(_){}
 c.font='42px Jua, sans-serif';const bw=c.measureText('운명탐정').width,pw=bw+(mascot?100:60),px=W/2-pw/2,py=280;
 rr(c,px,py,pw,86,43);c.fillStyle='#fff';c.fill();c.lineWidth=2.5;c.strokeStyle=LINE;c.stroke();
 if(mascot)c.drawImage(mascot,px+18,py+12,62,62);c.fillStyle=GOLD;c.textAlign='left';c.fillText('운명탐정',px+(mascot?88:30),py+58);c.textAlign='center';
 /* 제목 */
 let y=py+86+90;c.fillStyle=SUB;c.font='600 44px "IBM Plex Sans KR", sans-serif';c.fillText(name?name+'님은':'나는',W/2,y);
 y+=118;let fs=104;c.font=fs+'px Jua, sans-serif';const tail='입니다';
 const fit=()=>{c.font=fs+'px Jua, sans-serif';const a=c.measureText(title).width;c.font='600 44px "IBM Plex Sans KR", sans-serif';return a+12+c.measureText(tail).width};
 while(fit()>CW-100&&fs>60)fs-=4;
 const total=fit();c.font=fs+'px Jua, sans-serif';const tw=c.measureText(title).width,sx=W/2-total/2;
 c.textAlign='left';c.fillStyle=INK;c.fillText(title,sx,y);c.font='600 44px "IBM Plex Sans KR", sans-serif';c.fillStyle=SUB;c.fillText(tail,sx+tw+12,y);c.textAlign='center';
 /* 캐릭터 원 */
 const R=300,cy=y+70+R;c.save();c.shadowColor='rgba(138,90,30,.16)';c.shadowBlur=70;c.shadowOffsetY=24;c.beginPath();c.arc(W/2,cy,R,0,7);c.fillStyle='#fff';c.fill();c.restore();
 c.fillStyle='#e8b964';c.font='58px sans-serif';c.fillText('✦',W/2-R-30,cy-R+70);c.fillText('✦',W/2+R+20,cy+R-50);
 if(src){try{const im=await img(src),[bx,by,bw2,bh]=bbox(im),s=Math.min(460/bw2,460/bh);c.drawImage(im,bx,by,bw2,bh,W/2-bw2*s/2,cy-bh*s/2,bw2*s,bh*s)}catch(_){}}
 /* 소개 */
 y=cy+R+84;c.fillStyle=INK;c.font='500 40px "IBM Plex Sans KR", sans-serif';
 for(const p of desc)for(const l of wrap(c,p,CW-120)){c.fillText(l,W/2,y);y+=62}
 /* 근거·링크 */
 const by2=Math.max(y+40,CY+CH2-150);c.fillStyle=SUB;c.font='600 30px "IBM Plex Sans KR", sans-serif';c.fillText('사주 · 서양 점성술 · 베딕 점성술 · 수비학 · 마야력',W/2,by2);
 c.fillStyle='#8c7565';c.font='400 30px "IBM Plex Sans KR", sans-serif';c.fillText('다섯 가지 점술로 읽은 운명 캐릭터',W/2,by2+46);
 c.fillStyle=GOLD;c.font='600 32px "IBM Plex Sans KR", sans-serif';c.fillText('fatedog.co.kr',W/2,CY+CH2+70);
 return new Promise(ok=>cv.toBlob(ok,'image/jpeg',.9))}
document.addEventListener('click',async e=>{const b=e.target.closest('.cs-btn');if(!b)return;const sec=b.closest('.destiny-character'),st=sec.querySelector('.cs-status'),withName=!!sec.querySelector('.cs-name input')?.checked;
 b.disabled=true;st.textContent='이미지를 만들고 있어요…';
 try{const blob=await draw(sec,withName),title=(sec.querySelector('h2')||{}).textContent||'캐릭터',file=new File([blob],'운명탐정-'+title.replace(/\s+/g,'')+'.jpg',{type:'image/jpeg'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});st.textContent='공유했어요.';track('share_character',{method:'share',character:title})}catch(err){st.textContent=err&&err.name==='AbortError'?'':'공유하지 못했어요. 다시 시도해 주세요.'}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);st.textContent='이미지를 저장했어요.';track('share_character',{method:'download',character:title})}
 }catch(_){st.textContent='이미지를 만들지 못했어요. 다시 시도해 주세요.'}finally{b.disabled=false}});
})();
