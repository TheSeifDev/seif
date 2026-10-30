"""Focused real-browser checks for the visual-refinement pass on production :3000."""
import json
import shutil
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("docs/checks")
SHOTS = OUT / "shots"
SHOTS.mkdir(parents=True, exist_ok=True)
results = {"desktop": {}, "responsive": {}, "reduced": {}, "touch": {}, "navigation": {}, "failures": []}

INSTRUMENT = """(() => {
  const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
  const registry = new Map();
  function key(target, type) {
    if (target === document && ['pointermove','pointerover','pointerout'].includes(type)) return 'document:' + type;
    if (target instanceof Element && target.hasAttribute('data-site-footer') && ['pointermove','pointerleave'].includes(type)) return 'footer:' + type;
    if (target instanceof Element && target.hasAttribute('data-portrait-shield') && type.startsWith('pointer')) return 'shield:' + type;
    return null;
  }
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    const k=key(this,type); if(k) { if(!registry.has(k)) registry.set(k,new Set()); registry.get(k).add(listener); }
    return add.call(this,type,listener,options);
  };
  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    const k=key(this,type); if(k) registry.get(k)?.delete(listener);
    return remove.call(this,type,listener,options);
  };
  window.__listenerCounts = () => Object.fromEntries([...registry].map(([k,v])=>[k,v.size]));
  window.__layoutShift = 0;
  new PerformanceObserver(list => { for (const e of list.getEntries()) if(!e.hadRecentInput) window.__layoutShift += e.value; }).observe({type:'layout-shift',buffered:true});
})()"""


def fail(message):
    results["failures"].append(message)
    print("FAIL:", message)


def open_home(ctx):
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_function("""() => {
      const hero = document.querySelector('[data-scene=hero]');
      const actions = document.querySelector('[data-hero-actions]');
      return hero?.dataset.entrance === 'complete' && actions && getComputedStyle(actions).opacity === '1';
    }""", timeout=10000)
    return page, errors


def scroll(page, y):
    page.evaluate("y=>scrollTo(0,y)", y)
    page.wait_for_timeout(1000)


def position(page, selector):
    return page.evaluate("s=>document.querySelector(s).getBoundingClientRect().top+scrollY", selector)


def counts(page):
    return page.evaluate("window.__listenerCounts?.()")


def mode(page):
    return page.locator("[data-cursor-follower]").get_attribute("data-mode")


with sync_playwright() as p:
    exe = shutil.which("chromium") or shutil.which("chromium-browser")
    browser = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    ctx.add_init_script(INSTRUMENT)
    page, errors = open_home(ctx)
    desktop = results["desktop"]
    desktop["hero"] = page.evaluate("""() => ({entrance:document.querySelector('[data-scene=hero]').dataset.entrance,
      actions:getComputedStyle(document.querySelector('[data-hero-actions]')).opacity,
      mask:getComputedStyle(document.querySelector('[data-hero-portrait-reveal]')).clipPath,
      originalFilter:getComputedStyle(document.querySelector('[data-portrait-shield] img')).filter,
      fit:getComputedStyle(document.querySelector('[data-portrait-shield] img')).objectFit,
      cls:window.__layoutShift})""")
    if desktop["hero"]["entrance"] != "complete" or desktop["hero"]["actions"] != "1": fail("Hero entrance incomplete or CTA hidden")
    if desktop["hero"]["originalFilter"] != "none" or desktop["hero"]["fit"] != "contain": fail("Original portrait changed")
    if desktop["hero"]["cls"] > 0.05: fail(f"Unexpected Hero layout shifts {desktop['hero']['cls']}")

    shield = page.locator("[data-portrait-shield]")
    box = shield.bounding_box()
    page.mouse.move(box["x"] + box["width"] * .45, box["y"] + box["height"] * .45)
    page.wait_for_timeout(350)
    first = page.locator("[data-portrait-shield] radialGradient").get_attribute("cx")
    page.mouse.move(box["x"] + box["width"] * .65, box["y"] + box["height"] * .6)
    page.wait_for_timeout(350)
    second = page.locator("[data-portrait-shield] radialGradient").get_attribute("cx")
    desktop["shield"] = {"active": shield.get_attribute("data-active"), "tracking": shield.get_attribute("data-tracking"), "cx": [first, second], "energy": shield.evaluate("e=>e.style.getPropertyValue('--shield-energy')")}
    if first == second or desktop["shield"]["active"] != "true": fail("Shield pointer-local light did not respond")
    page.screenshot(path=str(SHOTS / "refinement-portrait-hover.png"))
    page.mouse.move(30, 85)
    page.wait_for_timeout(350)
    desktop["shield"]["after_leave"] = shield.get_attribute("data-active")
    if desktop["shield"]["after_leave"] != "false": fail("Shield did not leave smoothly")
    desktop["pointer_events"] = page.locator("[data-cursor-follower]").evaluate("e=>getComputedStyle(e).pointerEvents")
    if desktop["pointer_events"] != "none": fail("Cursor blocks pointer events")

    cursor_layers = page.locator("[data-cursor-follower] > span")
    desktop["cursor_light"] = {
        "ambient_px": cursor_layers.nth(0).evaluate("e=>getComputedStyle(e).width"),
        "core_px": cursor_layers.nth(1).evaluate("e=>getComputedStyle(e).width"),
    }
    if float(desktop["cursor_light"]["ambient_px"].replace("px", "")) > 500:
        fail("Cursor ambient spotlight is too large")
    if float(desktop["cursor_light"]["core_px"].replace("px", "")) > 110:
        fail("Cursor core spotlight is too large")

    cta = page.locator("[data-magnetic=true]").first
    cbox = cta.bounding_box()
    page.mouse.move(cbox["x"] + cbox["width"] * .8, cbox["y"] + cbox["height"] * .6)
    page.wait_for_timeout(250)
    desktop["magnetic"] = {"translate": cta.evaluate("e=>getComputedStyle(e).translate"), "mode": mode(page)}
    if desktop["magnetic"]["translate"] == "none": fail("Selected CTA magnetic movement missing")
    if desktop["magnetic"]["mode"] != "link": fail("CTA cursor mode incorrect")
    page.keyboard.press("Tab")
    page.wait_for_timeout(50)
    desktop["keyboard_cursor_opacity"] = page.locator("[data-cursor-follower]").evaluate("e=>getComputedStyle(e).opacity")
    if desktop["keyboard_cursor_opacity"] != "0": fail("Keyboard interaction did not hide cursor")
    page.mouse.move(25, 85)
    page.wait_for_timeout(250)
    desktop["magnetic"]["after_leave"] = cta.evaluate("e=>getComputedStyle(e).translate")
    if desktop["magnetic"]["after_leave"] != "none": fail("CTA magnetic transform not restored")

    scroll(page, position(page, "[data-site-footer]") + 40)
    grain = page.locator("[data-footer-grain]")
    grain_root = page.locator("[data-footer-grain-interaction]")
    grain_reveal = page.locator("[data-footer-grain-reveal]")
    grain_box = grain_root.bounding_box()
    page.mouse.move(grain_box["x"] + grain_box["width"] * .35, grain_box["y"] + grain_box["height"] * .35)
    page.wait_for_timeout(120)
    first_reveal = grain_root.evaluate("e=>[e.style.getPropertyValue('--grain-x'),e.style.getPropertyValue('--grain-y')]")
    page.mouse.move(grain_box["x"] + grain_box["width"] * .65, grain_box["y"] + grain_box["height"] * .58)
    page.wait_for_timeout(360)
    second_reveal = grain_root.evaluate("e=>[e.style.getPropertyValue('--grain-x'),e.style.getPropertyValue('--grain-y')]")
    reveal_opacity = grain_reveal.evaluate("e=>getComputedStyle(e).opacity")
    texture_response = page.request.get(BASE + "/images/footer-grain.svg")
    desktop["footer_grain"] = {
        "animation": grain.evaluate("e=>getComputedStyle(e).animationName"),
        "duration": grain.evaluate("e=>getComputedStyle(e).animationDuration"),
        "opacity": grain.evaluate("e=>getComputedStyle(e).opacity"),
        "tracking": grain_root.get_attribute("data-tracking"),
        "enabled": grain_root.get_attribute("data-enabled"),
        "reveal_opacity": reveal_opacity,
        "reveal_coordinates": [first_reveal, second_reveal],
        "texture_url": grain.evaluate("e=>getComputedStyle(e).backgroundImage.includes('footer-grain.svg')"),
        "background_size": grain.evaluate("e=>getComputedStyle(e).backgroundSize"),
        "background_repeat": grain.evaluate("e=>getComputedStyle(e).backgroundRepeat"),
        "texture_status": texture_response.status,
        "texture_content_type": texture_response.headers.get("content-type", ""),
        "pointer_events": grain.evaluate("e=>getComputedStyle(e).pointerEvents"),
        "inside_footer": grain.evaluate("e=>e.closest('[data-site-footer]') !== null"),
        "footer_overflow": grain.evaluate("e=>getComputedStyle(e.closest('[data-site-footer]')).overflow"),
    }
    if desktop["footer_grain"]["animation"] != "footer-grain-shift": fail("Footer grain is not animated")
    if not 0.045 <= float(desktop["footer_grain"]["opacity"]) <= 0.07: fail("Footer grain base opacity is not restrained")
    if desktop["footer_grain"]["enabled"] != "true" or desktop["footer_grain"]["tracking"] != "true": fail("Footer grain did not enable pointer tracking")
    if float(desktop["footer_grain"]["reveal_opacity"]) < 0.08: fail("Cursor-local grain reveal is missing")
    if desktop["footer_grain"]["reveal_coordinates"][0] == desktop["footer_grain"]["reveal_coordinates"][1]: fail("Footer grain reveal did not follow the pointer")
    if float(desktop["footer_grain"]["duration"].replace("s", "")) > 1.3: fail("Footer grain movement is too slow")
    if not desktop["footer_grain"]["texture_url"] or desktop["footer_grain"]["texture_status"] != 200 or "image/svg+xml" not in desktop["footer_grain"]["texture_content_type"]: fail("Footer grain SVG asset failed to load")
    if desktop["footer_grain"]["background_size"] != "cover" or desktop["footer_grain"]["background_repeat"] != "no-repeat": fail("Footer grain texture is tiled")
    if desktop["footer_grain"]["pointer_events"] != "none" or not desktop["footer_grain"]["inside_footer"] or desktop["footer_grain"]["footer_overflow"] != "hidden": fail("Footer grain is not safely contained")
    page.mouse.move(12, 12)
    page.wait_for_timeout(350)
    desktop["footer_grain"]["tracking_after_leave"] = grain_root.get_attribute("data-tracking")
    desktop["footer_grain"]["reveal_opacity_after_leave"] = grain_reveal.evaluate("e=>getComputedStyle(e).opacity")
    if desktop["footer_grain"]["tracking_after_leave"] != "false" or float(desktop["footer_grain"]["reveal_opacity_after_leave"]) > 0.01: fail("Footer grain reveal did not clear on pointer leave")
    transform_before = grain.evaluate("e=>getComputedStyle(e).transform")
    page.wait_for_timeout(300)
    transform_after = grain.evaluate("e=>getComputedStyle(e).transform")
    desktop["footer_grain"]["transform_samples"] = [transform_before, transform_after]
    if transform_before == transform_after: fail("Footer grain transform did not change over time")
    page.screenshot(path=str(SHOTS / "footer-grain.png"))

    scroll(page, position(page, "#work") + 3)
    project = page.locator("[data-slide][data-current] a[data-cursor=project]").first
    project.hover()
    page.wait_for_timeout(150)
    desktop["project_cursor"] = mode(page)
    if desktop["project_cursor"] != "project": fail("Explicit project link looks like a generic link")
    page.mouse.move(*(lambda b: (b["x"] + b["width"] * .5, b["y"] + 20))(page.locator("#work h2").bounding_box()))
    page.wait_for_timeout(100)
    desktop["featured_tone"] = page.locator("[data-cursor-follower]").get_attribute("data-tone")
    if desktop["featured_tone"] != "light": fail("Spotlight did not adapt to the white Featured surface")
    rect = page.locator("[data-slide][data-current] [data-featured-summary]").bounding_box()
    page.mouse.move(rect["x"] + rect["width"] * .5, rect["y"] + rect["height"] * .5)
    page.wait_for_timeout(100)
    desktop["scroll_cursor"] = mode(page)
    if not desktop["scroll_cursor"].startswith("scroll-"): fail("Horizontal scroll region cue missing")
    last_link = page.locator("[data-slide]").last.locator("a").first
    last_link.focus()
    page.wait_for_timeout(1000)
    desktop["keyboard_last_slide"] = page.locator("[data-slide]").last.bounding_box()
    if desktop["keyboard_last_slide"]["x"] < -2 or desktop["keyboard_last_slide"]["x"] + desktop["keyboard_last_slide"]["width"] > 1441: fail("Keyboard focus left final project off-screen")

    scroll(page, position(page, "#more-projects") + 100)
    page.locator("[data-more-card] [data-card-summary]").first.hover()
    page.wait_for_timeout(100)
    desktop["preview_cursor"] = mode(page)
    if desktop["preview_cursor"] != "preview": fail("Non-clickable card surface has ambiguous cursor feedback")
    card = page.locator("[data-more-card] article").first
    desktop["card_spotlight"] = {
        "x": card.evaluate("e=>e.style.getPropertyValue('--spot-x')"),
        "y": card.evaluate("e=>e.style.getPropertyValue('--spot-y')"),
        "tone": page.locator("[data-cursor-follower]").get_attribute("data-tone"),
    }
    if not desktop["card_spotlight"]["x"] or not desktop["card_spotlight"]["y"]: fail("Card spotlight coordinates missing")
    if desktop["card_spotlight"]["tone"] != "dark": fail("Spotlight tone wrong on dark cards")
    page.mouse.move(8, 140)
    page.wait_for_timeout(100)
    desktop["card_spotlight"]["after_leave"] = card.evaluate("e=>e.style.getPropertyValue('--spot-x')")
    if desktop["card_spotlight"]["after_leave"]: fail("Card spotlight coordinates not released")

    targets = page.locator("[data-chapter]").evaluate_all("es=>es.map(e=>e.getBoundingClientRect().top+scrollY-innerHeight*.35+4)")
    forward, backward = [], []
    for y in targets:
        scroll(page, y)
        forward.append(page.locator("[data-rail-counter]").inner_text())
    for y in reversed(targets):
        scroll(page, y)
        backward.append(page.locator("[data-rail-counter]").inner_text())
    desktop["journey"] = {"forward": forward, "backward": backward}
    if forward != ["01", "02", "03", "04"] or backward != ["04", "03", "02", "01"]: fail(f"Journey progression mismatch {desktop['journey']}")
    desktop["listeners"] = counts(page)
    pointer_total = desktop["listeners"].get("document:pointermove", 0)
    footer_pointer_total = desktop["listeners"].get("footer:pointermove", 0)
    footer_leave_total = desktop["listeners"].get("footer:pointerleave", 0)
    if footer_pointer_total != 1 or footer_leave_total != 1: fail("Footer grain pointer listeners are missing or duplicated")

    for route in ("/projects", "/about", "/", "/contact", "/"):
        page.locator(f"header nav a[href='{route}']").first.click()
        page.wait_for_url(BASE + route)
        page.wait_for_timeout(1500)
        results["navigation"][route + str(len(results["navigation"]))] = counts(page)
        if counts(page).get("document:pointermove") != pointer_total: fail(f"Cursor pointer listener duplicated on {route}")
        if counts(page).get("footer:pointermove", 0) != footer_pointer_total or counts(page).get("footer:pointerleave", 0) != footer_leave_total: fail(f"Footer grain listeners duplicated on {route}")
        expected = 1 if route == "/" else 0
        if counts(page).get("shield:pointermove", 0) != expected: fail(f"Portrait listeners leaked on {route}")
        if route == "/projects":
            page.locator("main button").first.hover()
            page.wait_for_timeout(100)
            desktop["button_cursor"] = mode(page)
            if desktop["button_cursor"] != "button": fail("Button cursor mode incorrect")
    page.emulate_media(reduced_motion="reduce")
    page.wait_for_function("""expected => {
      const counts = window.__listenerCounts?.() ?? {};
      const cursor = document.querySelector('[data-cursor-follower]');
      const shield = document.querySelector('[data-portrait-shield]');
      const grain = document.querySelector('[data-footer-grain-interaction]');
      return cursor?.dataset.enabled === 'false' && shield?.dataset.tracking === 'false' &&
        grain?.dataset.enabled === 'false' && counts['document:pointermove'] === expected - 1 &&
        !counts['shield:pointermove'] && !counts['footer:pointermove'] &&
        !counts['footer:pointerleave'] && window.__motion?.triggers().length === 0;
    }""", arg=pointer_total, timeout=5000)
    results["reduced"] = {"listeners": counts(page), "cursor_enabled": page.locator("[data-cursor-follower]").get_attribute("data-enabled"), "shield_tracking": page.locator("[data-portrait-shield]").get_attribute("data-tracking"), "footer_grain_animation": page.locator("[data-footer-grain]").evaluate("e=>getComputedStyle(e).animationName"), "grain_tracking_enabled": page.locator("[data-footer-grain-interaction]").get_attribute("data-enabled"), "grain_reveal_opacity": page.locator("[data-footer-grain-reveal]").evaluate("e=>getComputedStyle(e).opacity"), "triggers": page.evaluate("window.__motion.triggers()")}
    if results["reduced"]["listeners"].get("document:pointermove") != pointer_total - 1 or results["reduced"]["listeners"].get("shield:pointermove"): fail("Reduced motion retained the custom pointer listeners")
    if results["reduced"]["listeners"].get("footer:pointermove") or results["reduced"]["listeners"].get("footer:pointerleave"): fail("Reduced motion retained footer grain listeners")
    if results["reduced"]["footer_grain_animation"] != "none": fail("Reduced motion retained footer grain animation")
    if results["reduced"]["grain_tracking_enabled"] != "false" or float(results["reduced"]["grain_reveal_opacity"]) > 0.01: fail("Reduced motion retained cursor-reactive footer grain")
    if results["reduced"]["triggers"]: fail("Reduced motion retained ScrollTriggers")
    page.emulate_media(reduced_motion="no-preference")
    page.wait_for_function("""expected => {
      const counts = window.__listenerCounts?.() ?? {};
      return document.querySelector('[data-cursor-follower]')?.dataset.enabled === 'true' &&
        counts['document:pointermove'] === expected && counts['shield:pointermove'] === 1 &&
        counts['footer:pointermove'] === 1 && counts['footer:pointerleave'] === 1;
    }""", arg=pointer_total, timeout=5000)
    if counts(page).get("document:pointermove") != pointer_total or counts(page).get("shield:pointermove") != 1: fail("Media reconfiguration duplicated/missed listeners")
    desktop["errors"] = errors
    if errors: fail(f"Desktop page errors {errors}")
    ctx.close()

    for width, height in [(1440, 760), (1280, 800), (1024, 768), (1920, 1080), (768, 1024), (390, 844)]:
        ctx = browser.new_context(viewport={"width": width, "height": height})
        page, errors = open_home(ctx)
        bucket = {"overflow": page.evaluate("document.documentElement.scrollWidth-innerWidth"), "errors": errors}
        results["responsive"][f"{width}x{height}"] = bucket
        if bucket["overflow"] > 1: fail(f"{width}x{height} horizontal overflow")
        if width >= 1024:
            scroll(page, position(page, "#process") + 3)
            bucket["process"] = page.evaluate("""() => {const p=document.querySelector('[data-process-pin]'), a=document.querySelector('[data-process-panel][data-active]');return {overflowY:p.scrollHeight-p.clientHeight,bottom:Math.max(...[...a.querySelectorAll('h3,p,ul')].map(e=>e.getBoundingClientRect().bottom)),viewport:innerHeight};}""")
            if bucket["process"]["overflowY"] > 1 or bucket["process"]["bottom"] > height: fail(f"{width}x{height} Process clipping {bucket['process']}")
        else:
            ys = page.locator("[data-process-compact-step]").evaluate_all("es=>es.map(e=>e.getBoundingClientRect().top+scrollY-innerHeight*.7+4)")
            stages = []
            for y in ys:
                scroll(page, y)
                stages.append(page.locator("[data-process-compact-step]").evaluate_all("es=>es.findIndex(e=>e.hasAttribute('data-active'))"))
            bucket["compact_process"] = stages
            if stages != [0,1,2,3]: fail(f"{width}x{height} compact Process did not advance {stages}")
        ctx.close()

    ctx = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
    ctx.add_init_script(INSTRUMENT)
    page, errors = open_home(ctx)
    results["touch"] = {"listeners": counts(page), "cursor_enabled": page.locator("[data-cursor-follower]").get_attribute("data-enabled"), "shield_tracking": page.locator("[data-portrait-shield]").get_attribute("data-tracking"), "grain_enabled": page.locator("[data-footer-grain-interaction]").get_attribute("data-enabled"), "errors": errors}
    if results["touch"]["cursor_enabled"] != "false" or results["touch"]["shield_tracking"] != "false": fail("Touch requires hover")
    if results["touch"]["grain_enabled"] != "false": fail("Touch enabled the cursor-reactive footer grain")
    if results["touch"]["listeners"].get("footer:pointermove") or results["touch"]["listeners"].get("footer:pointerleave"): fail("Touch registered footer grain listeners")
    ctx.close()
    browser.close()

(OUT / "refinement-browser-results.json").write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
sys.exit(1 if results["failures"] else 0)
