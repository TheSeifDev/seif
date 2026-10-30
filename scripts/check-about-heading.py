#!/usr/bin/env python3
"""Recheck only Introduction scroll timing; preserve unrelated passing evidence."""
import json
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path("docs/checks/about-top-results.json")
results = json.loads(OUT.read_text())
failures = []


def state(page):
    return page.evaluate("""() => {
      const y=s=>{const t=getComputedStyle(document.querySelector(s)).transform;return t==='none'?0:new DOMMatrix(t).m42;};
      return {titleY:y('[data-about-hero] h1'),backgroundY:y('[data-about-hero] img'),
        headingY:y('#introduction-heading'),summaryY:y('[data-about-intro-summary]')};
    }""")


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which("chromium"))
    for key, info in results["viewports"].items():
        width, height = map(int, key.split("x"))
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto("http://127.0.0.1:3000/about", wait_until="networkidle")
        section_top = page.locator("#introduction").evaluate("e=>e.getBoundingClientRect().top+scrollY")
        states = []
        for y in [section_top-height*.95, section_top+250, section_top-height*.95]:
            page.evaluate("y=>scrollTo(0,y)", y)
            page.wait_for_timeout(900)
            states.append(state(page))
        before, after, reverse = states
        if before["headingY"] <= after["headingY"]+15:
            failures.append(f"{key}: intro heading does not rise")
        if after["summaryY"] >= before["summaryY"]-2:
            failures.append(f"{key}: intro copy not scrubbed")
        if abs(reverse["headingY"]-before["headingY"]) >= 2:
            failures.append(f"{key}: intro not reversible")
        info["introStates"] = {"before": before, "after": after, "reverse": reverse}
        print(key, "heading", round(before["headingY"],2), "->", round(after["headingY"],2), "->", round(reverse["headingY"],2), flush=True)
        page.close()
    browser.close()

results["failures"] = [f for f in results["failures"] if ": intro heading does not rise" not in f and ": intro copy not scrubbed" not in f and ": intro not reversible" not in f] + failures
OUT.write_text(json.dumps(results, indent=2)+"\n")
print(json.dumps({"failures": results["failures"]}, indent=2))
raise SystemExit(1 if results["failures"] else 0)
