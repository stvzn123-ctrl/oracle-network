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
 return new Promise(ok=>c.toBlob(ok,'image/png'))}
/* 2026-11-14 우정(두 사람) 캐릭터 조합(.social-share-card)도 같은 틀로 그린다: 캐릭터 별명·그림·이름·역할 */
async function renderSocial(box){
 const F="MemomentKkukkukk,'IBM Plex Sans KR',sans-serif",dogs=[...box.querySelectorAll('.social-dog')].slice(0,2),roles={},strengths={};
 box.querySelectorAll('.social-role-table tbody tr').forEach(tr=>{const td=tr.querySelectorAll('th,td');if(td.length>1){roles[td[0].textContent.trim()]=td[1].textContent.trim();strengths[td[0].textContent.trim()]=(td[2]?.textContent||'').trim()}});
 try{if(window.loadMemoment)await window.loadMemoment();await document.fonts.load('60px MemomentKkukkukk',box.textContent.slice(0,400)+'우리 둘의 캐릭터 조합 운명탐정')}catch(_){}
 const H=1150,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#FFF9F4';g.fillRect(0,0,W,H);g.fillStyle='#FDF1DF';g.strokeStyle='#E9D3B0';g.lineWidth=3;g.beginPath();g.roundRect(60,60,W-120,H-200,48);g.fill();g.stroke();
 g.textAlign='center';g.fillStyle='#8A5A1E';g.font='34px '+F;g.fillText('우리 둘의 캐릭터 조합',W/2,180);
 const S=410,top=250,pos=[[95,top],[W-95-S,top]];
 for(let i=0;i<dogs.length;i++){const d=dogs[i],x=pos[i][0],name=d.querySelector('.social-dog-name')?.textContent.trim()||'';
  /* 그림 안에 캐릭터 별명이 이미 적혀 있어 따로 쓰지 않는다 */
  g.save();g.beginPath();g.roundRect(x,top,S,S,36);g.clip();try{await sprite(g,d.querySelector('.social-dog-sprite'),x,top,S)}catch(_){}g.restore();
  g.textAlign='center';g.fillStyle='#4A352B';g.font='700 50px '+F;g.fillText(name,x+S/2,top+S+76);
  g.fillStyle='#8A5A1E';g.font='34px '+F;wrap(g,roles[name]||'',x+S/2,top+S+128,S,44);
  g.fillStyle='#6b5547';g.font='28px '+F;const st=(strengths[name]||'').split(/(?<=요\.)\s/)[0];wrap(g,st,x+S/2,top+S+196,S-10,38)}
 g.fillStyle='#8A5A1E';g.font='40px '+F;g.fillText('운명탐정',W/2,H-80);g.fillStyle='#9a8576';g.font='28px '+F;g.fillText('fatedog.co.kr',W/2,H-38);
 return new Promise(ok=>c.toBlob(ok,'image/png'))}
async function share(btn){const card=btn.closest('.pair-character')||btn.closest('.social-share-card');if(!card||btn.disabled)return;btn.disabled=true;const old=btn.textContent;btn.textContent='이미지 만드는 중…';
 try{const blob=await (card.matches('.social-share-card')?renderSocial(card):render(card));if(!blob)throw Error('blob');const file=new File([blob],'운명탐정-우리둘.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});try{window.oracleShared&&oracleShared('pair')}catch(_){}}catch(e){if(e&&e.name!=='AbortError')throw e}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}}
 catch(_){alert('이미지를 만들지 못했어요. 다시 시도해 주세요.')}finally{btn.disabled=false;btn.textContent=old}}
function add(root){for(const box of root.querySelectorAll?root.querySelectorAll('.social-share-card'):[]){if(box.querySelector('.pair-share')||box.querySelectorAll('.social-dog').length!==2)continue;const b=document.createElement('button');b.type='button';b.className='pair-share fd-cta fd-cta-sub';b.textContent='이미지로 저장·공유하기';box.querySelector('.social-share-button')?.before(b)}
 for(const card of root.querySelectorAll?root.querySelectorAll('.pair-character'):[]){if(card.querySelector('.pair-share'))continue;const b=document.createElement('button');b.type='button';b.className='pair-share fd-cta fd-cta-sub';b.textContent='이미지로 저장·공유하기';(card.querySelector('.tc-wrap')||card.querySelector('.pair-description'))?.after(b)}}
document.addEventListener('click',e=>{const b=e.target.closest('.pair-share');if(b)share(b)});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches?.('.pair-character,.social-share-card'))add(n.parentNode);else add(n)}}).observe(document.body,{childList:true,subtree:true});
add(document);
})();
