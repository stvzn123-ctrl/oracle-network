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
 const tags=reportTags(ch),c=select(tags),primary=RTAG[c.primary],secondary=RTAG[c.secondary];
 const index=c.id-1,x=(index%6)*20,y=Math.floor(index/6)*20;
 const evidence=tags.find(t=>t.k===c.primary);
 return '<section class="destiny-character" aria-label="나의 운명 캐릭터" data-character-id="'+c.id+'"><p class="character-eyebrow">나의 운명 캐릭터 · '+String(c.id).padStart(2,"0")+' / 36</p><div class="character-art" role="img" aria-label="'+c.name+'" style="background-position:'+x+'% '+y+'%"></div><h2>'+c.name+'</h2><p class="character-description">'+primary.s+'을 가진 당신.<br>'+secondary.t+'.</p><div class="character-tags"><span>'+primary.kw+'</span><span>'+secondary.kw+'</span></div><details class="character-basis"><summary>이 캐릭터가 나온 이유</summary><p>'+primary.t+'. '+(evidence?evidence.sys.join(" · ")+"에서 이 성향을 함께 읽었어요.":"")+'</p><p>타고난 성향을 조합한 재미용 캐릭터예요. 오늘 운세나 접속 날짜에 따라 바뀌지 않아요.</p></details></section>';
}
window.OracleCharacters={version:1,select,names,groups};
const original=resultIntroHTML;
resultIntroHTML=function(ch){return html(ch)+original(ch)};
if(typeof CH!=="undefined"&&CH&&CH.inp&&document.getElementById("resIntro"))document.getElementById("resIntro").innerHTML=resultIntroHTML(CH);
})();
