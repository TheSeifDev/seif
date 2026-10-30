#!/usr/bin/env python3
"""Check the genuine Google ownership token in crawler-visible homepage head."""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen


class VerificationHead(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = False
        self.tokens = []
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.in_head = True
        if self.in_head and tag == "meta" and attrs.get("name") == "google-site-verification":
            self.tokens.append(attrs.get("content"))
        if self.in_head and tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:3000")
    parser.add_argument("--canonical-origin", default="https://theseif.vercel.app")
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1] / "lib/seo/site-verification.ts"
    match = re.search(r'PUBLIC_GOOGLE_SITE_VERIFICATION\s*=\s*"([^"]+)"', source.read_text())
    if not match:
        raise SystemExit("No genuine public ownership token is configured.")
    req = Request(args.base.rstrip("/") + "/", headers={"User-Agent": "Google-Site-Verification/1.0"})
    with urlopen(req, timeout=30) as response:
        status = response.status
        html = response.read().decode()
    head = VerificationHead()
    head.feed(html)
    result = {"base": args.base, "status": status, "genuineTokenInHead": match.group(1) in head.tokens,
              "canonical": head.canonical, "canonicalMatches": head.canonical == args.canonical_origin.rstrip("/")}
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if status == 200 and result["genuineTokenInHead"] and result["canonicalMatches"] else 1)


if __name__ == "__main__":
    main()
