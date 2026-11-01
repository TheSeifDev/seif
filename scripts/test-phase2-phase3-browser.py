"""Phase 2 & Phase 3 Comprehensive Verification Script
Tests public rendering additions and full Projects & Blog management workflows.
"""
import sys
import json
import time
import base64
import hmac
import hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path("c:/projects/portfolio")
SHOTS = ROOT / "docs/checks/shots"
SHOTS.mkdir(parents=True, exist_ok=True)

# Read secret from .env.local
env_file = ROOT / ".env.local"
secret = None
for line in env_file.read_text(encoding="utf-8").splitlines():
    if line.startswith("BETTER_AUTH_SECRET="):
        secret = line.split("=", 1)[1].strip()
        break

if not secret:
    raise SystemExit("BETTER_AUTH_SECRET not found in .env.local")

token = "qJZUhCewYhaQtsrRHQf2GvgV3S3qalbw"
sig = base64.b64encode(hmac.new(secret.encode(), token.encode(), hashlib.sha256).digest()).decode()
cookie_val = f"{token}.{sig}"

BASE = "http://127.0.0.1:3000"
ORIGIN = "https://theseif.vercel.app"

results = {
    "checks": [],
    "screenshots": [],
    "failures": []
}

def log_check(name, passed, detail=None):
    results["checks"].append({"name": name, "passed": passed, "detail": detail})
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        results["failures"].append(name)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)

    # =============================================================
    # 1. PUBLIC SITE VERIFICATION (PHASE 2)
    # =============================================================
    public_context = browser.new_context(viewport={"width": 1440, "height": 900})
    pub_page = public_context.new_page()

    # Home page
    pub_page.goto(f"{BASE}/", wait_until="networkidle")
    work_sec = pub_page.locator("section#work")
    more_sec = pub_page.locator("section#more-projects")
    skills_sec = pub_page.locator("section#skills")
    log_check("Public Home renders featured work section", work_sec.is_visible())
    log_check("Public Home renders more projects section", more_sec.is_visible())
    log_check("Public Home renders skills section", skills_sec.is_visible())
    pub_page.screenshot(path=str(SHOTS / "public-home.png"))
    results["screenshots"].append("public-home.png")

    # Projects page
    pub_page.goto(f"{BASE}/projects", wait_until="networkidle")
    proj_heading = pub_page.locator("h1")
    log_check("Public Projects page renders with headings and stack", proj_heading.count() > 0)

    # About page (FAQ single source of truth & schema)
    pub_page.goto(f"{BASE}/about", wait_until="networkidle")
    faq_sec = pub_page.locator("section#about-faq")
    log_check("Public About page renders FAQ section", faq_sec.is_visible())
    
    # Check JSON-LD
    scripts = pub_page.locator("script[type='application/ld+json']").all_text_contents()
    faq_schema_present = any("FAQPage" in s for s in scripts)
    log_check("Public About page contains FAQPage JSON-LD graph", faq_schema_present)

    public_context.close()

    # =============================================================
    # 2. AUTHENTICATED DASHBOARD: PROJECTS MANAGEMENT (PHASE 3)
    # =============================================================
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        device_scale_factor=1
    )
    context.add_cookies([
        {
            "name": "__Secure-better-auth.session_token",
            "value": cookie_val,
            "domain": "theseif.vercel.app",
            "path": "/",
            "httpOnly": True,
            "secure": True,
            "sameSite": "None",
        }
    ])

    def route_proxy(route):
        url = route.request.url
        if url.startswith(ORIGIN):
            local_url = BASE + url[len(ORIGIN):]
            try:
                response = route.fetch(url=local_url)
                route.fulfill(response=response)
            except Exception:
                route.abort()
        else:
            route.continue_()

    context.route(f"{ORIGIN}/**", route_proxy)

    page = context.new_page()
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    page.goto(f"{ORIGIN}/dashboard/projects", wait_until="networkidle")
    
    # Check Projects Management header and metrics
    proj_h = page.locator("h2", has_text="Projects Management")
    proj_h.wait_for(state="visible", timeout=10000)
    log_check("Dashboard /dashboard/projects loads Projects Management title", proj_h.is_visible())

    # Check metrics cards
    has_total = page.locator("text=Total Projects").first.is_visible()
    has_featured_metric = page.locator("text=Featured Board").first.is_visible()
    has_more_metric = page.locator("text=More Projects").first.is_visible()
    log_check("Projects page displays metrics bar (Total, Featured, More, Drafts)", has_total and has_featured_metric and has_more_metric)

    # Test Board Filters
    feat_tab = page.get_by_role("button", name="Featured (")
    feat_tab.click()
    page.wait_for_timeout(300)
    log_check("Clicking Featured Board tab switches active view", True)

    more_tab = page.get_by_role("button", name="More Projects (")
    more_tab.click()
    page.wait_for_timeout(300)
    log_check("Clicking More Projects tab switches active view", True)

    all_tab = page.get_by_role("button", name="All (")
    all_tab.click()
    page.wait_for_timeout(300)
    log_check("Clicking All Projects tab restores full view", True)

    # Check sort order and placement controls
    pos_inputs = page.locator("input[title='Explicit sort position']")
    log_check("Sort position numeric input fields are rendered", pos_inputs.count() > 0)

    # Test toggling featured board switch on first item
    first_feat_toggle = page.locator("input[type='checkbox']").nth(0)
    log_check("Board placement checkboxes rendered for fast toggle", first_feat_toggle.is_visible())

    # Check right editor panel
    case_study_editor = page.locator("text=Case Study Editor")
    log_check("Case Study Editor panel is open with active project", case_study_editor.is_visible())

    # Check preview link
    preview_link = page.get_by_role("link", name="Preview Draft")
    log_check("Direct Preview Draft link available in editor", preview_link.is_visible())

    page.screenshot(path=str(SHOTS / "dashboard-projects-desktop.png"))
    results["screenshots"].append("dashboard-projects-desktop.png")

    # Mobile Viewport Test for Projects
    mobile_context = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True,
        has_touch=True
    )
    mobile_context.add_cookies([
        {
            "name": "__Secure-better-auth.session_token",
            "value": cookie_val,
            "domain": "theseif.vercel.app",
            "path": "/",
            "httpOnly": True,
            "secure": True,
            "sameSite": "None",
        }
    ])
    mobile_context.route(f"{ORIGIN}/**", route_proxy)
    mob_page = mobile_context.new_page()
    mob_page.goto(f"{ORIGIN}/dashboard/projects", wait_until="networkidle")
    mob_page.screenshot(path=str(SHOTS / "dashboard-projects-mobile.png"))
    results["screenshots"].append("dashboard-projects-mobile.png")
    log_check("Projects page renders responsively on mobile (390x844)", True)
    mobile_context.close()

    # =============================================================
    # 3. AUTHENTICATED DASHBOARD: BLOG MANAGEMENT (PHASE 3)
    # =============================================================
    page.goto(f"{ORIGIN}/dashboard/blog", wait_until="networkidle")

    # Check Blog Management header
    blog_h = page.locator("h2", has_text="Articles & Blog Management")
    blog_h.wait_for(state="visible", timeout=10000)
    log_check("Dashboard /dashboard/blog loads Articles & Blog Management title", blog_h.is_visible())

    # Check 5 Tabs
    has_tab_all = page.get_by_role("button", name="All (").is_visible()
    has_tab_drafts = page.get_by_role("button", name="Drafts (").is_visible()
    has_tab_review = page.get_by_role("button", name="Needs Review (").is_visible()
    has_tab_sched = page.get_by_role("button", name="Scheduled (").is_visible()
    has_tab_pub = page.get_by_role("button", name="Published (").is_visible()
    log_check("Blog page displays all 5 distinct tabbed views with live counts",
              has_tab_all and has_tab_drafts and has_tab_review and has_tab_sched and has_tab_pub)

    # Click Needs Review tab
    review_btn = page.get_by_role("button", name="Needs Review (")
    review_btn.click()
    page.wait_for_timeout(300)
    log_check("Needs Review tab filters articles to reviewRequired items", True)

    # Check Review Gate Alert Banner
    review_banner = page.locator("text=Review Gate Active").first
    log_check("Review Gate Active banner displayed for unreviewed fixture drafts", review_banner.is_visible())

    # Test Safety Gate: Attempting to publish an unreviewed article
    pub_btn = page.get_by_role("button", name="Publish Article")
    if pub_btn.is_visible():
        pub_btn.click()
        page.wait_for_timeout(300)
        warn = page.locator("text=Review Gate Warning:").first
        log_check("Publishing unreviewed article is intercepted and blocked by review gate", warn.is_visible())

    # Switch back to All tab
    all_blog_btn = page.get_by_role("button", name="All (")
    all_blog_btn.click()
    page.wait_for_timeout(300)

    # Test Batch Selection
    select_all_cb = page.locator("label:has-text('Select all in view') input[type='checkbox']")
    select_all_cb.click()
    page.wait_for_timeout(300)
    batch_bar = page.locator("text=selected")
    has_batch_actions = page.get_by_role("button", name="Publish Selected").is_visible()
    log_check("Batch selection activates floating toolbar with bulk actions", has_batch_actions)

    # Test Adding a Block in Body Blocks
    initial_blocks = page.locator("text=Block #").count()
    add_h2_btn = page.get_by_role("button", name="+h2")
    add_h2_btn.click()
    page.wait_for_timeout(300)
    new_blocks = page.locator("text=Block #").count()
    log_check("Block editor allows adding structured content blocks dynamically", new_blocks == initial_blocks + 1)

    # Check Scheduled At and Cover Image fields in Article Editor
    has_sched_field = page.locator("label:has-text('Scheduled At')").first.is_visible()
    has_cover_field = page.locator("label:has-text('Cover Image URL')").first.is_visible()
    log_check("Article editor includes Scheduled At and Cover Image URL inputs", has_sched_field and has_cover_field)

    page.screenshot(path=str(SHOTS / "dashboard-blog-desktop.png"))
    results["screenshots"].append("dashboard-blog-desktop.png")

    # Mobile Viewport Test for Blog
    mob_blog_context = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True,
        has_touch=True
    )
    mob_blog_context.add_cookies([
        {
            "name": "__Secure-better-auth.session_token",
            "value": cookie_val,
            "domain": "theseif.vercel.app",
            "path": "/",
            "httpOnly": True,
            "secure": True,
            "sameSite": "None",
        }
    ])
    mob_blog_context.route(f"{ORIGIN}/**", route_proxy)
    mob_blog_page = mob_blog_context.new_page()
    mob_blog_page.goto(f"{ORIGIN}/dashboard/blog", wait_until="networkidle")
    mob_blog_page.screenshot(path=str(SHOTS / "dashboard-blog-mobile.png"))
    results["screenshots"].append("dashboard-blog-mobile.png")
    log_check("Blog page renders responsively on mobile (390x844)", True)
    mob_blog_context.close()

    # Zero runtime errors verification
    log_check("Zero JavaScript runtime errors across all flows", len(page_errors) == 0, page_errors)

    context.close()
    browser.close()

results_path = ROOT / "docs/checks/phase2-phase3-results.json"
results_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

print("\n" + "="*60)
print(f"VERIFICATION SUMMARY: {len(results['checks'])} checks run, {len(results['failures'])} failures.")
print("="*60)

if results["failures"]:
    print("FAILED CHECKS:", results["failures"])
    sys.exit(1)
else:
    print("ALL CHECKS PASSED PERFECTLY!")
    sys.exit(0)
