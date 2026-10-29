from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,urllib.request,subprocess,shutil
root=Path('public/__qa__');root.mkdir(parents=True,exist_ok=True)
cmd=['npm','exec','--yes','--package=esbuild@0.25.12','--','esbuild','scripts/motion-harness.tsx','--bundle','--format=iife','--jsx=automatic','--alias:@=.','--define:process.env.NODE_ENV="development"','--outfile=public/__qa__/motion.js']
assert subprocess.run(cmd).returncode==0
html=urllib.request.urlopen('http://127.0.0.1:3000/').read().decode();css=re.findall(r'<link[^>]+href="([^"]+\.css[^\"]*)"',html)
(root/'index.html').write_text('<!doctype html><html><head>'+''.join('<link rel="stylesheet" href="'+c+'">' for c in css)+'</head><body><div id="qa-root"></div><script src="/&#95;&#95;qa&#95;&#95;/motion.js"></script></body></html>'.replace('/&#95;&#95;qa&#95;&#95;/','/__qa__/'))
r={'cycles':[],'pageErrors':[]}
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':900})
  page.on('pageerror',lambda e:r['pageErrors'].append(str(e)))
  page.route('**/__qa__/index.html',lambda route:route.fulfill(status=200,content_type='text/html',body=(root/'index.html').read_text()))
  page.route('**/__qa__/motion.js',lambda route:route.fulfill(status=200,content_type='application/javascript',body=(root/'motion.js').read_text()))
  page.goto('http://127.0.0.1:3000/__qa__/index.html',wait_until='networkidle');page.wait_for_function('window.__motionQa?.snapshot().triggers.length===6');page.wait_for_timeout(350)
  for i in range(5):
   if i:page.evaluate('window.__motionQa.mount()');page.wait_for_function('window.__motionQa.snapshot().triggers.length===6');page.wait_for_timeout(180)
   before=page.evaluate('window.__motionQa.snapshot()');assert before['spacers']==2 and len(set(before['triggers']))==6,before
   page.evaluate('window.__motionQa.unmount()');page.wait_for_timeout(200);after=page.evaluate('window.__motionQa.snapshot()');assert not after['triggers'] and after['spacers']==0 and after['canvases']==0,after
   r['cycles'].append({'mount':before,'unmount':after})
  page.evaluate('window.__motionQa.mount()');page.wait_for_function('window.__motionQa.snapshot().triggers.length===6');page.wait_for_timeout(400)
  initial=page.evaluate('window.__motionQa.snapshot()');page.wait_for_timeout(1000);stable=page.evaluate('window.__motionQa.snapshot()');assert stable['refreshCount']==initial['refreshCount'],[initial,stable]
  page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(200);reduce=page.evaluate('window.__motionQa.snapshot()');assert not reduce['triggers'] and reduce['spacers']==0 and reduce['canvases']==0,reduce
  page.emulate_media(reduced_motion='no-preference');page.wait_for_timeout(500);restored=page.evaluate('window.__motionQa.snapshot()');assert len(restored['triggers'])==6 and restored['spacers']==2,restored
  page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(500);mobile=page.evaluate('window.__motionQa.snapshot()');assert len(mobile['triggers'])==4 and mobile['spacers']==0 and mobile['canvases']==0,mobile
  page.evaluate('window.__motionQa.unmount()');page.wait_for_timeout(200);final=page.evaluate('window.__motionQa.snapshot()');assert not final['triggers'] and final['spacers']==0,final
  r.update(idleRefresh=[initial,stable],reduced=reduce,restored=restored,mobile=mobile,final=final)
  b.close()
 assert not r['pageErrors'],r['pageErrors']
 Path('docs/checks/redesign-cleanup.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
finally:shutil.rmtree(root,ignore_errors=True)
