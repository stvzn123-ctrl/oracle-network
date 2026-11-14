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
 return toBlob(c)}
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
 return toBlob(c)}
/* 2026-11-14 모임(3~8명) 단체 사진: 배경을 오려 낸 캐릭터(img/social-cut/<시트><번호>.webp)를 줄줄이 겹쳐 세우고(뒤로 갈수록 작게),
   크기·기울기·위치를 이름으로 정한 무작위로 살짝 흔든다(같은 모임이면 같은 배치). 나(첫 사람)는 앞줄 가운데. 별명은 화살표로 가리킨다. */
function cutKey(el){const cs=getComputedStyle(el),m=cs.backgroundImage.match(/social-dogs-([a-d])-/);if(!m)return null;const [px,py]=cs.backgroundPosition.split(' ').map(v=>Math.round(parseFloat(v)/50));return m[1]+(py*3+px)}
function seeded(str){let h=1779033703;for(const ch of str)h=Math.imul(h^ch.charCodeAt(0),3432918353),h=h<<13|h>>>19;return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^=h>>>16)>>>0)/4294967296}}
function arrow(g,x1,y1,x2,y2,bend){const mx=(x1+x2)/2+bend,my=(y1+y2)/2;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(mx,my,x2,y2);g.stroke();const a=Math.atan2(y2-my,x2-mx);g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-16*Math.cos(a-0.45),y2-16*Math.sin(a-0.45));g.moveTo(x2,y2);g.lineTo(x2-16*Math.cos(a+0.45),y2-16*Math.sin(a+0.45));g.stroke()}
async function renderGroup(box){
 const F="MemomentKkukkukk,'IBM Plex Sans KR',sans-serif",dogs=[...box.querySelectorAll('.social-dog')].slice(0,8),n=dogs.length;
 try{if(window.loadMemoment)await window.loadMemoment();await document.fonts.load('60px MemomentKkukkukk',box.textContent.slice(0,800)+'우리 모임 단체 사진 명의 캐릭터 조합 운명탐정')}catch(_){}
 const people=await Promise.all(dogs.map(async d=>{const k=cutKey(d.querySelector('.social-dog-sprite'));let img=null;try{img=await load('img/social-cut/'+k+'.webp')}catch(_){}return {name:d.querySelector('.social-dog-name')?.textContent.trim()||'',nick:d.querySelector('.social-dog-label')?.textContent.trim()||'',img}}));
 const rnd=seeded(people.map(p=>p.name).join('|')),H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#FFF6EA';g.fillRect(0,0,W,H);
 for(let i=0;i<26;i++){const x=60+rnd()*(W-120),y=260+rnd()*(H-420),r=6+rnd()*10;g.fillStyle=i%3?'rgba(242,196,90,.55)':'rgba(255,134,176,.35)';g.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*0.38:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill()}
 g.textAlign='center';g.fillStyle='#4A352B';g.font='64px '+F;g.fillText('우리 모임 단체 사진',W/2,150);g.fillStyle='#8A5A1E';g.font='32px '+F;g.fillText(n+'명의 캐릭터 조합',W/2,200);
 const plan={3:[1,2],4:[2,2],5:[2,3],6:[3,3],7:[3,4],8:[4,4]}[n]||[n],R=plan.length,front=plan[R-1];
 /* 줄마다 사람 배치: 나는 앞줄 가운데 */
 const others=people.slice(1),rows=plan.map(k=>Array(k).fill(null)),mid=Math.floor((front-1)/2);rows[R-1][mid]=people[0];let q=0;for(let r=R-1;r>=0;r--)for(let i=0;i<rows[r].length;i++)if(!rows[r][i])rows[r][i]=others[q++];
 const base=Math.min(n<=3?430:n<=4?380:340,(W-120)/front*1.2),items=[];let feet=0;
 for(let r=R-1;r>=0;r--){const sz=base*Math.pow(0.86,R-1-r),k=rows[r].length,step=(W-150)/k;
  rows[r].forEach((p,i)=>{const s=sz*(0.94+rnd()*0.12),ar=p.img?p.img.height/p.img.width:1,w=ar>1?s/ar:s,h=ar>1?s:s*ar,cx=75+step*(i+0.5)+(rnd()-0.5)*40+(r<R-1&&k===plan[r+1]?step*0.25:0);
   items.push({p,r,cx,feet:feet+(rnd()-0.5)*24,w,h,rot:(rnd()-0.5)*0.22})});feet-=sz*0.52}
 const top=Math.min(...items.map(t=>t.feet-t.h))-110,bottom=110,span=bottom-top,area=[250,1150],sc=Math.min(1,(area[1]-area[0])/span),oy=area[0]-top*sc+((area[1]-area[0])-span*sc)/2;
 for(const t of items){t.w*=sc;t.h*=sc;t.feet=oy+t.feet*sc;t.cx=W/2+(t.cx-W/2)*Math.min(1,sc*1.05);t.cx=Math.max(30+t.w/2,Math.min(W-30-t.w/2,t.cx))}
 for(let r=0;r<R;r++)for(const t of items.filter(t=>t.r===r)){if(!t.p.img)continue;g.save();g.translate(t.cx,t.feet);g.rotate(t.rot);g.shadowColor='rgba(74,53,43,.18)';g.shadowBlur=14;g.shadowOffsetY=6;g.drawImage(t.p.img,-t.w/2,-t.h,t.w,t.h);g.restore()}
 /* 별명 + 이름, 화살표로 가리키기: 앞줄은 발밑, 나머지는 머리 위 */
 g.lineCap='round';g.lineJoin='round';
 for(const t of items){const below=t.r===R-1,k4=items.filter(u=>u.r===t.r).length>=4;let lx=Math.max(120,Math.min(W-120,t.cx+(below||k4?0:(t.cx<W/2?-30:30))));const ly=below?t.feet+64:t.feet-t.h-58;
  g.font=(k4?'26px ':'30px ')+F;{const hw=g.measureText(t.p.nick).width/2+14;lx=Math.max(70+hw,Math.min(W-70-hw,lx))}g.lineWidth=9;g.strokeStyle='#FFF6EA';g.strokeText(t.p.nick,lx,ly);g.fillStyle='#4A352B';g.fillText(t.p.nick,lx,ly);
  g.font=(k4?'600 23px ':'600 26px ')+F;g.strokeText(t.p.name,lx,ly+(below?34:-36));g.fillStyle='#B0613F';g.fillText(t.p.name,lx,ly+(below?34:-36));
  g.strokeStyle='#8A5A1E';g.lineWidth=3.5;below?arrow(g,lx+(lx<t.cx?20:-20),ly-34,t.cx+(t.cx<W/2?-10:10),t.feet-t.h*0.18,lx<W/2?-30:30):arrow(g,lx,ly+12,t.cx+(t.cx<W/2?8:-8),t.feet-t.h*0.86,t.cx<W/2?-24:24)}
 g.fillStyle='#8A5A1E';g.font='40px '+F;g.fillText('운명탐정',W/2,H-80);g.fillStyle='#9a8576';g.font='28px '+F;g.fillText('fatedog.co.kr',W/2,H-38);
 return toBlob(c)}
/* 아이폰 사파리는 누른 직후에만 공유 창을 연다. 그래서 이미지를 미리 만들어 두고(prep), 누르면 바로 navigator.share를 부른다.
   미리 만들기가 덜 끝났으면 만든 뒤 '한 번 더 눌러 주세요'로 바꾸고, 공유가 막히면 화면에 이미지를 띄워 길게 눌러 저장하게 한다. */
const ready=new WeakMap();
function toBlob(c){return new Promise(ok=>{try{c.toBlob(b=>{if(b)return ok(b);fetch(c.toDataURL('image/png')).then(r=>r.blob()).then(ok,()=>ok(null))},'image/png')}catch(_){ok(null)}})}
function cardOf(btn){return btn.closest('.pair-character')||btn.closest('.social-share-card')}
function build(card){return card.matches('.social-share-card')?(card.querySelectorAll('.social-dog').length>2?renderGroup(card):renderSocial(card)):render(card)}
function prep(card){if(!ready.has(card))ready.set(card,build(card).then(blob=>{if(!blob)throw Error('blob 없음');let file=null;try{file=new File([blob],card.querySelectorAll('.social-dog').length>2?'운명탐정-우리모임.png':'운명탐정-우리둘.png',{type:'image/png'})}catch(_){}return {blob,file}}).catch(e=>{ready.delete(card);card.dataset.psErr=String(e&&e.message||e).slice(0,80);try{console.error('share image',e)}catch(_){}return null}));return ready.get(card)}
/* 무료 화면에 이미지 자체를 효과와 함께 보여 준다(우정·모임 카드). 기존 칸 그림(.social-cast)은 숨긴다 */
function inline(box,r){if(!r||box.querySelector('.ps-inline'))return;const img=new Image();img.className='ps-inline';img.alt='우리 캐릭터 조합 이미지';img.src=URL.createObjectURL(r.blob);(box.querySelector('.social-cast')||box.firstElementChild).before(img);box.classList.add('ps-has-img')}
function showImage(blob){const url=URL.createObjectURL(blob),d=document.createElement('dialog');d.className='ps-view';d.innerHTML='<p>이미지를 길게 눌러 저장하거나 공유해 주세요.</p><img alt="공유 이미지"><div><a download="운명탐정.png">사진 저장하기</a><button type="button">닫기</button></div>';d.querySelector('img').src=url;d.querySelector('a').href=url;document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.addEventListener('close',()=>{URL.revokeObjectURL(url);d.remove()});d.showModal()}
function share(btn){const card=cardOf(btn);if(!card||btn.disabled)return;const p=ready.get(card);let res=null;
 p&&p.then(r=>{res=r});
 /* 이미 만들어졌으면 같은 탭 안에서 바로 공유 */
 const go=r=>{if(r.file&&navigator.canShare&&navigator.canShare({files:[r.file]})){navigator.share({files:[r.file]}).then(()=>{try{window.oracleShared&&oracleShared('pair')}catch(_){}}).catch(e=>{if(!e||e.name!=='AbortError')showImage(r.blob)})}else showImage(r.blob)};
 if(btn.dataset.ready==='1'&&btn._r){go(btn._r);return}
 const old=btn.dataset.label||btn.textContent;btn.dataset.label=old;btn.disabled=true;btn.textContent='이미지 만드는 중…';
 prep(card).then(r=>{btn.disabled=false;if(!r){btn.textContent=old;alert('이미지를 만들지 못했어요. 다시 시도해 주세요.'+(card.dataset.psErr?' ('+card.dataset.psErr+')':''));return}btn._r=r;btn.dataset.ready='1';btn.textContent='이미지 준비 완료 · 눌러서 공유하기'})}
function add(root){for(const box of root.querySelectorAll?root.querySelectorAll('.social-share-card'):[]){if(box.querySelector('.pair-share')||box.querySelectorAll('.social-dog').length<2)continue;const b=document.createElement('button');b.type='button';b.className='pair-share fd-cta fd-cta-sub';b.textContent='이미지로 저장·공유하기';box.querySelector('.social-share-button')?.before(b);setTimeout(()=>prep(box).then(r=>{if(r){b._r=r;b.dataset.ready='1';inline(box,r)}}),300)}
 for(const card of root.querySelectorAll?root.querySelectorAll('.pair-character'):[]){if(card.querySelector('.pair-share'))continue;const b=document.createElement('button');b.type='button';b.className='pair-share fd-cta fd-cta-sub';b.textContent='이미지로 저장·공유하기';(card.querySelector('.tc-wrap')||card.querySelector('.pair-description'))?.after(b);setTimeout(()=>prep(card).then(r=>{if(r){b._r=r;b.dataset.ready='1'}}),600)}}
document.addEventListener('click',e=>{const b=e.target.closest('.pair-share');if(b)share(b)});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches?.('.pair-character,.social-share-card'))add(n.parentNode);else add(n)}}).observe(document.body,{childList:true,subtree:true});
add(document);
})();
