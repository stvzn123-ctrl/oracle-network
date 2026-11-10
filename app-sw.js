/* Network-only: do not persist birth information, reports, or API responses. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode!=='navigate'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>운명탐정 · 연결 확인</title><body style="font:16px/1.8 system-ui;padding:32px;background:#fff8ed;color:#302e29"><h1>인터넷 연결을 확인해 주세요</h1><p>연결 후 다시 열면 운명탐정을 이용할 수 있어요.</p><a href="/oracle-network/">다시 열기</a></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})));
});
