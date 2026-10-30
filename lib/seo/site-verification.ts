import type { Metadata } from "next";

/**
 * A Search Console HTML-tag token is intentionally public once rendered in
 * document metadata. Keep this empty until the site owner has received the
 * exact token for this property; never place API credentials here.
 *
 * This durable fallback is useful when the token should travel with the
 * deployment instead of relying on a runtime environment variable.
 */
export const PUBLIC_GOOGLE_SITE_VERIFICATION = "";

export function getGoogleSiteVerification(): string | undefined {
  const configured = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return configured || PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
}

export function createSiteVerification(): Metadata["verification"] | undefined {
  const google = getGoogleSiteVerification();
  return google ? { google } : undefined;
}
