/* 2026-11-13 Clarity 화면 기록에서 개인 정보가 보이는 영역은 가린다(입력칸·결과·리포트·내 정보·궁합 상대). */
(function(){var SEL='#askbox,#result,#report,#accountSheet,#savedRecordsPanel,#guestProfile,.cmp-wrap,#tab-match,#loginSaveDialog,#pairConsentDialog,.demo-note';
 function m(){document.querySelectorAll(SEL).forEach(function(e){if(!e.hasAttribute('data-clarity-mask'))e.setAttribute('data-clarity-mask','true')})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',m);else m();
 var q=0;try{new MutationObserver(function(){if(q)return;q=setTimeout(function(){q=0;m()},500)}).observe(document.body||document.documentElement,{childList:true,subtree:true})}catch(_){}})();
/* 2026-11-13 공통 이벤트 헬퍼: GA4 + Clarity(녹화 필터용). 개인정보(이름·생년월일 등)는 넣지 않는다. */
window.track=function(name,params){params=params||{};try{if(window.gtag)gtag('event',name,params)}catch(_){}
 try{if(window.clarity){clarity('event',name);Object.keys(params).forEach(function(k){clarity('set',k,String(params[k]))})}}catch(_){}};
/* 캐릭터 이름(36종 중 하나, 개인정보 아님). 결과 전이면 빈 값 */
window.oracleCharType=function(){var h=document.querySelector('.destiny-character h2');return h?h.textContent.trim().slice(0,30):''};
(function(){
 /* view_paywall: 결제 화면이 열릴 때마다 1번(열린 상태에서 다시 그려져도 다시 보내지 않음) */
 function src(){try{return typeof purchaseReportKey!=='undefined'&&purchaseReportKey||''}catch(_){return ''}}
 function hook(){var d=document.getElementById('reportPurchase');if(!d){return}var was=d.open;
  new MutationObserver(function(){if(d.open&&!was){track('view_paywall',{character_type:oracleCharType(),source_page:src()})}was=d.open}).observe(d,{attributes:true,attributeFilter:['open']})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#reportCheckoutAll'))track('click_unlock_all',{character_type:oracleCharType(),source_page:src()})},true);
})();
// 방문 분석: Microsoft Clarity(히트맵·세션 녹화) + Google Analytics 4(방문·체류시간·유입).
// 입력값(이름·생년월일 등)은 보내지 않는다. 클릭 이벤트에는 버튼 문구/ID만 담는다.
(function () {
  var host = location.hostname;
  if (host !== 'fatedog.co.kr' && host !== 'www.fatedog.co.kr') return; // 로컬·미리보기에서는 수집하지 않음

  var CLARITY_ID = 'zcqov2wjsi';
  var GA_ID = 'G-PZ3TL06NMV';

  function load(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  /* 2026-11-13: 첫 화면 로딩과 겹치지 않게 load 뒤 2.5초(또는 첫 스크롤·터치)에 시작한다. */
  var started=false;function start(){if(started)return;started=true;
  // Clarity
  window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
  load('https://www.clarity.ms/tag/' + CLARITY_ID);

  // GA4
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
  load('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);

  }
  ['pointerdown','scroll','keydown'].forEach(function(ev){addEventListener(ev,start,{once:true,passive:true})});
  if(document.readyState==='complete')setTimeout(start,2500);else addEventListener('load',function(){setTimeout(start,2500)});

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // 버튼·링크 클릭 추적 (입력 필드 값은 절대 담지 않음)
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('button, a, [role="button"]');
    if (!el || el.closest('[data-analytics-ignore]')) return;
    var label = (el.getAttribute('data-track') || el.getAttribute('aria-label') || el.textContent || '')
      .replace(/\s+/g, ' ').trim().slice(0, 60);
    var params = { click_label: label, click_id: (el.id || '').slice(0, 60) };
    if (el.tagName === 'A' && el.href) params.link_url = el.href.split('?')[0].slice(0, 100);
    gtag('event', 'ui_click', params);
  }, true);
})();
