/* 2026-11-13: 직업·학업 주제 화면 맨 위 무료 상자 "언제 잘 될까?".
   그래프는 10년 흐름 탭(renderBig)과 같은 모양(.bc-cell 선 그래프). 직업은 앞으로 10년, 학업은 앞으로 3년만 본다.
   계산은 기존 값만 읽는다: R[i][2](직업·학업 1~10년 뒤 점수, 표시는 D()), dayFortune(ch,date).sc[2]. */
(()=>{"use strict";
const orig=window.topicHTML;if(typeof orig!=='function')return;
function months(ch){const now=new Date(),out=[];for(let i=0;i<12;i++){const d0=new Date(now.getFullYear(),now.getMonth()+i,1);let t=0,n=0;for(let dd=1;dd<=28;dd+=3){t+=dayFortune(ch,new Date(d0.getFullYear(),d0.getMonth(),dd,12)).sc[2];n++}out.push({y:d0.getFullYear(),m:d0.getMonth()+1,v:t/n})}return out}
function chart(S,name){const W=220,H=150,L=26,Rr=8,T=12,B=22,n=S.length,x=k=>L+(W-L-Rr)*k/Math.max(1,n-1),y=v=>T+(100-Math.max(60,Math.min(100,v)))/40*(H-T-B);
 let g='',bi=0;S.forEach((s,k)=>{if(s.v>S[bi].v)bi=k});
 [60,80,100].forEach(v=>{g+=`<line x1="${L}" x2="${W-Rr}" y1="${y(v)}" y2="${y(v)}" class="bc-grid"/><text x="${L-5}" y="${y(v)+4}" text-anchor="end" class="bc-t">${v===100?'높음':v===80?'보통':'낮음'}</text>`});
 const ticks=n>4?[0,3,6,9]:S.map((_,k)=>k);ticks.forEach(k=>{g+=`<text x="${x(k)}" y="${H-6}" text-anchor="${k===0?"start":k===n-1?"end":"middle"}" class="bc-t">${S[k].y}년</text>`});
 const p=S.map((s,k)=>[x(k),y(s.v)]),path=typeof smoothPath==='function'?smoothPath(p.map(q=>q.join(',')).join(' ')):'M'+p.map(q=>q.join(' ')).join('L');
 g+=`<path class="bc-line" d="${path}" stroke="var(--work)"/>`+p.map((q,k)=>`<circle class="bc-pt${k===bi?' top':''}" cx="${q[0]}" cy="${q[1]}" r="${k===bi?5:3}" fill="var(--work)"><title>${S[k].y}년 ${S[k].v}점</title></circle>`).join('');
 return `<figure class="bc-cell tt-chart"><figcaption><b style="color:var(--work)">${name}</b><span>가장 밝은 시기 · ${S[bi].y}년</span></figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${name} 흐름">${g}</svg></figure>`}
function timingHTML(ch,k){
 if(!R||!R.length)return '';const W=k==='work',y0=new Date().getFullYear(),age=y=>y-ch.Y+1;
 const S=R.map((r,i)=>({y:y0+1+i,v:D(r[2].mean)})).slice(0,W?10:3),srt=S.slice().sort((a,b)=>b.v-a.v||a.y-b.y),top=srt.slice(0,W?2:1).sort((a,b)=>a.y-b.y),low=srt.at(-1);
 let mm=[];try{mm=months(ch)}catch(_){}
 const hiM=mm.slice().sort((a,b)=>b.v-a.v).slice(0,3).sort((a,b)=>a.y-b.y||a.m-b.m),mLab=x=>(x.y!==y0?String(x.y).slice(2)+'년 ':'')+x.m+'월';
 const lowTxt=W?'일의 흐름이 10년 중 가장 느려지는 해예요. 무리한 이직·확장은 부담이 커질 수 있어요.':'공부한 만큼 결과가 바로 보이지 않을 수 있는 해예요. 조급해지기 쉬워요.';
 const fix=W?'이 해에는 자격증·포트폴리오처럼 다음 기회를 위한 준비에 힘을 모아 보세요. 밝은 해에 훨씬 크게 돌아와요.':'이 해에는 기초 개념과 오답 정리에 집중해 보세요. 다음 해에 성적으로 이어지기 쉬워요.';
 return `<section class="tt-box" aria-label="${W?'일이 잘 풀리는 시기':'공부 성과가 나는 시기'}">
<h4>언제 잘 될까?</h4>
<p class="tt-lead"><span>${W?'앞으로 10년, 일이 가장 잘 풀리는 해':'앞으로 3년, 공부한 만큼 성과가 나는 해'}</span><strong>${top.map(t=>`${t.y}년<small>(${age(t.y)}살)</small>`).join(' · ')}</strong></p>
${chart(S,W?'직업 · 앞으로 10년':'학업 · 앞으로 3년')}
<dl class="tt-facts">${hiM.length?`<div><dt>앞으로 12개월 중 밝은 달</dt><dd>${hiM.map(mLab).join(' · ')}</dd></div>`:''}<div><dt>주의할 해</dt><dd>${low.y}년</dd></div></dl>
<p class="tt-fix"><b>${low.y}년</b>은 ${lowTxt}<br><span>→ ${fix}</span></p>
<p class="tt-note">${W?'이직·도전·승진 준비는':'시험·자격증·진학 준비는'} 밝은 해와 달에 맞추면 흐름을 타기 좋아요.</p>
</section>`}
window.topicHTML=function(ch,k){let h=orig.apply(this,arguments);if((k==='work'||k==='study')&&typeof h==='string'){
 try{const box=timingHTML(ch,k);if(box){h=h.replace('</header>','</header>'+box);h=h.replace(/<article class="topic-answer"><h4>(일이 가장 잘 풀리는 해는\?|성과가 나는 해는\?)<\/h4>[\s\S]*?<\/article>/,'')}}catch(_){}}
 return h};
})();
