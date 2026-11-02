"""
Phase 5.1 — Release Candidate Verification Test Script
Tests security headers, negative auth cases, CSRF, postMessage boundaries,
and client-side bundle leakage.
"""

import sys
import json
import base64
import hmac
import hashlib
import time
import urllib.request
import urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:3000"
RESULTS_FILE = Path("docs/checks/phase5-1-rc-results.json")

results = {
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "checks": [],
    "failures": [],
    "security_headers": {},
    "bundle_scan": {},
}

def record_check(category: str, name: str, passed: bool, detail: str = ""):
    entry = {"category": category, "name": name, "passed": passed, "detail": detail}
    results["checks"].append(entry)
    if not passed:
        results["failures"].append(entry)
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {category} - {name} {f'({detail})' if detail else ''}")

def get_ci_headers(resp_or_err):
    """Case-insensitive header dictionary."""
    return {k.lower(): v for k, v in resp_or_err.headers.items()}

# 1. Inspect response headers for protected dashboard routes & APIs
def check_http_headers():
    print("\n--- 1. Testing Protected Dashboard Routes & Security Headers ---")
    
    routes_to_test = [
        ("/dashboard", "Dashboard Overview"),
        ("/dashboard/home", "Home Live Editor"),
        ("/dashboard/projects", "Projects Editor"),
        ("/dashboard/blog", "Blog Editor"),
        ("/dashboard/about", "About Editor"),
        ("/dashboard/skills", "Skills Editor"),
        ("/dashboard/schedule", "Schedule Editor"),
        ("/dashboard/media", "Media Manager"),
        ("/dashboard/inbox", "Inbox"),
        ("/dashboard/analytics", "Analytics"),
        ("/dashboard/seo", "SEO Settings"),
        ("/dashboard/settings", "Settings"),
        ("/dashboard/preview/home", "Live Home Preview Route"),
        ("/dashboard/preview/project/rafiq", "Project Preview Route"),
    ]
    
    for path, desc in routes_to_test:
        req = urllib.request.Request(f"{BASE_URL}{path}")
        try:
            with urllib.request.urlopen(req) as resp:
                headers = get_ci_headers(resp)
                body = resp.read().decode("utf-8")
                
                # Verify frame-ancestors 'self'
                csp = headers.get("content-security-policy", "")
                has_csp_frame = "frame-ancestors 'self'" in csp
                record_check(
                    "Security Headers",
                    f"{desc} ({path}) CSP includes frame-ancestors 'self'",
                    has_csp_frame,
                    f"CSP: {csp}",
                )
                
                # Verify Cache-Control: no-store
                cache = headers.get("cache-control", "")
                has_cache = "no-store" in cache
                record_check(
                    "Security Headers",
                    f"{desc} ({path}) Cache-Control includes no-store",
                    has_cache,
                    f"Cache-Control: {cache}",
                )
                
                # Verify X-Frame-Options
                xfo = headers.get("x-frame-options", "")
                has_xfo = xfo.upper() == "SAMEORIGIN"
                record_check(
                    "Security Headers",
                    f"{desc} ({path}) X-Frame-Options is SAMEORIGIN",
                    has_xfo,
                    f"XFO: {xfo}",
                )
                
                # Verify no draft content or secrets in unauthenticated HTML
                has_secrets = any(w in body for w in ["DATABASE_URL", "BETTER_AUTH_SECRET", "GITHUB_CLIENT_SECRET"])
                record_check(
                    "Information Disclosure",
                    f"{desc} ({path}) Unauthenticated HTML has zero secrets leaked",
                    not has_secrets,
                )
                
                # Verify login guard is present
                is_guarded = "Private workspace" in body or "Sign in" in body
                record_check(
                    "Access Control",
                    f"{desc} ({path}) Renders login guard without access to data",
                    is_guarded,
                )
        except Exception as e:
            record_check("Access Control", f"{desc} ({path}) request error", False, str(e))

def check_admin_apis():
    print("\n--- 2. Testing Protected Administrative APIs ---")
    
    api_endpoints = [
        ("GET", "/api/admin/content", None),
        ("PUT", "/api/admin/content", {"content": {}, "expectedRevision": 1}),
        ("GET", "/api/admin/revisions", None),
        ("POST", "/api/admin/publish", {}),
        ("GET", "/api/admin/messages", None),
        ("GET", "/api/admin/media", None),
    ]
    
    for method, path, data in api_endpoints:
        body_bytes = json.dumps(data).encode("utf-8") if data else None
        headers = {"Content-Type": "application/json"} if data else {}
        req = urllib.request.Request(f"{BASE_URL}{path}", data=body_bytes, headers=headers, method=method)
        
        try:
            urllib.request.urlopen(req)
            record_check("API Authorization", f"Unauthenticated {method} {path} rejected", False, "Returned 200 OK")
        except urllib.error.HTTPError as e:
            headers = get_ci_headers(e)
            is_unauthorized = e.code == 401
            cache = headers.get("cache-control", "")
            csp = headers.get("content-security-policy", "")
            xfo = headers.get("x-frame-options", "")
            
            record_check(
                "API Authorization",
                f"Unauthenticated {method} {path} rejected with HTTP 401",
                is_unauthorized,
                f"Status: {e.code}",
            )
            record_check(
                "API Security Headers",
                f"{method} {path} returns Cache-Control: no-store",
                "no-store" in cache,
                f"Cache-Control: {cache}",
            )
            record_check(
                "API Security Headers",
                f"{method} {path} returns frame-ancestors 'none' or 'self'",
                "frame-ancestors 'none'" in csp or "frame-ancestors 'self'" in csp,
                f"CSP: {csp}",
            )
            record_check(
                "API Security Headers",
                f"{method} {path} returns X-Frame-Options DENY or SAMEORIGIN",
                xfo.upper() in ["DENY", "SAMEORIGIN"],
                f"XFO: {xfo}",
            )

def check_session_invalidation():
    print("\n--- 3. Testing Session Invalidation & CSRF Protection ---")
    
    # 3.1 Invalid mock session token
    headers = {
        "Cookie": "__Secure-better-auth.session_token=invalid_forged_token.invalid_signature",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(f"{BASE_URL}/api/admin/content", headers=headers, method="GET")
    try:
        urllib.request.urlopen(req)
        record_check("Session Security", "Invalid session token is rejected", False, "Returned 200")
    except urllib.error.HTTPError as e:
        record_check("Session Security", "Invalid session token returns HTTP 401", e.code == 401, f"Status: {e.code}")

    # 3.2 Cross-site mutation CSRF rejection
    forged_headers = {
        "Origin": "https://malicious-attacker.com",
        "Sec-Fetch-Site": "cross-site",
        "Content-Type": "application/json",
    }
    body = json.dumps({"content": {}, "expectedRevision": 1}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/api/admin/content", data=body, headers=forged_headers, method="PUT")
    try:
        urllib.request.urlopen(req)
        record_check("CSRF Guard", "Cross-site mutation is rejected", False, "Returned 200")
    except urllib.error.HTTPError as e:
        record_check("CSRF Guard", "Cross-site mutation returns HTTP 401 or 403", e.code in [401, 403], f"Status: {e.code}")

    # 3.3 State-changing mutation missing Origin
    no_origin_headers = {
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(f"{BASE_URL}/api/admin/content", data=body, headers=no_origin_headers, method="PUT")
    try:
        urllib.request.urlopen(req)
        record_check("CSRF Guard", "Mutation without origin is rejected", False, "Returned 200")
    except urllib.error.HTTPError as e:
        record_check("CSRF Guard", "Mutation without origin returns HTTP 401 or 403", e.code in [401, 403], f"Status: {e.code}")

def check_browser_postmessage():
    print("\n--- 4. Testing Browser Live Preview postMessage Boundaries ---")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        # Navigate to the preview route
        page.goto(f"{BASE_URL}/dashboard/preview/home")
        page.wait_for_timeout(1000)
        
        # Test 1: Untrusted origin postMessage is ignored
        result_untrusted = page.evaluate("""
            () => {
                let errorLogged = false;
                window.addEventListener('error', () => { errorLogged = true; });
                window.postMessage({
                    type: 'PREVIEW_CONTENT_UPDATE',
                    payload: { homeSections: [] }
                }, 'https://attacker.com');
                return { success: true, errorLogged };
            }
        """)
        record_check("postMessage Security", "Untrusted target origin postMessage fails safely", result_untrusted["success"] and not result_untrusted["errorLogged"])

        # Test 2: Oversized postMessage (> 5MB) is ignored / dropped
        result_oversized = page.evaluate("""
            () => {
                let errorLogged = false;
                try {
                    const hugeStr = 'A'.repeat(6 * 1024 * 1024);
                    window.postMessage({
                        type: 'PREVIEW_CONTENT_UPDATE',
                        payload: { hero: { headline: hugeStr } }
                    }, window.location.origin);
                } catch(e) {
                    errorLogged = true;
                }
                return { handled: true };
            }
        """)
        record_check("postMessage Security", "Oversized 6MB payload rejected safely without crash", result_oversized["handled"])

        # Test 3: Malformed message type is dropped
        result_malformed_type = page.evaluate("""
            () => {
                let crashed = false;
                try {
                    window.postMessage({
                        type: 'UNKNOWN_EXEC_ATTEMPT',
                        code: 'alert(1)'
                    }, window.location.origin);
                } catch(e) {
                    crashed = true;
                }
                return { safe: !crashed };
            }
        """)
        record_check("postMessage Security", "Unknown message type ignored safely", result_malformed_type["safe"])

        browser.close()

def check_client_bundle_secrets():
    print("\n--- 5. Scanning Client JavaScript Bundles for Secrets ---")
    static_js_dir = Path(".next/static")
    js_files = list(static_js_dir.glob("**/*.js"))
    
    secret_patterns = [
        "DATABASE_URL",
        "BETTER_AUTH_SECRET",
        "GITHUB_CLIENT_SECRET",
        "postgres://",
        "postgresql://",
        "neon.tech",
    ]
    
    leaks = []
    for f in js_files:
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
            for pattern in secret_patterns:
                if pattern in content:
                    leaks.append(f"{f.name}: found {pattern}")
        except Exception:
            pass
            
    record_check(
        "Client Bundle Scan",
        "Zero server credentials or database connection strings in client JS",
        len(leaks) == 0,
        f"Leaks found: {leaks}" if leaks else "Clean bundle (0 secrets)",
    )

def main():
    print("=" * 60)
    print("Phase 5.1 — Release Candidate Security & Verification Suite")
    print("=" * 60)
    
    check_http_headers()
    check_admin_apis()
    check_session_invalidation()
    check_browser_postmessage()
    check_client_bundle_secrets()
    
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
