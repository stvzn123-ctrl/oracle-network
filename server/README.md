# 공용 API 서버 (Cloudflare Worker + D1)

서비스 전체에서 사용할 공용 API 서버입니다. 카카오 로그인과 내 정보 저장도 구현되어 있습니다. 결제·유료 리포트 권한은 이후 추가할 수 있습니다.

공유한 사람의 초대 링크(`?r=코드`)를 **다른 사람이 열었을 때만** 개선법·운명 리포트를 여는 서버입니다.
초대 링크 API는 출생 정보와 결과를 받지 않습니다. 아래 내 정보 API는 로그인 회원이 저장에 동의한 출생 정보만 받습니다. 저장하는 것은 초대 코드, 비밀 키의 해시, 브라우저별 무작위 기기값,
IP+브라우저 정보의 해시(원문 저장 안 함), 만든 시각·열린 시각뿐입니다.

## API
- `POST /invite {d}` → `{ref, key}` 새 초대 링크. 같은 접속에서 하루 20개까지.
- `POST /open {r, d}` → 친구가 링크로 들어왔을 때. 만든 사람과 같은 기기값이거나 같은 IP+브라우저면 세지 않음.
- `GET /status?r=&k=` → `{opened}` 공유한 사람 화면이 5초마다 확인.

## 대시보드로 배포하기
1. dash.cloudflare.com → **Storage & Databases → D1** → Create → 이름 `oracle-db`.
2. 만든 DB → **Console** → `schema.sql` 내용을 붙여 넣고 실행.
3. **Workers & Pages → Create → Worker** → 이름 `oracle-api` → Deploy → **Edit code** → `worker.js` 전체를 붙여 넣고 Deploy.
4. Worker → **Settings → Bindings → Add → D1 database** → 변수 이름 `DB`, 데이터베이스 `oracle-db` → 저장.
5. `https://oracle-api.<계정>.workers.dev/health` 가 `{"ok":true}` 이면 완료.
6. `index.html`의 `const INVITE_API="";`에 위 주소(끝 `/` 없이)를 넣으면 초대 링크 방식이 켜진다.

CLI를 쓴다면 `wrangler d1 create oracle-db` 후 `wrangler.toml`의 `database_id`를 바꾸고
`wrangler d1 execute oracle-db --remote --file schema.sql`, `wrangler deploy`.

## 한계
- 시크릿 창은 같은 IP+브라우저라 세지 않지만, 내 다른 기기(폰↔PC)로 열면 열린다.
- 같은 와이파이에서 같은 기종·브라우저를 쓰는 친구는 드물게 세지 않을 수 있다.
- 서버가 응답하지 않으면 잠금이 풀리지 않는다.

## 현재 연결 (2026-11-03)
- Worker: `https://oracle-api.stvzn123.workers.dev`
- D1: `oracle-db`, 바인딩 이름 `DB`.
- `index.html`의 `INVITE_API`를 위 주소로 설정했다. 공유 창 완료나 복사만으로 열지 않고, 다른 접속에서 초대 링크가 열렸는지 서버에 확인한다.
- `/health`는 서버 실행 확인용이다. DB 연결은 `/invite`의 저장과 `/status` 조회 또는 D1 콘솔에서 별도로 확인한다.
- 초대 기록, 카카오 로그인, 출생 정보 저장을 다룬다. 유료 결제·보고서 권한은 아직 포함하지 않는다.

## 이름 변경 (2026-11-03)
- Worker는 `oracle-invite`에서 `oracle-api`로 이름을 변경했다.
- D1은 직접 이름 변경을 지원하지 않아 `oracle-db`를 새로 만들고 기존 초대 기록 3건을 복사했다.
- Worker의 `DB` 바인딩은 새 DB를 사용한다. 기존 `oracle-invite` DB는 백업으로 보관한다.


## 카카오 로그인과 내 정보 (2026-11-03)
- 카카오 앱: 오라클 네트워크 / 트리웨이브, ID 1636031. 회원 식별값과 선택 동의 닉네임만 사용한다. 이메일·사진·전화번호·현재 거주지는 수집하지 않는다.
- 비로그인은 빈 입력창으로 시작한다. 로그인 회원은 `/me`의 저장 출생 정보가 있으면 자동으로 fillForm 한다. 입력 도중 응답이 와도 수정 중인 값을 덮어쓰지 않는다. 결과는 자동 계산하지 않는다.
- 저장은 동의 체크 + `내 정보 저장` 버튼으로만 수행한다. 운명 확인 및 입력 변경만으로 DB를 덮어쓰지 않는다. 이름·영문 이름·성별·달력/윤달·생년월일·시각/모름·출생지(place 좌표/시간대/선택 인덱스)를 저장한다. `내 정보 불러오기`, `저장 정보 삭제`, `로그아웃` 제공.
- server/worker.js: `/auth/start` → 카카오 인가 → `/auth/kakao/callback` → 일회용 코드와 브라우저 검증값으로 `/auth/exchange` → 7일 자체 세션. 세션 원문은 localStorage oracle-session, DB에는 SHA-256 해시만 저장. 카카오 토큰은 저장하지 않는다. 로그인 검증값은 sessionStorage oracle-verifier, 사용 뒤 삭제. 일회용 코드는 URL fragment로 돌아오고 즉시 주소창에서 제거한다. GET /me, POST /profile 및 /auth/logout은 세션 필수. 프로필 소유자는 서버의 세션으로만 결정한다.
- D1 users/sessions/auth_flows/auth_grants 테이블 추가. 기존 invites 유지. 만료 세션·로그인 요청은 로그인 시작 때 정리한다. 프로필 내용은 서버에서 길이/형식/좌표 범위를 검증한다.
- Cloudflare Secrets: KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, KAKAO_ADMIN_KEY. 절대 소스에 키를 넣지 않는다. 연결 해제 웹훅 POST /auth/kakao/unlink는 대표 어드민 키와 app_id를 검증 후 회원·출생 정보·세션을 삭제한다.
- 기존 생년월일 계산식/점수/공유 잠금 기능은 변경하지 않는다. 현재 거주지는 입력 필드도 저장 항목도 추가하지 않는다.

### 설정과 배포
1. oracle-db Console에서 schema.sql의 새 테이블 부분을 실행한다(기존 테이블은 보존).
2. Worker 비밀 변수 3개를 카카오 앱 값으로 설정한다.
3. 카카오 로그인 활성화, 닉네임 선택 동의. 콜백 URI: https://oracle-api.stvzn123.workers.dev/auth/kakao/callback
4. 연결 해제 웹훅: POST https://oracle-api.stvzn123.workers.dev/auth/kakao/unlink
5. worker.js를 배포하고 사이트 index.html을 배포한다.
6. GET /auth/config는 설정 여부만 반환한다. 실제 회원 로그인과 저장은 사용자가 카카오 동의를 완료한 후 확인한다.

저장 프로필 삭제는 해당 회원의 출생 정보만 지운다. 카카오 연결 해제 알림은 회원 전체와 연결된 세션을 정리한다. DB 운영자 권한으로는 데이터를 조회할 수 있으므로 대시보드 권한을 제한해 관리한다.
