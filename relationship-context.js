/* Relationship context changes interpretation, never birth-chart scores. */
(() => {
  const OPTIONS = {married:'결혼', dating:'연애 중', crush:'썸·호감', single:'혼자에요', private:'고르고 싶지 않음'};
  const normalize = value => Object.hasOwn(OPTIONS,value) ? value : 'private';
  const storageKey = () => accountUser ? 'oracle-relationship-v1:'+accountUser.id : null;
  function savedRelationship(){try{return normalize(localStorage.getItem(storageKey()))}catch(_){return 'private'}}
  function context(ch){return normalize(ch?.inp?.relationship ?? (accountUser ? savedRelationship() : 'private'))}
  const originalRead=readForm, originalFill=fillForm, originalAPI=accountAPI;
  readForm=function(){return {...originalRead(),relationship:normalize($('in-relationship').value)}};
  fillForm=function(value){originalFill(value);$('in-relationship').value=normalize(value.relationship ?? (accountUser?savedRelationship():'private'))};
  accountAPI=async function(path,body){
    const key=storageKey();const result=await originalAPI(path,body);
    if(key&&path==='/profile')try{if(body?.profile)localStorage.setItem(key,normalize(body.profile.relationship));else localStorage.removeItem(key)}catch(_){}
    return result;
  };
  const COPY={
    married:{title:'함께하는 사랑과 결혼 생활',question:'함께하는 관계에서 중요한 것은?',answer:'서로의 생활 방식과 기대를 이해하고, 작은 약속을 꾸준히 지키는 데서 신뢰가 쌓여요.',action:'생활비·가사·휴식 중 한 가지를 골라 서로 원하는 분담을 이야기해 보세요.',next:'함께 세울 다음 계획',detail:'함께 세운 계획이 있다면 비용과 역할, 서로 양보할 수 있는 부분을 구체적으로 이야기해 보세요.'},
    dating:{title:'지금 사랑의 발전과 결실',question:'지금 사랑이 결실을 맺을 시기는?',answer:'다른 사람을 만날 시기 대신, 지금 만나는 사람과 관계를 깊게 하고 미래 계획을 이야기할 흐름을 살펴봐요.',action:'서로 생각하는 관계의 다음 단계를 묻고, 결혼·동거·장거리 등 실제 조건을 함께 확인해 보세요.',next:'우리 관계의 다음 단계',detail:'관계를 진전시키고 싶다면 두 사람의 의사와 준비를 먼저 확인해 보세요. 현재 상대와의 궁합은 상대의 출생 정보를 함께 넣었을 때 별도로 살펴볼 수 있어요.'},
    crush:{title:'설렘에서 관계로 이어지는 사랑',question:'호감이 관계로 발전할 흐름은?',answer:'새로운 상대를 예고하기보다, 지금의 호감을 확인하고 대화와 만남을 자연스럽게 넓힐 흐름을 살펴봐요.',action:'부담 없는 만남을 한 번 제안하고 상대가 편하게 응답할 여지를 주세요.',next:'서로의 마음을 확인하는 과정',detail:'상대의 반응과 경계를 존중하며 연락과 만남이 서로 이어지는지 살펴보세요. 내 차트만으로 상대의 마음이나 관계의 성사를 단정하지 않아요.'},
    single:{title:'새로운 만남과 사랑의 시작',question:'새로운 인연을 만날 흐름은?',answer:'새로운 사람을 알아가고 내게 맞는 관계를 시작할 흐름을 살펴봐요.',action:'내가 편안한 모임이나 활동 하나를 정하고 새로운 대화를 시작해 보세요.',next:'내게 맞는 만남 준비',detail:'만남의 기회와 함께 내가 원하는 관계의 기준을 정리해 보세요. 연애를 서두르기보다 대화와 실제 경험으로 잘 맞는지 확인하는 과정이 중요해요.'},
    private:{title:'사랑과 관계의 흐름',question:'사랑과 관계에서 주목할 시기는?',answer:'현재 관계 상태를 가정하지 않고, 애정을 표현하고 관계를 돌보는 흐름을 중심으로 읽어요.',action:'지금 나에게 중요한 관계에서 고마운 점과 바라는 점을 하나씩 정리해 보세요.',next:'나에게 맞는 관계의 방향',detail:'새로운 만남을 원하는지, 현재 관계를 깊게 하고 싶은지에 따라 같은 흐름을 다르게 활용할 수 있어요. 원하면 내 정보에서 관계 상태를 바꿀 수 있어요.'}
  };
  function flowTiming(ch){
    const c=COPY[context(ch)];
    if(context(ch)==='single')return partnerFirstMeeting(ch)+' '+c.answer;
    const years=(typeof RY!=='undefined'&&RY?RY:[]).map((r,i)=>({year:horizonDate(i+1).y,score:D(r[1].mean)}));
    const peak=years.sort((a,b)=>b.score-a.score)[0];
    return peak?peak.year+'년은 앞으로 10년의 애정 흐름에서 주목할 해예요. '+c.answer:c.answer;
  }
  function rows(ch){
    const c=COPY[context(ch)];
    return [[c.question,flowTiming(ch)],['사랑을 표현하는 나의 방식',LOVE_STYLE[sign(birthExtraLon('Venus',ch.jd))%4]+' 방식이 차트에 나타나요. 현재 상황에 맞게 표현의 속도와 방식을 조율해 보세요.'],[c.next,c.detail],['지금 해 볼 일',c.action]];
  }
  const originalOffer=topicReportHTML;
  topicReportHTML=function(key){
    if(!['love','marry'].includes(key)||!CH)return originalOffer(key);
    const c=COPY[context(CH)];
    return '<section class="topic-offer"><h4>'+c.title+' 리포트</h4><ul><li>'+c.question+'</li><li>나의 관계 성향과 표현 방식</li><li>'+c.next+'</li><li>지금 실천할 대화와 행동</li></ul><p class="relationship-report-note" role="note">운명은 같아도 현재 상태에 따라 해석이 달라질 수 있어요. 현재 상태를 입력해 주시면 내 상황을 더 정확하게 반영한 해석을 받아보실 수 있어요. 리포트를 보기 전, 내 정보에서 현재 상태를 확인해 주세요.</p><div class="topic-offer-action"><strong>'+LAUNCH_PRICE(TOPIC_REPORT_PRICE)+'</strong><button type="button" data-buy="'+key+'">나의 리포트 보기</button></div><p class="buy-msg" aria-live="polite"></p></section>';
  };
  const oldTopic=topicHTML;
  topicHTML=function(ch,key){
    if(!['love','marry'].includes(key))return oldTopic(ch,key);
    const c=COPY[context(ch)];
    return '<section class="blk blk-first topic"><header class="topic-intro"><span class="eyebrow">'+topicEsc(OPTIONS[context(ch)])+'</span><h3>'+c.title+'</h3></header>'+spousePreviewHTML(ch,key)+answerCards(rows(ch))+topicReportHTML(key)+'</section>';
  };
  const originalRich=buildRichReport;
  /* 2026-11-10: 관계 상태는 리포트를 통째로 바꾸지 않고, 기존의 풍부한 장(사랑할 때의 나·인연의 모습·시기·주의·제언)을 그대로 두고
     앞에 '현재 상황에 맞춰 읽는 사랑' 장을 더한다. 결혼·연애 중·썸이면 '새 인연을 만나는 계기' 장은 상황에 맞는 '다음 단계' 장으로 바꾼다. */
  buildRichReport=function(ch,key){
    const data=originalRich(ch,key),state=context(ch),c=COPY[state];
    if(!['love','marry','comprehensive'].includes(key))return data;
    const section={kind:'relationship-context',question:c.question,lead:c.answer,paragraphs:[c.detail],basis:[],action:c.action};
    if(key==='comprehensive'){
      if(state!=='private'){const p=data.sections.find(s=>s.kind==='partner');if(p)p.paragraphs=[c.answer+' '+c.detail,...(p.paragraphs||[])]}
      return data;
    }
    const taken=['married','dating','crush'].includes(state);
    const sections=data.sections.map(s=>{
      if(s.kind==='partner'&&state==='married')return {...s,question:'배우자를 이렇게 읽었어요',lead:'함께하는 배우자를 차트의 상징으로 다시 읽어 본 모습이에요. '+(s.lead||'')};
      if(s.kind==='partner'&&taken)return {...s,question:'지금 곁에 있는 사람, 차트로 다시 읽기',lead:'현재 관계 상태와 별개로, 차트가 그리는 잘 맞는 상대의 모습이에요. 지금 곁의 사람과 겹치는 점을 찾아보세요. '+(s.lead||'')};
      if(s.kind==='meet'&&taken)return {kind:'relationship-next',question:c.next,lead:'',paragraphs:[(s.paragraphs||[]).find(p=>/시기로 보면/.test(p))||'',c.detail],basis:s.basis||[],action:c.action};
      return s;
    });
    if(key!=='marry')sections.unshift(section);
    const sumOf=s=>{const seen=[];[s.lead,...(s.paragraphs||[])].filter(Boolean).join(' ').split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean).forEach(x=>{if(seen.length<3&&!seen.includes(x))seen.push(x)});return seen.join(' ')};
    const summary=[...(key==='marry'?[]:[sumOf(section)]),...sections.filter(s=>['core','partner','timing'].includes(s.kind)).slice(0,3).map(sumOf)];
    return {...data,title:(ch.inp.name||'당신')+'님의 '+(key==='marry'?'인연 운명':'연인 운명')+' 리포트',relationshipContext:true,summary,sections};
  };
  // Restored profiles from the current API may not yet include this optional field.
  if(accountUser?.profile)$('in-relationship').value=context(CH);
})();
