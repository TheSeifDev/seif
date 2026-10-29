from pathlib import Path
import argparse,json,time
from playwright.sync_api import sync_playwright

args=argparse.ArgumentParser();args.add_argument('--three',action='store_true');args.add_argument('--loop',action='store_true');opts=args.parse_args()
out=Path('docs/checks');out.mkdir(parents=True,exist_ok=True);results={'errors':[],'widths':{}}

def mat(page,selector):
 return page.locator(selector).first.evaluate('(e)=>{let m=new DOMMatrix(getComputedStyle(e).transform);return {x:m.m41,y:m.m42,scaleX:m.a,scaleY:m.d}}')
def scroll(page,y):
 page.evaluate('async(y)=>{scrollTo({top:y,behavior:"instant"});for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);}',y)
def bounds(page,selector):
 return page.locator(selector).evaluate('(e)=>({start:Number(e.dataset.scrollStart),end:Number(e.dataset.scrollEnd),distance:Number(e.dataset.scrollDistance||0)})')

with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(1440,900),(1024,768),(768,900),(390,844),(320,740),(1440,650),(1440,760)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.on('pageerror',lambda e:results['errors'].append(str(e)))
  page.goto('http://127.0.0.1:3000/',wait_until='networkidle');page.wait_for_timeout(900)
  layout=page.evaluate('''()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,pins:document.querySelectorAll('.pin-spacer').length,blue:getComputedStyle(document.querySelector('.portfolio')).getPropertyValue('--accent').trim(),portraitFilter:getComputedStyle(document.querySelector('.hero-portrait')).filter,moreColumns:getComputedStyle(document.querySelector('.more-work-grid')).gridTemplateColumns,headingWidth:document.querySelector('#hero-title').getBoundingClientRect().width,heroHeight:document.querySelector('#home').getBoundingClientRect().height,projects:document.querySelectorAll('[data-project-slide]').length})''')
  assert layout['scrollWidth']==width,layout
  assert layout['blue']=='#49baf1' and layout['portraitFilter']=='none',layout
  suitable=width>=1024 and height>=760
  assert layout['pins']==(2 if suitable else 0),layout
  if width<801:
   toggle=page.locator('.menu-toggle');toggle.click();assert toggle.get_attribute('aria-expanded')=='true';page.keyboard.press('Escape');assert toggle.get_attribute('aria-expanded')=='false'
  if suitable:
   j=bounds(page,'.journey-pin-root');assert j['end']>j['start'] and j['start']>0,j
   states=[]
   for f in [0,.35,.7,1]:
    scroll(page,j['start']+f*(j['end']-j['start']))
    states.append(page.locator('.journey-stage').evaluate('(e)=>({top:e.getBoundingClientRect().top,panels:[...e.querySelectorAll("[data-journey-panel]")].map(x=>new DOMMatrix(getComputedStyle(x).transform).m42)})'))
   assert max(s['top'] for s in states[:3])-min(s['top'] for s in states[:3])<2,states
   assert states[0]['panels']!=states[2]['panels'],states
   scroll(page,j['end']+100);release=page.locator('.journey-stage').evaluate('(e)=>getComputedStyle(e).position');assert release!='fixed',release
   page.get_by_role('button',name='Show leadership stage').click();page.wait_for_timeout(150)
   panels=page.locator('[data-journey-panel]').evaluate_all('(es)=>es.map(e=>({inert:e.inert,hidden:e.getAttribute("aria-hidden")}))');assert panels==[{"inert":True,"hidden":"true"},{"inert":True,"hidden":"true"},{"inert":False,"hidden":"false"}],panels
   layout['journeyAccessiblePanels']=panels
   h=bounds(page,'#featured-horizontal');assert h['distance']>0 and abs((h['end']-h['start'])-h['distance'])<2,h
   scroll(page,h['start']);a=mat(page,'.featured-track')
   scroll(page,(h['start']+h['end'])/2);middle=mat(page,'.featured-track')
   scroll(page,h['end']);end=mat(page,'.featured-track')
   assert abs(a['x'])<2 and abs(end['x']+h['distance'])<2 and end['x']<middle['x']<a['x'],[h,a,middle,end]
   scroll(page,h['end']+120);assert page.locator('.featured-viewport').evaluate('(e)=>getComputedStyle(e).position')!='fixed'
   scroll(page,0);assert abs(mat(page,'.featured-track')['x'])<2
   # Browser-native focus into an offscreen slide must advance the pinned story.
   link=page.locator('[data-project-slide]').nth(2).locator('a').first;link.focus();page.wait_for_timeout(250)
   focus=link.evaluate('(e)=>({rect:e.getBoundingClientRect().toJSON(),active:document.activeElement===e})');assert focus['active'] and 0<=focus['rect']['x']<=width and focus['rect']['bottom']<=height+2,focus
   layout.update(journeyBounds=j,journeyStates=states,horizontalBounds=h,horizontalTransforms=[a,middle,end],focus=focus)
  # Confirm scrub text has a true intermediate position, not a timed reveal.
  top=page.locator('#about').evaluate('(e)=>e.getBoundingClientRect().top+scrollY')
  scroll(page,max(0,top-height*.82));textStart=mat(page,'[data-about-line]')
  scroll(page,max(0,top-height*.5));textMid=mat(page,'[data-about-line]')
  scroll(page,max(0,top-height*.2));textEnd=mat(page,'[data-about-line]')
  assert textStart['y']>textMid['y']>textEnd['y']-.1,[textStart,textMid,textEnd]
  layout['aboutText']=[textStart,textMid,textEnd]
  results['widths'][f'{width}x{height}']=layout
  (out/'redesign-browser-results.json').write_text(json.dumps(results,indent=2)+'\n')
  if width==1440 and height==900:
   scroll(page,page.locator('#skills').evaluate('(e)=>e.getBoundingClientRect().top+scrollY+140'))
   pos=lambda:page.locator('[data-skills-track]').evaluate_all('(es)=>es.map(e=>new DOMMatrix(getComputedStyle(e).transform).m41)')
   x=pos();page.wait_for_timeout(900);y=pos();delta=[a-b for a,b in zip(y,x)];assert delta[0]<0 and delta[1]>0 and delta[2]<0,delta
   results['marqueeDirections']=delta
   pause=page.locator('#skills button');pause.click();x=pos();page.wait_for_timeout(500);assert all(abs(a-c)<.1 for a,c in zip(x,pos()));pause.click()
   if opts.loop:
    wrapped=[False]*3;old=pos();deadline=time.monotonic()+67
    print('Waiting one real seamless-loop observation...',flush=True)
    while time.monotonic()<deadline and not all(wrapped):
     page.wait_for_timeout(1000);new=pos()
     for i,(a,c) in enumerate(zip(old,new)):
      if (i%2==0 and c-a>100)or(i%2==1 and c-a<-100):wrapped[i]=True
     old=new
    assert all(wrapped),wrapped;results['marqueeFullLoop']=wrapped
   page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(200)
   reduced=page.evaluate('''()=>({pins:document.querySelectorAll('.pin-spacer').length,tracks:[...document.querySelectorAll('[data-skills-track]')].map(e=>getComputedStyle(e).transform),clones:[...document.querySelectorAll('.is-duplicate')].map(e=>getComputedStyle(e).display),overflow:document.documentElement.scrollWidth})''')
   assert reduced['pins']==0 and reduced['tracks']==['none']*3 and reduced['clones']==['none']*3 and reduced['overflow']==width,reduced;results['reducedMotion']=reduced
  (out/'redesign-browser-results.json').write_text(json.dumps(results,indent=2)+'\n')
  page.close();print(f'{width}x{height} core choreography passed',flush=True)
 assert not results['errors'],results['errors']
 b.close()
print('Core redesign checks passed; Three checks run separately after core stability.')
