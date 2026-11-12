# 가져온 스킬 (2026-11-12)

GitHub에서 별이 많은 공개 스킬을 그대로 가져왔다. 고칠 때는 원본 저장소의 최신판과 비교한다.

| 스킬 | 용도 | 출처(커밋) | 별 | 라이선스 |
|---|---|---|---|---|
| performance | 로딩 속도 진단·개선(측정 → 원인 → 수정 → 재측정) | addyosmani/web-quality-skills (afa8da9) | 3.1k | MIT |
| core-web-vitals | LCP·INP·CLS 개선 | 같은 곳 | | MIT |
| accessibility | WCAG 2.2 접근성 점검 | 같은 곳 | | MIT |
| web-quality-audit | 성능·접근성·SEO·모범 사례 종합 점검(+ HTML 정적 분석 스크립트, jq 필요) | 같은 곳 | | MIT |
| frontend-design | 템플릿 같지 않은 디자인 방향·타이포·카피 | anthropics/skills (2c5958e) | 193k | Apache-2.0 |
| ui-ux-pro-max | UI/UX 규칙 120개·팔레트·폰트 조합 검색(Python 3, 외부 의존성 없음) | nextlevelbuilder/ui-ux-pro-max-skill (6ae86f6) | 148k | MIT |

바꾼 점: ui-ux-pro-max의 스크립트 경로를 플러그인용 `${CLAUDE_PLUGIN_ROOT}/...`에서 저장소 기준 `.claude/skills/ui-ux-pro-max/...`로 고쳤고, 테스트 폴더는 뺐다.

이 사이트에 적용할 때의 주의(CLAUDE.md 우선):
- 색·글꼴·캐릭터 톤은 CLAUDE.md의 '2026-11 캐릭터 리뉴얼'과 `ui-unify.css`가 기준이다. 스킬이 다른 팔레트를 권해도 그대로 바꾸지 않는다.
- 빌드 도구가 없는 정적 사이트(GitHub Pages)라 React·번들러 전용 조언(code splitting, tree shaking)은 해당 없음.
