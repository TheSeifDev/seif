#!/usr/bin/env python3
"""Focused About hero/Introduction motion and paper-surface regression checks."""
import json
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("docs/checks")
SHOTS = OUT / "shots"
SHOTS.mkdir(parents=True, exist_ok=True)
results = {"viewports": {}, "reduced": {}, "no_js": {}, "navigation": {}, "failures": []}


def check(ok, message):
    if not ok:
        results["failures"].append(message)
        print("FAIL:", message, flush=True)


def scroll(page, y):
    page.evaluate("y => scrollTo(0,y)", y)
    page.wait_for_timeout(1000)


def top(page, selector):
    return page.locator(selector).evaluate("e => e.getBoundingClientRect().top + scrollY")


def state(page):
    return page.evaluate("""() => {
      const y = s => { const t=getComputedStyle(document.querySelector(s)).transform; return t==='none'?0:new DOMMatrix(t).m42; };
      return {copyY:y('[data-about-hero-copy]'),artY:y('[data-about-hero-art]'),
        headingY:y('#introduction-heading'),summaryY:y('[data-about-intro-summary]'),
        summaryOpacity:+getComputedStyle(document.querySelector('[data-about-intro-summary]')).opacity};
    }""")


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which("chromium"))
    for width, height in [(1440,900),(1280,760),(1024,768),(768,1024),(390,844)]:
        key=f"{width}x{height}"
        ctx=browser.new_context(viewport={"width":width,"height":height})
        page=ctx.new_page()
        errors=[]
        page.on("pageerror",lambda e: errors.append(str(e)))
        page.goto(BASE+"/about",wait_until="networkidle")
        page.wait_for_timeout(600)
        info=page.evaluate("""() => ({overflow:document.documentElement.scrollWidth-innerWidth,
          h1Count:document.querySelectorAll('h1').length,h1Text:document.querySelector('h1').textContent,
          heroOpacity:+getComputedStyle(document.querySelector('[data-about-hero-copy]')).opacity,
          panels:['#introduction','#capabilities'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {selector:s,width:r.width,left:r.left,right:innerWidth-r.right};}),
          facts:document.querySelectorAll('[data-about-intro-facts] dd').length,
          skills:document.querySelectorAll('[data-cap-skill]').length,
          factOverflow:[...document.querySelectorAll('[data-about-intro-facts] dt,[data-about-intro-facts] dd')].map(e=>e.scrollWidth-e.clientWidth),
          triggers:window.__motion?.triggers() || [],pins:window.__motion?.pins() || 0})""")
        expected=min(1280,width-(64 if width>=640 else 24))
        for panel in info["panels"]:
            check(abs(panel["width"]-expected)<2,f"{key} {panel['selector']}: wrong background width {panel}")
            check(abs(panel["left"]-panel["right"])<2,f"{key}: unequal panel gutters {panel}")
        check(info["overflow"]<=0,f"{key}: page overflow {info['overflow']}")
        check(info["h1Count"]==1 and "whole product" in info["h1Text"],f"{key}: hero heading missing")
        check(info["heroOpacity"]==1,f"{key}: initial hero copy hidden")
        check(info["facts"]==4 and info["skills"]==93,f"{key}: missing facts/skills")
        check(max(info["factOverflow"])<=1,f"{key}: clipped fact labels {info['factOverflow']}")
        for name in ["about-page-hero-scroll","about-page-introduction-heading","about-page-introduction-reveal","about-page-introduction-portrait"]:
            check(info["triggers"].count(name)==1,f"{key}: missing/duplicate {name}")
        check(info["pins"]==(1 if width>=1024 and height>=760 else 0),f"{key}: unexpected new pins")
        initial=state(page)
        scroll(page,300)
        moved=state(page)
        scroll(page,0)
        returned=state(page)
        check(moved["copyY"]<initial["copyY"]-2 and moved["artY"]<initial["artY"]-2,f"{key}: hero not scroll-linked")
        check(abs(returned["copyY"]-initial["copyY"])<1,f"{key}: hero not reversible")
        intro_top=top(page,"#introduction")
        scroll(page,intro_top-height*.95)
        before=state(page)
        scroll(page,intro_top+250)
        after=state(page)
        scroll(page,intro_top-height*.95)
        reverse=state(page)
        check(before["headingY"]>after["headingY"]+15,f"{key}: intro heading does not rise")
        check(after["summaryY"]<before["summaryY"]-2,f"{key}: intro copy not scrubbed")
        check(abs(reverse["headingY"]-before["headingY"])<2,f"{key}: intro not reversible")
        info["heroStates"]={"initial":initial,"scrolled":moved,"returned":returned}
        info["introStates"]={"before":before,"after":after,"reverse":reverse}
        info["errors"]=errors
        check(not errors,f"{key}: console errors {errors[:2]}")
        results["viewports"][key]=info
        if width in (1440,390):
            scroll(page,0)
            page.screenshot(path=str(SHOTS/f"about-top-{width}-hero.png"))
            scroll(page,intro_top+40)
            page.screenshot(path=str(SHOTS/f"about-top-{width}-introduction.png"))
        if width==1440:
            scroll(page,0)
            page.click("header a[href='/']")
            page.wait_for_url(BASE+"/")
            page.wait_for_timeout(700)
            leaked=page.evaluate("() => (window.__motion?.triggers()||[]).filter(id=>id?.startsWith('about-page-') || id?.startsWith('about-reveal-'))")
            check(not leaked,f"About triggers leaked: {leaked}")
            page.click("header a[href='/about']")
            page.wait_for_url(BASE+"/about")
            page.wait_for_timeout(700)
            again=page.evaluate("() => window.__motion?.triggers()||[]")
            check(again.count("about-page-hero-scroll")==1,"duplicate hero trigger after navigation")
            page.emulate_media(reduced_motion="reduce")
            page.wait_for_timeout(400)
            reduced_triggers=page.evaluate("() => (window.__motion?.triggers()||[]).filter(id=>id?.startsWith('about-'))")
            check(not reduced_triggers,"live reduced-motion change did not clean up About")
            results["navigation"]={"leaked":leaked,"reducedTriggers":reduced_triggers}
        ctx.close()
        print("Checked",key,flush=True)

    for key,options in [("reduced",{"reduced_motion":"reduce"}),("no_js",{"java_script_enabled":False})]:
        ctx=browser.new_context(viewport={"width":390,"height":844},**options)
        page=ctx.new_page()
        page.goto(BASE+"/about",wait_until="networkidle")
        info=page.evaluate("""() => ({heroOpacity:+getComputedStyle(document.querySelector('[data-about-hero-copy]')).opacity,
          summaryOpacity:+getComputedStyle(document.querySelector('[data-about-intro-summary]')).opacity,
          skills:document.querySelectorAll('[data-cap-skill]').length,facts:document.querySelectorAll('[data-about-intro-facts] dd').length,
          overflow:document.documentElement.scrollWidth-innerWidth,triggers:window.__motion?.triggers()||[]})""")
        check(info["heroOpacity"]==1 and info["summaryOpacity"]==1,f"{key}: hidden static content")
        check(info["skills"]==93 and info["facts"]==4 and info["overflow"]<=0,f"{key}: incomplete static layout")
        check(not any(t and t.startswith("about-") for t in info["triggers"]),f"{key}: unexpected motion")
        results[key]=info
        ctx.close()
    browser.close()

(OUT/"about-top-results.json").write_text(json.dumps(results,indent=2)+"\n")
print(json.dumps({"failures":results["failures"]},indent=2))
raise SystemExit(1 if results["failures"] else 0)
