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

  // Clarity
  window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
  load('https://www.clarity.ms/tag/' + CLARITY_ID);

  // GA4
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
  load('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);

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
