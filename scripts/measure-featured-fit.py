"""Measure whether the pinned Featured stage fits common desktop viewports."""

import json
import shutil

from playwright.sync_api import sync_playwright

VIEWPORTS = [(1440, 900), (1440, 760), (1280, 800), (1024, 768), (1920, 1080)]

MEASURE = """() => {
  const root = document.querySelector('[data-scene=featured]');
  const pin = document.querySelector('[data-featured-pin]');
  const slide = document.querySelector('[data-slide][data-current]') || document.querySelector('[data-slide]');
  const s = slide.getBoundingClientRect();
  const fill = document.querySelector('[data-featured-fill]');
  const f = fill ? fill.getBoundingClientRect() : null;
  const head = pin.querySelector('h2').getBoundingClientRect();
  return {
    enhanced: root.dataset.enhanced || null,
    overflowY: pin.scrollHeight - pin.clientHeight,
    headTop: Math.round(head.top),
    slideTop: Math.round(s.top),
    slideBottom: Math.round(s.bottom),
    progressBottom: f ? Math.round(f.bottom) : null,
    viewportH: innerHeight,
  };
}"""

with sync_playwright() as p:
    exe = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
    browser = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    out = {}
    for w, h in VIEWPORTS:
        page = browser.new_page(viewport={"width": w, "height": h})
        page.goto("http://127.0.0.1:3000/", wait_until="load")
        page.wait_for_timeout(900)
        y = page.evaluate("() => document.querySelector('[data-scene=featured]').getBoundingClientRect().top + scrollY")
        page.evaluate(f"() => scrollTo(0, {y} + 3)")
        page.wait_for_timeout(1300)
        out[f"{w}x{h}"] = page.evaluate(MEASURE)
        page.screenshot(path=f"docs/checks/shots/featured-fit-{w}x{h}.png")
        page.close()
    browser.close()

for key, value in out.items():
    print(key, json.dumps(value))
