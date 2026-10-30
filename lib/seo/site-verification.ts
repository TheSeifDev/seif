import type { Metadata } from "next";

/**
 * A Search Console HTML-tag token is intentionally public once rendered in
 * document metadata. This exact token was issued to the signed-in site owner
 * for https://theseif.vercel.app/ on 30 October 2026. Keep it after verification;
 * never place API credentials here.
 *
 * This durable fallback is useful when the token should travel with the
 * deployment instead of relying on a runtime environment variable.
 */
export const PUBLIC_GOOGLE_SITE_VERIFICATION = "z6v9RKXeJ3hfXIeUFVTfDpbrsLUQPIo2l9VzyIpLO_o";

export function getGoogleSiteVerification(): string | undefined {
  const configured = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return configured || PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
}

export function createSiteVerification(): Metadata["verification"] | undefined {
  const google = getGoogleSiteVerification();
  return google ? { google } : undefined;
}
