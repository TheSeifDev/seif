# Google Search Console — verified 30 October 2026

The official portfolio is https://theseif.vercel.app/. Its exact URL-prefix property was verified in the owner's signed-in Google Search Console account using the genuine HTML tag issued by Google. The public homepage was checked with a verification crawler User-Agent: HTTP 200, matching canonical origin and the exact token inside `<head>` before Google confirmed ownership. [1]

The sitemap https://theseif.vercel.app/sitemap.xml was submitted after ownership verification. Google's sitemap detail report confirmed successful processing on 30 October 2026, with **11 discovered pages** and **0 discovered videos**. An initial `Couldn't fetch` table status was superseded by that successful result. Discovered URLs are not the same as indexed URLs, and processing a sitemap does not guarantee search ranking. [2] [4]

The durable, intentionally public token is in `lib/seo/site-verification.ts`, and root metadata emits it. Keep that token after verification so Google can continue confirming ownership; it is not a Google API credential or login secret. `GOOGLE_SITE_VERIFICATION` remains available as an environment override. [3]

`lib/seo/metadata.ts` uses the user-confirmed new origin and remaps a stale `SITE_URL=https://prof-zeta-one.vercel.app` to it. The former alias currently returns a platform 404, so no application-level redirect can be served there. Historical performance measurements retain their original origin as evidence; active sitemap, robots, social metadata and public identity graphs use the new origin.

Run `python3 scripts/check-google-verification.py --base https://theseif.vercel.app` to confirm the verification tag and canonical in published raw HTML. The broader published SEO check also passed for visitor, Googlebot, AI-search and social crawler User-Agents, route metadata, public schemas, sitemap, robots, social image and missing/draft noindex responses.

## References

[1]: https://search.google.com/search-console?resource_id=https%3A%2F%2Ftheseif.vercel.app%2F "Verified Search Console property, owner login required"
[2]: https://search.google.com/search-console/sitemaps/info-drilldown?resource_id=https:%2F%2Ftheseif.vercel.app%2F&sitemap=https:%2F%2Ftheseif.vercel.app%2Fsitemap.xml "Successful sitemap processing report, owner login required"
[3]: https://support.google.com/webmasters/answer/9008080?hl=en "Google website ownership verification"
[4]: https://support.google.com/webmasters/answer/7451001?hl=en "Google Sitemaps report"
