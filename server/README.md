# 초대 링크 서버 (Cloudflare Worker + D1)

공유한 사람의 초대 링크(`?r=코드`)를 **다른 사람이 열었을 때만** 개선법·운명 리포트를 여는 서버입니다.
출생 정보와 결과는 서버로 보내지 않습니다. 저장하는 것은 초대 코드, 비밀 키의 해시, 브라우저별 무작위 기기값,
IP+브라우저 정보의 해시(원문 저장 안 함), 만든 시각·열린 시각뿐입니다.

## API
- `POST /invite {d}` → `{ref, key}` 새 초대 링크. 같은 접속에서 하루 20개까지.
- `POST /open {r, d}` → 친구가 링크로 들어왔을 때. 만든 사람과 같은 기기값이거나 같은 IP+브라우저면 세지 않음.
- `GET /status?r=&k=` → `{opened}` 공유한 사람 화면이 5초마다 확인.

## 대시보드로 배포하기
1. dash.cloudflare.com → **Storage & Databases → D1** → Create → 이름 `oracle-invite`.
2. 만든 DB → **Console** → `schema.sql` 내용을 붙여 넣고 실행.
3. **Workers & Pages → Create → Worker** → 이름 `oracle-invite` → Deploy → **Edit code** → `worker.js` 전체를 붙여 넣고 Deploy.
4. Worker → **Settings → Bindings → Add → D1 database** → 변수 이름 `DB`, 데이터베이스 `oracle-invite` → 저장.
5. `https://oracle-invite.<계정>.workers.dev/health` 가 `{"ok":true}` 이면 완료.
6. `index.html`의 `const INVITE_API="";`에 위 주소(끝 `/` 없이)를 넣으면 초대 링크 방식이 켜진다.

CLI를 쓴다면 `wrangler d1 create oracle-invite` 후 `wrangler.toml`의 `database_id`를 바꾸고
`wrangler d1 execute oracle-invite --remote --file schema.sql`, `wrangler deploy`.

## 한계
- 시크릿 창은 같은 IP+브라우저라 세지 않지만, 내 다른 기기(폰↔PC)로 열면 열린다.
- 같은 와이파이에서 같은 기종·브라우저를 쓰는 친구는 드물게 세지 않을 수 있다.
- 서버가 응답하지 않으면 잠금이 풀리지 않는다.

## 현재 연결 (2026-11-03)
- Worker: `https://oracle-invite.stvzn123.workers.dev`
- D1: `oracle-invite`, 바인딩 이름 `DB`.
- `index.html`의 `INVITE_API`를 위 주소로 설정했다. 공유 창 완료나 복사만으로 열지 않고, 다른 접속에서 초대 링크가 열렸는지 서버에 확인한다.
- `/health`는 서버 실행 확인용이다. DB 연결은 `/invite`의 저장과 `/status` 조회 또는 D1 콘솔에서 별도로 확인한다.
- 이 서버는 초대 기록만 다룬다. 로그인·출생정보 저장·유료 결제·보고서 권한은 아직 포함하지 않는다.
