import type {
  ChannelReadiness,
  NotificationAlertPayload,
} from "./types";

/**
 * Official Meta Instagram Messaging API Assessment & Adapter:
 *
 * Why Instagram is marked `unavailable` for automated website owner alerts:
 * 1. Account Type Restriction: Personal Instagram accounts have zero official messaging API support.
 *    Even with an Instagram Professional (Business or Creator) account linked to a Meta App,
 *    the Instagram Messaging API (`POST /{ig-user-id}/messages` with `instagram_manage_messages`)
 *    is strictly a customer-care reply API, not an outbound owner-alerting channel.
 * 2. Cannot Self-DM: An Instagram Professional account cannot send a Direct Message to itself.
 * 3. Mandatory 24-Hour Inbound Window: Sending a DM to a secondary owner Instagram account
 *    requires that secondary account to manually send an inbound DM to the Professional account
 *    every 24 hours. Once 24 hours elapse without a new user-initiated inbound DM, Meta blocks
 *    all automated outbound messages (HTTP 400 / error code 10 / subcode 2534022).
 * 4. No Template / Proactive Alert Mechanism: Unlike WhatsApp Business Platform (which supports
 *    pre-approved utility templates outside the 24-hour window), Instagram Messaging API has
 *    deprecated message tags (`ACCOUNT_UPDATE`, `CONFIRMED_EVENT_UPDATE`, `POST_PURCHASE_UPDATE`),
 *    and the `HUMAN_AGENT` tag strictly prohibits automated notifications.
 * 5. No Unofficial Automation: Browser session/cookie/password scraping violates Meta terms and
 *    security policy and is strictly prohibited.
 */
export const INSTAGRAM_UNAVAILABLE_REASON =
  "Unavailable due to Meta Instagram API restrictions: Personal accounts are unsupported, Professional accounts cannot DM themselves, and Meta enforces a strict 24-hour user-initiated reply window with no utility template mechanism for automated website alerts.";

export function getInstagramConfigReadiness(
  enabled = false,
  lastSentAt: string | null = null,
  lastTestSentAt: string | null = null,
): ChannelReadiness {
  return {
    channel: "instagram",
    implemented: true,
    configured: false,
    enabled: Boolean(enabled && false), // Forced disabled due to platform restriction
    available: false,
    availabilityState: "unavailable",
    restrictionReason: INSTAGRAM_UNAVAILABLE_REASON,
    missingEnvVars: [],
    lastSentAt,
    lastTestSentAt,
    testDeliveryVerified: false,
    details: INSTAGRAM_UNAVAILABLE_REASON,
  };
}

export async function sendInstagramNotification(
  _payload: NotificationAlertPayload,
): Promise<{
  status: "unavailable";
  providerStatus: string;
  errorCode: string;
  errorMessage: string;
}> {
  void _payload;
  return {
    status: "unavailable",
    providerStatus: "unavailable_platform_restriction",
    errorCode: "INSTAGRAM_UNAVAILABLE_BY_META_POLICY",
    errorMessage: INSTAGRAM_UNAVAILABLE_REASON,
  };
}
