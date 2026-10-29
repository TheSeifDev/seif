from pathlib import Path
import json
from playwright.sync_api import sync_playwright
out=Path('docs/checks');r={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=b.new_page(viewport={'width':1440,'height':900},device_scale_factor=2)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:3000/',wait_until='networkidle');page.wait_for_function('document.querySelector(".moon-scene").dataset.renderer==="webgl"',timeout=15000)
 snap=lambda:page.locator('.moon-scene canvas').evaluate('(e)=>({width:e.width,height:e.height,frames:Number(e.dataset.frameCount),drawCalls:Number(e.dataset.drawCalls),triangles:Number(e.dataset.triangles),dpr:Number(e.dataset.dpr),progress:Number(e.dataset.progress)})')
 a=snap();assert a['width']<=640 and a['height']<=640 and a['dpr']<=1.5 and a['drawCalls']<=1 and a['triangles']<=2500,a
 page.wait_for_timeout(700);idle=snap();assert idle['frames']==a['frames'],[a,idle]
 page.evaluate('async()=>{scrollTo({top:220,behavior:"instant"});for(let i=0;i<4;i++)await new Promise(requestAnimationFrame)}');moving=snap();assert moving['frames']>a['frames'] and moving['progress']>a['progress'],[a,moving]
 page.evaluate('async()=>{scrollTo({top:1800,behavior:"instant"});for(let i=0;i<4;i++)await new Promise(requestAnimationFrame)}');offscreen=snap();page.wait_for_timeout(700);assert snap()['frames']==offscreen['frames']
 page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(300)
 page.locator('.moon-scene canvas').evaluate('(e)=>e.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext()');page.wait_for_function('document.querySelector(".moon-scene").dataset.renderer==="fallback"');page.wait_for_function('getComputedStyle(document.querySelector(".moon-css")).opacity==="1"')
 r['desktopWebGL']={'initial':a,'idle':idle,'scroll':moving,'offscreen':offscreen,'contextLostFallback':True,'pageErrors':errors};assert not errors,errors
 page.close()
 for name,width,reduce,save in [('mobile',390,False,False),('reduced',1440,True,False),('saveData',1440,False,True),('lowMemory',1440,False,False)]:
  page=b.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
  if reduce:page.emulate_media(reduced_motion='reduce')
  if save:page.add_init_script('Object.defineProperty(navigator,"connection",{value:{saveData:true}})')
  if name=='lowMemory':page.add_init_script('Object.defineProperty(navigator,"deviceMemory",{value:2})')
  page.goto('http://127.0.0.1:3000/',wait_until='networkidle');page.wait_for_timeout(800)
  data=page.locator('.moon-scene').evaluate('(e)=>({mode:e.dataset.renderer,canvases:e.querySelectorAll("canvas").length,fallbackOpacity:getComputedStyle(e.querySelector(".moon-css")).opacity})')
  assert data=={'mode':'fallback','canvases':0,'fallbackOpacity':'1'},[name,data];r[name]=data;page.close()
 b.close()
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-webgl'])
 page=b.new_page(viewport={'width':1440,'height':900});page.goto('http://127.0.0.1:3000/',wait_until='networkidle');page.wait_for_timeout(1200)
 r['noWebGL']=page.locator('.moon-scene').evaluate('(e)=>({mode:e.dataset.renderer,canvases:e.querySelectorAll("canvas").length})');assert r['noWebGL']=={'mode':'fallback','canvases':0},r['noWebGL'];b.close()
(out/'moon-results.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
