#!/usr/bin/env bash
# Cloudflare Pages 빌드 (2026-11-13). 사이트에 필요한 파일만 dist/로 복사한다(server/, 메모 파일, .claude/ 제외).
# Cloudflare Pages 설정: Build command = bash build.sh, Build output directory = dist
set -e
rm -rf dist && mkdir -p dist
cp *.html *.js *.css *.png *.jpg *.webmanifest *.txt *.xml _headers dist/ 2>/dev/null || true
cp -r img dist/
# 주제별 검색 입구 페이지(tools/build-topics.py가 만든다)
for d in gunghap jaemul yeonae jikup; do [ -d "$d" ] && cp -r "$d" dist/; done
rm -f dist/build.sh
echo "Not found" > dist/404.html
