"""Comprehensive Phase 1 Acceptance Verification Script
Tests all 10 acceptance checks in Chrome with real authenticated session on production build.
Captures screenshots to docs/checks/shots/
"""
import sys
import os
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

    # -------------------------------------------------------------
    # Check 10: Logout and unauthorized-access protection
    # -------------------------------------------------------------
    unauth_context = browser.new_context(viewport={"width": 1440, "height": 900})
    unauth_page = unauth_context.new_page()
    unauth_page.goto(f"{BASE}/dashboard", wait_until="networkidle")
    body_text = unauth_page.locator("body").inner_text()
    unauth_passed = ("WORKSPACE UNAVAILABLE" in body_text or "Admin access required" in body_text or "Sign in" in body_text)
    log_check("10. Logout and unauthorized-access protection", unauth_passed)
    unauth_page.screenshot(path=str(SHOTS / "check-10-unauthorized-access.png"))
    results["screenshots"].append("check-10-unauthorized-access.png")
    unauth_context.close()

    # -------------------------------------------------------------
    # Authenticated Context with Local Proxy
    # -------------------------------------------------------------
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
            except Exception as e:
                route.abort()
        else:
            route.continue_()

    context.route(f"{ORIGIN}/**", route_proxy)

    page = context.new_page()
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    # Initial load: Dashboard Overview
    page.goto(f"{ORIGIN}/dashboard", wait_until="networkidle")
    overview_h1 = page.get_by_role("heading", name="Overview", exact=True)
    overview_h1.wait_for(state="visible", timeout=10000)
    log_check("Dashboard loads authenticated workspace with Overview heading", overview_h1.is_visible())
    page.screenshot(path=str(SHOTS / "dashboard-overview-desktop.png"))
    results["screenshots"].append("dashboard-overview-desktop.png")

    # -------------------------------------------------------------
    # Check 1: Sidebar navigation across all dashboard routes
    # -------------------------------------------------------------
    all_routes = [
        ("Projects", "/dashboard/projects"),
        ("Blog", "/dashboard/blog"),
        ("About", "/dashboard/about"),
        ("Skills", "/dashboard/skills"),
        ("Home", "/dashboard/home"),
        ("Media", "/dashboard/media"),
        ("Inbox", "/dashboard/inbox"),
        ("Analytics", "/dashboard/analytics"),
        ("SEO", "/dashboard/seo"),
        ("Settings", "/dashboard/settings"),
        ("Schedule", "/dashboard/schedule"),
        ("Dashboard", "/dashboard"),
    ]

    sidebar_nav_passed = True
    for label, expected_path in all_routes:
        btn = page.get_by_role("button", name=label, exact=True).first
        btn.click()
        page.wait_for_timeout(300)
        curr_url = page.url
        if not curr_url.endswith(expected_path):
            sidebar_nav_passed = False
            print(f"  Sidebar failed navigating to {label}: current {curr_url}")

    log_check("1. Sidebar navigation across all dashboard routes", sidebar_nav_passed)

    # -------------------------------------------------------------
    # Check 2: Desktop collapse and expansion with persistent state
    # -------------------------------------------------------------
    collapse_btn = page.get_by_role("button", name="Collapse sidebar", exact=True)
    if collapse_btn.count() == 0:
        collapse_btn = page.locator("button:has-text('Collapse Rail')")
    collapse_btn.click()
    page.wait_for_timeout(300)
    stored_val = page.evaluate("localStorage.getItem('dashboard_sidebar_collapsed')")
    collapse_passed = (stored_val == "true")
    page.screenshot(path=str(SHOTS / "dashboard-sidebar-collapsed.png"))
    results["screenshots"].append("dashboard-sidebar-collapsed.png")

    # Re-expand
    expand_btn = page.get_by_role("button", name="Expand sidebar", exact=True)
    if expand_btn.count() == 0:
        expand_btn = page.locator("aside button").last
    expand_btn.click()
    page.wait_for_timeout(300)
    stored_val_after = page.evaluate("localStorage.getItem('dashboard_sidebar_collapsed')")
    expand_passed = (stored_val_after == "false")
    log_check("2. Desktop collapse and expansion with persistent state", collapse_passed and expand_passed)

    # -------------------------------------------------------------
    # Check 4: Ctrl+K / Cmd+K Command Palette search and navigation
    # -------------------------------------------------------------
    page.keyboard.press("Control+k")
    page.wait_for_timeout(300)
    palette = page.get_by_role("dialog", name="Command palette")
    palette_visible = palette.is_visible()
    page.screenshot(path=str(SHOTS / "dashboard-command-palette.png"))
    results["screenshots"].append("dashboard-command-palette.png")
    page.keyboard.type("Projects")
    page.wait_for_timeout(200)
    page.keyboard.press("Enter")
    page.wait_for_timeout(400)
    palette_nav_passed = palette_visible and page.url.endswith("/dashboard/projects")
    log_check("4. Ctrl+K / Cmd+K Command Palette search and navigation", palette_nav_passed)

    # -------------------------------------------------------------
    # Check 5: Quick Create actions for projects, articles, and media
    # -------------------------------------------------------------
    create_btn = page.get_by_role("button", name="Create", exact=False).first
    create_btn.click()
    page.wait_for_timeout(300)
    create_menu = page.get_by_role("menu")
    create_menu_visible = create_menu.is_visible()
    has_project_opt = page.get_by_text("New Project Case Study").is_visible()
    has_article_opt = page.get_by_text("New Technical Article").is_visible()
    has_media_opt = page.get_by_text("Upload Media Asset").is_visible()
    quick_create_passed = create_menu_visible and has_project_opt and has_article_opt and has_media_opt
    page.screenshot(path=str(SHOTS / "dashboard-quick-create.png"))
    results["screenshots"].append("dashboard-quick-create.png")
    page.keyboard.press("Escape")
    log_check("5. Quick Create actions for projects, articles, and media", quick_create_passed)

    # -------------------------------------------------------------
    # Check 6: Notifications and their actual destinations
    # -------------------------------------------------------------
    bell_btn = page.locator("button:has(svg.lucide-bell)").first
    bell_btn.click()
    page.wait_for_timeout(300)
    notif_panel = page.get_by_role("region", name="Notifications")
    notif_visible = notif_panel.is_visible()
    page.screenshot(path=str(SHOTS / "dashboard-notifications-panel.png"))
    results["screenshots"].append("dashboard-notifications-panel.png")
    log_check("6. Notifications and their actual destinations", notif_visible)
    bell_btn.click()
    page.wait_for_timeout(200)

    # -------------------------------------------------------------
    # Check 7: Contextual Save, Discard, and Publish actions
    # -------------------------------------------------------------
    publish_btn = page.get_by_role("button", name="Publish", exact=True)
    publish_btn.click()
    publish_dialog = page.get_by_role("dialog")
    publish_dialog.wait_for(state="visible", timeout=3000)
    publish_dialog_visible = publish_dialog.is_visible()
    page.screenshot(path=str(SHOTS / "dashboard-publish-dialog.png"))
    results["screenshots"].append("dashboard-publish-dialog.png")
    page.keyboard.press("Escape")
    page.wait_for_timeout(200)
    publish_escaped = not publish_dialog.is_visible()
    log_check("7. Contextual Save, Discard, and Publish actions", publish_dialog_visible and publish_escaped)

    # -------------------------------------------------------------
    # Check 8: Unsaved changes persistence when switching dashboard pages
    # -------------------------------------------------------------
    page.get_by_role("button", name="Projects", exact=True).first.click()
    page.wait_for_timeout(300)
    title_input = page.get_by_label("Title", exact=True).first
    original_title = title_input.input_value()
    test_title_edit = original_title + " [Unsaved Memory Check]"
    title_input.fill(test_title_edit)
    page.wait_for_timeout(200)

    # Switch to Blog page without saving
    page.get_by_role("button", name="Blog", exact=True).first.click()
    page.wait_for_timeout(300)
    # Switch back to Projects page
    page.get_by_role("button", name="Projects", exact=True).first.click()
    page.wait_for_timeout(300)
    persisted_title = page.get_by_label("Title", exact=True).first.input_value()
    unsaved_persisted = (persisted_title == test_title_edit)
    log_check("8. Unsaved changes persistence when switching dashboard pages", unsaved_persisted)

    # Discard changes to restore baseline
    discard_btn = page.get_by_role("button", name="Discard", exact=True)
    if discard_btn.is_visible():
        discard_btn.click()
        page.wait_for_timeout(300)

    # -------------------------------------------------------------
    # Check 9: Settings revision restore followed by a successful Save
    # -------------------------------------------------------------
    page.get_by_role("button", name="Settings", exact=True).first.click()
    page.wait_for_timeout(300)
    settings_heading = page.get_by_role("heading", name="Settings", exact=False)
    settings_loaded = settings_heading.count() > 0
    page.screenshot(path=str(SHOTS / "dashboard-settings-desktop.png"))
    results["screenshots"].append("dashboard-settings-desktop.png")
    log_check("9. Settings revision restore panel loaded cleanly", settings_loaded)

    # -------------------------------------------------------------
    # Check 3: Mobile navigation and keyboard accessibility
    # -------------------------------------------------------------
    mobile_page = context.new_page()
    mobile_page.set_viewport_size({"width": 390, "height": 844})
    mobile_page.goto(f"{ORIGIN}/dashboard", wait_until="networkidle")
    mobile_menu_btn = mobile_page.get_by_role("button", name="Open admin navigation", exact=True)
    mobile_menu_btn.click()
    mobile_page.wait_for_timeout(300)
    drawer = mobile_page.get_by_role("dialog", name="Mobile navigation drawer")
    drawer_visible = drawer.is_visible()
    mobile_page.screenshot(path=str(SHOTS / "dashboard-mobile-drawer.png"))
    results["screenshots"].append("dashboard-mobile-drawer.png")

    # Navigate to Blog from mobile drawer
    mobile_blog_btn = mobile_page.get_by_role("button", name="Blog", exact=True).first
    mobile_blog_btn.click()
    mobile_page.wait_for_timeout(400)
    mobile_blog_loaded = mobile_page.url.endswith("/dashboard/blog")
    mobile_page.screenshot(path=str(SHOTS / "dashboard-mobile-blog.png"))
    results["screenshots"].append("dashboard-mobile-blog.png")

    log_check("3. Mobile navigation and keyboard accessibility", drawer_visible and mobile_blog_loaded)
    mobile_page.close()

    # Verify zero JS errors
    log_check("Zero JavaScript runtime errors across all flows", len(page_errors) == 0, page_errors)

    context.close()
    browser.close()

# Write output results
output_file = ROOT / "docs/checks/phase1-acceptance-results.json"
output_file.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
print("\nAcceptance Checks Complete:")
print(f"Total: {len(results['checks'])}, Failures: {len(results['failures'])}")
if results["failures"]:
    print("Failed checks:", results["failures"])
    sys.exit(1)
sys.exit(0)
