"""Focused Phase 2 checks; requires Python Playwright and Chromium."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / "docs" / "checks"
out.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    for width in (390, 768, 1440):
        page = browser.new_page(viewport={"width": width, "height": 900}, device_scale_factor=1)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        response = page.goto("http://localhost:3000/", wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        assert response.status == 200
        assert page.locator("h1").count() == 1
        assert page.locator(".project-card").count() == 7
        assert not page.evaluate("document.documentElement.scrollWidth > innerWidth"), f"Overflow at {width}"
        assert page.locator(".hero-portrait").evaluate("im => im.complete && im.naturalWidth > 0")
        assert page.locator("#contact").evaluate("el => getComputedStyle(el).getPropertyValue('--accent').trim()") == "#49baf1"
        if width <= 768:
            toggle = page.locator(".menu-toggle")
            toggle.click()
            assert toggle.get_attribute("aria-expanded") == "true"
            page.keyboard.press("Escape")
            assert toggle.get_attribute("aria-expanded") == "false"
            assert toggle.evaluate("el => document.activeElement === el")
        page.screenshot(path=str(out / f"home-{width}.png"), full_page=True)
        rail = page.locator(".project-rail")
        rail.scroll_into_view_if_needed()
        page.locator("button[aria-label='Scroll next projects']").click()
        page.wait_for_function("document.querySelector('.project-rail').scrollLeft > 0")
        page.locator("#contact").scroll_into_view_if_needed()
        page.wait_for_timeout(1200)
        global_accent = page.locator(".portfolio").evaluate("el => getComputedStyle(el).getPropertyValue('--accent').trim()")
        assert global_accent in ("#dc143c", "rgb(220, 20, 60)", "rgba(220,20,60,1)"), global_accent
        assert page.locator("#contact").evaluate("el => getComputedStyle(el).getPropertyValue('--accent').trim()") == "#49baf1"
        assert not errors, errors
        results.append({"width": width, "http": response.status, "overflow": False, "js_errors": errors, "menu": "passed" if width <= 768 else "not applicable", "rail": "passed", "global_accent_at_contact": global_accent, "contact_accent": "#49baf1"})
        print(f"Viewport {width}: passed", flush=True)
        page.close()
    page = browser.new_page(viewport={"width": 390, "height": 900}, reduced_motion="reduce")
    page.goto("http://localhost:3000/", wait_until="networkidle")
    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    assert page.locator(".portfolio").evaluate("el => getComputedStyle(el).getPropertyValue('--accent').trim()") == "#49baf1"
    assert page.locator("[data-reveal]").first.evaluate("el => getComputedStyle(el).opacity") == "1"
    results.append({"reduced_motion": "passed", "visible_content": True, "default_accent": "#49baf1"})
    browser.close()
(out / "browser-results.json").write_text(json.dumps(results, indent=2) + "\n")
print("Responsive, menu, rail, scroll accents and reduced-motion checks passed.")
