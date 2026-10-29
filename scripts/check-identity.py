"""Real-browser checks for the Home Cinematic Identity Sequence (production build on :3000).

Covers: one coordinated `identity-sequence` trigger and pin in desktop stage mode,
pin distance and release into The Journey, identical states when scrolling down
and back up through the same positions, composition geometry (no overlap with
the moon, portrait at natural 3:4 proportions), lazy on-demand WebGL with CSS
fallback when WebGL is unavailable, reduced motion, compact/mobile reveal and
route-change cleanup.

Writes docs/checks/identity-browser-results.json and screenshots to
docs/checks/shots/ (git-ignored).
"""
import json
import math
import re
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("docs/checks")
SHOTS = OUT / "shots"
SHOTS.mkdir(parents=True, exist_ok=True)
GL_ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
SAMPLES = [0.0, 0.08, 0.18, 0.3, 0.4, 0.5, 0.62, 0.77, 0.86, 0.95, 1.0]

results: dict = {"desktop": {}, "geometry": {}, "webgl": {}, "no_webgl": {}, "reduced": {},
                 "mobile": {}, "short": {}, "navigation": {}, "failures": []}


def fail(message: str) -> None:
    results["failures"].append(message)
    print("FAIL:", message)


def launch(p):
    for candidate in (None, shutil.which("chromium"), shutil.which("chromium-browser"),
                      shutil.which("google-chrome")):
        try:
            if candidate is None:
                return p.chromium.launch(args=GL_ARGS)
            return p.chromium.launch(executable_path=candidate, args=GL_ARGS)
        except Exception:  # noqa: BLE001 - try the next browser binary
            continue
    raise RuntimeError("No Chromium available")


def frames(page, n: int = 6) -> None:
    page.evaluate(
        "n => new Promise(r => { let i = 0; const f = () => (++i >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); })",
        n,
    )


def settle(page, ms: int = 700) -> None:
    page.wait_for_timeout(ms)
    frames(page)


def scroll_to(page, y: float, wait: int = 1500) -> None:
    page.evaluate("y => window.scrollTo(0, y)", y)
    settle(page, wait)


def motion(page):
    return page.evaluate(
        "() => window.__motion ? { triggers: window.__motion.triggers(), pins: window.__motion.pins() } : null"
    )


def attach_errors(page, bucket: list):
    page.on("console", lambda m: bucket.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: bucket.append(f"pageerror: {e}"))


STATE_JS = """
() => {
  const r = document.querySelector('[data-scene=identity]');
  const q = s => r.querySelector(s);
  const cs = el => { const c = getComputedStyle(el); return { t: c.transform, o: c.opacity, clip: c.clipPath }; };
  const canvas = q('canvas');
  return {
    sequence: r.dataset.sequence || null,
    halfA: cs(q('[data-identity-half="a"]')),
    halfB: cs(q('[data-identity-half="b"]')),
    copyA: cs(q('[data-identity-copy="a"]')),
    copyB: cs(q('[data-identity-copy="b"]')),
    portrait: cs(q('[data-identity-portrait]')),
    img: cs(q('[data-identity-portrait-img]')),
    lines: [...r.querySelectorAll('[data-identity-line-inner]')].map(e => getComputedStyle(e).transform),
    kicker: cs(q('[data-identity-kicker]')).o,
    caption: cs(q('[data-identity-caption]')).o,
    next: cs(q('[data-identity-next]')).o,
    moonWrap: cs(q('[data-identity-moon]')).o,
    disc: cs(q('[data-identity-moon-disc]')).t,
    rise: r.dataset.moonRise || null,
    exit: r.dataset.moonExit || null,
    renderer: q('[data-renderer]').dataset.renderer,
    canvas: canvas ? { rise: canvas.dataset.rise, exit: canvas.dataset.exit, frames: Number(canvas.dataset.frames), dpr: canvas.dataset.dpr } : null,
    pinTop: q('[data-identity-pin]').getBoundingClientRect().top,
  };
}
"""

GEOMETRY_JS = """
() => {
  const r = document.querySelector('[data-scene=identity]');
  const q = s => r.querySelector(s);
  const rect = el => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const host = rect(q('[data-identity-moon]'));
  const img = q('[data-identity-portrait] img');
  return {
    vw: innerWidth, vh: innerHeight,
    halfA: rect(q('[data-identity-half="a"]')), halfB: rect(q('[data-identity-half="b"]')),
    copyA: rect(q('[data-identity-copy="a"]')), copyB: rect(q('[data-identity-copy="b"]')),
    figure: rect(q('[data-identity-figure]')),
    moon: { cx: host.l + host.w / 2, cy: host.t + host.h / 2, r: host.w * 0.43 / 2 },
    img: { natural: [img.naturalWidth, img.naturalHeight], box: rect(img), fit: getComputedStyle(img).objectFit,
           filter: getComputedStyle(img).filter, mix: getComputedStyle(img).mixBlendMode },
    fontA: parseFloat(getComputedStyle(q('[data-identity-half="a"]')).fontSize),
  };
}
"""


def numbers(value: str) -> list:
    return [float(x) for x in re.findall(r"-?\d+(?:\.\d+)?(?:e-?\d+)?", value or "")]


def close(a, b, tol: float = 0.75) -> bool:
    if isinstance(a, dict):
        return all(close(a[k], b.get(k), tol) for k in a)
    if isinstance(a, list):
        return len(a) == len(b) and all(close(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) <= tol
    if isinstance(a, str) and isinstance(b, str):
        na, nb = numbers(a), numbers(b)
        if na or nb:
            return len(na) == len(nb) and all(abs(x - y) <= tol for x, y in zip(na, nb))
    return a == b


def comparable(state: dict) -> dict:
    s = dict(state)
    s.pop("canvas", None)
    s.pop("renderer", None)
    return s


def rect_circle_gap(rect: dict, circle: dict) -> float:
    nx = min(max(circle["cx"], rect["l"]), rect["r"])
    ny = min(max(circle["cy"], rect["t"]), rect["b"])
    return math.hypot(circle["cx"] - nx, circle["cy"] - ny) - circle["r"]


def overlaps(a: dict, b: dict) -> bool:
    return a["l"] < b["r"] and b["l"] < a["r"] and a["t"] < b["b"] and b["t"] < a["b"]


def identity_box(page):
    return page.evaluate(
        """() => {
          const pin = document.querySelector('[data-identity-pin]');
          const spacer = pin.closest('.pin-spacer');
          const top = (spacer || pin).getBoundingClientRect().top + scrollY;
          const journey = document.getElementById('journey').getBoundingClientRect().top + scrollY;
          return { top, spacer: spacer ? spacer.offsetHeight : null, pinH: pin.offsetHeight, journey, vh: innerHeight };
        }"""
    )


def check_geometry(page, label: str) -> dict:
    g = page.evaluate(GEOMETRY_JS)
    results["geometry"][label] = g
    for name in ("halfA", "halfB", "copyA", "copyB"):
        box = g[name]
        gap = rect_circle_gap(box, g["moon"])
        if gap < 0:
            fail(f"{label}: {name} overlaps the moon disc by {-gap:.1f}px")
        if box["l"] < 0 or box["r"] > g["vw"] or box["t"] < 0 or box["b"] > g["vh"]:
            fail(f"{label}: {name} leaves the viewport {box}")
    if overlaps(g["halfA"], g["copyA"]) or overlaps(g["halfB"], g["copyB"]):
        fail(f"{label}: statement halves overlap their copy blocks")
    ratio = g["figure"]["w"] / g["figure"]["h"]
    if abs(ratio - 0.75) > 0.01:
        fail(f"{label}: portrait figure ratio {ratio:.3f} != 0.75")
    optimized_natural = g["img"]["natural"]
    image_ratio = optimized_natural[0] / optimized_natural[1] if optimized_natural[1] else 0
    if abs(image_ratio - 0.75) > 0.01 or g["img"]["fit"] != "contain":
        fail(f"{label}: portrait image not natural/contained {g['img']}")
    if g["img"]["filter"] != "none" or g["img"]["mix"] != "normal":
        fail(f"{label}: portrait recoloured {g['img']}")
    if g["figure"]["b"] - g["vh"] > 1.5:
        fail(f"{label}: portrait not bottom anchored ({g['figure']['b']} vs {g['vh']})")
    return g


def stage_run(browser, width: int, height: int, label: str, full: bool) -> None:
    ctx = browser.new_context(viewport={"width": width, "height": height})
    page = ctx.new_page()
    errors: list = []
    attach_errors(page, errors)
    page.goto(BASE + "/", wait_until="load")
    settle(page, 1000)
    out: dict = {"errors": errors}
    m = motion(page)
    out["motion"] = m
    ids = (m or {}).get("triggers", [])
    if ids.count("identity-sequence") != 1:
        fail(f"{label}: identity-sequence count {ids.count('identity-sequence')}")
    if "identity-reveal" in ids:
        fail(f"{label}: compact identity-reveal present in stage mode")
    if len(ids) != len(set(ids)):
        fail(f"{label}: duplicated trigger ids")
    box = identity_box(page)
    out["box"] = box
    distance = (box["spacer"] or 0) - box["pinH"]
    expected = round(height * 3.2)
    if box["spacer"] is None or abs(distance - expected) > 2:
        fail(f"{label}: pin distance {distance} expected {expected}")
    if abs(box["pinH"] - height) > 1:
        fail(f"{label}: pinned stage height {box['pinH']} != viewport {height}")
    if abs(box["journey"] - (box["top"] + (box["spacer"] or 0))) > 2:
        fail(f"{label}: Journey does not start where the pin spacer ends {box}")
    start = box["top"]

    def at(p: float) -> float:
        return start + distance * p

    if full:
        down = {}
        for p in SAMPLES:
            scroll_to(page, at(p))
            down[p] = page.evaluate(STATE_JS)
            if abs(down[p]["pinTop"]) > 1:
                fail(f"{label}: stage not pinned at progress {p} (top {down[p]['pinTop']})")
            if p in (0.08, 0.3, 0.5, 0.77, 0.95):
                page.screenshot(path=str(SHOTS / f"identity-{label}-p{int(p * 100):02d}.png"))
        # Leave past the end, then come back up through the same positions.
        scroll_to(page, at(1.0) + height * 0.6)
        after = page.evaluate(STATE_JS)
        out["after_release_pin_top"] = after["pinTop"]
        if after["pinTop"] > -height * 0.5:
            fail(f"{label}: pin did not release after the end ({after['pinTop']})")
        page.screenshot(path=str(SHOTS / f"identity-{label}-release.png"))
        up = {}
        for p in reversed(SAMPLES):
            scroll_to(page, at(p))
            up[p] = page.evaluate(STATE_JS)
        mismatched = [p for p in SAMPLES if not close(comparable(down[p]), comparable(up[p]))]
        out["down"] = {str(k): v for k, v in down.items()}
        out["up"] = {str(k): v for k, v in up.items()}
        out["reverse_mismatches"] = mismatched
        if mismatched:
            fail(f"{label}: down/up states differ at progress {mismatched}")
        # Phase expectations.
        s0, s30, s50, s77, s100 = down[0.0], down[0.3], down[0.5], down[0.77], down[1.0]
        if s0["portrait"]["clip"] != "inset(0% 50%)" and "50%" not in s0["portrait"]["clip"]:
            fail(f"{label}: portrait not masked at start ({s0['portrait']['clip']})")
        if float(s0["copyA"]["o"]) > 0.01 or float(s0["moonWrap"]) > 0.01:
            fail(f"{label}: copy or moon visible before the split")
        if any(t != "none" and abs(numbers(t)[-1]) > 0.5 for t in s30["lines"]):
            fail(f"{label}: statement lines not revealed by 30% ({s30['lines']})")
        if "inset(0" not in s50["portrait"]["clip"] or "50%" in s50["portrait"]["clip"]:
            fail(f"{label}: portrait not open at 50% ({s50['portrait']['clip']})")
        if float(s77["copyA"]["o"]) < 0.99 or float(s77["copyB"]["o"]) < 0.99:
            fail(f"{label}: copy blocks not visible in the full frame")
        if float(s77["rise"] or 0) < 0.999 or float(s77["exit"] or 0) > 0.001:
            fail(f"{label}: moon rise not complete in the full frame ({s77['rise']}, {s77['exit']})")
        if float(s100["exit"] or 0) < 0.999 or float(s100["moonWrap"]) > 0.01 or float(s100["next"]) < 0.99:
            fail(f"{label}: exit state incomplete at 100%")
        if float(s100["halfA"]["o"]) > 0.01 or float(s100["portrait"]["o"]) > 0.01:
            fail(f"{label}: statement/portrait still visible at the exit")
        # Portrait is never scaled: only translation in its matrix.
        for p, s in down.items():
            for key in ("portrait", "img"):
                t = s[key]["t"]
                if t != "none":
                    n = numbers(t)
                    if abs(n[0] - 1) > 1e-3 or abs(n[3] - 1) > 1e-3 or abs(n[1]) > 1e-3 or abs(n[2]) > 1e-3:
                        fail(f"{label}: portrait {key} scaled/rotated at {p}: {t}")
        scroll_to(page, at(0.77))
        check_geometry(page, label)
        # WebGL: lazy, on demand, linked to the timeline.
        state = page.evaluate(STATE_JS)
        gl = {"renderer": state["renderer"], "canvas": state["canvas"]}
        if state["canvas"]:
            before = page.evaluate(STATE_JS)["canvas"]["frames"]
            page.wait_for_timeout(1200)
            idle = page.evaluate(STATE_JS)["canvas"]["frames"]
            gl["idle_frames_added"] = idle - before
            if idle != before:
                fail(f"{label}: WebGL renders continuously while idle ({before} -> {idle})")
            if state["canvas"]["rise"] != f"{float(state['rise']):.3f}":
                fail(f"{label}: WebGL rise {state['canvas']['rise']} not synced with timeline {state['rise']}")
            if float(state["canvas"]["dpr"]) > 1.5:
                fail(f"{label}: DPR above cap")
        results["webgl"][label] = gl
    else:
        scroll_to(page, at(0.77))
        check_geometry(page, label)
        page.screenshot(path=str(SHOTS / f"identity-{label}-p77.png"))
    # The page must not have loaded three before the section approached.
    if errors:
        fail(f"{label}: console/page errors {errors}")
    results["desktop"][label] = out
    ctx.close()


with sync_playwright() as p:
    browser = launch(p)

    # Lazy loading: the three chunk must not be requested at the top of Home.
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    canvas_at_top = None
    page.goto(BASE + "/", wait_until="load")
    settle(page, 1500)
    canvas_at_top = page.evaluate("() => !!document.querySelector('[data-scene=identity] canvas')")
    results["webgl"]["canvas_at_page_top"] = canvas_at_top
    if canvas_at_top:
        fail("WebGL canvas created while the Identity section is far away")
    results["webgl"]["navigator"] = page.evaluate(
        "() => ({ deviceMemory: navigator.deviceMemory ?? null, cores: navigator.hardwareConcurrency })")
    ctx.close()

    stage_run(browser, 1440, 900, "1440x900", full=True)
    stage_run(browser, 1920, 1080, "1920x1080", full=False)
    stage_run(browser, 1280, 800, "1280x800", full=False)
    stage_run(browser, 1024, 768, "1024x768", full=False)

    # No WebGL: CSS moon fallback remains, nothing throws.
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    ctx.add_init_script(
        """(() => { const orig = HTMLCanvasElement.prototype.getContext;
           HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
             if (String(type).startsWith('webgl')) return null; return orig.call(this, type, ...rest); }; })()"""
    )
    page = ctx.new_page()
    errors = []
    attach_errors(page, errors)
    page.goto(BASE + "/", wait_until="load")
    settle(page, 1000)
    box = identity_box(page)
    distance = box["spacer"] - box["pinH"]
    scroll_to(page, box["top"] + distance * 0.77, 2500)
    st = page.evaluate(STATE_JS)
    disc_opacity = page.evaluate(
        "() => getComputedStyle(document.querySelector('[data-identity-moon-disc] > span')).opacity")
    results["no_webgl"] = {"renderer": st["renderer"], "canvas": st["canvas"], "disc_opacity": disc_opacity,
                           "moonWrap": st["moonWrap"], "errors": errors}
    if st["renderer"] != "fallback" or st["canvas"] or float(disc_opacity) < 0.99 or float(st["moonWrap"]) < 0.99:
        fail(f"no-WebGL fallback not visible {results['no_webgl']}")
    page.screenshot(path=str(SHOTS / "identity-no-webgl-p77.png"))
    unexpected_errors = [
        error for error in errors
        if not ("THREE.WebGLRenderer" in error and "Error creating WebGL context" in error)
    ]
    if unexpected_errors:
        fail(f"no-WebGL errors {unexpected_errors}")
    ctx.close()

    # Reduced motion: static, fully visible, no identity triggers, no WebGL.
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    errors = []
    attach_errors(page, errors)
    page.goto(BASE + "/", wait_until="load")
    settle(page, 800)
    page.evaluate("() => document.getElementById('identity').scrollIntoView()")
    settle(page, 1500)
    st = page.evaluate(STATE_JS)
    m = motion(page)
    results["reduced"] = {"motion": m, "state": st, "errors": errors}
    ids = (m or {}).get("triggers", [])
    if any(t.startswith("identity") for t in ids) or st["sequence"] or st["canvas"]:
        fail(f"reduced motion still animates Identity ({ids}, {st['sequence']}, {st['canvas']})")
    if (st["portrait"]["clip"] != "none" or float(st["copyA"]["o"]) < 1 or float(st["moonWrap"]) < 1
            or any(t != "none" for t in st["lines"])):
        fail("reduced motion Identity content not fully visible")
    page.screenshot(path=str(SHOTS / "identity-reduced-1440.png"), full_page=False)
    if errors:
        fail(f"reduced errors {errors}")
    ctx.close()

    # Mobile and short desktop: compact reveal, no pin, no WebGL.
    for label, vp in (("mobile", {"width": 390, "height": 844}), ("short", {"width": 1280, "height": 720})):
        ctx = browser.new_context(viewport=vp, device_scale_factor=2 if label == "mobile" else 1,
                                  is_mobile=label == "mobile", has_touch=label == "mobile")
        page = ctx.new_page()
        errors = []
        attach_errors(page, errors)
        page.goto(BASE + "/", wait_until="load")
        settle(page, 800)
        m = motion(page)
        ids = (m or {}).get("triggers", [])
        info = {"motion": m, "errors": errors}
        if ids.count("identity-reveal") != 1 or "identity-sequence" in ids:
            fail(f"{label}: expected one identity-reveal and no pin ({ids})")
        top = page.evaluate("() => document.getElementById('identity').getBoundingClientRect().top + scrollY")
        height = page.evaluate("() => document.getElementById('identity').offsetHeight")
        info["section_height"] = height
        scroll_to(page, top - vp["height"] * 0.1, 1200)
        page.screenshot(path=str(SHOTS / f"identity-{label}-start.png"))
        scroll_to(page, top + height * 0.35, 1200)
        page.screenshot(path=str(SHOTS / f"identity-{label}-mid.png"))
        scroll_to(page, top + height - vp["height"] * 0.6, 1500)
        st = page.evaluate(STATE_JS)
        info["end_state"] = st
        page.screenshot(path=str(SHOTS / f"identity-{label}-end.png"))
        if st["sequence"] or st["canvas"]:
            fail(f"{label}: pinned mode or WebGL active")
        if float(st["copyB"]["o"]) < 0.99 or "50%" in st["portrait"]["clip"]:
            fail(f"{label}: content not fully revealed at section end ({st['copyB']['o']}, {st['portrait']['clip']})")
        over = page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        info["overflow"] = over
        if over > 1:
            fail(f"{label}: horizontal overflow {over}px")
        if errors:
            fail(f"{label}: errors {errors}")
        results[label] = info
        ctx.close()

    # Route lifecycle: Home -> About -> Home through client navigation.
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    errors = []
    attach_errors(page, errors)
    page.goto(BASE + "/", wait_until="load")
    settle(page, 1000)
    box = identity_box(page)
    scroll_to(page, box["top"] + (box["spacer"] - box["pinH"]) * 0.6, 2500)
    home = motion(page)
    had_canvas = page.evaluate("() => !!document.querySelector('[data-scene=identity] canvas')")
    page.evaluate("() => window.scrollTo(0, 0)")
    settle(page, 400)
    page.click("header a[href='/about']")
    page.wait_for_url(BASE + "/about")
    settle(page, 1500)
    about = motion(page)
    canvases = page.evaluate("() => document.querySelectorAll('canvas').length")
    page.click("header a[href='/']")
    page.wait_for_url(BASE + "/")
    settle(page, 1500)
    back = motion(page)
    results["navigation"] = {"home": home, "had_canvas": had_canvas, "about": about,
                             "canvases_on_about": canvases, "back": back, "errors": errors}
    if any(t.startswith("identity") for t in (about or {}).get("triggers", [])):
        fail("identity triggers leaked into /about")
    if (about or {}).get("pins", 0) != 0:
        fail("pin spacers left on /about")
    if canvases:
        fail(f"{canvases} canvas element(s) left after leaving Home")
    if sorted((back or {}).get("triggers", [])) != sorted((home or {}).get("triggers", [])):
        fail("Home triggers differ after returning")
    if (back or {}).get("pins") != (home or {}).get("pins"):
        fail("Home pin count differs after returning")
    if errors:
        fail(f"navigation errors {errors}")
    ctx.close()
    browser.close()

(OUT / "identity-browser-results.json").write_text(json.dumps(results, indent=2, default=str))
print(json.dumps({k: results[k] for k in ("webgl", "no_webgl")}, indent=1, default=str)[:3000])
print("FAILURES:", len(results["failures"]))
