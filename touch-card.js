/* 2026-11-13: 연인 궁합의 관계 캐릭터 카드 안에 '우리가 오래가는 작은 습관'(결론 3줄)을 넣는다. 근거(금성·달 별자리, 사주 배우자 자리)는
   카드의 접기 '왜 이런 결과가 나왔을까?' 안에, 그 끝에 리포트로 이어지는 버튼. 이미지 공유는 pair-share.js가 이 목록까지 함께 그린다. */
(()=>{"use strict";
const VEN=[[["먼저 연락해 주면","마음을 확인하느라 애태울 일이 없어요"],["보고 싶다는 말을 아끼지 않으면","설렘이 오래 가요"],["가끔 깜짝 데리러 가면","둘만의 추억이 차곡차곡 쌓여요"]],
 [["약속 시간을 지키면","믿음이 단단해져 다툴 일이 줄어요"],["먹고 싶다던 걸 기억해 두면","아낌받는 느낌이 오래 가요"],["작은 거라도 꾸준히 챙기면","서운함이 쌓이지 않아요"]],
 [["이야기에 끝까지 맞장구쳐 주면","대화가 끊기지 않아 오해가 줄어요"],["재밌는 걸 보면 바로 공유하면","하루를 함께 보내는 느낌이 들어요"],["새로운 곳에 같이 가 보면","관계가 지루해지지 않아요"]],
 [["힘든 날 말없이 안아 주면","말다툼보다 마음이 먼저 풀려요"],["자기 전에 잘 자라는 한마디를 건네면","그날의 서운함이 남지 않아요"],["기분을 먼저 알아채 주면","싸움이 되기 전에 풀려요"]]];
const MOON=[["기분이 가라앉은 날 바람 쐬러 나가면","분위기가 금방 다시 밝아져요"],["힘들 때 일단 편이 되어 주면","서로 더 기대게 돼요"],["고민을 끝까지 듣고 같이 정리하면","같은 일로 다투지 않게 돼요"],["해결책보다 \"많이 힘들었지\"를 먼저 말하면","속상함이 싸움으로 번지지 않아요"]];
const DAY=[["서로 하는 일을 진심으로 응원하면","함께 성장하는 사이가 돼요"],["사람들 앞에서 서로를 칭찬하면","둘 다 더 행복해져요"],["미래 이야기를 가끔 진지하게 나누면","같은 방향을 보며 오래 가요"],["한 말은 꼭 지키면","믿음이 깊어져 흔들리지 않아요"],["이유 없이 짧은 메시지를 보내면","떨어져 있어도 가까운 느낌이 들어요"]];
const ELN5=['목(木)','화(火)','토(土)','금(金)','수(水)'];const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function points(ch){const v=sign(birthExtraLon('Venus',ch.jd))%4,m=sign(ch.moon)%4,d=SE[BMAIN[ch.brs.d]],h=[...String(ch.inp&&ch.inp.date||ch.Y)].reduce((a,c)=>a+c.charCodeAt(0),0)%3;
 const out=[VEN[v][h],MOON[m],DAY[d]];return out.filter((x,i)=>out.findIndex(y=>y[0]===x[0])===i)}
function attach(card){try{
 if(!card.closest('#tab-match')||!COMPAT||COMPAT.kind==='friend'||!CH||card.querySelector('.tc-list'))return;
 const wrapEl=card.parentNode;if(/재회/.test(wrapEl.textContent))return;
 const list=points(CH),v=sign(birthExtraLon('Venus',CH.jd)),m=sign(CH.moon),d=SE[BMAIN[CH.brs.d]];
 card.querySelector('.pair-description')?.insertAdjacentHTML('afterend','<div class="tc-wrap"><p class="tc-head">우리가 오래가는 작은 습관</p><ol class="tc-list">'+list.map(x=>'<li><b>'+E(x[0])+'</b><small>'+E(x[1])+'</small></li>').join('')+'</ol></div>');
 const det=card.querySelector('.pair-basis');if(det){const sum=det.querySelector('summary');if(sum)sum.textContent='왜 이런 결과가 나왔을까?';
  det.insertAdjacentHTML('beforeend','<p class="tc-why"><b>작은 습관</b><br>금성 '+SIGNWORD[v]+'자리 · 사랑을 느끼는 방식<br>달 '+SIGNWORD[m]+'자리 · 마음이 풀리는 방식<br>사주 배우자 자리 '+ELN5[d]+' · 곁에서 바라는 모습</p><button type="button" class="fd-cta fd-cta-sub tc-more">더 자세히 보기 →</button>')}
 }catch(_){}}
document.addEventListener('click',e=>{const b=e.target.closest('.tc-more');if(!b)return;b.closest('.cmp-out,.cmp-result,.cmp-wrap')?.querySelector('[data-cmp-open]')?.click()});
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)(n.matches?.('.pair-character')?[n]:n.querySelectorAll?.('.pair-character')||[]).forEach(attach)}).observe(document.body,{childList:true,subtree:true});
})();
