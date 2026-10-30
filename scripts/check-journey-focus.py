"""Check Journey stacking, featured tech filtering, and unchanged profile/panel facts."""
import json
import shutil
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("docs/checks")
(OUT / "shots").mkdir(parents=True, exist_ok=True)
results = {"journey": {}, "featured": {}, "focus": {}, "role": {}, "failures": []}


def check(condition, message):
    if not condition:
        results["failures"].append(message)


def doc_top(locator):
    return locator.evaluate("e => e.getBoundingClientRect().top + scrollY")


def scroll(page, y, wait=800):
    page.evaluate("y => scrollTo({top:y,behavior:'instant'})", y)
    page.wait_for_timeout(wait)


STACK_STATE = """() => [...document.querySelectorAll('[data-chapter]')].map(e=>{
  const card=e.querySelector('[data-journey-card]'), body=card.lastElementChild;
  const r=e.getBoundingClientRect(),m=new DOMMatrixReadOnly(getComputedStyle(card).transform==='none'?undefined:getComputedStyle(card).transform);
  return {top:r.top,bottom:r.bottom,height:e.offsetHeight,position:getComputedStyle(e).position,
    y:m.m42,scale:m.a,clip:getComputedStyle(card).clipPath,
    shade:Number(getComputedStyle(card.querySelector('[data-journey-shade]')).opacity),
    contentOverflow:body.scrollHeight-body.clientHeight};
})"""

FEATURE_FIT = """() => {
  const panel=document.querySelector('[data-featured-panel]'),r=panel.getBoundingClientRect();
  const slides=[...document.querySelectorAll('#work [data-slide]')].filter(e=>!e.hidden);
  const links=slides.flatMap(e=>[...e.querySelectorAll('a')]);
  const clippedVertically=links.filter(e=>{const b=e.getBoundingClientRect();return b.bottom>r.bottom+1 || b.top<r.top-1;}).map(e=>e.getAttribute('aria-label')||e.textContent.trim());
  return {panelTop:r.top,panelBottom:r.bottom,clippedVertically,overflow:document.documentElement.scrollWidth-innerWidth};
}"""


def current_slugs(page):
    return page.locator("#work [data-slide]").evaluate_all("es=>es.filter(e=>!e.hidden).map(e=>e.dataset.projectSlug)")


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which("chromium"))
    for width, height in [(1440, 900), (1280, 760), (1024, 768)]:
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(BASE + "/", wait_until="networkidle")
        page.wait_for_function("() => document.querySelector('[data-scene=hero]')?.dataset.entrance === 'complete'")
        check(page.locator("#journey").get_attribute("data-stacked") == "true", f"{width}: stack not enabled")
        check(page.locator("[data-chapter]").count() == 4, "Journey must retain four chapters")
        top = doc_top(page.locator("[data-chapters]"))
        card_height = page.locator("[data-chapter]").first.evaluate("e=>e.offsetHeight")
        snapshots = []
        for index in range(4):
            scroll(page, top + index * card_height - (96 + index * 16) + 1)
            state = page.evaluate(STACK_STATE)
            current = state[index]
            check(current["position"] == "sticky", f"{width}: chapter {index+1} not sticky")
            check(abs(current["top"] - (96 + index * 16)) < 2, f"{width}: wrong stack top {current}")
            check(current["bottom"] <= height + 1 and current["contentOverflow"] <= 1, f"{width}: clipped Journey content {current}")
            if index:
                check(state[index-1]["scale"] < 0.94 and state[index-1]["shade"] > 0.5, f"{width}: previous card did not settle under next card")
            snapshots.append(state)
        scroll(page, top - 96 + 1)
        check(page.evaluate(STACK_STATE)[0]["scale"] > 0.97, f"{width}: stack depth not reversible")
        progression = []
        for index in [0, 1, 2, 3, 3, 2, 1, 0]:
            scroll(page, top + index * card_height - height * 0.35 + 5, 180)
            progression.append(page.locator("[data-rail-counter]").inner_text())
        check(progression == ["01", "02", "03", "04", "04", "03", "02", "01"], f"{width}: rail progression {progression}")
        results["journey"][f"{width}x{height}"] = {"cards": snapshots, "progression": progression}
        if width == 1440:
            page.locator("[data-rail-item] a[href='#chapter-community']").click()
            page.wait_for_timeout(800)
            check(page.locator("[data-rail-counter]").inner_text() == "03", "Native rail anchor targets wrong stacked card")
            page.screenshot(path=str(OUT / "shots" / "journey-stacked.png"))
        scroll(page, doc_top(page.locator("#work")) + 16)
        fit = page.evaluate(FEATURE_FIT)
        check(not fit["clippedVertically"], f"{width}: Featured links clipped vertically {fit}")
        check(fit["panelTop"] >= -1 and fit["panelBottom"] <= height + 1, f"{width}: pinned Featured panel outside viewport {fit}")
        check(fit["overflow"] <= 1, f"{width}: horizontal overflow")
        results["featured"][f"fit-{width}x{height}"] = fit
        if width == 1440:
            original = page.locator("#work [data-slide]").evaluate_all("es=>es.map(e=>({slug:e.dataset.projectSlug,stack:e.dataset.techStack.split('|')}))")
            options = page.locator("#featured-tech-stack option").evaluate_all("es=>es.map(e=>e.value)")
            entries = []
            for technology in options[1:] + ["all"]:
                page.locator("#featured-tech-stack").select_option(technology)
                page.wait_for_timeout(350)
                expected = [e["slug"] for e in original if technology == "all" or technology in e["stack"]]
                actual = current_slugs(page)
                pins = page.evaluate("() => (window.__motion?.triggers()||[]).filter(t=>t==='featured-horizontal').length")
                check(actual == expected, f"Tech filter {technology}: {actual} != {expected}")
                check(pins == (1 if len(expected) > 1 else 0), f"Tech filter {technology}: stale/missing pin {pins}")
                check(page.locator("[data-featured-filter] [aria-live]").inner_text().startswith(str(len(expected))), "Incorrect filter result count")
                entries.append({"technology": technology, "slugs": actual, "horizontalPins": pins})
            results["featured"]["filters"] = entries
            page.locator("header nav a[href='/about']").first.click()
            page.wait_for_url("**/about")
            page.wait_for_timeout(500)
            text = page.locator("main").text_content() or ""
            check("Vice Head IT Support" in text and "Sep 2026" in text, "About current role/date missing")
            stale = [t for t in page.evaluate("() => window.__motion?.triggers() || []") if t.startswith(("journey-", "featured-"))]
            check(not stale, f"Motion leaks after navigation: {stale}")
            results["role"] = {"current": "Vice Head IT Support", "month": "Sep 2026", "staleHomeTriggers": stale}
        page.close()

    modes = [("mobile", {"viewport": {"width": 390, "height": 844}, "has_touch": True, "is_mobile": True}),
             ("short", {"viewport": {"width": 1280, "height": 700}}),
             ("reduced", {"viewport": {"width": 1440, "height": 900}, "reduced_motion": "reduce"}),
             ("no-js", {"viewport": {"width": 1440, "height": 900}, "java_script_enabled": False})]
    for label, options in modes:
        page = browser.new_page(**options)
        page.goto(BASE + "/", wait_until="networkidle")
        check(page.locator("#journey").get_attribute("data-stacked") != "true", f"{label}: sticky stack should be disabled")
        cards = page.evaluate(STACK_STATE)
        check(all(c["position"] != "sticky" and c["contentOverflow"] <= 1 for c in cards), f"{label}: Journey static/fit failure")
        if label in ["reduced", "no-js"]:
            check(all(c["y"] == 0 and c["clip"] == "none" for c in cards), f"{label}: cards not fully open")
        check(page.evaluate("document.documentElement.scrollWidth-innerWidth") <= 1, f"{label}: horizontal overflow")
        if label != "no-js":
            page.locator("#featured-tech-stack").select_option("Electron")
            page.locator("#work [data-slide]:not([hidden])").scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            check(current_slugs(page) == ["rafiq"], f"{label}: single-tech filtering failed")
            alpha = page.locator("#work [data-slide]:not([hidden])").evaluate("e=>Number(getComputedStyle(e).opacity)")
            check(alpha > 0.95, f"{label}: filtered result remains transparent")
            page.locator("#featured-tech-stack").select_option("all")
            page.wait_for_timeout(350)
            check(len(current_slugs(page)) == 3, f"{label}: All reset failed")
        results["journey"][label] = cards
        page.close()
    browser.close()

with urlopen(BASE + "/llms.txt") as response:
    summary = response.read().decode()
check("Vice Head IT Support" in summary and "IT Support Team Leader" not in summary, "Public summary current role wrong")
results["role"]["publicSummaryVerified"] = "Vice Head IT Support" in summary
(OUT / "journey-focus-results.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
raise SystemExit(1 if results["failures"] else 0)
