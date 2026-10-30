#!/usr/bin/env python3
"""Validate crawler-visible SEO on a local or published production build."""
import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from xml.etree import ElementTree


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.canonical = None
        self.title = ""
        self.h1 = []
        self.text = []
        self.schemas = []
        self.in_title = False
        self.in_h1 = False
        self.script_type = None
        self.script_text = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.meta[attrs.get("name") or attrs.get("property")] = attrs.get("content")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.in_h1 = True
        if tag == "script":
            self.script_type = attrs.get("type", "script")
            self.script_text = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "h1":
            self.in_h1 = False
        if tag == "script":
            if self.script_type == "application/ld+json":
                self.schemas.append(json.loads(self.script_text))
            self.script_type = None

    def handle_data(self, data):
        if self.script_type:
            self.script_text += data
            return
        self.text.append(data)
        if self.in_title:
            self.title += data
        if self.in_h1:
            self.h1.append(data)


def request(base, path, ua):
    req = Request(base.rstrip("/") + path, headers={"User-Agent": ua})
    try:
        with urlopen(req, timeout=30) as response:
            return response.status, {k.lower(): v for k, v in response.headers.items()}, response.read()
    except HTTPError as error:
        return error.code, {k.lower(): v for k, v in error.headers.items()}, error.read()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:3000")
    parser.add_argument("--canonical-origin", default="https://prof-zeta-one.vercel.app")
    parser.add_argument("--out", default="docs/checks/seo-results.json")
    args = parser.parse_args()
    results = {"base": args.base, "canonical_origin": args.canonical_origin, "pages": {}, "failures": []}
    def check(condition, message):
        if not condition:
            results["failures"].append(message)
    routes = ["/", "/about", "/projects", "/projects/rafiq", "/contact", "/blog"]
    titles = set()
    for route in routes:
        samples = {}
        for label, ua in {
            "visitor": "Mozilla/5.0",
            "google": "Googlebot",
            "ai_search": "OAI-SearchBot/1.4",
            "social": "Twitterbot/1.0",
        }.items():
            status, headers, body = request(args.base, route, ua)
            document = Document()
            document.feed(body.decode("utf-8"))
            expected = args.canonical_origin.rstrip("/") + ("" if route == "/" else route)
            check(status == 200, f"{route} {label}: status {status}")
            check(bool(document.title.strip()), f"{route} {label}: missing title")
            check(bool(document.h1), f"{route} {label}: missing initial-HTML h1")
            check(document.canonical == expected, f"{route} {label}: incorrect canonical {document.canonical}")
            check(bool(document.meta.get("description")), f"{route} {label}: missing description")
            for key in ["og:title", "og:description", "og:url", "og:image", "twitter:card"]:
                check(bool(document.meta.get(key)), f"{route} {label}: missing {key}")
            check(document.meta.get("og:url") == expected, f"{route} {label}: incorrect og:url")
            check(len(" ".join(document.text)) > 400, f"{route} {label}: no meaningful body text")
            check(bool(document.schemas), f"{route} {label}: missing structured data")
            samples[label] = {"status": status, "title": document.title, "description": document.meta.get("description"), "canonical": document.canonical, "h1": " ".join(document.h1), "json_ld_blocks": len(document.schemas)}
            if label == "visitor":
                check(document.title not in titles, f"{route}: duplicate title")
                titles.add(document.title)
        results["pages"][route] = samples
    for missing in ["/this-page-does-not-exist", "/projects/not-a-real-project", "/blog/__no-published-posts"]:
        status, _, body = request(args.base, missing, "Googlebot")
        check(status == 404, f"{missing}: expected 404, got {status}")
        check(b'noindex' in body, f"{missing}: missing noindex")
    status, _, body = request(args.base, "/sitemap.xml", "Googlebot")
    check(status == 200, "sitemap missing")
    root = ElementTree.fromstring(body)
    locations = [node.text for node in root.findall("{*}url/{*}loc")]
    check(all(loc and loc.startswith(args.canonical_origin) for loc in locations), "sitemap has wrong public origin")
    check(not any("localhost" in loc or "__no-published-posts" in loc for loc in locations), "sitemap leaks local/draft URLs")
    results["sitemap_entries"] = locations
    status, _, body = request(args.base, "/robots.txt", "OAI-SearchBot")
    robots = body.decode("utf-8")
    check(status == 200, "robots missing")
    check("OAI-SearchBot" in robots and "Allow: /" in robots, "AI-search crawl rule missing")
    check("Disallow: /api/" in robots and "Disallow: /dashboard" in robots, "private-route crawl exclusions missing")
    check(args.canonical_origin + "/sitemap.xml" in robots, "robots sitemap has wrong origin")
    results["robots"] = robots
    status, headers, body = request(args.base, "/opengraph-image", "Twitterbot")
    check(status == 200 and headers.get("content-type", "").startswith("image/"), "OG image unavailable")
    results["og_image"] = {"status": status, "bytes": len(body), "content_type": headers.get("content-type")}
    status, _, body = request(args.base, "/llms.txt", "OAI-SearchBot")
    check(status == 200 and b"Seif Ayman" in body, "public machine-readable profile summary missing")
    check(b"localhost" not in body and b"__no-published-posts" not in body, "AI summary contains local/draft URLs")
    target = Path(args.out)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(results, indent=2, ensure_ascii=False))
    return 1 if results["failures"] else 0


if __name__ == "__main__":
    sys.exit(main())
