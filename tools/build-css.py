"""CSS 묶기 (2026-11-13). 원본 CSS를 고친 뒤 이 스크립트를 실행하면 bundle.<해시>.css를 다시 만들고 index.html의 참조를 바꾼다.
실행: python tools/build-css.py   (저장소 맨 위에서)
순서가 중요하다(뒤 파일이 앞 파일을 덮는다). 새 CSS 파일을 만들면 ORDER에 알맞은 자리로 넣는다."""
import hashlib,re,os,glob
ORDER=['pair-characters.css','install-app.css','app.004405c6.css','companion.css','glass-system.css','product-flow.css','ui-unify.css','demo-ui.css','topic-timing.css','touch-card.css','ui-cta.css','report-table.css','destiny-characters.css','type-scale.css','purchase.css','character-share.css','share-reward.css']
parts=[]
for f in ORDER:
    parts.append('/* ==== '+f+' ==== */\n'+open(f,encoding='utf-8').read().strip()+'\n')
css='\n'.join(parts)
h=hashlib.md5(css.encode('utf-8')).hexdigest()[:8]
for old in glob.glob('bundle.*.css'): os.remove(old)
name='bundle.'+h+'.css'
open(name,'w',encoding='utf-8',newline='\n').write(css)
p='index.html';s=open(p,encoding='utf-8').read()
tag='<link rel="stylesheet" href="'+name+'">'
if re.search(r'<link rel="stylesheet" href="bundle\.[0-9a-f]+\.css">',s):
    s=re.sub(r'<link rel="stylesheet" href="bundle\.[0-9a-f]+\.css">',tag,s,1)
else:
    first=True
    for f in ORDER:
        m=re.search(r'<link rel="stylesheet" href="'+re.escape(f)+r'(\?[^"]*)?">',s)
        assert m,f
        s=s[:m.start()]+(tag if first else '')+s[m.end():];first=False
open(p,'w',encoding='utf-8',newline='').write(s)
print(name,len(css)//1024,'KB')
