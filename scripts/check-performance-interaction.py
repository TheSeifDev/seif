"""Validate Montserrat and on-demand portrait-shield rendering on production."""
import json
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000/"
OUT = Path("docs/checks")
(OUT / "shots").mkdir(parents=True, exist_ok=True)
results = {}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which("chromium"))
    cases = [
        ("mobile", {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True}),
        ("desktop", {"viewport": {"width": 1440, "height": 900}}),
    ]
    for label, options in cases:
        page = browser.new_page(**options)
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_function("() => document.querySelector('[data-scene=hero]')?.dataset.entrance === 'complete'")
        state = page.locator("[data-portrait-shield]").evaluate("""e => ({
            tracking: e.dataset.tracking,
            svgDisplay: getComputedStyle(e.querySelector('svg')).display,
            svgOpacity: getComputedStyle(e.querySelector('svg')).opacity,
            font: getComputedStyle(document.body).fontFamily,
            overflow: document.documentElement.scrollWidth - innerWidth
        })""")
        assert state["overflow"] == 0, state
        assert state["font"].startswith("Montserrat"), state
        if label == "mobile":
            assert state["svgDisplay"] == "none" and state["tracking"] == "false", state
        else:
            assert state["tracking"] == "true" and state["svgOpacity"] == "0", state
            page.locator("[data-portrait-shield]").hover()
            page.wait_for_function("() => getComputedStyle(document.querySelector('[data-portrait-shield] svg')).opacity === '1'", timeout=10000)
            state["hoverOpacity"] = page.locator("[data-portrait-shield] svg").evaluate("e => getComputedStyle(e).opacity")
            assert state["hoverOpacity"] == "1", state
        page.screenshot(path=str(OUT / "shots" / f"montserrat-{label}.png"))
        results[label] = state
        page.close()
    browser.close()

(OUT / "performance-interaction-results.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
