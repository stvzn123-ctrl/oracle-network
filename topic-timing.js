/* 2026-11-13: 직업·학업 주제 화면 맨 위에 무료 '언제 잘 될까?' 상자(10년 막대 + 가장 좋은 해 + 다가오는 12개월 중 밝은 달).
   계산은 기존 값만 읽는다: R[i][2](직업·학업 1~10년 뒤 점수, 표시는 D()), dayFortune(ch,date).sc[2](그날의 직업·학업 점수). */
(()=>{"use strict";
const orig=window.topicHTML;if(typeof orig!=='function')return;
function months(ch){const now=new Date(),out=[];for(let i=0;i<12;i++){const y=now.getFullYear(),m=now.getMonth()+i,d0=new Date(y,m,1);let t=0,n=0;for(let dd=1;dd<=28;dd+=3){t+=dayFortune(ch,new Date(d0.getFullYear(),d0.getMonth(),dd,12)).sc[2];n++}out.push({y:d0.getFullYear(),m:d0.getMonth()+1,v:t/n})}return out}
function timingHTML(ch,k){
 if(!R||!R.length)return '';const W=k==='work',y0=new Date().getFullYear(),age=y=>y-ch.Y+1;
 const S=R.map((r,i)=>({y:y0+1+i,v:D(r[2].mean)})),srt=S.slice().sort((a,b)=>b.v-a.v||a.y-b.y),top=srt.slice(0,2).sort((a,b)=>a.y-b.y),low=srt.at(-1);
 let mm=[];try{mm=months(ch)}catch(_){}
 const hiM=mm.slice().sort((a,b)=>b.v-a.v).slice(0,3).sort((a,b)=>a.y-b.y||a.m-b.m);
 const mLab=x=>(x.y!==y0?String(x.y).slice(2)+'년 ':'')+x.m+'월';
 const isTop=y=>top.some(t=>t.y===y);
 const bars=S.map(s=>`<li class="tt-bar${isTop(s.y)?' on':''}${s.y===low.y?' low':''}"><i style="height:${Math.max(8,(s.v-55)/45*100)}%"></i><b>${s.v}</b><span>'${String(s.y).slice(2)}</span></li>`).join('');
 return `<section class="tt-box" aria-label="${W?'일이 잘 풀리는 시기':'공부 성과가 나는 시기'}">
<h4>언제 잘 될까?</h4>
<p class="tt-lead"><span>${W?'일이 가장 잘 풀리는 해':'공부한 만큼 성과가 나는 해'}</span><strong>${top.map(t=>`${t.y}년<small>(${age(t.y)}살)</small>`).join(' · ')}</strong></p>
<ol class="tt-bars" aria-label="앞으로 10년 ${W?'직업':'학업'} 흐름">${bars}</ol>
<dl class="tt-facts">${hiM.length?`<div><dt>앞으로 12개월 중 밝은 달</dt><dd>${hiM.map(mLab).join(' · ')}</dd></div>`:''}<div><dt>주의할 해</dt><dd>${low.y}년</dd></div></dl>
<p class="tt-fix"><b>${low.y}년</b>은 ${W?'일의 흐름이 10년 중 가장 느려지는 해예요. 무리한 이직·확장은 부담이 커질 수 있어요.':'공부한 만큼 결과가 바로 보이지 않을 수 있는 해예요. 조급해지기 쉬워요.'}<br><span>→ ${W?'이 해에는 자격증·포트폴리오처럼 다음 기회를 위한 준비에 힘을 모아 보세요. 밝은 해에 훨씬 크게 돌아와요.':'이 해에는 기초 개념과 오답 정리에 집중해 보세요. 다음 밝은 해에 성적으로 이어지기 쉬워요.'}</span></p>
<p class="tt-note">${W?'이직·도전·승진 준비는':'시험·자격증·진학 준비는'} 밝은 해와 달에 맞추면 흐름을 타기 좋아요.</p>
</section>`}
window.topicHTML=function(ch,k){let h=orig.apply(this,arguments);if((k==='work'||k==='study')&&typeof h==='string'){
 try{const box=timingHTML(ch,k);if(box){h=h.replace('</header>','</header>'+box);h=h.replace(/<article class="topic-answer"><h4>(일이 가장 잘 풀리는 해는\?|성과가 나는 해는\?)<\/h4>[\s\S]*?<\/article>/,'')}}catch(_){}}
 return h};
})();
