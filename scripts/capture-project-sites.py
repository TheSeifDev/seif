"""Verify user-provided CV URLs and capture only accessible public pages."""
from pathlib import Path
import json
import re
from concurrent.futures import ThreadPoolExecutor
import requests
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / "docs" / "checks"
out.mkdir(parents=True, exist_ok=True)
images = root / "public" / "images" / "projects"
images.mkdir(parents=True, exist_ok=True)
urls = {
    "rafiq": "https://phantomsio.vercel.app/rafiq",
    "itsum": "https://it-sum-seven.vercel.app",
    "phantoms": "https://phantomsio.vercel.app",
    "nabd": "https://nabdmasr.vercel.app",
    "portfolio": "https://seifdev.vercel.app",
}

def verify(item):
    name, url = item
    try:
        r = requests.get(url, timeout=25)
        match = re.search(r"<title[^>]*>(.*?)</title>", r.text, re.I | re.S)
        title = re.sub(r"\s+", " ", match.group(1)).strip() if match else ""
        bad = "/restricted" in r.url or any(x in title.lower() for x in ("404", "not found", "deployment", "login", "security checkpoint"))
        return name, {"url": url, "final_url": r.url, "status": r.status_code, "title": title, "verified": r.status_code == 200 and not bad}
    except requests.RequestException as e:
        return name, {"url": url, "verified": False, "error": type(e).__name__}

results = dict(ThreadPoolExecutor(max_workers=3).map(verify, urls.items()))
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    for name, item in results.items():
        if not item["verified"]:
            print(name, item, flush=True)
            continue
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
        try:
            page.goto(item["url"], wait_until="domcontentloaded", timeout=40000)
            page.wait_for_timeout(1800)
            title = page.title()
            if any(x in title.lower() for x in ("404", "not found", "security checkpoint", "log in")):
                item["verified"] = False
            else:
                filename = name + ".webp"
                page.screenshot(path=str(images / filename), type="jpeg", quality=90)
                # Encode the actual captured pixels as WebP, with no invented visual content.
                from PIL import Image
                im = Image.open(images / filename)
                im.save(images / filename, "WEBP", quality=90, method=6)
                item["image"] = "/images/projects/" + filename
                item["image_label"] = "PUBLIC SITE CAPTURE"
                item["browser_title"] = title
        except Exception as e:
            item["capture_error"] = type(e).__name__
        page.close()
        print(name, {k: v for k,v in item.items() if k != "error"}, flush=True)
    browser.close()
(out / "project-links.json").write_text(json.dumps(results, indent=2) + "\n")
