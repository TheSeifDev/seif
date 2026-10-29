from pathlib import Path
import json
from playwright.sync_api import sync_playwright
r={};out=Path('docs/checks')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(1440,900),(390,900)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.add_init_script('''window.__metrics={cls:0,lcp:0};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__metrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});''')
  page.goto('http://127.0.0.1:3000/',wait_until='networkidle');page.wait_for_timeout(900)
  for run in ['firstScroll','warmScroll']:
   page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(300)
   value=page.evaluate('''async() => {let frames=[],tasks=[],last=performance.now();let po=new PerformanceObserver(l=>tasks.push(...l.getEntries().map(e=>e.duration)));po.observe({type:'longtask',buffered:false});for(let i=0;i<160;i++){await new Promise(requestAnimationFrame);const n=performance.now();frames.push(n-last);last=n;scrollTo({top:i*(document.documentElement.scrollHeight-innerHeight)/160,behavior:'instant'});}po.disconnect();frames.sort((a,b)=>a-b);return{frameCount:frames.length,meanFrame:frames.reduce((a,b)=>a+b,0)/frames.length,p95Frame:frames[Math.floor(frames.length*.95)],longTasks:tasks,pinCount:document.querySelectorAll('.pin-spacer').length,metrics:window.__metrics,resources:performance.getEntriesByType('resource').filter(e=>e.initiatorType==='script').map(e=>({name:e.name.split('/').pop(),encodedBytes:e.encodedBodySize})),userAgent:navigator.userAgent};}''')
   r[f'{width}x{height}-{run}']=value
  page.close()
 b.close()
(out/'redesign-performance.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({k:{f:v for f,v in x.items() if f not in ['resources','userAgent']} for k,x in r.items()},indent=2))
