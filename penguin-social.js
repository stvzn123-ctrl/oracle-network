/* Extend the existing natal/relative-role classification with nine penguins. */
(()=>{
 'use strict';
 const labels=['충전기는 얘한테','기념일 몰래 준비함','덕질 시작하면 밤샘','비밀은 무덤까지','흑역사 봉인 중','단톡 공지 담당','선물에 의미 오백 개','안부 대신 짤 보냄','한 입이 거의 반'];
 const copy=['필요한 물건을 미리 챙겨 두고 조용히 빌려주는 편','기억해 둔 날을 작은 이벤트로 챙기는 편','좋아하는 이야기가 나오면 함께 깊이 파고드는 편','남의 이야기를 쉽게 옮기지 않고 신뢰를 지키는 편','친구의 민망한 순간을 웃음거리로 퍼뜨리지 않는 편','흩어진 일정과 안내를 한곳에 모아 주는 편','선물 하나에도 상대의 취향과 추억을 담는 편','가벼운 웃음과 짤로 먼저 안부를 건네는 편','맛있는 것을 보면 가까운 사람과 나누려는 편'];
 // Same six axes as the existing 36 types: initiative/expression/care/structure/listening/energy.
 const vectors=[[0,-1,1,1,0,0],[0,0,1,1,1,-1],[1,1,0,-1,0,1],[0,-1,1,1,1,-1],[0,-1,0,1,1,0],[1,0,0,1,-1,1],[0,1,1,1,1,0],[1,1,0,-1,0,1],[0,1,1,-1,0,0]];
 labels.forEach((label,i)=>{SOCIAL_DOGS.push(['p',i,label]);SOCIAL_PERSONALITIES.push(vectors[i]);SOCIAL_PERSONALITY_COPY.push(copy[i]);});
 const pools=[[12,13,21,23,28,38],[1,8,11,26,30,32,43],[2,5,10,14,17,20,24,33,34,36,37,42,44],[3,4,6,15,18,22,29,41],[0,7,9,16,19,25,27,31,35,39,40]];
 const roles=[['먼저 판을 벌이는 사람','아이디어와 다음 약속을 먼저 꺼내며 이 조합의 출발을 맡아요.'],['분위기를 띄우는 사람','반응과 표현으로 조용한 자리를 풀어 주는 역할이 상대적으로 잘 보여요.'],['모임을 챙기는 사람','사람들의 상태와 편의를 살피며 함께하는 시간을 안정적으로 이어 가요.'],['정리하고 결정하는 사람','흩어진 의견과 비용·일정을 정리하며 선택의 기준을 잡아 줘요.'],['듣고 중재하는 사람','다른 사람의 말을 살피고 놓친 사정을 짚으며 대화의 균형을 잡아요.']];
 socialContext=function(list){
  if(!list.length)return [];
  const values=list.map(c=>{const total=c.cnt.reduce((a,b)=>a+b,0)||1;return c.cnt.map(v=>v/total)});
  const mean=[0,1,2,3,4].map(k=>values.reduce((n,r)=>n+r[k],0)/list.length);
  // A canonical, sorted signature makes ties independent of member order and today's date.
  const signature=list.map(c=>JSON.stringify([c.inp.date,c.inp.notime?'unknown':c.inp.time||'',c.inp.sex,c.cnt,c.stems.d,Boolean(c.strong)])).sort().join('|');
  let hash=2166136261;for(const ch of signature)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  return list.map((c,i)=>{
   const weights=values[i].map((v,k)=>v-mean[k]+v*.2),field=weights.indexOf(Math.max(...weights)),pool=pools[field];
   const score=id=>SOCIAL_PERSONALITIES[id].slice(0,5).reduce((n,v,k)=>n+v*weights[k],0)+SOCIAL_PERSONALITIES[id][5]*(c.strong?.03:-.03);
   const maximum=Math.max(...pool.map(score)),tied=pool.filter(id=>Math.abs(score(id)-maximum)<1e-9),id=tied[(hash+mod(c.stems.d,10))%tied.length],dog=SOCIAL_DOGS[id];
   return {field,role:roles[field][0],strength:SOCIAL_PERSONALITY_COPY[id]+'이에요. '+roles[field][1],personality:id,cast:{name:groupName(c,i),sheet:dog[0],index:dog[1],label:dog[2]}};
  });
 };
 const original=socialCastHTML;
 socialCastHTML=function(cast){return '<div class="social-cast">'+cast.map(c=>{
  if(c.sheet!=='p')return original([c]).replace(/^<div class="social-cast">/,'').replace(/<\/div>$/,'');
  const index=Math.max(0,Math.min(8,c.index|0)),label=labels[index];
  return '<figure class="social-dog" data-character-kind="penguin"><figcaption class="social-dog-label">'+topicEsc(label)+'</figcaption><img class="social-penguin-image" src="img/penguins-v1/social-'+String(index+1).padStart(2,'0')+'.jpg" width="360" height="360" loading="lazy" decoding="async" alt="'+topicEsc(label)+' 펭귄 캐릭터"><strong class="social-dog-name">'+topicEsc(c.name)+'</strong></figure>';
 }).join('')+'</div>'};
 window.OracleSocialPenguins={version:1,labels,pools};
})();
