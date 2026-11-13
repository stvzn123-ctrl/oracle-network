/* 2026-11-13: 궁합 관계 캐릭터 카드(.pair-character)를 이미지로 저장·공유한다.
   출생 정보는 넣지 않는다(이름·캐릭터·장면 문구만). 휴대폰은 시스템 공유 창, 안 되면 PNG 내려받기. */
(()=>{"use strict";
const W=1080,H=1350,F="'IBM Plex Sans KR',sans-serif",J="Jua,'IBM Plex Sans KR',sans-serif";
const load=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
function wrap(g,text,x,y,max,lh){const out=[];let line='';for(const w of text.split(/\s+/)){const t=line?line+' '+w:w;if(g.measureText(t).width>max&&line){out.push(line);line=w}else line=t}if(line)out.push(line);out.forEach((l,i)=>g.fillText(l,x,y+i*lh));return out.length}
async function sprite(g,el,x,y,s){const cs=getComputedStyle(el),url=(cs.backgroundImage.match(/url\(["']?([^"')]+)/)||[])[1];if(!url)return;const img=await load(url);
 const [sx,sy]=cs.backgroundSize.split(' ').map(v=>parseFloat(v)/100),[px,py]=cs.backgroundPosition.split(' ').map(v=>parseFloat(v)/100);
 const cw=img.width/sx,chh=img.height/sy,ox=px*(img.width-cw),oy=py*(img.height-chh);g.drawImage(img,ox,oy,cw,chh,x,y,s,s)}
async function render(card){
 await document.fonts?.ready;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#FFF9F4';g.fillRect(0,0,W,H);
 g.fillStyle='#FDF1DF';g.strokeStyle='#E9D3B0';g.lineWidth=3;g.beginPath();g.roundRect(60,60,W-120,H-200,48);g.fill();g.stroke();
 g.textAlign='center';g.fillStyle='#8A5A1E';g.font='600 34px '+F;g.fillText(card.querySelector('.pair-eyebrow')?.textContent||'우리 둘의 관계 캐릭터',W/2,170);
 g.fillStyle='#4A352B';g.font='64px '+J;wrap(g,card.querySelector('h3')?.textContent||'',W/2,260,W-220,78);
 const figs=[...card.querySelectorAll('.pair-stage figure')],S=360,pos=[[110,360],[W-110-S,360]];
 for(let i=0;i<2&&i<figs.length;i++){const art=figs[i].querySelector('.pair-art');try{await sprite(g,art,pos[i][0],pos[i][1],S)}catch(_){}
  g.fillStyle='#4A352B';g.font='700 46px '+F;g.fillText(figs[i].querySelector('b')?.textContent||'',pos[i][0]+S/2,pos[i][1]+S+60);
  g.fillStyle='#7a6457';g.font='34px '+F;g.fillText(figs[i].querySelector('span')?.textContent||'',pos[i][0]+S/2,pos[i][1]+S+108)}
 const svg=card.querySelector('.pair-prop svg');if(svg){try{const cp=svg.cloneNode(true);cp.setAttribute('xmlns','http://www.w3.org/2000/svg');cp.setAttribute('width','180');cp.setAttribute('height','180');const im=await load('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(cp)));g.drawImage(im,W/2-90,450,180,180)}catch(_){}}
 g.fillStyle='#4A352B';g.font='38px '+F;wrap(g,card.querySelector('.pair-description')?.textContent||'',W/2,960,W-240,60);
 g.fillStyle='#8A5A1E';g.font='40px '+J;g.fillText('운명탐정',W/2,H-80);g.fillStyle='#9a8576';g.font='28px '+F;g.fillText('fatedog.co.kr · 재미로 보는 관계 캐릭터',W/2,H-38);
 return new Promise(ok=>c.toBlob(ok,'image/png'))}
async function share(btn){const card=btn.closest('.pair-character');if(!card||btn.disabled)return;btn.disabled=true;const old=btn.textContent;btn.textContent='이미지 만드는 중…';
 try{const blob=await render(card);if(!blob)throw Error('blob');const file=new File([blob],'운명탐정-우리둘.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'우리 둘의 관계 캐릭터',text:'운명탐정에서 본 우리 둘의 관계 캐릭터 https://fatedog.co.kr'})}catch(e){if(e&&e.name!=='AbortError')throw e}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}}
 catch(_){alert('이미지를 만들지 못했어요. 다시 시도해 주세요.')}finally{btn.disabled=false;btn.textContent=old}}
function add(root){for(const card of root.querySelectorAll?root.querySelectorAll('.pair-character'):[]){if(card.querySelector('.pair-share'))continue;const b=document.createElement('button');b.type='button';b.className='pair-share fd-cta fd-cta-sub';b.textContent='이미지로 저장·공유하기';card.querySelector('.pair-description')?.after(b)}}
document.addEventListener('click',e=>{const b=e.target.closest('.pair-share');if(b)share(b)});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches?.('.pair-character'))add(n.parentNode);else add(n)}}).observe(document.body,{childList:true,subtree:true});
add(document);
})();
