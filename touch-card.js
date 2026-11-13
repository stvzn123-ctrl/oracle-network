/* 2026-11-13: 연인 궁합 결과에 '우리가 오래가는 작은 습관' 카드(은근한 톤: ~하면 오래가요·덜 다퉈요·더 행복해요).
   내 차트(금성 별자리 원소=사랑받는 방식, 달 별자리 원소=위로받는 방식, 일지 오행=배우자 자리)로 습관 3개를 고르고
   상대에게 이미지·글로 보낸다. 출생 정보는 넣지 않는다. */
(()=>{"use strict";
const VEN=[[["먼저 연락해 주면","마음을 확인하느라 애태울 일이 없어요"],["보고 싶다는 말을 아끼지 않으면","설렘이 오래 가요"],["가끔 깜짝 데리러 가면","둘만의 추억이 차곡차곡 쌓여요"]],
 [["약속 시간을 지키면","믿음이 단단해져 다툴 일이 줄어요"],["먹고 싶다던 걸 기억해 두면","아낌받는 느낌이 오래 가요"],["작은 거라도 꾸준히 챙기면","서운함이 쌓이지 않아요"]],
 [["이야기에 끝까지 맞장구쳐 주면","대화가 끊기지 않아 오해가 줄어요"],["재밌는 걸 보면 바로 공유하면","하루를 함께 보내는 느낌이 들어요"],["새로운 곳에 같이 가 보면","관계가 지루해지지 않아요"]],
 [["힘든 날 말없이 안아 주면","말다툼보다 마음이 먼저 풀려요"],["자기 전에 잘 자라는 한마디를 건네면","그날의 서운함이 남지 않아요"],["기분을 먼저 알아채 주면","싸움이 되기 전에 풀려요"]]];
const MOON=[["기분이 가라앉은 날 바람 쐬러 나가면","분위기가 금방 다시 밝아져요"],["힘들 때 일단 편이 되어 주면","서로 더 기대게 돼요"],["고민을 끝까지 듣고 같이 정리하면","같은 일로 다투지 않게 돼요"],["해결책보다 \"많이 힘들었지\"를 먼저 말하면","속상함이 싸움으로 번지지 않아요"]];
const DAY=[["서로 하는 일을 진심으로 응원하면","함께 성장하는 사이가 돼요"],["사람들 앞에서 서로를 칭찬하면","둘 다 더 행복해져요"],["미래 이야기를 가끔 진지하게 나누면","같은 방향을 보며 오래 가요"],["한 말은 꼭 지키면","믿음이 깊어져 흔들리지 않아요"],["이유 없이 짧은 메시지를 보내면","떨어져 있어도 가까운 느낌이 들어요"]];
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function points(ch){const v=sign(birthExtraLon('Venus',ch.jd))%4,m=sign(ch.moon)%4,d=SE[BMAIN[ch.brs.d]],h=[...String(ch.inp&&ch.inp.date||ch.Y)].reduce((a,c)=>a+c.charCodeAt(0),0)%3;
 const out=[VEN[v][h],MOON[m],DAY[d]];return out.filter((x,i)=>out.findIndex(y=>y[0]===x[0])===i)}
function msg(list){return `우리 궁합 봤는데 😊 이렇게 하면 오래간대\n\n${list.map((x,i)=>`${i+1}. ${x[0]} — ${x[1]}`).join('\n')}\n\n우리 궁합도 같이 볼래? 👉 https://fatedog.co.kr`}
function html(me,to,list){return `<section class="touch-card" aria-label="우리가 오래가는 작은 습관"><p class="tc-eye">${E(me)} ♥ ${E(to)} 궁합에서 찾은</p><h3>우리가 오래가는 작은 습관</h3><p class="tc-sub">이렇게 하면 서로 더 행복하고, 다툴 일도 줄어요</p><ol>${list.map(x=>'<li><span><b>'+E(x[0])+'</b><small>'+E(x[1])+'</small></span></li>').join('')}</ol><p class="tc-basis">두 사람의 궁합과 금성·달 별자리, 사주의 배우자 자리를 바탕으로 골랐어요.</p><div class="tc-btns"><button type="button" class="fd-cta tc-img">카드로 공유하기</button><button type="button" class="fd-cta fd-cta-sub tc-txt">글로 보내기</button></div><p class="tc-msg" aria-live="polite"></p></section>`}
const load=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
function lines(g,t,max){const out=[];let line='';for(const w of t.split(/\s+/)){const s=line?line+' '+w:w;if(g.measureText(s).width>max&&line){out.push(line);line=w}else line=s}if(line)out.push(line);return out}
async function image(me,to,list){const F="'IBM Plex Sans KR',sans-serif",J="Jua,'IBM Plex Sans KR',sans-serif";
 try{await Promise.all([document.fonts.load('64px Jua','우리가 오래가는 작은 습관 운명탐정 123'),document.fonts.load('600 36px "IBM Plex Sans KR"',list.flat().join('')+me+to)])}catch(_){}
 const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#FFF4F1';g.fillRect(0,0,W,H);g.fillStyle='#FFFFFF';g.strokeStyle='#F4C6C0';g.lineWidth=3;g.beginPath();g.roundRect(60,60,W-120,H-200,48);g.fill();g.stroke();
 try{const m=await load('img/main-character.webp');g.drawImage(m,W/2-130,90,260,260)}catch(_){}
 g.textAlign='center';g.fillStyle='#B0607A';g.font='600 32px '+F;g.fillText(me+' ♥ '+to+' 궁합에서 찾은',W/2,400);
 g.fillStyle='#4A352B';g.font='68px '+J;g.fillText('우리가 오래가는 작은 습관',W/2,490);g.fillStyle='#7a6457';g.font='34px '+F;g.fillText('이렇게 하면 서로 더 행복하고, 다툴 일도 줄어요',W/2,550);
 let y=610;g.textBaseline='middle';list.forEach((x,i)=>{const h=170,cy=y+h/2;g.fillStyle='#FCE7E3';g.beginPath();g.roundRect(120,y,W-240,h,28);g.fill();
  g.textAlign='center';g.fillStyle='#D0587A';g.font='48px '+J;g.fillText(String(i+1),180,cy);g.textAlign='left';
  g.font='600 36px '+F;const a=lines(g,x[0],W-420);g.font='32px '+F;const b=lines(g,x[1],W-420);const all=[...a.map(t=>[t,'600 36px '+F,'#4A352B']),...b.map(t=>[t,'32px '+F,'#9a6a5c'])];
  all.forEach(([t,f,col],k)=>{g.font=f;g.fillStyle=col;g.fillText(t,230,cy+(k-(all.length-1)/2)*48)});y+=h+20});
 g.textBaseline='alphabetic';g.textAlign='center';g.fillStyle='#8A5A1E';g.font='40px '+J;g.fillText('운명탐정',W/2,H-80);g.fillStyle='#9a8576';g.font='28px '+F;g.fillText('fatedog.co.kr · 우리 궁합도 같이 볼래?',W/2,H-38);
 return new Promise(ok=>c.toBlob(ok,'image/png'))}
async function send(box,asImage){const me=box.dataset.me,to=box.dataset.to,list=JSON.parse(box.dataset.list),text=msg(list),out=box.querySelector('.tc-msg');
 try{if(asImage){const blob=await image(me,to,list),file=new File([blob],'우리가-오래가는-습관.png',{type:'image/png'});
   if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text});out.textContent='';return}
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
   try{await navigator.clipboard.writeText(text);out.textContent='카드 이미지를 저장했고, 함께 보낼 글도 복사했어요.'}catch(_){out.textContent='카드 이미지를 저장했어요. 메신저에서 사진으로 보내 주세요.'}return}
  if(navigator.share){await navigator.share({text});out.textContent='';return}
  await navigator.clipboard.writeText(text);out.textContent='보낼 글을 복사했어요. 메신저에 붙여 넣어 보내 주세요.'}
 catch(e){if(e&&e.name==='AbortError')return;out.textContent='보내지 못했어요. 다시 시도해 주세요.'}}
function attach(card){try{
 if(!card.closest('#tab-match')||!COMPAT||COMPAT.kind==='friend'||!CH)return;const wrapEl=card.parentNode;if(wrapEl.querySelector('.touch-card'))return;
 if(/재회/.test(wrapEl.textContent))return;
 const names=card.querySelectorAll('.pair-stage figcaption b'),me=(names[0]?.textContent||'나').trim(),to=(names[1]?.textContent||'너').trim(),list=points(CH);
 card.insertAdjacentHTML('afterend',html(me,to,list));const box=wrapEl.querySelector('.touch-card');Object.assign(box.dataset,{me,to,list:JSON.stringify(list)})}catch(_){}}
document.addEventListener('click',e=>{const b=e.target.closest('.tc-img,.tc-txt');if(!b)return;const box=b.closest('.touch-card');b.disabled=true;send(box,b.classList.contains('tc-img')).finally(()=>{b.disabled=false})});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)(n.matches?.('.pair-character')?[n]:n.querySelectorAll?.('.pair-character')||[]).forEach(attach)}).observe(document.body,{childList:true,subtree:true});
})();
