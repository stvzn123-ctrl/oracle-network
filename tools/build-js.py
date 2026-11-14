"""JS 묶기 (2026-11-14). 작은 defer 스크립트 25개를 scripts.<해시>.js 하나로 묶는다(요청 25개 → 1개, 폰에서 약 4초 단축).
실행: python tools/build-js.py   (저장소 맨 위에서). 아래 ORDER의 파일을 고친 뒤에는 반드시 다시 실행한다.
순서가 중요하다(예전 index.html의 defer 순서 그대로). app.<해시>.js는 따로 둔다. 새 스크립트는 ORDER에 알맞은 자리로 넣는다."""
import hashlib,re,os,glob
ORDER=['relationship-context.js','navigation.js','navigation-history.js','input-experience.js','product-flow.js','topic-timing.js',
 'profile-controls.js','install-app.js','year-format.js','penguin-social.js','social-card.js','destiny-characters.js','pair-characters.js',
 'pair-share.js','character-share.js','share-reward.js','touch-card.js','week-pass.js','admin-test.js','demo-home.js','demo-ui.js',
 'purchase-first.js','report-toc.js','refresh-keep.js','analytics.js']
js='\n;\n'.join('/* ==== '+f+' ==== */\n'+open(f,encoding='utf-8').read().strip() for f in ORDER)+'\n'
h=hashlib.md5(js.encode('utf-8')).hexdigest()[:8]
for old in glob.glob('scripts.*.js'): os.remove(old)
name='scripts.'+h+'.js'
open(name,'w',encoding='utf-8',newline='\n').write(js)
p='index.html';s=open(p,encoding='utf-8').read()
tag='<script defer src="'+name+'"></script>'
if re.search(r'<script defer src="scripts\.[0-9a-f]+\.js"></script>',s):
    s=re.sub(r'<script defer src="scripts\.[0-9a-f]+\.js"></script>',tag,s,1)
else:
    first=True
    for f in ORDER:
        m=re.search(r'<script defer src="'+re.escape(f)+r'(\?[^"]*)?"></script>',s)
        assert m,f
        s=s[:m.start()]+(tag if first else '')+s[m.end():];first=False
open(p,'w',encoding='utf-8',newline='').write(s)
print(name,len(js)//1024,'KB')
