#!/usr/bin/env python3
"""Check Home Hero shared-frame alignment without changing accepted composition."""
import json
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path('docs/checks')
SHOTS = OUT/'shots'
SHOTS.mkdir(parents=True, exist_ok=True)
results = {'viewports':{}, 'static':{}, 'failures':[]}


def check(ok, message):
    if not ok:
        results['failures'].append(message)
        print('FAIL:',message,flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which('chromium'))
    for w,h in [(1920,1080),(1440,900),(1280,760),(1024,768),(768,1024),(390,844)]:
        key=f'{w}x{h}'
        page=browser.new_page(viewport={'width':w,'height':h})
        page.goto('http://127.0.0.1:3000/',wait_until='networkidle')
        page.wait_for_function("() => document.querySelector('[data-scene=hero]')?.dataset.entrance==='complete'")
        page.wait_for_timeout(200)
        info=page.evaluate("""() => {
          const rect=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,display:getComputedStyle(e).display};};
          const f=document.querySelector('[data-hero-frame]'),style=getComputedStyle(f);
          const image=document.querySelector('[data-hero-portrait] img');
          return {frame:rect('[data-hero-frame]'),content:rect('[data-hero-content]'),card:rect('[data-hero-card]'),label:rect('[data-hero-frame]>p'),portrait:rect('[data-hero-portrait]'),
            paddingLeft:parseFloat(style.paddingLeft),paddingRight:parseFloat(style.paddingRight),
            overflow:document.documentElement.scrollWidth-innerWidth,fit:getComputedStyle(image).objectFit,
            imageAlt:image.alt,headings:document.querySelectorAll('h1').length,heroText:document.querySelector('#hero-title').textContent,
            hrefs:[...document.querySelectorAll('[data-hero-actions] a')].map(a=>a.getAttribute('href')),
            triggers:window.__motion?.triggers()||[],actionsOpacity:+getComputedStyle(document.querySelector('[data-hero-actions]')).opacity};
        }""")
        check(abs(info['content']['left']-(info['frame']['left']+info['paddingLeft']))<1,f'{key}: left content misaligned')
        check(info['overflow']<=0,f'{key}: page overflow')
        check(info['headings']==1 and 'Seif' in info['heroText'] and 'Ayman' in info['heroText'],f'{key}: changed/missing identity')
        check(info['fit']=='contain' and info['imageAlt']=='Seif Ayman',f'{key}: portrait changed')
        check('/projects' in info['hrefs'] and len(info['hrefs'])==2,f'{key}: action links changed')
        check(info['actionsOpacity']==1,f'{key}: actions hidden after entrance')
        if w>=1024:
            edge=info['frame']['right']-info['paddingRight']
            check(abs(info['card']['right']-edge)<1 and abs(info['label']['right']-edge)<1,f'{key}: right data detached from frame')
            check(info['card']['bottom']<=h and info['card']['left']>=info['content']['right'],f'{key}: card clips/overlaps copy')
            check(abs(info['portrait']['width']/info['portrait']['height']-.75)<.01,f'{key}: portrait aspect changed')
            page.evaluate('scrollTo(0,250)');page.wait_for_timeout(700)
            opacity=page.locator('[data-hero-card]').evaluate('e=>+getComputedStyle(e).opacity')
            page.evaluate('scrollTo(0,0)');page.wait_for_timeout(700)
            returned=page.locator('[data-hero-card]').evaluate('e=>+getComputedStyle(e).opacity')
            check(opacity<1 and returned>.99,f'{key}: existing overlap no longer reverses')
            if w in [1920,1440]:page.screenshot(path=str(SHOTS/f'home-aligned-{w}.png'))
        else:
            check(info['card']['display']=='none' and info['label']['display']=='none',f'{key}: mobile side data unexpectedly visible')
        results['viewports'][key]=info
        page.close();print('Checked',key,flush=True)
    for key,options in [('reduced',{'reduced_motion':'reduce'}),('no_js',{'java_script_enabled':False})]:
        page=browser.new_page(viewport={'width':390,'height':844},**options)
        page.goto('http://127.0.0.1:3000/',wait_until='networkidle')
        info=page.evaluate("""() => ({overflow:document.documentElement.scrollWidth-innerWidth,opacity:+getComputedStyle(document.querySelector('[data-hero-actions]')).opacity,links:document.querySelectorAll('[data-hero-actions] a').length})""")
        check(info['overflow']<=0 and info['opacity']==1 and info['links']==2,f'{key}: static/mobile content broken')
        results['static'][key]=info;page.close()
    browser.close()
(OUT/'home-alignment-results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'failures':results['failures']},indent=2))
raise SystemExit(1 if results['failures'] else 0)
