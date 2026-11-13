"""주제별 검색 입구 페이지(/gunghap/ /jaemul/ /yeonae/ /jikup/)를 한 틀로 만든다. 2026-11-13.
문구를 고친 뒤 `python3 tools/build-topics.py`. 점수(궁합 점수·운세 점수)는 쓰지 않는다(사용자 결정).
CSS 묶음 해시가 바뀌면 index.html에서 읽어 자동으로 맞춘다. 사이트맵도 같이 갱신한다."""
import json,re,os,html
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd=lambda p:open(os.path.join(R,p),encoding='utf-8').read()
CSS=rd('tools/topic-template.css.txt');FOOT=rd('tools/topic-footer.html.txt');BRAND=rd('tools/topic-brand.html.txt')
BUNDLE=re.search(r'bundle\.[0-9a-f]+\.css',rd('index.html')).group(0)
NAV=[('gunghap','궁합'),('jaemul','재물운'),('yeonae','연애운'),('jikup','직업운')]
SYS='<section class="box"><h2>무엇을 보고 계산하나요?</h2><table>{rows}</table></section>\n<p class="tp-note" style="text-align:left;margin-top:8px">다섯 점술의 결과를 정해진 비율로 합쳐 흐름을 읽어요. 같은 생년월일이면 언제 봐도 같은 결과가 나와요.</p>'
P=[
{'slug':'gunghap','label':'무료 궁합','title':'무료 궁합 보기 - 사주·별자리로 보는 두 사람의 관계 | 운명탐정',
 'desc':'두 사람의 생년월일로 사주(일간 합·일지 합·띠), 서양·베딕 점성술, 수비학, 마야력을 함께 읽어 둘만의 관계 캐릭터와 서로 잘 지내는 법을 무료로 알려드려요.',
 'h1':'우리 둘은 어떤 사이일까? 사주·별자리로 보는 궁합',
 'lead':'두 사람의 생년월일로 사주·서양 점성술·베딕 점성술·수비학·마야력을 함께 읽어서, 둘만의 관계 캐릭터와 서로 잘 지내는 법을 알려드려요.',
 'cta':'우리 궁합 보러 가기','note':"내 정보를 넣은 뒤 '궁합' 메뉴에서 상대 정보를 넣어요 · 약 1분",
 'ex':'<div class="pair"><img src="../img/characters/21.webp" alt="인연의 연결자 캐릭터" width="110" height="110" loading="lazy"><span aria-hidden="true">♥</span><img src="../img/characters/05.webp" alt="상대 캐릭터" width="110" height="110" loading="lazy"></div><h3>서로를 키워 주는 단짝</h3><p class="score">다섯 점술 중 4개가 잘 맞는다고 봤어요</p>',
 'items':[('한 달에 한 번, 둘만의 새로운 곳에 가 보기','함께 처음 해 보는 일에서 가장 가까워지는 조합이에요.'),('서운한 건 그날 안에 짧게 말하기','쌓아 두면 서로의 기준 차이가 크게 느껴져요.'),('돈 쓰는 기준은 미리 하나 정해 두기','오래가는 관계의 열쇠는 생활 기준을 맞추는 거예요.')],
 'rows':[('사주','두 사람의 일간(나를 뜻하는 글자)이 합을 이루는지, 서로 살려 주는지, 일지(배우자 자리)와 띠가 합인지 충인지, 한쪽에 없는 오행을 다른 쪽이 채워 주는지 봐요.'),('서양 점성술','태양·달 별자리의 원소(불·흙·공기·물)가 같은지, 서로 보완하는지 봐요.'),('베딕 점성술','인도식 달 별자리와 낙샤트라(27개 별자리 구역)로 감정의 결이 맞는지 봐요.'),('수비학','생년월일로 구한 인생 수끼리 잘 맞는 조합인지 봐요.'),('마야력','260일 주기 달력(촐킨)의 탄생 기호가 어떤 관계인지 봐요.')],
 'free':['두 사람의 관계 캐릭터','관계를 위한 조언 3가지','다섯 점술이 함께 짚은 점','이미지로 저장·공유'],'rep':'궁합 리포트','repl':['점술별 궁합 풀이','앞으로 3년의 관계 흐름','앞으로 12개월, 두 사람의 흐름','주의할 점과 대처법'],
 'faq':[('궁합을 보려면 무엇이 필요한가요?','두 사람의 이름, 성별, 생년월일이 필요해요. 태어난 시각과 장소를 알면 별자리의 상승궁까지 계산해 더 자세해지고, 몰라도 궁합은 볼 수 있어요.'),('궁합은 무료인가요?','두 사람의 관계 캐릭터와 관계를 위한 조언 3가지는 무료로 볼 수 있어요. 앞으로 3년과 12개월의 흐름, 주의할 점을 담은 궁합 리포트는 유료예요.'),('상대방 정보를 몰래 넣어도 되나요?',"계산은 브라우저에서 이뤄지지만 상대 정보를 저장하려면 그 사람의 동의가 필요해요. '공유해서 입력 요청하기'로 상대가 직접 넣게 할 수도 있어요."),('잘 안 맞는다고 나오면 어떡하죠?','맞춰 갈 점에는 왜 그런지와 함께 바로 해 볼 수 있는 대처법을 같이 보여 드려요. 재미로 즐겨 주세요.')]},
{'slug':'jaemul','label':'무료 재물운','title':'무료 재물운 보기 - 앞으로 10년 돈의 흐름과 잘 버는 방법 | 운명탐정',
 'desc':'생년월일로 사주·서양 점성술·베딕 점성술·수비학·마야력을 함께 읽어 앞으로 10년 중 돈이 잘 들어오는 해, 12개월 중 밝은 달, 나에게 맞는 돈 버는 방식을 무료로 알려드려요.',
 'h1':'내 돈은 언제, 어떻게 불어날까? 앞으로 10년 재물운',
 'lead':'생년월일로 다섯 점술을 함께 읽어서, 앞으로 10년 중 돈이 잘 들어오는 해와 조심할 해, 나에게 맞는 돈 버는 방식을 알려드려요.',
 'cta':'내 재물운 보러 가기','note':"내 정보를 넣은 뒤 '재물운' 메뉴를 열어요 · 약 1분",
 'ex':'<div class="pair"><img src="../img/characters/21.webp" alt="예시 운명 캐릭터" width="110" height="110" loading="lazy"></div><h3>돈이 가장 잘 들어오는 해 2029년 · 2036년</h3><p class="score">앞으로 12개월 중 밝은 달: 1월 · 4월 · 9월</p>',
 'items':[('2029년: 안정적으로 쌓이는 해','월급과 저축이 착실히 늘어나요. 모아 둔 것을 불릴 계획을 세우기 좋아요.'),('2035년: 지키며 다지는 해','큰 지출·투자는 다음 해로 미루고 비상금부터 채워 두세요.'),('나에게 맞는 돈 버는 방식','재능이 그대로 돈이 되는 쪽. 본업 안에서 내 이름이 걸린 일을 늘려 보세요.')],
 'rows':[('사주','타고난 재물 글자(재성)의 수와 해마다 들어오는 세운의 기운으로 돈이 움직이는 해를 봐요.'),('서양 점성술','재물의 집(2하우스)과 목성·토성이 지나가는 위치로 돈이 커지는 해와 다지는 해를 봐요.'),('베딕 점성술','지금 지나는 다샤(행성 주기)가 재물에 유리한지 봐요.'),('수비학','해마다 바뀌는 개인년 수로 시작·성과·정리의 리듬을 봐요.'),('마야력','260일마다 돌아오는 탄생일이 그해 몇 번 오는지로 흐름을 더해요.')],
 'free':['앞으로 10년 재물 흐름 그래프','돈이 가장 잘 들어오는 해','12개월 중 밝은 달','조심할 해와 대처법','나에게 맞는 돈 버는 방식'],'rep':'재물·돈 리포트','repl':['나의 돈 그릇','돈이 들어오는 길','돈을 키울 때와 지킬 때','모으고 불리는 방법','돈이 새기 쉬운 곳','앞으로 10년, 연도별 운명','앞으로 12개월, 월별 운명'],
 'faq':[('재물운을 보려면 무엇이 필요한가요?','이름, 성별, 생년월일이 필요해요. 태어난 시각과 장소를 알면 서양 점성술의 재물 집까지 계산해 더 자세해져요.'),('재물운은 무료인가요?','앞으로 10년 흐름 그래프, 돈이 잘 들어오는 해, 12개월 중 밝은 달, 조심할 해와 대처법은 무료예요. 해마다의 풀이와 월별 실천을 담은 재물·돈 리포트는 유료예요.'),('투자 시기를 정해도 되나요?','점술로 읽은 흐름은 재미로 참고해 주세요. 실제 투자 결정은 본인의 재정 상황과 전문가 상담을 기준으로 해 주세요.')]},
{'slug':'yeonae','label':'무료 연애운','title':'무료 연애운 보기 - 나와 잘 맞는 사람과 인연이 오는 때 | 운명탐정',
 'desc':'생년월일로 사주·서양 점성술·베딕 점성술·수비학·마야력을 함께 읽어 나와 잘 맞는 사람의 모습, 사랑이 깊어지는 해, 사랑을 표현하는 나의 방식을 무료로 알려드려요.',
 'h1':'나와 잘 맞는 사람은 누구일까? 앞으로 10년 연애운',
 'lead':'생년월일로 다섯 점술을 함께 읽어서, 나와 잘 맞는 사람의 모습과 사랑이 깊어지는 해, 사랑을 표현하는 나의 방식을 알려드려요. 지금 관계 상태(혼자·썸·연애 중·결혼)에 맞춰 읽어 드려요.',
 'cta':'내 연애운 보러 가기','note':"내 정보를 넣은 뒤 '연애' 메뉴를 열어요 · 약 1분",
 'ex':'<div class="pair"><img src="../img/characters/21.webp" alt="예시 운명 캐릭터" width="110" height="110" loading="lazy"></div><h3>사랑이 가장 깊어지는 해 2029년 · 2034년</h3><p class="score">차트가 그리는 잘 맞는 사람: 차분하고 믿음직한 사람</p>',
 'items':[('2032년: 마음을 한 번 더 말로 전하는 해','서운함이 쌓이기 쉬워요. 고마운 마음을 말로 표현하면 관계를 지켜요.'),('잘 맞는 사람','내 속도를 기다려 주고, 약속을 지키는 사람과 오래가요.'),('함께 살펴볼 점','서운함을 혼자 오래 품지 말고 짧게 말해 보세요.')],
 'rows':[('사주','배우자 자리(일지)와 이성 인연의 글자, 도화살로 끌리는 사람과 인연이 들어오는 해를 봐요.'),('서양 점성술','금성 별자리와 관계의 집(7하우스), 그곳을 지나는 목성으로 사랑의 방식과 시기를 봐요.'),('베딕 점성술','금성과 7번째 집 주인 행성의 보조 기간으로 관계가 깊어지는 때를 봐요.'),('수비학','개인년 2·6처럼 관계와 약속의 해를 봐요.'),('마야력','탄생일이 돌아오는 날로 새로운 만남의 리듬을 더해요.')],
 'free':['차트가 그리는 나와 잘 맞는 사람','앞으로 10년 사랑 흐름 그래프','사랑이 깊어지는 해','사랑을 표현하는 나의 방식','함께 살펴볼 점'],'rep':'연인·결혼 리포트','repl':['사랑할 때의 나','나와 잘 맞는 연인의 모습','인연은 언제·어디서·어떻게 만날까요?','앞으로 10년, 사랑의 흐름','사랑에서 조심할 점','앞으로 12개월, 월별 운명'],
 'faq':[('연애운을 보려면 무엇이 필요한가요?','이름, 성별, 생년월일과 지금 관계 상태가 필요해요. 관계 상태에 따라 혼자라면 인연이 오는 때를, 연애 중이라면 사랑이 깊어지는 때를 읽어 드려요.'),('연애운은 무료인가요?','잘 맞는 사람의 모습, 10년 흐름, 사랑을 표현하는 방식은 무료예요. 만나는 시기·장소와 월별 흐름을 담은 연인·결혼 리포트는 유료예요.'),('상대와 둘이 함께 보고 싶어요.',"'궁합' 메뉴에서 상대 정보를 넣으면 두 사람의 관계 캐릭터와 조언을 볼 수 있어요.")]},
{'slug':'jikup','label':'무료 직업운','title':'무료 직업운 보기 - 나에게 맞는 일과 이직하기 좋은 해 | 운명탐정',
 'desc':'생년월일로 사주·서양 점성술·베딕 점성술·수비학·마야력을 함께 읽어 나에게 맞는 일, 일이 잘 풀리는 해, 이직·자격증에 좋은 시기를 무료로 알려드려요.',
 'h1':'나에게 맞는 일은? 앞으로 10년 직업운',
 'lead':'생년월일로 다섯 점술을 함께 읽어서, 나에게 맞는 일과 일이 잘 풀리는 해, 이직·자격증에 좋은 시기를 알려드려요.',
 'cta':'내 직업운 보러 가기','note':"내 정보를 넣은 뒤 '직장' 메뉴를 열어요 · 약 1분",
 'ex':'<div class="pair"><img src="../img/characters/21.webp" alt="예시 운명 캐릭터" width="110" height="110" loading="lazy"></div><h3>일이 가장 잘 풀리는 해 2029년 · 2031년</h3><p class="score">나에게 맞는 일: 사람을 잇고 기획하는 일</p>',
 'items':[('2030년: 준비에 힘을 모으는 해','무리한 이직보다 자격증·포트폴리오를 다져 두면 밝은 해에 크게 돌아와요.'),('잘 맞는 일','사람을 연결하고 계획을 세우는 역할에서 강점이 드러나요.'),('함께 살펴볼 점','일을 혼자 끌어안기보다 나눠 맡기는 연습이 도움이 돼요.')],
 'rows':[('사주','가장 많은 오행과 십성 그룹으로 맞는 일의 성격을, 세운과 대운으로 일이 풀리는 해를 봐요.'),('서양 점성술','일과 명예의 집(10하우스)과 그곳을 지나는 목성·토성으로 성과의 해를 봐요.'),('베딕 점성술','지금 다샤(행성 주기)와 10번째 집 주인 행성으로 커리어 흐름을 봐요.'),('수비학','인생 수로 타고난 일의 방식을, 개인년으로 시작·전환의 해를 봐요.'),('마야력','탄생 기호와 그해 탄생일 횟수로 흐름을 더해요.')],
 'free':['앞으로 10년 일의 흐름 그래프','일이 가장 잘 풀리는 해','나에게 맞는 일','이직·자격증에 좋은 시기','함께 살펴볼 점'],'rep':'직업 리포트','repl':['일할 때의 나','취업·이직 준비와 시기','나에게 맞는 일','일에서 만나는 귀인','앞으로 3년, 일의 흐름','일에서 조심할 점','앞으로 12개월, 월별 운명'],
 'faq':[('직업운을 보려면 무엇이 필요한가요?','이름, 성별, 생년월일이 필요해요. 태어난 시각과 장소를 알면 일과 명예의 집까지 계산해 더 자세해져요.'),('직업운은 무료인가요?','10년 흐름, 잘 풀리는 해, 나에게 맞는 일, 이직 시기는 무료예요. 앞으로 3년과 12개월의 실천을 담은 직업 리포트는 유료예요.'),('학생도 볼 수 있나요?','네. 나이에 맞춰 공부와 자격증 중심으로 읽어 드려요.')]},
]
E=html.escape
def page(d):
    rows=''.join('<tr><th>%s</th><td>%s</td></tr>'%(a,b) for a,b in d['rows'])
    items=''.join('<li><b>%s</b><small>%s</small></li>'%(a,b) for a,b in d['items'])
    faq=''.join('<details><summary>%s</summary><p>%s</p></details>'%(q,a) for q,a in d['faq'])
    more=''.join('<a href="../%s/">%s</a>'%(s,n) for s,n in NAV if s!=d['slug'])+'<a href="../">나의 운명 캐릭터</a>'
    ld={"@context":"https://schema.org","@graph":[{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"운명탐정","item":"https://fatedog.co.kr/"},{"@type":"ListItem","position":2,"name":d['label'].replace('무료 ',''),"item":"https://fatedog.co.kr/%s/"%d['slug']}]},{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in d['faq']]}]}
    url='https://fatedog.co.kr/%s/'%d['slug']
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{d['title']}</title>
<meta name="description" content="{E(d['desc'])}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="운명탐정">
<meta property="og:title" content="{E(d['title'].split(' | ')[0])}">
<meta property="og:description" content="{E(d['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://fatedog.co.kr/og-share-v11.png">
<meta name="theme-color" content="#FFF9F4">
<link rel="icon" href="../img/mascot.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&display=swap">
<link rel="stylesheet" href="../{BUNDLE}">
{CSS}
<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False,separators=(',',':'))}</script>
</head>
<body class="tp">
{BRAND}
<main>
<p class="crumb"><a href="../">운명탐정</a> › {d['label'].replace('무료 ','')} 보기</p>
<p class="tp-label">{d['label']}</p>
<h1>{d['h1']}</h1>
<p class="lead">{d['lead']}</p>
<a class="tp-cta" href="../">{d['cta']}</a>
<p class="tp-note">{d['note']}</p>
<section class="box ex" aria-label="결과 예시"><span class="ex-tag">결과 예시</span>{d['ex']}<ul>{items}</ul><p class="ex-cap">가상의 인물로 만든 예시예요. 실제 결과는 생년월일에 따라 달라져요.</p></section>
{SYS.format(rows=rows)}
<h2>무료로 볼 수 있는 것과 리포트</h2>
<div class="free"><div class="box"><h3>무료</h3><ul>{''.join('<li>%s</li>'%x for x in d['free'])}</ul></div><div class="box"><h3>{d['rep']}</h3><ul>{''.join('<li>%s</li>'%x for x in d['repl'])}</ul></div></div>
<section class="box faq"><h2>자주 묻는 질문</h2>{faq}</section>
<div style="margin-top:32px">
<a class="tp-cta" href="../">{d['cta']}</a>
<h2>다른 운세도 볼 수 있어요</h2>
<nav class="more" aria-label="다른 운세">{more}</nav>
</div>
</main>
{FOOT}
<script defer src="../analytics.js?v=4"></script>
</body>
</html>
'''
for d in P:
    os.makedirs(os.path.join(R,d['slug']),exist_ok=True)
    open(os.path.join(R,d['slug'],'index.html'),'w',encoding='utf-8').write(page(d))
sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://fatedog.co.kr/</loc><lastmod>2026-11-13</lastmod><changefreq>weekly</changefreq></url>\n'+''.join('  <url><loc>https://fatedog.co.kr/%s/</loc><lastmod>2026-11-13</lastmod><changefreq>monthly</changefreq></url>\n'%d['slug'] for d in P)+'  <url><loc>https://fatedog.co.kr/sample.html</loc><lastmod>2026-11-13</lastmod><changefreq>monthly</changefreq></url>\n</urlset>\n'
open(os.path.join(R,'sitemap.xml'),'w').write(sm)
print('ok',[d['slug'] for d in P])
