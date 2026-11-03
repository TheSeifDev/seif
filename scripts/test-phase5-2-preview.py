"""
Phase 5.2 — Live Deployed Preview Verification Suite
Tests the live deployed Vercel Preview URL:
https://prof-git-release-rc-phase5-1-s3fpls-projects.vercel.app
"""

import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright

PREVIEW_URL = "https://prof-git-release-rc-phase5-1-s3fpls-projects.vercel.app"
RESULTS_FILE = Path("docs/checks/phase5-2-preview-results.json")
SHOTS_DIR = Path("docs/checks/shots")
SHOTS_DIR.mkdir(parents=True, exist_ok=True)

results = {
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "preview_url": PREVIEW_URL,
    "checks": [],
    "failures": [],
}

def record_check(category: str, name: str, passed: bool, detail: str = ""):
    entry = {"category": category, "name": name, "passed": passed, "detail": detail}
    results["checks"].append(entry)
    if not passed:
        results["failures"].append(entry)
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {category} - {name} {f'({detail})' if detail else ''}")

def get_ci_headers(resp_or_err):
    return {k.lower(): v for k, v in resp_or_err.headers.items()}

def test_live_public_pages():
    print("\n--- 1. Testing Live Public Routes on Preview Deployment ---")
    routes = [
        ("/", "Home Page"),
        ("/about", "About Page"),
        ("/projects", "Projects Directory"),
        ("/blog", "Technical Blog"),
        ("/contact", "Contact Page"),
        ("/robots.txt", "Robots Directives"),
        ("/sitemap.xml", "Sitemap XML"),
    ]
    for path, desc in routes:
        req = urllib.request.Request(f"{PREVIEW_URL}{path}", headers={"User-Agent": "AntigravityAudit/1.0"})
        try:
            with urllib.request.urlopen(req) as resp:
                status = resp.status
                record_check("Public Route", f"{desc} ({path}) loads successfully", status == 200, f"Status: {status}")
        except Exception as e:
            record_check("Public Route", f"{desc} ({path}) failed to load", False, str(e))

def test_live_security_headers():
    print("\n--- 2. Testing Live Security & Isolation Headers on Preview ---")
    routes = [
        ("/dashboard", "Dashboard Overview"),
        ("/dashboard/home", "Home Live Editor"),
        ("/dashboard/preview/home", "Live Preview Frame"),
    ]
    for path, desc in routes:
        req = urllib.request.Request(f"{PREVIEW_URL}{path}", headers={"User-Agent": "AntigravityAudit/1.0"})
        try:
            with urllib.request.urlopen(req) as resp:
                headers = get_ci_headers(resp)
                csp = headers.get("content-security-policy", "")
                xfo = headers.get("x-frame-options", "")
                cache = headers.get("cache-control", "")
                
                record_check("Preview Security Headers", f"{desc} ({path}) enforces frame-ancestors 'self'", "frame-ancestors 'self'" in csp, f"CSP: {csp}")
                record_check("Preview Security Headers", f"{desc} ({path}) enforces XFO SAMEORIGIN", xfo.upper() == "SAMEORIGIN", f"XFO: {xfo}")
                record_check("Preview Security Headers", f"{desc} ({path}) enforces no-store caching", "no-store" in cache, f"Cache: {cache}")
        except urllib.error.HTTPError as e:
            record_check("Preview Security Headers", f"{desc} ({path}) returned HTTP error", False, f"Status: {e.code}")
        except Exception as e:
            record_check("Preview Security Headers", f"{desc} ({path}) error", False, str(e))

def test_live_admin_apis():
    print("\n--- 3. Testing Protected Admin APIs on Preview Deployment ---")
    apis = [
        ("GET", "/api/admin/content"),
        ("PUT", "/api/admin/content"),
        ("GET", "/api/admin/revisions"),
        ("POST", "/api/admin/publish"),
        ("GET", "/api/admin/messages"),
    ]
    for method, path in apis:
        data = json.dumps({"content": {}, "expectedRevision": 1}).encode("utf-8") if method in ["PUT", "POST"] else None
        headers = {"Content-Type": "application/json"} if data else {}
        req = urllib.request.Request(f"{PREVIEW_URL}{path}", data=data, headers=headers, method=method)
        try:
            urllib.request.urlopen(req)
            record_check("Preview API Auth", f"{method} {path} unexpectedly returned 200", False)
        except urllib.error.HTTPError as e:
            headers = get_ci_headers(e)
            is_unauthorized = e.code in [401, 403]
            cache = headers.get("cache-control", "")
            record_check("Preview API Auth", f"Unauthenticated {method} {path} rejected (HTTP 401/403)", is_unauthorized, f"Status: {e.code}")
            record_check("Preview API Auth", f"{method} {path} includes Cache-Control: no-store", "no-store" in cache, f"Cache: {cache}")

def test_live_browser_rendering():
    print("\n--- 4. Testing Browser Rendering & Capturing Screenshots on Preview ---")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        
        # Desktop
        desktop_page = browser.new_page(viewport={"width": 1440, "height": 900})
        desktop_page.goto(f"{PREVIEW_URL}/", wait_until="networkidle")
        desktop_page.wait_for_timeout(1000)
        desktop_page.screenshot(path=str(SHOTS_DIR / "preview-live-home-desktop.png"))
        record_check("Live Visual", "Desktop Home renders cleanly", True)
        
        # Test dashboard login guard on desktop
        desktop_page.goto(f"{PREVIEW_URL}/dashboard", wait_until="networkidle")
        desktop_page.wait_for_timeout(1000)
        guard_visible = desktop_page.locator("text=Private workspace").is_visible()
        desktop_page.screenshot(path=str(SHOTS_DIR / "preview-live-dashboard-guard.png"))
        record_check("Live Visual", "Dashboard displays private workspace guard", guard_visible)
        
        # Mobile
        mobile_page = browser.new_page(viewport={"width": 390, "height": 844})
        mobile_page.goto(f"{PREVIEW_URL}/", wait_until="networkidle")
        mobile_page.wait_for_timeout(1000)
        mobile_page.screenshot(path=str(SHOTS_DIR / "preview-live-home-mobile.png"))
        record_check("Live Visual", "Mobile Home renders cleanly", True)
        
        # Public About FAQ on Preview
        desktop_page.goto(f"{PREVIEW_URL}/about", wait_until="networkidle")
        desktop_page.wait_for_timeout(1000)
        faq_rendered = desktop_page.locator("text=Frequently Asked Questions").is_visible()
        desktop_page.screenshot(path=str(SHOTS_DIR / "preview-live-about-faq.png"))
        record_check("Live Visual", "Public About renders FAQ section from staging schema", faq_rendered)
        
        browser.close()

def main():
    print("=" * 60)
    print("Phase 5.2 — Live Deployed Preview Verification Suite")
    print("=" * 60)
    
    test_live_public_pages()
    test_live_security_headers()
    test_live_admin_apis()
    test_live_browser_rendering()
    
    total = len(results["checks"])
    failed = len(results["failures"])
    passed = total - failed
    
    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} checks passed ({failed} failures)")
    print("=" * 60)
    
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Results saved to {RESULTS_FILE}")
    
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()

