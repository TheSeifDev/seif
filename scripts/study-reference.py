from pathlib import Path
import json
from playwright.sync_api import sync_playwright

out=Path('docs/checks');out.mkdir(parents=True,exist_ok=True)
results={}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in [1440,390]:
        page=browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
        page.goto('https://7lf.vercel.app/',wait_until='domcontentloaded')
        page.wait_for_timeout(1800)
        skip=page.get_by_role('button',name='Skip intro',exact=True)
        if skip.count() and skip.is_visible(): skip.click()
        page.wait_for_timeout(800)
        top=page.evaluate("""() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,pins:[...document.querySelectorAll('.pin-spacer')].map(e=>({height:Math.round(e.offsetHeight),child:e.firstElementChild?.className})),sections:[...document.querySelectorAll('main section')].map(e=>({id:e.id,top:Math.round(e.getBoundingClientRect().top+scrollY),height:Math.round(e.offsetHeight)}))})""")
        process=next((s for s in top['sections'] if s['id']=='process'),None)
        states=[]
        if process:
            for fraction in [0,.35,.75,1]:
                page.evaluate('(y)=>scrollTo({top:y,behavior:"instant"})',process['top']+fraction*process['height'])
                page.wait_for_timeout(400)
                states.append(page.evaluate("""() => ({y:Math.round(scrollY),pinPosition:getComputedStyle(document.querySelector('.process__pin')).position,top:Math.round(document.querySelector('.process__pin').getBoundingClientRect().top),steps:[...document.querySelectorAll('.step')].map(e=>({opacity:getComputedStyle(e).opacity,numberTransform:getComputedStyle(e.querySelector('.step__num')).transform})),serviceTransform:getComputedStyle(document.querySelector('.svc__track')).transform})"""))
        results[str(width)]={'layout':top,'processStates':states}
        page.close()
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    page.goto('http://127.0.0.1:3000/',wait_until='networkidle');page.wait_for_timeout(900)
    results['currentBaseline']=page.evaluate("""async() => {let frames=[],tasks=[],last=performance.now();let po=new PerformanceObserver(l=>tasks.push(...l.getEntries().map(e=>e.duration)));po.observe({type:'longtask',buffered:true});for(let i=0;i<160;i++){await new Promise(requestAnimationFrame);const n=performance.now();frames.push(n-last);last=n;scrollTo({top:i*(document.documentElement.scrollHeight-innerHeight)/160,behavior:'instant'});}po.disconnect();frames.sort((a,b)=>a-b);return {frameCount:frames.length,meanFrame:frames.reduce((a,b)=>a+b,0)/frames.length,p95Frame:frames[Math.floor(frames.length*.95)],longTasks:tasks,pinCount:document.querySelectorAll('.pin-spacer').length,resources:performance.getEntriesByType('resource').filter(e=>e.initiatorType==='script').map(e=>({name:e.name.split('/').pop(),encodedBytes:e.encodedBodySize})),userAgent:navigator.userAgent};}""")
    browser.close()
(out/'reference-study.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({k:({'pins':v['layout']['pins'],'processStates':v['processStates']} if 'layout' in v else v) for k,v in results.items()},indent=2))
