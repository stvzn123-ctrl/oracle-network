# 로딩 최적화 (2026-11-14)

## 참고 스킬
GitHub API 조회 기준 ECC(affaan-m/ECC) 302,542 stars, vercel-labs/agent-skills 34,033 stars. 비교한 후보 중 가장 많은 별을 받은 ECC의 frontend-patterns 스킬을 `.agents/skills/ecc-frontend-patterns/SKILL.md`에 가져왔다. 개별 스킬에는 별 수가 없으므로 저장소 수치다. 원본: https://github.com/affaan-m/ECC/blob/main/skills/frontend-patterns/SKILL.md
React 전환 없이 필요한 시점에 코드 로드, 불필요한 렌더링 제거 원칙을 적용했다.

## 변경 및 측정
- 첫 진입 후 5.5초 시점: report.75ba499e.js 자동 요청 1 → 0. 약 241KB 원본 JS의 다운로드와 파싱을 첫 방문에서 제외(압축 전 크기).
- 종합 리포트 미리보기는 화면 200px 앞에서 준비한다. 차트가 바뀌면 이전 작업이 미리보기를 덮어쓰지 않도록 세대와 차트 참조를 확인한다.
- 리포트 버튼 hover/focus/touch 때 코드를 준비하고, 클릭 시 기존 오류 처리·재시도를 유지한다.
- 입력 제출의 고정 대기 1100 → 180ms, 우정·모임 결과의 고정 대기 900 → 180ms.
- immutable 캐시 충돌을 피하도록 메인 앱 파일명 해시 갱신.

## 검증
로컬 Python HTTP 서버 + Playwright/시스템 Chromium으로 전후 실행. RY/LD/LS 전체 JSON과 메인 결과 텍스트가 동일했고 pageerror 없음. 390×844에서 사용자 차트 계산 후 화면 밖 미리보기는 리포트를 로드하지 않으며, 미리보기로 스크롤 시 코드와 목차 정상 표시 확인. flow/week/natal 탭 전환 오류 없음. node --check, 인라인 스크립트 문법 검사, build.sh, git diff --check 통과.

로컬 측정이며 실제 모바일 네트워크의 LCP 개선율은 측정하지 않았다. API 로그인/결제 서버 응답은 이번 변경 대상이 아니다.

## 숨은 패널 추가 점검
첫 결과에서 숨겨진 장식 SVG 182개 요소, 10년 그래프 225개 요소, 주간 결과 1개 하위 트리를 미리 생성하던 동작을 제거했다. flow/today 탭 진입 시 각각 생성하며, 새 차트에서는 내용을 비워 오래된 결과를 방지한다. 주간 카드·공유 버튼의 래퍼도 탭 진입 후 처리한다. 지도 페이지가 숨겨져 있으면 결과 갱신 때 지도를 다시 그리지 않는다.

Playwright 모바일 390×844 전후 비교에서 초기 sigil/graph/week 하위 요소 수 182/225/1 → 0/0/0. flow/today/natal 탭의 보이는 텍스트 동일. 다른 이름으로 차트를 다시 계산한 뒤 주간 결과와 공유 버튼 생성 확인, pageerror 없음. PDF·공유 canvas는 사용자가 요청할 때 실행하는 코드여서 유지했다. 지도 데이터도 기존에 필요한 시점에만 내려받으므로 유지했다.
