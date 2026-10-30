"""Check Journey card reveals/current role and the narrower Projects panel."""
import json
import shutil
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("docs/checks")
(OUT / "shots").mkdir(parents=True, exist_ok=True)
results = {"journey": {}, "focus": {}, "role": {}, "failures": []}


def check(condition, message):
    if not condition:
        results["failures"].append(message)


def doc_top(locator):
    return locator.evaluate("e => e.getBoundingClientRect().top + scrollY")


CARD_STATE = """e => ({
  y: new DOMMatrixReadOnly(getComputedStyle(e).transform === 'none' ? undefined : getComputedStyle(e).transform).m42,
  clip: getComputedStyle(e).clipPath,
  radius: getComputedStyle(e).borderRadius,
  background: getComputedStyle(e.lastElementChild).backgroundColor
})"""

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which("chromium"))
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(BASE + "/", wait_until="networkidle")
    page.wait_for_function("() => document.querySelector('[data-scene=hero]')?.dataset.entrance === 'complete'")
    check(page.locator("[data-journey-card]").count() == 4, "Journey must retain four cards")
    check(page.locator("#chapter-community").inner_text() == "Vice Head IT Support", "Home current role is wrong")
    first = page.locator("[data-chapter]").first
    card = page.locator("[data-journey-card]").first
    top = doc_top(first)
    page.evaluate("y => scrollTo(0,y)", top - 900 * 0.98)
    page.wait_for_function("() => window.__motion?.triggers().includes('journey-card-1')")
    page.wait_for_timeout(200)
    closed = card.evaluate(CARD_STATE)
    page.evaluate("y => scrollTo(0,y)", top - 900 * 0.5)
    page.wait_for_function("() => Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('[data-journey-card]')).transform).m42)<0.2", timeout=10000)
    opened = card.evaluate(CARD_STATE)
    check(closed["y"] > 60 and abs(opened["y"]) < 0.2, f"Card did not rise: {closed} -> {opened}")
    check(opened["radius"] == "32px" and opened["background"] == "rgb(11, 14, 19)", "Journey surface differs from raised Education surface")
    card.screenshot(path=str(OUT / "shots" / "journey-card-new.png"))
    page.evaluate("y => scrollTo(0,y)", top - 900)
    page.wait_for_function("() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('[data-journey-card]')).transform).m42>69", timeout=10000)
    reversed_state = card.evaluate(CARD_STATE)
    results["journey"]["reveal"] = {"before": closed, "after": opened, "reversed": reversed_state}
    progression = []
    for index in [0, 1, 2, 3, 3, 2, 1, 0]:
        chapter_top = doc_top(page.locator("[data-chapter]").nth(index))
        page.evaluate("y=>scrollTo(0,y)", chapter_top - 900 * 0.35 + 5)
        page.wait_for_timeout(180)
        progression.append(page.locator("[data-rail-counter]").inner_text())
    check(progression == ["01", "02", "03", "04", "04", "03", "02", "01"], f"Journey rail progression changed: {progression}")
    results["journey"]["progression"] = progression
    page.locator("header nav a[href='/about']").first.click()
    page.wait_for_url("**/about")
    page.wait_for_timeout(500)
    about_text = page.locator("main").text_content() or ""
    check("Vice Head IT Support" in about_text, "About current role is missing")
    check("Sep 2026" in about_text, "About promotion month is missing")
    stale = [t for t in page.evaluate("() => window.__motion?.triggers() || []") if t.startswith("journey-")]
    check(not stale, f"Journey triggers leaked after navigation: {stale}")
    results["role"] = {"home": "Vice Head IT Support", "month": "Sep 2026", "aboutVerified": True, "staleJourneyTriggers": stale}
    page.close()

    for width, height in [(1024, 768), (1280, 760), (1440, 900), (1920, 1080), (768, 1024), (390, 844)]:
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(BASE + "/projects", wait_until="networkidle")
        panel = page.locator("section[aria-labelledby='in-focus-title']")
        geometry = panel.evaluate("e => {const r=e.getBoundingClientRect();return {width:r.width,left:r.left,right:r.right,overflow:document.documentElement.scrollWidth-innerWidth}}")
        if width >= 1024:
            expected = min(width * 0.84, 1280)
            check(abs(geometry["width"] - expected) < 1, f"{width}: panel width {geometry}")
            check(abs(geometry["left"] - (width - expected) / 2) < 1, f"{width}: panel is not centered")
        check(geometry["overflow"] <= 1, f"{width}: Projects horizontal overflow")
        check(page.locator("[data-stack-card]").count() == 3, f"{width}: wrong number of featured case files")
        results["focus"][f"{width}x{height}"] = geometry
        page.close()

    for label, options in [("mobile", {"viewport": {"width": 390, "height": 844}, "has_touch": True, "is_mobile": True}), ("reduced", {"viewport": {"width": 1440, "height": 900}, "reduced_motion": "reduce"})]:
        page = browser.new_page(**options)
        page.goto(BASE + "/", wait_until="networkidle")
        page.locator("[data-journey-card]").first.scroll_into_view_if_needed()
        page.wait_for_timeout(1600)
        cards = page.locator("[data-journey-card]").evaluate_all("es => es.map(e=>({transform:getComputedStyle(e).transform,clip:getComputedStyle(e).clipPath,overflow:e.lastElementChild.scrollHeight-e.lastElementChild.clientHeight}))")
        check(all(c["overflow"] <= 1 for c in cards), f"{label}: Journey content clipped")
        check(page.evaluate("document.documentElement.scrollWidth-innerWidth") <= 1, f"{label}: Home horizontal overflow")
        if label == "reduced":
            check(all(c["transform"] == "none" and c["clip"] == "none" for c in cards), "Reduced-motion cards not fully static/open")
        results["journey"][label] = cards
        page.close()
    browser.close()

with urlopen(BASE + "/llms.txt") as response:
    summary = response.read().decode()
check("Vice Head IT Support" in summary and "IT Support Team Leader" not in summary, "Public machine-readable summary still presents former role")
results["role"]["publicSummaryVerified"] = not any("summary" in f for f in results["failures"])
(OUT / "journey-focus-results.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
raise SystemExit(1 if results["failures"] else 0)
