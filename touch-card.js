/* 2026-11-13: 연인 궁합의 관계 캐릭터 카드(.pair-character) 안, 장면 문구 아래에 '우리 관계를 위한 조언' 3줄.
   - 낭만 2개: 여자(남녀가 아니면 나)의 금성 원소가 고르는 세트(ROM) 중, 남자(상대)의 금성 원소에 맞는 표현 2개.
   - 오래가는 1개: 여자(나)의 일지 오행(LAST).
   근거는 카드 접기 '왜 이런 결과가 나왔을까?' 안에, 끝에 '더 자세히 보기 →'(같은 결과의 [data-cmp-open]).
   이미지 공유는 pair-share.js가 이 목록까지 그린다. 출생 정보는 넣지 않는다. */
(()=>{"use strict";
const ROM=[
 [["뜬금없는 날, 꽃 한 송이를 건네 보세요.","아무 날도 아닌 날의 꽃 한 송이가 더 오래 기억될 수도 있어요!"],["\"지금 바다 보러 갈래?\"","가끔은 계획 없는 드라이브가 최고의 데이트가 될 수 있어요!"],["친구들 앞에서 슬쩍 자랑해 주세요.","생각보다 그 한마디를 오래 기억할지도 몰라요!"]],
 [["지나가듯 말한 \"이거 맛있겠다\"를 기억해 두세요.","다음 데이트에 데려가면 그날의 주인공이 될 수 있어요!"],["가방에 짧은 쪽지 하나 몰래 넣어 보세요.","몇 년이 지나도 꺼내 보는 보물이 될 수도 있어요!"],["집에서 같이 요리하는 저녁 어때요?","화려한 레스토랑보다 더 설레는 날이 될 수 있어요!"]],
 [["둘만 아는 별명 하나 만들어 보세요.","부를 때마다 괜히 웃음이 날 수도 있어요!"],["처음 가 보는 동네나 전시를 같이 골라 보세요.","새로운 곳에서 서로의 새로운 모습을 발견할 수 있어요!"],["자기 전에 \"오늘 제일 웃겼던 일\"을 물어봐 주세요.","짧은 대화가 하루의 마무리가 될 수 있어요!"]],
 [["처음 만난 곳에 다시 가 보세요.","그날의 설렘이 다시 찾아올지도 몰라요!"],["비 오는 날, 같이 듣고 싶은 노래 한 곡을 보내 보세요.","말보다 더 많은 게 전해질 수 있어요!"],["\"요즘 마음은 어때?\" 가끔 먼저 물어봐 주세요.","그 한마디에 마음이 스르르 열릴 수 있어요!"]]];
/* 각 세트의 3개는 [깜짝·행동형, 활동·함께형, 말·표현형] 순서. 상대 금성 원소(불·흙·바람·물)가 잘하는 표현부터 고른다. */
const FIT=[[0,1,2],[1,0,2],[1,2,0],[2,0,1]];
const LAST=[["\"넌 잘할 거야\" 한마디 해 주세요.","생각보다 큰 힘이 될 수 있어요!"],["바쁜 날에도 \"밥 먹었어?\" 한 줄이면 충분해요.","그 한 줄이 하루를 바꿀 수 있어요!"],["가끔은 \"우리 나중에 어디서 살까?\" 같은 이야기도 나눠 보세요.","함께 그리는 미래가 든든함이 될 수 있어요!"],["약속 시간 5분 전 도착!","작은 약속을 지키는 모습이 제일 멋져 보일 수 있어요!"],["연락이 잠깐 뜸해도 재촉하지 않기!","그 여유가 오히려 더 가까워지는 비결이 될 수 있어요!"]];
const ELN5=['목(木)','화(火)','토(土)','금(金)','수(水)'],VEL=['불','흙','바람','물'];
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ven=ch=>sign(birthExtraLon('Venus',ch.jd));
function pick(her,him){const hv=ven(her)%4,mv=him&&him.jd?ven(him)%4:hv,set=ROM[hv],o=FIT[mv];return [set[o[0]],set[o[1]],LAST[SE[BMAIN[her.brs.d]]]]}
function attach(card){try{
 if(!card.closest('#tab-match')||!COMPAT||COMPAT.kind==='friend'||!CH||card.querySelector('.tc-list'))return;
 const wrapEl=card.parentNode;if(/재회/.test(wrapEl.textContent))return;
 const other=COMPAT.b,names=card.querySelectorAll('.pair-stage figcaption b'),meN=(names[0]?.textContent||'나').trim(),otN=(names[1]?.textContent||'상대').trim();
 const swap=CH.inp&&CH.inp.sex==='m'&&other&&other.inp&&other.inp.sex==='f',her=swap?other:CH,him=swap?CH:other,herN=swap?otN:meN,himN=swap?meN:otN;
 const list=pick(her,him);
 card.querySelector('.pair-description')?.insertAdjacentHTML('afterend','<div class="tc-wrap"><p class="tc-head">우리 관계를 위한 조언</p><ol class="tc-list">'+list.map(x=>'<li><b>'+E(x[0])+'</b><small>'+E(x[1])+'</small></li>').join('')+'</ol></div>');
 const det=card.querySelector('.pair-basis');if(det){const sum=det.querySelector('summary');if(sum)sum.textContent='왜 이런 결과가 나왔을까?';
  const hv=ven(her),mv=him&&him.jd?ven(him):null;
  det.insertAdjacentHTML('beforeend','<p class="tc-why"><b>우리 관계를 위한 조언</b><br>'+E(herN)+'님 금성 '+SIGNWORD[hv]+'자리('+VEL[hv%4]+') · 사랑을 느끼는 방식'+(mv!=null?'<br>'+E(himN)+'님 금성 '+SIGNWORD[mv]+'자리('+VEL[mv%4]+') · 잘 맞는 표현 방식':'')+'<br>'+E(herN)+'님 사주 배우자 자리 '+ELN5[SE[BMAIN[her.brs.d]]]+' · 오래 함께하고 싶은 모습</p><button type="button" class="fd-cta fd-cta-sub tc-more">더 자세히 보기 →</button>')}
 }catch(_){}}
document.addEventListener('click',e=>{const b=e.target.closest('.tc-more');if(!b)return;b.closest('.cmp-out,.cmp-result,.cmp-wrap')?.querySelector('[data-cmp-open]')?.click()});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)(n.matches?.('.pair-character')?[n]:n.querySelectorAll?.('.pair-character')||[]).forEach(attach)}).observe(document.body,{childList:true,subtree:true});
})();
