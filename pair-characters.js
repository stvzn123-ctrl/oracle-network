/* Pair scenes interpret existing natal compatibility signals; no score changes. */
(()=>{
'use strict';
const scenes={
 rhythm:{title:'같은 박자로 걷는 우리',copy:'익숙한 생활 방식과 함께하는 리듬에서 공통점을 찾기 쉬운 조합이에요.',icon:'<path d="M18 66h64M26 55l9-13 10 13m10-13 10 13 9-13"/><circle cx="35" cy="29" r="6"/><circle cx="65" cy="29" r="6"/>'},
 map:{title:'다른 재능, 하나의 방향',copy:'서로 다른 강점이 빈자리를 채워 주는 조합이에요. 잘하는 일을 나누고 고마움을 표현해 보세요.',icon:'<path d="M15 25l23-7 24 8 23-8v53l-23 8-24-8-23 7zm23-7v53m24-45v53"/><path d="M47 43l14-8-6 16-14 8z"/>'},
 umbrella:{title:'네 마음에 우산이 되어',copy:'감정을 나누고 마음을 돌보는 방식에서 조화를 읽었어요. 편안함을 당연하게 여기지 않는 게 좋아요.',icon:'<path d="M14 49a36 36 0 0172 0Q74 38 62 49Q50 38 38 49Q26 38 14 49zm36-36v57q0 15 12 11q7-2 7-10"/>'},
 speech:{title:'표현은 달라도 마음은 가까이',copy:'반응과 표현의 차이를 알아가는 조합이에요. 서로 원하는 말과 행동을 구체적으로 알려 주세요.',icon:'<path d="M12 20h48v34H33L21 65V54h-9zm53 21h22v32H73L62 83V63"/><path d="M24 35h25m-25 9h16m47 14H72"/>'},
 bridge:{title:'차이 사이에 다리를 놓는 우리',copy:'생활 기준이나 감정 반응에 조율할 부분이 보여요. 차이를 없애기보다 함께 지킬 작은 약속을 정해 보세요.',icon:'<path d="M10 73h80M15 67V37m70 30V37M15 42q35 39 70 0M28 56v17m15-10v10m14-10v10m15-17v17"/>'},
 stars:{title:'같은 별을 바라보는 우리',copy:'관심과 삶의 방향에서 공통점을 찾을 수 있는 조합이에요. 함께 이루고 싶은 작은 목표를 이야기해 보세요.',icon:'<path d="M50 12l10 23 25 3-19 17 5 25-21-13-22 13 5-25-19-17 26-3z"/><path d="M13 16v9m-4-5h9m65 58v10m-5-5h10"/>'},
 chairs:{title:'따로 충전하고 함께 웃는 우리',copy:'각자의 자율성과 자기만의 시간을 소중히 여기는 조합이에요. 편안한 연락과 만남의 간격을 함께 정해 보세요.',icon:'<path d="M13 24v35h24V24H13zm4 35v20m16-20v20m30-55v35h24V24H63zm4 35v20m16-20v20M45 49h10"/>'},
 pause:{title:'서로의 속도로, 천천히',copy:'여러 영역에서 속도를 맞출 여지가 보여요. 결론을 서두르기보다 대화하고 쉴 시간을 함께 마련해 보세요.',icon:'<path d="M15 64h70M22 64v15m56-15v15M26 52V27h18v25m12 0V27h18v25M13 15h74"/>'}
};
function selectScene(a,b,res){
 const evidence=[];for(const sys of res?.sys||[])for(const item of sys.items||[])evidence.push({label:item[0].replace(/\((상대→나|나→상대)\)/g,''),value:item[1],system:sys.n});
 const rules={rhythm:/일지 육합|같은 일지|같은 숫자|같은 색 무리/,map:/오행 보완|일간 상생|숫자 보완|태양 보완 원소|맞은편 기호/,umbrella:/달의 조화|달 별자리 조화|달 별자리 1·7|영혼 수 조화/,speech:/태양 원소 차이|달의 차이/,bridge:/일지 충|일간 기준 차이|띠 충/,stars:/같은 인생 수|인생 수 조화|태양 같은 원소|일지 삼합/};
 const candidates=Object.entries(rules).map(([key,re],order)=>{const basis=evidence.filter(e=>re.test(e.label));return {key,order,basis,score:basis.reduce((n,e)=>n+Math.abs(e.value),0)}});
 const negative=evidence.filter(e=>e.value<0);
 if(negative.length>=4)candidates.push({key:'pause',order:6,basis:negative,score:negative.reduce((n,e)=>n+Math.abs(e.value),0)*.65});
 const ac=OracleCharacters.select(reportTags(a)),bc=OracleCharacters.select(reportTags(b));
 if(ac.primary==='free'&&bc.primary==='free')candidates.push({key:'chairs',order:7,basis:[{system:'개인 성향',label:'두 사람 모두 자율·변화 성향',value:0}],score:18});
 candidates.sort((x,y)=>y.score-x.score||x.order-y.order);
 const winner=candidates[0];return winner?.score>0?winner:{key:'stars',basis:[],score:0};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function art(c){const p=OracleCharacters.penguins[c.id];if(p)return '<img class="pair-art" src="'+p.image+'" width="360" height="360" loading="lazy" decoding="async" alt="'+esc(c.name)+'">';const n=c.id-1;return '<div class="pair-art pair-dog" role="img" aria-label="'+esc(c.name)+'" style="background-position:'+(n%6*20)+'% '+(Math.floor(n/6)*20)+'%"></div>'}
function renderCard(a,b,scene,names=['나','상대']){const s=scenes[scene.key]||scenes.stars;return '<section class="pair-character" aria-label="우리 둘의 관계 캐릭터" data-pair-scene="'+scene.key+'"><p class="pair-eyebrow">우리 둘의 관계 캐릭터</p><h3>'+s.title+'</h3><div class="pair-stage"><figure>'+art(a)+'<figcaption><b>'+esc(names[0])+'</b><span>'+esc(a.name)+'</span></figcaption></figure><div class="pair-prop" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+s.icon+'</svg></div><figure>'+art(b)+'<figcaption><b>'+esc(names[1])+'</b><span>'+esc(b.name)+'</span></figcaption></figure></div><p class="pair-description">'+s.copy+'</p><details class="pair-basis"><summary>이 장면이 나온 이유</summary><p>'+ (scene.basis.length?scene.basis.map(x=>esc(x.system+' · '+x.label)).filter((x,i,l)=>l.indexOf(x)===i).join('<br>'):'뚜렷하게 우세한 관계 신호가 없어 함께 방향을 찾아가는 기본 장면을 보여드려요.')+'</p><p>두 사람의 개인 캐릭터는 그대로 사용해요. 장면은 기존 궁합 근거를 묶은 재미용 표현이며 관계의 성패를 뜻하지 않아요.</p></details></section>'}
function html(a,b,res){return renderCard(OracleCharacters.select(reportTags(a)),OracleCharacters.select(reportTags(b)),selectScene(a,b,res),[a.inp.name||'나',b.inp.name||'상대'])}
window.OraclePairCharacters={version:1,scenes,selectScene,renderCard,html};
if(typeof cmpShowOne==='function'){
 const original=cmpShowOne;
 cmpShowOne=function(...args){original.apply(this,args);if(!COMPAT||COMPAT.mode!=='match'||COMPAT.kind==='friend'||CMPKIND==='group'||!CH)return;const out=document.querySelector('#cmpOne .cmp-out')||document.querySelector('#cmpOne .cmp-result');if(!out)return;out.querySelector('.pair-character')?.remove();out.insertAdjacentHTML('afterbegin',html(CH,COMPAT.b,COMPAT.res));};
}
})();
