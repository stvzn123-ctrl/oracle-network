/* One product catalogue drives scope, previews and report explanations. */
(()=>{
 const E=topicEsc;
 const catalog={
  comprehensive:{name:'종합 리포트',question:'나는 어떤 강점을 갖고, 앞으로 무엇에 주목하면 좋을까?',free:'핵심 성향과 강점, 전체 흐름',detail:'타고난 성향의 해석, 분야별 10년 흐름, 전환점과 실천 방법',limit:'전체 방향을 넓게 읽는 상품이에요. 개별 고민은 주제별 리포트에서 더 집중해서 살펴봐요.'},
  marry:{name:'연애·결혼 리포트',question:'현재 내 상황에서 사랑은 어떻게 발전할까?',free:'현재 관계 상태에 맞는 핵심 답과 나의 표현 방식',detail:'관계의 발전 시기, 관계 성향, 다음 단계와 실천 방법',limit:'내 차트를 중심으로 읽어요. 현재 상대와의 비교는 궁합에서 살펴봐요.'},
  money:{name:'재물 리포트',question:'돈을 벌고 관리할 때 나의 강점과 주의점은?',free:'재물 흐름의 핵심 답과 수입·관리 성향',detail:'수입·지출·사업 성향, 10년의 재물 흐름과 시기별 준비',limit:'특정 종목·수익률·매매 시점을 제시하는 상품은 아니에요.'},
  work:{name:'직업 리포트',question:'어떤 일이 맞고, 다음 경력은 어떻게 준비할까?',free:'맞는 일의 방향과 경력의 핵심 흐름',detail:'업무 성향, 취업·이직 준비, 경력 흐름과 실천 방법',limit:'직무 선택과 준비를 돕는 풀이예요. 합격이나 채용 결과를 정하지 않아요.'},
  study:{name:'학업·성취 리포트',question:'나에게 맞는 공부와 목표 준비 방법은?',free:'공부 방식과 준비 흐름의 핵심 답',detail:'학습 강점, 공부·시험 준비의 흐름, 습관과 실행 계획',limit:'실제 학습량과 시험 조건을 함께 살펴봐요.'},
  match:{name:'궁합 리포트',question:'우리 둘은 어디서 잘 맞고, 무엇을 조율하면 좋을까?',free:'두 사람의 궁합 점수와 핵심 특징',detail:'두 차트의 공통점·차이, 관계 성향과 대화·조율 방법',limit:'상대의 출생 정보가 필요해요. 상대의 현재 마음을 확인하는 기능은 아니에요.'},
  reunion:{name:'재회 리포트',question:'다시 연락하기 전에 무엇을 확인하고 바꿔야 할까?',free:'두 사람의 재회 흐름 점수와 핵심 특징',detail:'관계의 차이, 연락과 관계 회복의 흐름, 다시 만날 때 조율할 점',limit:'두 사람의 차트를 비교해요. 실제 연락과 재회는 상대의 의사를 존중해야 해요.'},
  friend:{name:'우정 리포트',question:'우리 우정의 강점과 편한 거리감은?',free:'두 사람의 비교 점수',detail:'우정의 핵심, 대화와 거리감, 작은 실천 약속',limit:'친구의 출생 정보로 비교하며 우정의 깊이나 지속 기간을 예측하지 않아요.'},
  group:{name:'모임 리포트',question:'우리 모임의 강점과 조율할 부분은?',free:'모임의 핵심 특징과 점수',detail:'구성원별 관계와 모임의 조합, 함께 지내기 위한 제안',limit:'입력한 구성원들의 차트를 함께 비교해요.'},
  ask:{name:'자유질문',question:'내가 처한 구체적인 상황은 어떻게 살펴보면 좋을까?',free:'출시 기념 첫 질문 1건 접수',detail:'작성한 고민을 검토하고 차트 결과를 바탕으로 개별 리포트를 이메일로 전달',limit:'즉시 채팅 답변이 아니에요. 접수 순서대로 검토하며 확정된 답변 기한은 아직 안내하지 않고 있어요.'}
 };
 const aliases={love:'marry',invest:'money',property:'money',business:'money',employment:'work',move:'work',exam:'study',cert:'study'};
 function scope(key){return catalog[aliases[key]||key]||catalog.comprehensive}
 function scopeHTML(key){const c=scope(key);return '<section class="product-scope"><h4>'+E(c.question)+'</h4><dl><dt>무료로 먼저 확인</dt><dd>'+E(c.free)+'</dd><dt>리포트에서 더 읽기</dt><dd>'+E(c.detail)+'</dd></dl><p>'+E(c.limit)+'</p></section>'}
 function compareHTML(){return '<details class="product-compare"><summary>종합·주제별·자유질문은 어떻게 다른가요?</summary><div class="product-table"><table><thead><tr><th>상품</th><th>답해 주는 질문과 범위</th><th>정상가</th></tr></thead><tbody>'+[['comprehensive',COMPREHENSIVE_REPORT_PRICE],['marry',TOPIC_REPORT_PRICE],['money',TOPIC_REPORT_PRICE],['work',TOPIC_REPORT_PRICE],['study',TOPIC_REPORT_PRICE],['match',TOPIC_REPORT_PRICE],['friend',TOPIC_REPORT_PRICE],['reunion',TOPIC_REPORT_PRICE],['group',TOPIC_REPORT_PRICE],['ask',FREE_QUESTION_PRICE]].map(([key,price])=>'<tr><th>'+catalog[key].name+'</th><td>'+catalog[key].question+'<br><small>'+catalog[key].detail+'</small></td><td>'+price.toLocaleString()+'원</td></tr>').join('')+'</tbody></table></div><p>종합과 주제별 리포트는 같은 차트를 사용해 일부 설명이 겹칠 수 있어요. 종합은 전체 방향, 주제별은 선택한 고민에 집중해요. 출시 기념 상품별 첫 1회는 무료예요.</p></details>'}
 /* 주제별 안내(scopeHTML)는 리포트 안내 문서로 옮겼고 결과 화면에는 붙이지 않는다. */
 // Short complete answers remain free; the offer names the added depth explicitly.
 function trimPreview(html,key){
  const template=document.createElement('template');template.innerHTML=html;
  for(const list of template.content.querySelectorAll('.topic-answers')){
   [...list.children].slice(2).forEach(node=>node.remove());
  }
  return template.innerHTML;
 }
 const originalTopic=topicHTML,originalMoney=moneyAllHTML;
 topicHTML=function(ch,key){const html=originalTopic(ch,key);return ['match','reunion','ask'].includes(key)?html:trimPreview(html,key)};
 moneyAllHTML=function(ch){return trimPreview(originalMoney(ch),'money')};
 const oldQuestion=freeQuestionHTML;
 freeQuestionHTML=function(){
  const t=document.createElement('template');t.innerHTML=oldQuestion();
  const form=t.content.querySelector('#free-question-form');
  form.insertAdjacentHTML('afterbegin','<p class="question-help" id="questionHelp">현재 상황 → 고민하는 선택 → 알고 싶은 점 순서로 적어주세요. 실명·연락처 등 타인의 개인정보는 질문에 넣지 않아도 돼요.</p>');
  const input=form.querySelector('textarea');input.placeholder='예: 연애 2년 차이고 결혼 이야기를 시작하려 해요. 서로 준비할 점과 관계의 흐름이 궁금해요.';input.setAttribute('aria-describedby','questionHelp');
  form.insertAdjacentHTML('beforeend','<p class="question-help">제출에 성공하면 접수 완료 메시지가 표시돼요. 답변은 입력한 이메일로 보내드려요. 이메일 주소를 한 번 더 확인해 주세요.</p>');
  return t.innerHTML;
 };
 const goalNames={natal:'전체 흐름',marry:'연애',money:'돈',work:'직업'};
 let pending=null;try{const stored=sessionStorage.getItem('oracle-entry-goal');if(Object.hasOwn(goalNames,stored))pending=stored}catch(_){}
 const entryForm=$('ask');
 function route(key){
  if(key==='natal')document.querySelector('[data-bottom="home"]').click();
  else {document.querySelector('[data-bottom="topics"]').click();setTab(key);}
  window.scrollTo({top:0,behavior:'instant'});
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-entry-goal]');if(!button)return;
  pending=button.dataset.entryGoal;try{sessionStorage.setItem('oracle-entry-goal',pending)}catch(_){}
  document.querySelectorAll('[data-entry-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('entryGoalStatus').textContent=goalNames[pending]+' 고민을 선택했어요. 정보를 입력하면 해당 결과부터 보여드려요.';
 });
 function takeGoal(){const target=pending;pending=null;try{sessionStorage.removeItem('oracle-entry-goal')}catch(_){}return target}
 $('landingStart').addEventListener('click',()=>{if(CH&&pending)route(takeGoal())});
 const originalRun=run;
 run=function(value,animate){originalRun(value,animate);if(pending)route(takeGoal())};
/* 2026-11-10: 상품 설명·비교표는 메인에서 빼고 '내 정보 > 안내와 약관 > 리포트 안내'(policy-products)에 모은다. */
 function productsGuideHTML(){
  const rows=[['comprehensive',COMPREHENSIVE_REPORT_PRICE],['marry',TOPIC_REPORT_PRICE],['money',TOPIC_REPORT_PRICE],['work',TOPIC_REPORT_PRICE],['study',TOPIC_REPORT_PRICE],['match',TOPIC_REPORT_PRICE],['friend',TOPIC_REPORT_PRICE],['reunion',TOPIC_REPORT_PRICE],['group',TOPIC_REPORT_PRICE],['ask',FREE_QUESTION_PRICE]];
  return '<p>운명탐정의 리포트는 모두 같은 출생 차트(사주·서양 점성술·베딕점성술·수비학·마야력)를 바탕으로 쓰여요. <b>종합</b>은 나 전체를 넓게, <b>주제별</b>은 고른 고민 하나를 깊게, <b>자유질문</b>은 내가 적은 상황을 사람이 검토해 이메일로 답해 드려요.</p>'
   +'<h3>한눈에 비교</h3><div class="product-table"><table><thead><tr><th>상품</th><th>답해 주는 질문</th><th>정상가</th></tr></thead><tbody>'+rows.map(([key,price])=>'<tr><th>'+E(catalog[key].name)+'</th><td>'+E(catalog[key].question)+'</td><td>'+price.toLocaleString()+'원</td></tr>').join('')+'</tbody></table></div>'
   +'<p>출시 기념으로 상품별 첫 1회는 무료예요. 같은 입력의 리포트는 다시 열어 볼 수 있어요.</p>'
   +rows.map(([key])=>{const c=catalog[key];return '<h3>'+E(c.name)+'</h3><dl class="product-dl"><dt>무료로 먼저 확인</dt><dd>'+E(c.free)+'</dd><dt>리포트에서 더 읽기</dt><dd>'+E(c.detail)+'</dd><dt>범위</dt><dd>'+E(c.limit)+'</dd></dl>'}).join('')
   +'<p>종합과 주제별 리포트는 같은 차트를 쓰기 때문에 일부 설명이 겹칠 수 있어요. 해석은 전통 규칙에 따른 상징 풀이이며, 미래를 보장하거나 예측하지 않아요.</p>';
 }
 const productsTpl=document.getElementById('policy-products');if(productsTpl)productsTpl.innerHTML=productsGuideHTML();
 /* 종합 리포트 안내: 실제 리포트 장 제목과 첫 문장을 보여 주고 바로 아래에 '종합 리포트 보기' 버튼이 오게 한다. */
 function renderReportCTA(){
  const list=document.getElementById('rcPreview');if(!list||typeof CH==='undefined'||!CH)return;
  let data;try{data=buildRichReport(CH,'comprehensive')}catch(_){return}
  const items=(data.sections||[]).filter(s=>!['limit','fun','relationship-context'].includes(s.kind)).map(s=>{
   const text=[s.lead,...(s.paragraphs||[])].filter(Boolean).map(x=>readingParts(x).main).filter(Boolean).join(' ').split(/(?<=[.!?])\s+/)[0]||'';
   const short=text.length>72?text.slice(0,70).replace(/[,\s]+$/,'')+'…':text;
   return '<li><b>'+E(s.question)+'</b><span>'+E(short)+'</span></li>'});
  if(items.length>=3)list.innerHTML=compactReportHTML(items.join(''));
 }
 const previousRenderAll=renderAll;renderAll=function(){previousRenderAll();renderReportCTA()};
 // Summary and body share the same section model, rather than separate generated claims.
 const previousRich=buildRichReport;
 buildRichReport=function(ch,key){
  const data=previousRich(ch,key);
  if(['love','marry'].includes(key)&&ch.inp.relationship==='single'){
   const person=partnerProfile(ch),meeting=partnerFirstMeeting(ch);
   for(const section of data.sections){
    /* 2026-11-10: 혼자일 때는 '인연을 만나는 계기' 장 앞에 첫 만남 시기·장소를 더하기만 하고, 인연의 모습 장은 원래의 풍부한 본문을 그대로 둔다. */
    if(section.kind==='meet'){section.lead=meeting;section.paragraphs=[meeting,...(section.paragraphs||[]).filter(p=>p!==meeting)];section.basis=[...(section.basis||[]),'출생 금성의 만남 장소 상징','인연 흐름의 연도·월']}
    if(section.kind==='partner'&&!(section.paragraphs||[]).length){section.lead=person.vibe+' 사람과의 관계를 살펴봐요.';section.paragraphs=[person.vibe+' 사람과 잘 맞는 흐름이에요.','사랑의 표현 방식은 '+person.style+' 모습으로 읽어요.']}
   }
  }
  /* 핵심 요약은 buildRichReport가 만든 2~3문장짜리를 그대로 쓴다(한 줄 lead만 모으던 덮어쓰기 제거, 2026-11-10). */
  for(const section of data.sections)section.answer=(section.paragraphs||[]).join('\n\n');
  data.body=data.sections.map(s=>s.question+'\n'+s.lead+'\n'+s.answer).join('\n\n');
  return data;
 };
})();

/* Add one concrete caution to self-chart previews; retain pair-comparison flows. */
(()=>{
 const original=topicHTML;
 topicHTML=function(ch,key){const html=original(ch,key);if(['match','friend','group','reunion','ask'].includes(key))return html;
 const area=['love','marry'].includes(key)?'relationship':['money','invest','property','business'].includes(key)?'money':['study','exam','cert'].includes(key)?'study':'work';
 return html.replace('<section class="topic-offer"','<aside class="topic-candid"><h4>함께 살펴볼 점</h4><p>'+topicEsc(constructiveCaution(ch,area))+'</p></aside><section class="topic-offer"');};
})();
