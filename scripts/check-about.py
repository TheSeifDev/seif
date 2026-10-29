"""Real-browser checks for the /about chapters (02 Experience -> 05 Principles).

Runs against the production build on :3000. Covers: console errors, horizontal
overflow, SplitText titles (text intact, lines revealed), Experience reading
highlight / counter / marquee drift (forward and reverse), Education card
unmask, Capabilities rows, the pinned Principles timeline (active panel per
step, forward == reverse, no clipped content, pin fits the viewport), compact
and reduced-motion fallbacks, and trigger cleanup across client navigation.
Writes docs/checks/about-browser-results.json; screenshots go to
docs/checks/shots/ (git-ignored).
"""
import json
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("docs/checks")
SHOTS = OUT / "shots"
SHOTS.mkdir(parents=True, exist_ok=True)
results: dict = {"desktop": {}, "short": {}, "tablet": {}, "mobile": {}, "reduced": {},
                 "navigation": {}, "failures": []}


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


def settle(page, ms: int = 250) -> None:
    page.evaluate("""() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))""")
    page.wait_for_timeout(ms)


def scroll_to(page, y: float, ms: int = 450) -> None:
    page.evaluate("y => window.scrollTo(0, y)", y)
    settle(page, ms)


def doc_top(page, selector: str) -> float:
    return page.evaluate(
        "s => { const el = document.querySelector(s); return el.getBoundingClientRect().top + scrollY; }",
        selector,
    )


def motion(page):
    return page.evaluate(
        "() => window.__motion ? { triggers: window.__motion.triggers(), pins: window.__motion.pins() } : null"
    )


def overflow(page) -> int:
    return page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")


def attach_errors(page, bucket: list) -> None:
    page.on("console", lambda m: bucket.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: bucket.append(f"pageerror: {e}"))


TITLES_JS = """
() => [...document.querySelectorAll('[data-about-chapter] h2')].map(h => ({
  chapter: h.closest('[data-about-chapter]').dataset.aboutChapter,
  text: h.textContent.replace(/\\s+/g, ' ').trim(),
}))
"""

PRINCIPLES_JS = """
() => {
  const items = [...document.querySelectorAll('[data-principle]')];
  const pin = document.querySelector('[data-principles-pin]');
  const row = document.querySelector('[data-principles-row]').getBoundingClientRect();
  const progress = document.querySelector('[data-principles-fill]')?.parentElement?.getBoundingClientRect();
  return {
    active: items.findIndex(i => i.hasAttribute('data-active')),
    widths: items.map(i => Math.round(i.getBoundingClientRect().width)),
    bodyOpacity: items.map(i => +getComputedStyle(i.querySelector('[data-principle-body]')).opacity),
    counter: document.querySelector('[data-principles-counter]')?.textContent,
    pinTop: Math.round(pin.getBoundingClientRect().top),
    rowBottom: Math.round(row.bottom),
    progressBottom: progress ? Math.round(progress.bottom) : null,
    clipped: items.map(i => {
      const body = i.querySelector('[data-principle-body]');
      return Math.max(0, Math.round(body.scrollHeight - i.clientHeight));
    }),
    vh: innerHeight,
  };
}
"""


def principles_distance(page) -> tuple[float, float]:
    start = doc_top(page, "#principles")
    end = start + round(page.evaluate("() => innerHeight") * 0.75 * 3)
    return start, end


with sync_playwright() as p:
    browser = launch(p)

    # ---------------------------------------------------------------- desktop
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    errors: list = []
    attach_errors(page, errors)
    page.goto(BASE + "/about", wait_until="networkidle")
    settle(page, 900)
    d = results["desktop"]
    d["motion"] = motion(page)
    d["overflow"] = overflow(page)
    d["titles"] = page.evaluate(TITLES_JS)
    triggers = (d["motion"] or {}).get("triggers", [])
    if "about-page-principles" not in triggers:
        fail("desktop: about-principles trigger missing")
    if (d["motion"] or {}).get("pins") != 1:
        fail(f"desktop: expected 1 pin, got {(d['motion'] or {}).get('pins')}")
    dupes = sorted({t for t in triggers if t and triggers.count(t) > 1})
    if dupes:
        fail(f"desktop: duplicate trigger ids {dupes}")
    if d["overflow"] > 0:
        fail(f"desktop: horizontal overflow {d['overflow']}px")

    # Experience: reading highlight forward and reverse.
    first_point = "[data-role] [data-role-point]"
    point_y = doc_top(page, first_point)
    vh = 900
    read = lambda: page.evaluate(  # noqa: E731
        "() => +getComputedStyle(document.querySelector('[data-role] [data-role-point-text]')).opacity")
    scroll_to(page, point_y - vh * 0.9)
    before = read()
    scroll_to(page, point_y - vh * 0.35, 700)
    after = read()
    scroll_to(page, point_y - vh * 0.9, 700)
    reverse = read()
    d["experience_point_opacity"] = {"before": before, "after": after, "reverse": reverse}
    if not (before < 0.4 and after > 0.95 and reverse < 0.4):
        fail(f"experience highlight not scrubbed/reversible: {d['experience_point_opacity']}")

    exp_top = doc_top(page, "#experience")
    scroll_to(page, exp_top + 60, 900)
    page.screenshot(path=str(SHOTS / "about-1440-experience-top.png"))
    marquee_a = page.evaluate("() => getComputedStyle(document.querySelector('[data-role-marquee]')).transform")
    list_y = doc_top(page, "[data-role] [data-role-points]")
    list_h = page.evaluate("() => document.querySelector('[data-role] [data-role-points]').offsetHeight")
    scroll_to(page, list_y + list_h * 0.7 - vh * 0.6, 900)
    page.screenshot(path=str(SHOTS / "about-1440-experience-reading.png"))
    marquee_b = page.evaluate("() => getComputedStyle(document.querySelector('[data-role-marquee]')).transform")
    d["experience_counter_mid"] = page.evaluate("() => document.querySelector('[data-role-counter]').textContent")
    d["experience_sticky_top"] = page.evaluate(
        "() => Math.round(document.querySelector('[data-role] header > div').getBoundingClientRect().top)")
    if marquee_a == marquee_b:
        fail("experience marquee does not drift with scroll")
    if d["experience_counter_mid"] in (None, "01"):
        fail(f"experience counter did not advance: {d['experience_counter_mid']}")
    if abs(d["experience_sticky_top"] - 112) > 4:
        fail(f"experience meta column not sticky (top {d['experience_sticky_top']})")

    # Education
    edu_top = doc_top(page, "#education")
    scroll_to(page, edu_top + 120, 1600)
    page.screenshot(path=str(SHOTS / "about-1440-education.png"))
    d["education_clip"] = page.evaluate("() => getComputedStyle(document.querySelector('[data-edu-card]')).clipPath")
    if "16%" in d["education_clip"]:
        fail(f"education card not unmasked: {d['education_clip']}")
    page.hover("[data-edu-card]", position={"x": 260, "y": 120})
    settle(page, 500)
    d["education_spot"] = page.evaluate(
        "() => document.querySelector('[data-edu-card]').style.getPropertyValue('--spot-x')")
    page.screenshot(path=str(SHOTS / "about-1440-education-hover.png"))
    page.mouse.move(5, 5)

    # Capabilities
    cap_top = doc_top(page, "#capabilities")
    scroll_to(page, cap_top + 40, 1400)
    page.screenshot(path=str(SHOTS / "about-1440-capabilities.png"))
    scroll_to(page, cap_top + 700, 1400)
    d["capability_rows"] = page.evaluate("() => document.querySelectorAll('[data-cap-row]').length")
    d["capability_skills"] = page.evaluate("() => document.querySelectorAll('[data-cap-skill]').length")
    if d["capability_rows"] != 15:
        fail(f"expected 15 capability rows, got {d['capability_rows']}")
    row = page.locator("[data-cap-row]").nth(3)
    row.hover()
    settle(page, 700)
    page.screenshot(path=str(SHOTS / "about-1440-capabilities-hover.png"))
    d["capability_hover_color"] = row.locator("h3").evaluate("e => getComputedStyle(e).color")
    page.mouse.move(5, 5)

    # Principles: forward through every step, then reverse.
    start, end = principles_distance(page)
    states = []
    for step in range(4):
        scroll_to(page, start + (end - start) * step / 3 + (2 if step < 3 else -2), 1500)
        state = page.evaluate(PRINCIPLES_JS)
        states.append(state)
        page.screenshot(path=str(SHOTS / f"about-1440-principles-{step + 1}.png"))
        if state["active"] != step:
            fail(f"principles step {step + 1}: active {state['active']}")
        if state["widths"][step] != max(state["widths"]):
            fail(f"principles step {step + 1}: active panel not widest {state['widths']}")
        if state["bodyOpacity"][step] < 0.95:
            fail(f"principles step {step + 1}: active body hidden {state['bodyOpacity']}")
        if any(state["clipped"]):
            fail(f"principles step {step + 1}: clipped body {state['clipped']}")
        if state["pinTop"] != 0:
            fail(f"principles step {step + 1}: pin top {state['pinTop']}")
        if (state["progressBottom"] or 0) > state["vh"]:
            fail(f"principles step {step + 1}: progress outside viewport {state['progressBottom']}")
    reverse_states = []
    for step in (2, 1, 0):
        scroll_to(page, start + (end - start) * step / 3 + 2, 1500)
        state = page.evaluate(PRINCIPLES_JS)
        reverse_states.append(state)
        if state["active"] != step or abs(state["widths"][step] - states[step]["widths"][step]) > 3:
            fail(f"principles reverse step {step + 1} mismatch: {state['active']} {state['widths']}")
    d["principles_forward"] = states
    d["principles_reverse"] = reverse_states
    scroll_to(page, start - 900, 900)
    d["principles_before_pin_active"] = page.evaluate(PRINCIPLES_JS)["active"]
    d["errors"] = errors
    if errors:
        fail(f"desktop console errors: {errors[:3]}")

    # Navigation cleanup: About -> Home -> About.
    titles_before = d["titles"]
    page.evaluate("() => window.scrollTo(0, 0)")
    settle(page, 300)
    page.click("header a[href='/']")
    page.wait_for_url(BASE + "/")
    settle(page, 1500)
    home = motion(page)
    page.click("header a[href='/about']")
    page.wait_for_url(BASE + "/about")
    settle(page, 1500)
    back = motion(page)
    results["navigation"] = {"home": home, "about_again": back}
    leaked = [t for t in (home or {}).get("triggers", []) if t.startswith("about-page-")]
    if leaked:
        fail(f"about triggers leaked into Home: {leaked[:5]}")
    if sorted((back or {}).get("triggers", [])) != sorted(triggers):
        fail("trigger set on About differs after Home round-trip")
    if (back or {}).get("pins") != 1:
        fail(f"About pins after round-trip: {(back or {}).get('pins')}")
    if page.evaluate(TITLES_JS) != titles_before:
        fail("chapter title text changed after SplitText round-trip")
    ctx.close()

    # ------------------------------------------------- short desktop (stage)
    ctx = browser.new_context(viewport={"width": 1280, "height": 760})
    page = ctx.new_page()
    page.goto(BASE + "/about", wait_until="networkidle")
    settle(page, 900)
    start, end = principles_distance(page)
    shorts = []
    for step in (0, 3):
        scroll_to(page, start + (end - start) * step / 3 + (2 if step < 3 else -2), 1500)
        shorts.append(page.evaluate(PRINCIPLES_JS))
    page.screenshot(path=str(SHOTS / "about-1280x760-principles.png"))
    results["short"] = {"states": shorts, "overflow": overflow(page)}
    for state in shorts:
        if any(state["clipped"]) or (state["progressBottom"] or 0) > state["vh"]:
            fail(f"short desktop principles do not fit: {state}")
    ctx.close()

    # ----------------------------------------------------- tablet / mobile
    for key, viewport in (("tablet", {"width": 768, "height": 1024}),
                          ("mobile", {"width": 390, "height": 844})):
        ctx = browser.new_context(viewport=viewport, is_mobile=key == "mobile", has_touch=key == "mobile")
        page = ctx.new_page()
        errs: list = []
        attach_errors(page, errs)
        page.goto(BASE + "/about", wait_until="networkidle")
        settle(page, 900)
        info = {"motion": motion(page), "overflow": overflow(page)}
        if (info["motion"] or {}).get("pins") != 0:
            fail(f"{key}: unexpected pins {(info['motion'] or {}).get('pins')}")
        if info["overflow"] > 0:
            fail(f"{key}: horizontal overflow {info['overflow']}px")
        for name in ("experience", "education", "capabilities", "principles"):
            top = doc_top(page, f"#{name}")
            scroll_to(page, top + 40, 1300)
            page.screenshot(path=str(SHOTS / f"about-{viewport['width']}-{name}.png"))
        top = doc_top(page, "[data-principles-row]")
        scroll_to(page, top - 200, 1500)
        info["principle_opacity"] = page.evaluate(
            "() => [...document.querySelectorAll('[data-principle]')].map(e => +getComputedStyle(e).opacity)")
        if min(info["principle_opacity"]) < 0.95:
            fail(f"{key}: principle cards not revealed {info['principle_opacity']}")
        info["errors"] = errs
        if errs:
            fail(f"{key} console errors: {errs[:3]}")
        results[key] = info
        ctx.close()

    # ------------------------------------------------------- reduced motion
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    page.goto(BASE + "/about", wait_until="networkidle")
    settle(page, 900)
    red = {
        "motion": motion(page),
        "point_opacity": page.evaluate(
            "() => Math.min(...[...document.querySelectorAll('[data-role-point-text]')].map(e => +getComputedStyle(e).opacity))"),
        "principle_body_opacity": page.evaluate(
            "() => Math.min(...[...document.querySelectorAll('[data-principle-body]')].map(e => +getComputedStyle(e).opacity))"),
        "enhanced": page.evaluate("() => document.querySelector('#principles').dataset.enhanced || null"),
    }
    about_triggers = [t for t in (red["motion"] or {}).get("triggers", []) if t.startswith("about-")]
    red["about_triggers"] = about_triggers
    if about_triggers or (red["motion"] or {}).get("pins"):
        fail(f"reduced motion still animates: {about_triggers[:4]}")
    if red["point_opacity"] < 1 or red["principle_body_opacity"] < 1 or red["enhanced"]:
        fail(f"reduced motion hides content: {red}")
    top = doc_top(page, "#principles")
    scroll_to(page, top, 300)
    page.screenshot(path=str(SHOTS / "about-1440-reduced-principles.png"))
    results["reduced"] = red
    ctx.close()

    browser.close()

(OUT / "about-browser-results.json").write_text(json.dumps(results, indent=2))
print(json.dumps({"failures": results["failures"]}, indent=2))
raise SystemExit(1 if results["failures"] else 0)
