"""Real-browser checks for the redesigned /projects page (作品集 Archive).

Runs against the production build on :3000. Covers: console errors, horizontal
overflow, no pins, hero wordmark + count-up + reversible line drift, index rows,
cursor-following preview (open / follow / close), domain filter (Flip result,
aria state, live count, sliding indicator), sticky stacked case files (scale +
shade forward and reverse, media unmask), clipped card content on stage and
short viewports, compact/touch fallbacks, reduced motion and trigger cleanup
across client navigation. Writes docs/checks/projects-browser-results.json;
screenshots go to docs/checks/shots/ (git-ignored).
"""

import json
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("docs/checks")
SHOTS = OUT / "shots"
SHOTS.mkdir(parents=True, exist_ok=True)

results: dict = {"desktop": {}, "stage_sizes": {}, "compact": {}, "reduced": {},
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


def scroll_to(page, y: float, ms: int = 500) -> None:
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


VISIBLE_ROWS_JS = """
() => [...document.querySelectorAll('[data-index-row]')]
  .filter(li => getComputedStyle(li).display !== 'none')
  .map(li => ({
    slug: li.dataset.flipId,
    opacity: Number(getComputedStyle(li).opacity),
    reveal: Number(getComputedStyle(li.querySelector('[data-row-reveal]')).opacity),
    position: getComputedStyle(li).position,
  }))
"""

PREVIEW_JS = """
() => {
  const p = document.querySelector('[data-preview-frame]').parentElement;
  const f = p.querySelector('[data-preview-frame]');
  const items = [...p.querySelectorAll('[data-preview-item]')].map(i => ({
    slug: i.dataset.previewItem, opacity: Number(getComputedStyle(i).opacity) }));
  const r = p.getBoundingClientRect();
  return { visibility: getComputedStyle(p).visibility, clip: getComputedStyle(f).clipPath,
           x: r.left, y: r.top, w: r.width, h: r.height, items };
}
"""

STACK_JS = """
() => [...document.querySelectorAll('[data-stack-card]')].map(li => {
  const inner = li.querySelector('[data-stack-inner]');
  const shade = li.querySelector('[data-stack-shade]');
  const media = li.querySelector('[data-stack-media]');
  const copyCol = li.querySelector('[data-stack-copy]').parentElement;
  const r = li.getBoundingClientRect();
  const a = inner.getBoundingClientRect();
  const m = new DOMMatrixReadOnly(getComputedStyle(inner).transform === 'none' ? undefined : getComputedStyle(inner).transform);
  const texts = [...inner.querySelectorAll('h3, p, li, a')].filter(el => el.getClientRects().length);
  const clipped = texts.filter(el => {
    const b = el.getBoundingClientRect();
    return b.bottom > a.bottom + 1 || b.right > a.right + 1 || b.top < a.top - 1;
  }).map(el => el.textContent.trim().slice(0, 40));
  return {
    top: r.top, bottom: r.bottom, height: r.height,
    position: getComputedStyle(li).position,
    scale: m.a,
    shade: Number(getComputedStyle(shade).opacity),
    clip: getComputedStyle(media).clipPath,
    copyOverflow: copyCol.scrollHeight - copyCol.clientHeight,
    clipped,
  };
})
"""


def check_stage_cards(page, key: str) -> list:
    """Scroll each card to its sticky slot and verify it fits and nothing is clipped."""
    stack_top = doc_top(page, "[data-stack]")
    cards = page.evaluate("() => document.querySelectorAll('[data-stack-card]').length")
    snapshots = []
    for index in range(cards):
        height = page.evaluate("() => document.querySelector('[data-stack-card]').offsetHeight")
        scroll_to(page, stack_top + index * height - (96 + index * 16) + 2, 900)
        state = page.evaluate(STACK_JS)
        card = state[index]
        snapshots.append({"index": index, **{k: card[k] for k in ("top", "bottom", "position", "scale", "clip", "copyOverflow", "clipped")}})
        if card["position"] != "sticky":
            fail(f"{key}: card {index + 1} is not sticky ({card['position']})")
        viewport_h = page.evaluate("() => innerHeight")
        if card["bottom"] > viewport_h + 1:
            fail(f"{key}: card {index + 1} bottom {card['bottom']:.0f} > viewport {viewport_h}")
        if card["copyOverflow"] > 1:
            fail(f"{key}: card {index + 1} copy column overflows by {card['copyOverflow']}px")
        if card["clipped"]:
            fail(f"{key}: card {index + 1} clipped text {card['clipped']}")
        if "inset(0%" not in card["clip"] and "inset(0px" not in card["clip"]:
            fail(f"{key}: card {index + 1} media not open in its slot ({card['clip']})")
    return snapshots


with sync_playwright() as p:
    browser = launch(p)

    # ---------------------------------------------------------------- desktop
    errors: list = []
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    attach_errors(page, errors)
    page.goto(f"{BASE}/projects", wait_until="networkidle")
    page.wait_for_timeout(2600)
    d = results["desktop"]

    d["title"] = page.evaluate("() => document.querySelector('#projects-title').textContent.replace(/\\s+/g, ' ').trim()")
    if d["title"] != "Selected Work (06)":
        fail(f"hero title text '{d['title']}'")
    d["counts"] = page.evaluate("() => [...document.querySelectorAll('[data-count]')].map(e => e.textContent)")
    if d["counts"] != ["06", "03", "07"]:
        fail(f"hero counts {d['counts']}")
    m = motion(page)
    d["pins"] = m["pins"] if m else None
    d["triggers"] = sorted(t for t in (m["triggers"] if m else []) if str(t).startswith("projects-page-"))
    if m and m["pins"]:
        fail(f"desktop pins on /projects: {m['pins']}")
    for needed in ("projects-page-hero-drift", "projects-page-index", "projects-page-stack-1", "projects-page-stack-2"):
        if needed not in d["triggers"]:
            fail(f"missing trigger {needed}")
    page.screenshot(path=str(SHOTS / "projects-1440-hero.png"))

    line_js = "() => [...document.querySelectorAll('[data-hero-line]')].map(l => new DOMMatrixReadOnly(getComputedStyle(l).transform === 'none' ? undefined : getComputedStyle(l).transform).e)"
    base_lines = page.evaluate(line_js)
    scroll_to(page, 450, 900)
    drift_lines = page.evaluate(line_js)
    scroll_to(page, 0, 900)
    back_lines = page.evaluate(line_js)
    d["hero_drift"] = {"base": base_lines, "drift": drift_lines, "back": back_lines}
    if not (drift_lines[0] < base_lines[0] - 10 and drift_lines[1] > base_lines[1] + 10):
        fail(f"hero lines did not drift apart {d['hero_drift']}")
    if any(abs(a - b) > 1 for a, b in zip(base_lines, back_lines)):
        fail(f"hero drift not reversible {d['hero_drift']}")

    # Index rows + preview
    index_top = doc_top(page, "[data-index-list]")
    scroll_to(page, index_top - 220, 1400)
    rows = page.evaluate(VISIBLE_ROWS_JS)
    d["rows"] = len(rows)
    if len(rows) != 6 or any(r["reveal"] < 0.99 for r in rows):
        fail(f"index rows not all visible {rows}")
    page.screenshot(path=str(SHOTS / "projects-1440-index.png"))

    first = page.locator("[data-index-row] a").nth(0).bounding_box()
    page.mouse.move(first["x"] + first["width"] * 0.35, first["y"] + first["height"] / 2)
    page.wait_for_timeout(900)
    open_state = page.evaluate(PREVIEW_JS)
    page.mouse.move(first["x"] + first["width"] * 0.55, first["y"] + first["height"] / 2, steps=8)
    page.wait_for_timeout(900)
    moved_state = page.evaluate(PREVIEW_JS)
    second = page.locator("[data-index-row] a").nth(1).bounding_box()
    page.mouse.move(second["x"] + second["width"] * 0.55, second["y"] + second["height"] / 2, steps=6)
    page.wait_for_timeout(900)
    swap_state = page.evaluate(PREVIEW_JS)
    page.screenshot(path=str(SHOTS / "projects-1440-index-preview.png"))
    dim = page.evaluate("() => [...document.querySelectorAll('[data-index-row] a')].map(a => Number(getComputedStyle(a).opacity))")
    page.mouse.move(20, 200)
    page.wait_for_timeout(900)
    closed_state = page.evaluate(PREVIEW_JS)
    d["preview"] = {
        "open_clip": open_state["clip"], "open_item": [i["slug"] for i in open_state["items"] if i["opacity"] > 0.9],
        "moved_dx": moved_state["x"] - open_state["x"],
        "swap_item": [i["slug"] for i in swap_state["items"] if i["opacity"] > 0.9],
        "closed_clip": closed_state["clip"], "dim": dim,
    }
    if "inset(0%" not in open_state["clip"] and "inset(0px" not in open_state["clip"]:
        fail(f"preview did not open {open_state['clip']}")
    if d["preview"]["open_item"] != ["rafiq"]:
        fail(f"preview item on first row {d['preview']['open_item']}")
    if d["preview"]["moved_dx"] < 100:
        fail(f"preview did not follow cursor dx={d['preview']['moved_dx']}")
    if d["preview"]["swap_item"] != ["it-sum"]:
        fail(f"preview did not swap to row 2 {d['preview']['swap_item']}")
    if "50%" not in closed_state["clip"]:
        fail(f"preview did not close {closed_state['clip']}")
    if not (dim[1] > 0.95 and min(dim[:1] + dim[2:]) < 0.5):
        fail(f"sibling rows not dimmed while hovering {dim}")

    # Filter
    def pick(name: str):
        page.locator("[data-filter-rail] button", has_text=name).first.click()
        page.mouse.move(20, 200)
        page.wait_for_timeout(1500)

    def indicator_gap(name: str) -> float:
        return page.evaluate(
            """n => { const b = [...document.querySelectorAll('[data-filter-rail] button')].find(x => x.textContent.startsWith(n));
                      const i = document.querySelector('[data-filter-rail] > span').getBoundingClientRect();
                      const r = b.getBoundingClientRect(); return Math.abs(i.left - r.left) + Math.abs(i.width - r.width); }""",
            name,
        )

    pick("Healthcare")
    hc_rows = page.evaluate(VISIBLE_ROWS_JS)
    live = page.evaluate("() => document.querySelector('[aria-live]').textContent.replace(/\\s+/g, ' ').trim()")
    pressed = page.evaluate("() => [...document.querySelectorAll('[data-filter-rail] button[aria-pressed=true]')].map(b => b.textContent)")
    d["filter_healthcare"] = {"rows": [r["slug"] for r in hc_rows], "live": live, "pressed": pressed,
                              "indicator_gap": indicator_gap("Healthcare"),
                              "opacities": [r["opacity"] for r in hc_rows], "positions": [r["position"] for r in hc_rows]}
    if [r["slug"] for r in hc_rows] != ["nabd-masr"]:
        fail(f"healthcare filter rows {d['filter_healthcare']['rows']}")
    if not live.startswith("01 / 06"):
        fail(f"live count '{live}'")
    if any(o < 0.99 for o in d["filter_healthcare"]["opacities"]) or any(pos == "absolute" for pos in d["filter_healthcare"]["positions"]):
        fail(f"filtered rows not settled {d['filter_healthcare']}")
    if d["filter_healthcare"]["indicator_gap"] > 3:
        fail(f"indicator not under Healthcare (gap {d['filter_healthcare']['indicator_gap']})")
    page.screenshot(path=str(SHOTS / "projects-1440-filter.png"))
    # Below-list triggers must follow the shorter list: heading reveals and card 1 sticks correctly.
    scroll_to(page, doc_top(page, "#in-focus-title") - 500, 1600)
    heading_y = page.evaluate(
        "() => { const l = document.querySelector('#in-focus-title > *'); return l ? new DOMMatrixReadOnly(getComputedStyle(l.firstElementChild || l).transform === 'none' ? undefined : getComputedStyle(l.firstElementChild || l).transform).f : null }"
    )
    filtered_cards = check_stage_cards(page, "desktop-filtered")
    d["filter_healthcare"]["in_focus_heading_y"] = heading_y
    d["filter_healthcare"]["cards"] = filtered_cards
    if heading_y is None or abs(heading_y) > 1:
        fail(f"In focus heading not revealed after filtering (translateY {heading_y})")
    scroll_to(page, doc_top(page, "[data-filter-rail]") - 300, 900)
    pick("Web")
    web_rows = page.evaluate(VISIBLE_ROWS_JS)
    d["filter_web"] = [r["slug"] for r in web_rows]
    if len(web_rows) != 5 or any(r["opacity"] < 0.99 for r in web_rows):
        fail(f"web filter rows {web_rows}")
    pick("All")
    all_rows = page.evaluate(VISIBLE_ROWS_JS)
    if len(all_rows) != 6 or any(r["opacity"] < 0.99 or r["reveal"] < 0.99 for r in all_rows):
        fail(f"rows after All {all_rows}")
    if indicator_gap("All") > 3:
        fail("indicator not back under All")

    # Stacked case files: forward then reverse
    d["stack"] = check_stage_cards(page, "desktop")
    stack_top = doc_top(page, "[data-stack]")
    height = page.evaluate("() => document.querySelector('[data-stack-card]').offsetHeight")
    scroll_to(page, stack_top + height - 112 + 2, 900)
    after_second = page.evaluate(STACK_JS)
    page.screenshot(path=str(SHOTS / "projects-1440-stack-2.png"))
    scroll_to(page, stack_top - 360, 1100)
    back_first = page.evaluate(STACK_JS)
    page.screenshot(path=str(SHOTS / "projects-1440-stack-1.png"))
    d["stack_scale"] = {"after_second": [round(c["scale"], 3) for c in after_second],
                        "shade_after_second": [round(c["shade"], 2) for c in after_second],
                        "back_first": [round(c["scale"], 3) for c in back_first],
                        "clip_first": back_first[0]["clip"]}
    if not (0.9 <= after_second[0]["scale"] <= 0.935 and after_second[0]["shade"] > 0.4):
        fail(f"card 1 did not settle back when card 2 arrived {d['stack_scale']}")
    if abs(back_first[0]["scale"] - 1) > 0.005 or back_first[0]["shade"] > 0.02:
        fail(f"stack not reversible {d['stack_scale']}")
    if "inset(0%" in back_first[0]["clip"]:
        fail(f"card 1 media did not close again when scrolled back above the stack {back_first[0]['clip']}")

    # CTA
    cta = page.evaluate("() => { const a = document.querySelector('a[data-magnetic][href=\"/contact\"]'); return a ? { text: a.textContent.replace(/\\s+/g,' ').trim() } : null }")
    d["cta"] = cta
    if not cta or "worth building" not in cta["text"]:
        fail(f"cta missing {cta}")
    scroll_to(page, doc_top(page, "#projects-cta-title") - 300, 1400)
    page.screenshot(path=str(SHOTS / "projects-1440-cta.png"))
    d["overflow"] = overflow(page)
    if d["overflow"] > 0:
        fail(f"desktop horizontal overflow {d['overflow']}")
    d["errors"] = list(errors)
    if errors:
        fail(f"desktop console errors {errors[:3]}")

    # Client navigation cleanup
    page.evaluate("() => window.scrollTo(0, 0)")
    settle(page, 300)
    page.locator("header a[href='/about']").first.click()
    page.wait_for_url(f"{BASE}/about")
    page.wait_for_timeout(1400)
    after_nav = motion(page)
    leaked = [t for t in (after_nav["triggers"] if after_nav else []) if str(t).startswith("projects-page-")]
    results["navigation"]["leaked"] = leaked
    if leaked:
        fail(f"projects triggers leaked to /about {leaked}")
    page.go_back()
    page.wait_for_url(f"{BASE}/projects")
    page.wait_for_timeout(1600)
    again = motion(page)
    results["navigation"]["back_triggers"] = len([t for t in (again["triggers"] if again else []) if str(t).startswith("projects-page-")])
    if results["navigation"]["back_triggers"] < 4:
        fail("projects triggers not recreated after back navigation")
    ctx.close()

    # ------------------------------------------------- other stage viewports
    for key, viewport in (("1280x760", {"width": 1280, "height": 760}),
                          ("1024x768", {"width": 1024, "height": 768}),
                          ("1920x1080", {"width": 1920, "height": 1080})):
        bucket: list = []
        ctx = browser.new_context(viewport=viewport)
        page = ctx.new_page()
        attach_errors(page, bucket)
        page.goto(f"{BASE}/projects", wait_until="networkidle")
        page.wait_for_timeout(1800)
        entry = {"overflow": overflow(page), "cards": check_stage_cards(page, key), "errors": bucket}
        page.screenshot(path=str(SHOTS / f"projects-{key}-stack.png"))
        if entry["overflow"] > 0:
            fail(f"{key}: horizontal overflow {entry['overflow']}")
        if bucket:
            fail(f"{key}: console errors {bucket[:3]}")
        results["stage_sizes"][key] = entry
        ctx.close()

    # ------------------------------------------------------- compact / touch
    for key, viewport, touch in (("tablet", {"width": 768, "height": 1024}, True),
                                 ("mobile", {"width": 390, "height": 844}, True),
                                 ("short-1280x700", {"width": 1280, "height": 700}, False)):
        bucket = []
        ctx = browser.new_context(viewport=viewport, is_mobile=key == "mobile", has_touch=touch)
        page = ctx.new_page()
        attach_errors(page, bucket)
        page.goto(f"{BASE}/projects", wait_until="networkidle")
        page.wait_for_timeout(1800)
        entry = {"overflow": overflow(page)}
        height = page.evaluate("() => document.documentElement.scrollHeight")
        y = 0
        while y < height:
            scroll_to(page, y, 250)
            y += viewport["height"] * 0.6
        scroll_to(page, doc_top(page, "[data-index-list]") - 120, 1200)
        entry["rows"] = page.evaluate(VISIBLE_ROWS_JS)
        entry["thumbs"] = page.evaluate("() => [...document.querySelectorAll('[data-index-row] a > span:last-child > span:first-child')].map(s => getComputedStyle(s).display)")
        page.screenshot(path=str(SHOTS / f"projects-{key}-index.png"))
        scroll_to(page, doc_top(page, "[data-stack]") - 80, 1200)
        stack = page.evaluate(STACK_JS)
        entry["stack"] = [{k: c[k] for k in ("position", "scale", "copyOverflow", "clipped")} for c in stack]
        page.screenshot(path=str(SHOTS / f"projects-{key}-stack.png"))
        entry["errors"] = bucket
        if entry["overflow"] > 0:
            fail(f"{key}: horizontal overflow {entry['overflow']}")
        if len(entry["rows"]) != 6 or any(r["reveal"] < 0.99 for r in entry["rows"]):
            fail(f"{key}: index rows not visible {entry['rows']}")
        if touch and any(t == "none" for t in entry["thumbs"]):
            fail(f"{key}: row thumbnails hidden on touch {entry['thumbs']}")
        if any(c["position"] == "sticky" for c in stack):
            fail(f"{key}: cards sticky outside stage")
        if any(c["clipped"] or c["copyOverflow"] > 1 for c in stack):
            fail(f"{key}: clipped card content {entry['stack']}")
        if bucket:
            fail(f"{key}: console errors {bucket[:3]}")
        results["compact"][key] = entry
        ctx.close()

    # -------------------------------------------------------- reduced motion
    bucket = []
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    attach_errors(page, bucket)
    page.goto(f"{BASE}/projects", wait_until="networkidle")
    page.wait_for_timeout(800)
    r = results["reduced"]
    m = motion(page)
    r["triggers"] = [t for t in (m["triggers"] if m else []) if str(t).startswith("projects-page-")]
    r["counts"] = page.evaluate("() => [...document.querySelectorAll('[data-count]')].map(e => e.textContent)")
    r["rows"] = page.evaluate(VISIBLE_ROWS_JS)
    r["stack"] = [{k: c[k] for k in ("position", "scale", "clip")} for c in page.evaluate(STACK_JS)]
    r["hidden_text"] = page.evaluate(
        "() => [...document.querySelectorAll('main h1, main h2, main h3, main p')].filter(e => !e.closest('[aria-hidden=true]')).filter(e => Number(getComputedStyle(e).opacity) < 0.99 || getComputedStyle(e).visibility === 'hidden').map(e => e.textContent.trim().slice(0, 30))"
    )
    page.locator("[data-filter-rail] button", has_text="AI").first.click()
    page.wait_for_timeout(200)
    r["ai_rows"] = [row["slug"] for row in page.evaluate(VISIBLE_ROWS_JS)]
    if r["triggers"]:
        fail(f"reduced motion created triggers {r['triggers']}")
    if r["counts"] != ["06", "03", "07"]:
        fail(f"reduced motion counts {r['counts']}")
    if len(r["rows"]) != 6 or any(row["reveal"] < 0.99 for row in r["rows"]):
        fail("reduced motion rows not visible")
    if any(c["position"] == "sticky" for c in r["stack"]):
        fail("reduced motion cards sticky")
    if r["hidden_text"]:
        fail(f"reduced motion hidden text {r['hidden_text'][:4]}")
    if r["ai_rows"] != ["rafiq"]:
        fail(f"reduced motion AI filter {r['ai_rows']}")
    if bucket:
        fail(f"reduced console errors {bucket[:3]}")
    ctx.close()
    browser.close()

(OUT / "projects-browser-results.json").write_text(json.dumps(results, indent=2))
print(json.dumps({k: v for k, v in results.items() if k in ("failures",)}, indent=2))
print("FAILURES:", len(results["failures"]))
raise SystemExit(1 if results["failures"] else 0)
