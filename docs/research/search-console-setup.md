# Google Search Console ownership setup — 30 October 2026

The deployed canonical site is https://prof-zeta-one.vercel.app. Use a URL-prefix property for this exact HTTPS site and an HTML tag issued by the owning Google account. The HTML-tag method requires the exact account-issued verification token on the public homepage; do not reuse an example token or infer successful ownership from metadata support. Verification remains valid while Google can confirm the token, so keep the genuine tag after successful verification. Google's official ownership guide is https://support.google.com/webmasters/answer/9008080?hl=en.

After successful ownership verification, submit https://prof-zeta-one.vercel.app/sitemap.xml in that property's Sitemaps screen. Official sitemap guidance: https://support.google.com/webmasters/answer/7451001?hl=en. The Search Console browser session currently requires Google sign-in; the user's ownership verification and sitemap submission are still pending.

Code support is in `lib/seo/site-verification.ts` and root metadata. Configure the genuine public HTML-tag content token through `GOOGLE_SITE_VERIFICATION` in production or the durable public fallback, then redeploy and perform Verify in Search Console. A verification token is public in the resulting HTML and is not an API key or Google login credential.
