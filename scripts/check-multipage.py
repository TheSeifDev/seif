"""Real-browser checks for the multi-page portfolio (production build on :3000).

Covers: direct loads of every route, console/page errors, horizontal overflow,
Home scroll scenes (pins, horizontal track, process stages, journey rail),
client-side navigation cleanup (no stale or duplicated ScrollTriggers),
responsive fallbacks and prefers-reduced-motion.
Writes docs/checks/multipage-browser-results.json and screenshots to
docs/checks/shots/ (screenshots are git-ignored).
"""

import json
import shutil
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
ROUTES = ["/", "/about", "/projects", "/projects/rafiq", "/projects/trackup",
          "/projects/nabd-masr", "/blog", "/contact"]
OUT = Path("docs/checks")
SHOTS = OUT / "shots"
SHOTS.mkdir(parents=True, exist_ok=True)

results: dict = {"routes": {}, "home": {}, "navigation": {}, "mobile": {},
                 "tablet": {}, "reduced": {}, "failures": []}


def fail(message: str) -> None:
    results["failures"].append(message)
    print("FAIL:", message)


def launch(p):
    for candidate in (None, shutil.which("chromium"), shutil.which("chromium-browser"),
                      shutil.which("google-chrome")):
        try:
            if candidate is None:
                return p.chromium.launch()
            return p.chromium.launch(executable_path=candidate)
        except Exception:  # noqa: BLE001 - try the next browser binary
            continue
    raise RuntimeError("No Chromium available")


def settle(page, frames: int = 6) -> None:
    page.wait_for_timeout(700)
    page.evaluate(
        """n => new Promise(r => { let i = 0; const f = () => (++i >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); })""",
        frames,
    )


def scroll_to(page, y: float) -> None:
    page.evaluate("y => window.scrollTo(0, y)", y)
    settle(page, 8)
    page.wait_for_timeout(120)


def motion(page):
    return page.evaluate(
        "() => window.__motion ? { triggers: window.__motion.triggers(), pins: window.__motion.pins() } : null"
    )


def overflow(page):
    return page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")


def attach_errors(page, bucket: list):
    page.on("console", lambda m: bucket.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: bucket.append(f"pageerror: {e}"))


with sync_playwright() as p:
    browser = launch(p)

    # 1. Direct loads at desktop size.
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    for route in ROUTES:
        page = ctx.new_page()
        errors: list = []
        attach_errors(page, errors)
        response = page.goto(BASE + route, wait_until="load")
        settle(page)
        info = {
            "status": response.status if response else None,
            "errors": errors,
            "overflow": overflow(page),
            "motion": motion(page),
            "h1": page.locator("h1").first.inner_text().strip().replace("\n", " "),
        }
        results["routes"][route] = info
        if info["status"] != 200:
            fail(f"{route} status {info['status']}")
        if errors:
            fail(f"{route} errors {errors}")
        if info["overflow"] > 1:
            fail(f"{route} horizontal overflow {info['overflow']}px")
        name = "home" if route == "/" else route.strip("/").replace("/", "-")
        page.screenshot(path=str(SHOTS / f"{name}-1440-top.png"))
        page.close()

    # 2. Home scroll scenes at desktop size.
    page = ctx.new_page()
    errors = []
    attach_errors(page, errors)
    page.goto(BASE + "/", wait_until="load")
    settle(page)
    m = motion(page)
    home = results["home"]
    home["triggers"] = m["triggers"] if m else None
    home["pins"] = m["pins"] if m else None
    for required in ("hero-overlap", "featured-horizontal", "process-pin", "journey-rail"):
        if not m or required not in m["triggers"]:
            fail(f"home missing trigger {required}")
    if m and len(m["triggers"]) != len(set(m["triggers"])):
        fail("home has duplicated trigger ids")

    home["featured_enhanced"] = page.locator("[data-scene=featured]").get_attribute("data-enhanced")
    home["process_enhanced"] = page.locator("[data-scene=process]").get_attribute("data-enhanced")
    if home["featured_enhanced"] != "true" or home["process_enhanced"] != "true":
        fail("pinned sections not enhanced at 1440x900")

    # Journey rail
    journey_top = page.evaluate("() => document.querySelector('#journey').getBoundingClientRect().top + scrollY")
    journey_h = page.evaluate("() => document.querySelector('#journey').offsetHeight")
    counters = []
    for frac in (0.15, 0.45, 0.7, 0.92):
        scroll_to(page, journey_top + journey_h * frac - 300)
        counters.append(page.locator("[data-rail-counter]").inner_text())
    home["journey_counters"] = counters
    if counters[0] == counters[-1]:
        fail(f"journey rail counter did not advance {counters}")
    scroll_to(page, journey_top + journey_h * 0.6)
    page.screenshot(path=str(SHOTS / "home-1440-journey.png"))

    # Featured horizontal track
    pin_top = page.evaluate("() => document.querySelector('[data-scene=featured]').getBoundingClientRect().top + scrollY")
    pin_spacer_h = page.evaluate("() => (document.querySelector('[data-featured-pin]').closest('.pin-spacer') || document.querySelector('[data-featured-pin]')).offsetHeight")
    xs, current = [], []
    for frac in (0.0, 0.35, 0.7, 1.0):
        scroll_to(page, pin_top + (pin_spacer_h - 900) * frac + 2)
        page.wait_for_timeout(1100)  # let snap settle
        xs.append(page.evaluate("() => new DOMMatrix(getComputedStyle(document.querySelector('[data-featured-track]')).transform).m41"))
        current.append(page.evaluate("() => [...document.querySelectorAll('[data-slide]')].findIndex(s => s.hasAttribute('data-current'))"))
        if frac in (0.35, 1.0):
            page.screenshot(path=str(SHOTS / f"home-1440-featured-{int(frac*100)}.png"))
    home["featured_x"] = xs
    home["featured_current"] = current
    if not (all(a >= b - 1 for a, b in zip(xs, xs[1:])) and xs[0] > xs[-1]):
        fail(f"featured track did not move monotonically {xs}")
    slide_count = page.locator("[data-slide]").count()
    step = abs(xs[-1]) / max(1, slide_count - 1)
    misaligned = [x for x in xs if min(abs(abs(x) - k * step) for k in range(slide_count)) > 3]
    home["featured_snap_misaligned"] = misaligned
    if misaligned:
        fail(f"featured track stopped between slides {misaligned}")
    last_slide_right = page.evaluate("() => { const s=[...document.querySelectorAll('[data-slide]')].at(-1).getBoundingClientRect(); return s.right; }")
    home["featured_last_slide_right"] = last_slide_right
    if last_slide_right > 1440 + 1:
        fail(f"last featured slide not fully visible at end ({last_slide_right})")
    if current[-1] != page.locator("[data-slide]").count() - 1:
        fail(f"last slide not current at end {current}")

    # More projects, skills
    for anchor in ("#more-projects", "#skills"):
        y = page.evaluate(f"() => document.querySelector('{anchor}').getBoundingClientRect().top + scrollY")
        scroll_to(page, y)
        page.screenshot(path=str(SHOTS / f"home-1440-{anchor[1:]}.png"))
    home["more_cards"] = page.locator("[data-more-card]").count()
    if home["more_cards"] != 3:
        fail(f"more projects shows {home['more_cards']} cards")
    home["more_live_links"] = page.locator("#more-projects a:has-text('Watch live')").count()
    home["more_repo_links"] = page.locator("#more-projects a:has-text('Go to repo')").count()

    # Process pinned path
    proc_top = page.evaluate("() => document.querySelector('[data-scene=process]').getBoundingClientRect().top + scrollY")
    proc_h = page.evaluate("() => (document.querySelector('[data-process-pin]').closest('.pin-spacer') || document.querySelector('[data-process-pin]')).offsetHeight")
    active = []
    for frac in (0.02, 0.3, 0.55, 0.95):
        scroll_to(page, proc_top + (proc_h - 900) * frac)
        active.append(page.evaluate("() => [...document.querySelectorAll('[data-process-node]')].findIndex(n => n.hasAttribute('data-active'))"))
        if frac in (0.3, 0.95):
            page.screenshot(path=str(SHOTS / f"home-1440-process-{int(frac*100)}.png"))
    home["process_active"] = active
    if active != sorted(active) or active[0] != 0 or active[-1] != 3:
        fail(f"process stages did not advance 0..3 {active}")
    visible_panels = page.evaluate("() => [...document.querySelectorAll('[data-process-panel]')].filter(p => getComputedStyle(p).opacity > 0.5).length")
    if visible_panels != 1:
        fail(f"process shows {visible_panels} panels at once")

    # Reverse scroll: back to the top restores the first stage
    scroll_to(page, proc_top + 4)
    home["process_active_after_reverse"] = page.evaluate("() => [...document.querySelectorAll('[data-process-node]')].findIndex(n => n.hasAttribute('data-active'))")
    if home["process_active_after_reverse"] != 0:
        fail("process did not reverse to stage 1")

    for anchor in ("#connect",):
        y = page.evaluate(f"() => document.querySelector('{anchor}').getBoundingClientRect().top + scrollY")
        scroll_to(page, y)
        page.screenshot(path=str(SHOTS / "home-1440-connect.png"))
    scroll_to(page, 10**7)
    page.screenshot(path=str(SHOTS / "home-1440-footer.png"))
    scroll_to(page, 0)
    page.wait_for_timeout(400)
    page.screenshot(path=str(SHOTS / "home-1440-hero.png"))
    about_y = page.evaluate("() => document.querySelector('#about').getBoundingClientRect().top + scrollY")
    scroll_to(page, about_y - 120)
    page.wait_for_timeout(500)
    page.screenshot(path=str(SHOTS / "home-1440-about.png"))
    home["errors"] = errors
    if errors:
        fail(f"home scroll errors {errors}")

    # 3. Client-side navigation cleanup.
    nav = results["navigation"]
    scroll_to(page, 2500)
    page.locator("header nav a[href='/about']").first.click()
    page.wait_for_url("**/about")
    page.wait_for_timeout(600)
    settle(page)
    m_about = motion(page)
    nav["about_after_home"] = m_about
    home_ids = set(home["triggers"] or [])
    leaked = [t for t in (m_about or {}).get("triggers", []) if t in home_ids]
    if leaked:
        fail(f"home triggers leaked into /about: {leaked}")
    if m_about and m_about["pins"] != 0:
        fail(f"/about has {m_about['pins']} pin spacers after navigation")
    nav["about_scroll_y"] = page.evaluate("() => scrollY")

    page.locator("header nav a[href='/projects']").first.click()
    page.wait_for_url("**/projects")
    page.wait_for_timeout(600)
    page.locator("a[href='/projects/rafiq']").first.click()
    page.wait_for_url("**/projects/rafiq")
    page.wait_for_timeout(600)
    nav["case_study"] = motion(page)

    page.locator("header a[href='/']").first.click()
    page.wait_for_url(BASE + "/")
    page.wait_for_timeout(800)
    settle(page)
    m_back = motion(page)
    nav["home_after_return"] = m_back
    if m_back and sorted(m_back["triggers"]) != sorted(home["triggers"] or []):
        fail("home triggers differ after returning via client navigation")
    if m_back and m_back["pins"] != home["pins"]:
        fail(f"pin spacer count changed after return ({home['pins']} -> {m_back['pins']})")
    nav["errors"] = errors
    page.close()
    ctx.close()

    # 4. Mobile and tablet.
    for label, viewport in (("mobile", {"width": 390, "height": 844}),
                            ("tablet", {"width": 768, "height": 1024})):
        ctx = browser.new_context(viewport=viewport, is_mobile=label == "mobile",
                                  has_touch=label == "mobile")
        bucket = results[label]
        for route in ROUTES:
            page = ctx.new_page()
            errs: list = []
            attach_errors(page, errs)
            page.goto(BASE + route, wait_until="load")
            settle(page)
            bucket[route] = {"overflow": overflow(page), "errors": errs, "motion": motion(page)}
            if bucket[route]["overflow"] > 1:
                fail(f"{label} {route} overflow {bucket[route]['overflow']}px")
            if errs:
                fail(f"{label} {route} errors {errs}")
            name = "home" if route == "/" else route.strip("/").replace("/", "-")
            page.screenshot(path=str(SHOTS / f"{name}-{viewport['width']}-top.png"))
            if route == "/":
                bucket["featured_enhanced"] = page.locator("[data-scene=featured]").get_attribute("data-enhanced")
                bucket["process_enhanced"] = page.locator("[data-scene=process]").get_attribute("data-enhanced")
                if label == "mobile" and (bucket["featured_enhanced"] or bucket["process_enhanced"]):
                    fail("pinned layouts enabled on mobile")
                for anchor in ("#about", "#journey", "#work", "#more-projects", "#skills", "#process", "#connect"):
                    y = page.evaluate(f"() => document.querySelector('{anchor}').getBoundingClientRect().top + scrollY")
                    scroll_to(page, y)
                    page.wait_for_timeout(250)
                    page.screenshot(path=str(SHOTS / f"home-{viewport['width']}-{anchor[1:]}.png"))
                if label == "mobile":
                    scroll_to(page, 0)
                    toggle = page.locator("header button[aria-expanded]").first
                    toggle.click()
                    page.wait_for_timeout(400)
                    bucket["menu_expanded"] = toggle.get_attribute("aria-expanded")
                    page.screenshot(path=str(SHOTS / "home-390-menu.png"))
                    if bucket["menu_expanded"] != "true":
                        fail("mobile menu did not open")
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(300)
                    bucket["menu_after_escape"] = toggle.get_attribute("aria-expanded")
                    if bucket["menu_after_escape"] != "false":
                        fail("mobile menu did not close on Escape")
            page.close()
        ctx.close()

    # 5. Reduced motion.
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    errs = []
    attach_errors(page, errs)
    page.goto(BASE + "/", wait_until="load")
    settle(page)
    red = results["reduced"]
    red["motion"] = motion(page)
    red["featured_enhanced"] = page.locator("[data-scene=featured]").get_attribute("data-enhanced")
    red["about_line_opacity"] = page.evaluate("() => getComputedStyle(document.querySelector('[data-about-line]')).opacity")
    red["marquee_animation"] = page.evaluate("() => getComputedStyle(document.querySelector('[class*=animate-marquee]')).animationName")
    if red["motion"] and red["motion"]["pins"]:
        fail("pins present with reduced motion")
    if red["featured_enhanced"]:
        fail("featured enhanced with reduced motion")
    if red["about_line_opacity"] != "1":
        fail("about heading hidden with reduced motion")
    if errs:
        fail(f"reduced motion errors {errs}")
    ctx.close()
    browser.close()

(OUT / "multipage-browser-results.json").write_text(json.dumps(results, indent=2))
print(json.dumps({k: v for k, v in results.items() if k in ("home", "navigation", "reduced")}, indent=1)[:6000])
print("FAILURES:", len(results["failures"]))
sys.exit(1 if results["failures"] else 0)
