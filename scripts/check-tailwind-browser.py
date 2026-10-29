"""Browser checks for the actual Tailwind Home, not source-only assertions."""
from pathlib import Path
import argparse
import hashlib
import json
import time
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / "docs" / "checks"
out.mkdir(parents=True, exist_ok=True)
results = {"responsive": {}, "errors": []}
parser = argparse.ArgumentParser()
parser.add_argument('--reuse-loop', action='store_true', help='Reuse a completed real-loop observation only when its source fingerprint matches')
args = parser.parse_args()
fingerprint = hashlib.sha256(b''.join((root / f).read_bytes() for f in ['components/home/skills-section.tsx','lib/content/skills.ts','lib/ui/layout.ts','app/globals.css'])).hexdigest()
base = "http://127.0.0.1:3000"
positions = """() => [...document.querySelectorAll('[data-skills-track]')].map(e => new DOMMatrix(getComputedStyle(e).transform).m41)"""
color_state = """() => ({accent:getComputedStyle(document.querySelector('.portfolio')).getPropertyValue('--accent').trim(), title:getComputedStyle(document.querySelector('.hero-name-accent')).color, mix:parseFloat(getComputedStyle(document.querySelector('.portfolio')).getPropertyValue('--identity-mix')),contact:getComputedStyle(document.querySelector('#contact')).getPropertyValue('--accent').trim(),portraitFilter:getComputedStyle(document.querySelector('.hero-portrait')).filter})"""

def instant_scroll(page, y):
    page.evaluate("y=>window.scrollTo({top:y,behavior:'instant'})", y)
    page.wait_for_timeout(1300)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    for width in (1440, 768, 390, 320):
        page = browser.new_page(viewport={"width": width, "height": 900})
        page.on("pageerror", lambda e: results["errors"].append(str(e)))
        page.goto(base, wait_until="networkidle", timeout=60000)
        page.wait_for_selector('.portfolio[data-motion="ready"]')
        page.wait_for_timeout(1700)
        layout = page.evaluate("""() => {
          const names=['.nav-shell','.hero-inner','#about > div','#stats > div','#projects > div','#more-projects > div','#skills > div','#process > div','.contact-inner','.site-footer > div'];
          const frames=names.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {selector:s,x:r.x,width:r.width}});
          const title=document.querySelector('.hero h1').getBoundingClientRect();
          const word=document.querySelectorAll('.hero-word')[1].getBoundingClientRect();
          return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,frames,headingClipped:word.right>innerWidth+1,heroHeight:document.querySelector('.hero').offsetHeight,moreColumns:getComputedStyle(document.querySelector('.more-work-grid')).gridTemplateColumns,projectCount:document.querySelectorAll('[data-card]').length,skillGroups:document.querySelectorAll('.skills-group').length,images:[...document.images].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&(!e.complete||!e.naturalWidth)}).map(e=>e.src)};
        }""")
        assert layout["scrollWidth"] <= width + 1, layout
        assert not layout["headingClipped"], layout
        assert layout["projectCount"] == 5 and layout["skillGroups"] == 15, layout
        assert not layout["images"], layout
        xs = [f["x"] for f in layout["frames"]]
        assert max(xs)-min(xs) < 1.1, layout
        assert max(f["width"] for f in layout["frames"])-min(f["width"] for f in layout["frames"]) < 1.1, layout
        results["responsive"][str(width)] = layout
        page.screenshot(path=str(out / f"tailwind-home-{width}.png"))
        if width < 801:
            toggle = page.locator('.menu-toggle')
            toggle.click()
            assert toggle.get_attribute("aria-expanded") == "true"
            page.keyboard.press("Escape")
            assert toggle.get_attribute("aria-expanded") == "false"
            toggle.click()
            page.locator('#mobile-nav a[href="#projects"]').click()
            assert toggle.get_attribute("aria-expanded") == "false"
            results["responsive"][str(width)]["mobileMenu"] = "open/escape/link-close passed"
        if width == 1440:
            results["identityStart"] = page.evaluate(color_state)
            mid_y = page.locator('#projects').evaluate("e=>e.offsetTop+250")
            instant_scroll(page, mid_y)
            results["identityMiddle"] = page.evaluate(color_state)
            end_y = page.locator('#process').evaluate("e=>e.offsetTop+e.offsetHeight-innerHeight*.65+50")
            instant_scroll(page, end_y)
            results["identityEnd"] = page.evaluate(color_state)
            assert results["identityMiddle"]["mix"] > .1
            assert results["identityEnd"]["mix"] > .98
            assert results["identityEnd"]["contact"] == "#49baf1"
            assert results["identityEnd"]["portraitFilter"] == "none"
            instant_scroll(page, 0)
            results["identityReverse"] = page.evaluate(color_state)
            assert results["identityReverse"]["mix"] < .01
            assert results["identityReverse"]["title"] == results["identityStart"]["title"]
            instant_scroll(page, page.locator('#skills').evaluate("e=>e.offsetTop+140"))
            page.mouse.move(0, 0)
            x1 = page.evaluate(positions)
            page.wait_for_timeout(900)
            x2 = page.evaluate(positions)
            deltas = [b-a for a,b in zip(x1,x2)]
            assert deltas[0] < -5 and deltas[1] > 5 and deltas[2] < -5, deltas
            results["marqueeDirections"] = deltas
            page.get_by_role("button", name="Pause skills marquee animation").click()
            paused1 = page.evaluate(positions)
            page.wait_for_timeout(700)
            paused2 = page.evaluate(positions)
            assert max(abs(b-a) for a,b in zip(paused1,paused2)) < .1
            results["marqueeManualPause"] = True
            page.get_by_role("button", name="Resume skills marquee animation").click()
            page.mouse.move(0, 0)
            page.locator('.skills-marquee-viewport').first.hover()
            page.wait_for_timeout(100)
            hover1 = page.evaluate(positions)
            page.wait_for_timeout(700)
            hover2 = page.evaluate(positions)
            assert max(abs(b-a) for a,b in zip(hover1,hover2)) < .1
            results["marqueeHoverPause"] = True
            page.mouse.move(0,0)
            page.evaluate("document.activeElement.blur()")
            sizes = page.evaluate("""() => [...document.querySelectorAll('[data-skills-track]')].map(t=>{let [a,b]=t.children;let ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();return {segment:ar.width,duplicate:br.width,gap:br.left-ar.right,duration:Math.min(65,Math.max(40,ar.width/31))}})""")
            assert all(abs(s["segment"]-s["duplicate"]) < .1 and abs(s["gap"]) < .1 for s in sizes), sizes
            results["marqueeSeamGeometry"] = sizes
            if args.reuse_loop:
                recorded = json.loads((out/'marquee-real-loop.json').read_text())
                assert recorded['sourceFingerprint'] == fingerprint and all(recorded['wraps']), recorded
                results['marqueeRealLoop'] = {**recorded, 'reusedMatchingSource':True}
            else:
                loop_samples = []
                deadline = time.monotonic() + max(s["duration"] for s in sizes) + 2
                previous = page.evaluate(positions)
                wraps = [False,False,False]
                print('Checking one full real marquee loop...', flush=True)
                while time.monotonic() < deadline:
                    page.wait_for_timeout(1000)
                    now = page.evaluate(positions)
                    for i,(a,b) in enumerate(zip(previous,now)):
                        if (i%2==0 and b-a>100) or (i%2==1 and b-a < -100): wraps[i]=True
                    previous=now
                    loop_samples.append(now)
                    if len(loop_samples)%10==0: print(f'Loop progress: {len(loop_samples)}s; wraps={wraps}',flush=True)
                assert all(wraps), {"wraps":wraps,"sizes":sizes}
                results["marqueeRealLoop"]={"wraps":wraps,"sampleCount":len(loop_samples),'sourceFingerprint':fingerprint}
                (out/'marquee-real-loop.json').write_text(json.dumps(results['marqueeRealLoop'],indent=2)+'\n')
            page.locator('#skills').screenshot(path=str(out/'tailwind-skills-desktop.png'))
            page.emulate_media(reduced_motion="reduce")
            page.wait_for_timeout(700)
            reduced = page.evaluate("""() => ({motion:document.querySelector('.skills-marquee').dataset.motion,tracks:[...document.querySelectorAll('[data-skills-track]')].map(e=>getComputedStyle(e).transform),copies:[...document.querySelectorAll('.is-duplicate')].map(e=>getComputedStyle(e).display),pauseDisabled:document.querySelector('.skills-motion-toggle').disabled,filter:getComputedStyle(document.querySelector('.hero-portrait')).filter})""")
            assert reduced["motion"] == "static"
            assert all(t=="none" for t in reduced["tracks"])
            assert all(d=="none" for d in reduced["copies"])
            assert reduced["pauseDisabled"] and reduced["filter"]=="none"
            results["reducedMotion"] = reduced
            page.emulate_media(reduced_motion="no-preference")
            page.wait_for_timeout(500)
            instant_scroll(page,page.locator('#projects').evaluate('e=>e.offsetTop-120'))
            page.locator('#projects').screenshot(path=str(out/'tailwind-projects-desktop.png'))
            instant_scroll(page,page.locator('#contact').evaluate('e=>e.offsetTop-100'))
            page.screenshot(path=str(out/'tailwind-contact-desktop.png'))
        (out/'tailwind-browser-results.json').write_text(json.dumps(results,indent=2)+'\n')
        page.close()
        print(f'{width}px layout and interactions passed', flush=True)
    browser.close()
assert not results["errors"], results["errors"]
(out/'tailwind-browser-results.json').write_text(json.dumps(results,indent=2)+'\n')
print('Tailwind browser verification passed', flush=True)
