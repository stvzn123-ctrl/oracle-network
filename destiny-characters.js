/* Personality characters v1: natal traits only; no date, random, or storage. */
(()=>{
"use strict";
const names=["단서 탐정","별빛 관측자","지혜의 기록자","직감의 예언자","길찾는 전략가","진실의 해독가","고요한 사색가","호기심 수집가","균형의 판단자","용감한 모험가","길을 여는 개척자","끈기의 등반가","꿈의 항해사","빛나는 선도자","묵묵한 장인","기회의 사냥꾼","변화의 여행자","든든한 수호자","다정한 치유자","마음의 통역사","인연의 연결자","평화의 중재자","따뜻한 안내자","믿음의 동반자","웃음의 전령사","꿈의 응원가","포근한 돌봄이","영감의 예술가","이야기 마법사","리듬의 연주자","반짝이는 발명가","풍요의 정원사","행운의 발견자","꿈짓는 건축가","시간의 조율사","새벽의 몽상가"];
const groups={
 insight:[[1,"achieve"],[2,"free"],[6,"create"],[7,"steady"]],
 achieve:[[5,"pioneer"],[9,"bond"],[15,"steady"],[34,"create"]],
 pioneer:[[10,"free"],[11,"lead"],[12,"steady"],[16,"achieve"]],
 bond:[[20,"insight"],[21,"free"],[22,"help"],[24,"steady"]],
 free:[[8,"insight"],[13,"pioneer"],[17,"bond"],[36,"create"]],
 create:[[28,"bond"],[29,"insight"],[30,"help"],[31,"achieve"]],
 steady:[[3,"insight"],[18,"help"],[32,"create"],[35,"achieve"]],
 lead:[[14,"pioneer"],[25,"bond"],[26,"help"],[33,"free"]],
 help:[[4,"insight"],[19,"steady"],[23,"lead"],[27,"bond"]]
};

const penguins={"37": {"name": "마감 직전 각성형", "description": "시작은 느긋해도 목표가 선명해지면 집중해서 끝내는 모습이에요.", "image": "img/penguins-v1/personal-01.webp"}, "38": {"name": "머릿속 리허설형", "description": "말과 행동을 꺼내기 전에 여러 장면을 마음속에서 그려 보는 모습이에요.", "image": "img/penguins-v1/personal-02.webp"}, "39": {"name": "루틴 고수형", "description": "자기만의 순서와 익숙한 리듬을 지킬 때 편안해지는 모습이에요.", "image": "img/penguins-v1/personal-03.webp"}, "40": {"name": "취향에 진심인 형", "description": "남들이 고른 답보다 직접 고른 취향에 시간과 정성을 쓰는 모습이에요.", "image": "img/penguins-v1/personal-04.webp"}, "41": {"name": "물건에 정드는 형", "description": "익숙한 물건에 추억과 의미를 담아 오래 간직하는 모습이에요.", "image": "img/penguins-v1/personal-05.webp"}, "42": {"name": "칭찬 오래 기억형", "description": "따뜻한 말 한마디를 기억해 두고 다시 힘을 얻는 모습이에요.", "image": "img/penguins-v1/personal-06.webp"}, "43": {"name": "시작 전 장비형", "description": "준비물과 방법을 갖추면서 시작할 자신감을 쌓는 모습이에요.", "image": "img/penguins-v1/personal-07.webp"}, "44": {"name": "작은 성공 수집형", "description": "큰 목표를 작은 성취로 나누고 하나씩 채워 가는 모습이에요.", "image": "img/penguins-v1/personal-08.webp"}, "45": {"name": "은근한 승부욕형", "description": "겉으로는 태연해도 자기 기준을 넘기 위해 조용히 몰입하는 모습이에요.", "image": "img/penguins-v1/personal-09.webp"}};
groups.pioneer.push([37,"create"]);names.push(penguins[37].name);
groups.insight.push([38,"lead"]);names.push(penguins[38].name);
groups.steady.push([39,"free"]);names.push(penguins[39].name);
groups.free.push([40,"achieve"]);names.push(penguins[40].name);
groups.bond.push([41,"achieve"]);names.push(penguins[41].name);
groups.bond.push([42,"create"]);names.push(penguins[42].name);
groups.achieve.push([43,"insight"]);names.push(penguins[43].name);
groups.achieve.push([44,"help"]);names.push(penguins[44].name);
groups.lead.push([45,"achieve"]);names.push(penguins[45].name);
function select(tags){
 if(!tags.length)return {id:1,name:names[0],primary:"insight",secondary:"insight"};
 // Use the existing five-system consensus order, including its stable tie rule.
 const primary=tags[0].k,choices=groups[primary]||groups.insight;
 const strength=Object.fromEntries(tags.map(t=>[t.k,t.n*100+t.ev.length]));
 const ranked=choices.map(([id,secondary],order)=>({id,secondary,order,score:strength[secondary]||0})).sort((a,b)=>b.score-a.score||a.order-b.order);
 const winner=ranked[0];
 return {...winner,name:names[winner.id-1],primary};
}
function html(ch){
 const tags=reportTags(ch),c=document.body.classList.contains("demo")?{id:21,name:names[20],primary:"bond",secondary:"free"}:select(tags),primary=RTAG[c.primary],secondary=RTAG[c.secondary];
 const index=c.id-1,x=(index%6)*20,y=Math.floor(index/6)*20;
 const penguin=penguins[c.id];
 const art=penguin?'<div class="character-art character-penguin-art"><img src="'+penguin.image+'" width="360" height="360" loading="lazy" decoding="async" alt="'+c.name+' 펭귄 캐릭터"></div>':'<div class="character-art" data-loading role="img" aria-label="'+c.name+'" style="background-position:'+x+'% '+y+'%"></div>';
 const description=penguin?penguin.description:primary.s+'을 가진 당신.<br>'+secondary.t+'.';
 const evidence=tags.find(t=>t.k===c.primary);
 return '<section class="destiny-character" aria-label="나의 운명 캐릭터" data-character-id="'+c.id+'"><p class="character-eyebrow">나의 운명 캐릭터</p>'+art+'<h2>'+c.name+'</h2><p class="character-description">'+description+'</p><div class="character-tags"><span>'+primary.kw+'</span><span>'+secondary.kw+'</span></div><details class="character-basis"><summary>이 캐릭터가 나온 이유</summary>'+fateTraitsHTML(ch)+'<p>'+primary.t+'. '+(evidence?evidence.sys.join(" · ")+"에서 이 성향을 함께 읽었어요.":"")+'</p><p>타고난 성향으로 정해져서, 날짜가 바뀌어도 그대로예요.</p></details></section>';
}
window.OracleCharacters={version:2,select,names,groups,penguins};
/* 2026-11-12: 캐릭터 그림을 받는 동안 칸을 비워 두고 메모하는 강아지를 보여 준 뒤 캐릭터로 바꾼다(우정 캐릭터 확인과 같은 방식). */
let spriteReady=null;
function loadSprite(){return spriteReady||(spriteReady=new Promise(r=>{const i=new Image();i.onload=i.onerror=()=>r();i.src="img/characters-v1.webp";}));}
function reveal(){const els=[...document.querySelectorAll(".character-art[data-loading]")];if(!els.length)return;Promise.all([loadSprite()]).then(()=>els.forEach(e=>e.removeAttribute("data-loading")));}
const original=resultIntroHTML;
resultIntroHTML=function(ch){
 const quadrant=fateTraitsHTML(ch);
 const content=original(ch).split(quadrant).join("");
 const card=html(ch);
 const lead=/(<p class="res-lead">[\s\S]*?<\/p>)/;
 setTimeout(reveal,0);
 return lead.test(content)?content.replace(lead,match=>match+card):content+card;
};
if(typeof CH!=="undefined"&&CH&&CH.inp&&document.getElementById("resIntro"))document.getElementById("resIntro").innerHTML=resultIntroHTML(CH);
})();

