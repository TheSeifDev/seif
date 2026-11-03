import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import type { ContactDb } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import type {
  ChannelDispatchResult,
  ChannelReadiness,
  NotificationAlertPayload,
} from "./types";

export interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export function getVapidConfig(): VapidConfig | null {
  const publicKey = (
    process.env.VAPID_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ||
    ""
  );
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
  const subject =
    process.env.VAPID_SUBJECT?.trim() ||
    (process.env.CONTACT_TO_EMAIL?.trim()
      ? `mailto:${process.env.CONTACT_TO_EMAIL.trim()}`
      : "");

  if (!publicKey || !privateKey || !subject) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

export function getWebPushConfigReadiness(
  activeSubscriptionCount = 0,
  enabled = true,
  lastSentAt: string | null = null,
  lastTestSentAt: string | null = null,
): ChannelReadiness {
  const missing: string[] = [];
  const publicKey =
    process.env.VAPID_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!publicKey) missing.push("VAPID_PUBLIC_KEY");
  if (!process.env.VAPID_PRIVATE_KEY?.trim()) missing.push("VAPID_PRIVATE_KEY");
  const subject =
    process.env.VAPID_SUBJECT?.trim() ||
    process.env.CONTACT_TO_EMAIL?.trim();
  if (!subject) missing.push("VAPID_SUBJECT");

  const vapidConfigured = missing.length === 0;
  const configured = vapidConfigured && activeSubscriptionCount > 0;
  const testDeliveryVerified = Boolean(lastTestSentAt || lastSentAt);

  return {
    channel: "web_push",
    implemented: true,
    configured,
    enabled,
    available: true,
    availabilityState: !vapidConfigured
      ? "not_configured"
      : activeSubscriptionCount === 0
        ? "implemented"
        : testDeliveryVerified
          ? "test_delivery_successful"
          : "configured",
    restrictionReason: null,
    missingEnvVars: missing,
    lastSentAt,
    lastTestSentAt,
    testDeliveryVerified,
    details: !vapidConfigured
      ? `Not Configured — missing environment variables: ${missing.join(", ")}`
      : activeSubscriptionCount === 0
        ? "VAPID keys configured, but 0 Chrome device subscriptions are registered. Click 'Enable Web Push on This Device' on Windows + Chrome or Android + Chrome."
        : testDeliveryVerified
          ? `VAPID configured and verified (${activeSubscriptionCount} active device subscription${activeSubscriptionCount === 1 ? "" : "s"}).`
          : `VAPID configured (${activeSubscriptionCount} active device subscription${activeSubscriptionCount === 1 ? "" : "s"}) — real device test delivery not yet verified.`,
  };
}

function toBase64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(str: string): Buffer {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    normalized.length % 4 === 0
      ? ""
      : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, "base64");
}

export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();
  return {
    publicKey: toBase64Url(ecdh.getPublicKey()),
    privateKey: toBase64Url(ecdh.getPrivateKey()),
  };
}

export function validatePushEndpoint(endpoint: string): {
  valid: boolean;
  reason?: string;
} {
  try {
    const parsed = new URL(endpoint);
    if (parsed.protocol !== "https:") {
      return { valid: false, reason: "Push endpoint must use https: protocol." };
    }
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".local") ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)
    ) {
      return { valid: false, reason: "Push endpoint hostname is not allowed." };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid push endpoint URL." };
  }
}

/**
 * Creates an RFC 8292 VAPID Authorization header using ES256 (P-256).
 */
export function createVapidAuthHeader(
  endpoint: string,
  vapid: VapidConfig,
): string {
  const origin = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

  const header = toBase64Url(
    Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" }), "utf8"),
  );
  const claims = toBase64Url(
    Buffer.from(
      JSON.stringify({
        aud: origin,
        exp,
        sub: vapid.subject,
      }),
      "utf8",
    ),
  );

  const unsignedToken = `${header}.${claims}`;

  const pubBytes = fromBase64Url(vapid.publicKey);
  const privBytes = fromBase64Url(vapid.privateKey);
  if (pubBytes.length !== 65 || pubBytes[0] !== 0x04) {
    throw new Error(
      "Invalid VAPID public key format (expected 65-byte uncompressed P-256 point).",
    );
  }

  const x = toBase64Url(pubBytes.subarray(1, 33));
  const y = toBase64Url(pubBytes.subarray(33, 65));
  const d = toBase64Url(privBytes);

  const privateKeyObj = crypto.createPrivateKey({
    key: {
      kty: "EC",
      crv: "P-256",
      x,
      y,
      d,
    },
    format: "jwk",
  });

  const signature = crypto.sign("sha256", Buffer.from(unsignedToken, "utf8"), {
    key: privateKeyObj,
    dsaEncoding: "ieee-p1363",
  });

  const jwt = `${unsignedToken}.${toBase64Url(signature)}`;
  return `vapid t=${jwt}, k=${vapid.publicKey}`;
}

function hkdfExtract(salt: Buffer, ikm: Buffer): Buffer {
  return crypto.createHmac("sha256", salt).update(ikm).digest();
}

function hkdfExpand(prk: Buffer, info: Buffer, length: number): Buffer {
  return crypto
    .createHmac("sha256", prk)
    .update(Buffer.concat([info, Buffer.from([1])]))
    .digest()
    .subarray(0, length);
}

/**
 * Encrypts a Web Push payload according to RFC 8291 (aes128gcm content encoding).
 */
export function encryptWebPushPayload(
  plaintext: string,
  subscriberP256dh: string,
  subscriberAuth: string,
): Buffer {
  const clientPublicKey = fromBase64Url(subscriberP256dh);
  const authSecret = fromBase64Url(subscriberAuth);

  if (clientPublicKey.length !== 65 || clientPublicKey[0] !== 0x04) {
    throw new Error("Invalid subscriber p256dh key.");
  }
  if (authSecret.length < 16) {
    throw new Error("Invalid subscriber auth secret.");
  }

  const serverEcdh = crypto.createECDH("prime256v1");
  serverEcdh.generateKeys();
  const serverPublicKey = serverEcdh.getPublicKey();
  const sharedSecret = serverEcdh.computeSecret(clientPublicKey);

  const salt = crypto.randomBytes(16);

  // RFC 8291 Section 3.3: Key derivation
  const prkKey = hkdfExtract(authSecret, sharedSecret);
  const keyInfo = Buffer.concat([
    Buffer.from("WebPush: info\0", "utf8"),
    clientPublicKey,
    serverPublicKey,
  ]);
  const ikm = hkdfExpand(prkKey, keyInfo, 32);

  const prk = hkdfExtract(salt, ikm);
  const cekInfo = Buffer.from("Content-Encoding: aes128gcm\0", "utf8");
  const contentEncryptionKey = hkdfExpand(prk, cekInfo, 16);

  const nonceInfo = Buffer.from("Content-Encoding: nonce\0", "utf8");
  const nonce = hkdfExpand(prk, nonceInfo, 12);

  // Delimiter 0x02 for final record
  const paddedPlaintext = Buffer.concat([
    Buffer.from(plaintext, "utf8"),
    Buffer.from([0x02]),
  ]);

  const cipher = crypto.createCipheriv(
    "aes-128-gcm",
    contentEncryptionKey,
    nonce,
  );
  const encrypted = Buffer.concat([
    cipher.update(paddedPlaintext),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  // RFC 8188 Section 2.1: aes128gcm binary header: salt (16) + rs (4) + idlen (1) + keyid (65)
  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096, 0);
  const keyIdLen = Buffer.from([serverPublicKey.length]);

  return Buffer.concat([
    salt,
    recordSize,
    keyIdLen,
    serverPublicKey,
    encrypted,
  ]);
}

export function buildSafePushPayload(payload: NotificationAlertPayload): string {
  // Privacy rule: do not include the full message body or sensitive personal data in Web Push payloads.
  const senderLabel = payload.senderName.trim().slice(0, 48) || "New visitor";
  const subjectPart = payload.subject?.trim()
    ? ` — ${payload.subject.trim().slice(0, 60)}`
    : "";

  return JSON.stringify({
    title: payload.isTest
      ? "Portfolio Test Notification"
      : "New Portfolio Contact Message",
    body: payload.isTest
      ? "Chrome Web Push notifications are active for your portfolio inbox."
      : `From ${senderLabel}${subjectPart}. Tap to view in Dashboard Inbox.`,
    tag: payload.dedupeKey,
    data: {
      url: payload.inboxPath,
      messageId: payload.contactMessageId,
      createdAt: payload.receivedAtIso,
      isTest: Boolean(payload.isTest),
    },
  });
}

export async function sendWebPushNotification(
  db: ContactDb,
  payload: NotificationAlertPayload,
): Promise<ChannelDispatchResult> {
  const vapid = getVapidConfig();
  if (!vapid) {
    return {
      status: "not_configured",
      errorCode: "VAPID_NOT_CONFIGURED",
      errorMessage:
        "Missing VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, or VAPID_SUBJECT environment variables.",
    };
  }

  const activeSubs = await db
    .select()
    .from(pushSubscriptions)
    .where(isNull(pushSubscriptions.revokedAt));

  if (activeSubs.length === 0) {
    return {
      status: "skipped",
      providerStatus: "no_active_subscriptions",
      errorCode: "NO_ACTIVE_SUBSCRIPTIONS",
      errorMessage: "No active Chrome Web Push device subscriptions registered.",
    };
  }

  const pushPayloadJson = buildSafePushPayload(payload);
  let deliveredCount = 0;
  let revokedCount = 0;
  const errors: string[] = [];
  const messageIds: string[] = [];

  for (const sub of activeSubs) {
    try {
      const check = validatePushEndpoint(sub.endpoint);
      if (!check.valid) {
        errors.push(`Sub ${sub.id.slice(0, 8)}: ${check.reason}`);
        continue;
      }

      const encryptedBody = encryptWebPushPayload(
        pushPayloadJson,
        sub.p256dh,
        sub.auth,
      );
      const authorization = createVapidAuthHeader(sub.endpoint, vapid);

      const response = await fetch(sub.endpoint, {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Encoding": "aes128gcm",
          "Content-Type": "application/octet-stream",
          "Content-Length": String(encryptedBody.length),
          TTL: "86400",
          Urgency: "high",
          Topic: payload.dedupeKey.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32),
        },
        body: new Uint8Array(encryptedBody),
      });

      if (response.status === 404 || response.status === 410) {
        revokedCount += 1;
        await db
          .update(pushSubscriptions)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(pushSubscriptions.id, sub.id),
              isNull(pushSubscriptions.revokedAt),
            ),
          );
        errors.push(
          `Sub ${sub.id.slice(0, 8)} expired (HTTP ${response.status}, auto-revoked)`,
        );
        continue;
      }

      if (!response.ok) {
        errors.push(
          `Sub ${sub.id.slice(0, 8)} failed with HTTP ${response.status}`,
        );
        continue;
      }

      deliveredCount += 1;
      const locationHeader = response.headers.get("location");
      if (locationHeader) {
        messageIds.push(locationHeader.slice(0, 80));
      } else {
        messageIds.push(sub.id.slice(0, 8));
      }

      await db
        .update(pushSubscriptions)
        .set({ lastUsedAt: new Date() })
        .where(eq(pushSubscriptions.id, sub.id));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Web Push request error";
      errors.push(`Sub ${sub.id.slice(0, 8)}: ${msg.slice(0, 120)}`);
    }
  }

  if (deliveredCount > 0) {
    return {
      status: "sent",
      providerMessageId: messageIds.join(",") || `push:${deliveredCount}`,
      providerStatus: `delivered:${deliveredCount}/${activeSubs.length}`,
      errorMessage:
        errors.length > 0 ? errors.join("; ").slice(0, 300) : undefined,
    };
  }

  if (revokedCount === activeSubs.length && revokedCount > 0) {
    return {
      status: "skipped",
      providerStatus: "all_subscriptions_expired_revoked",
      errorCode: "SUBSCRIPTIONS_EXPIRED",
      errorMessage: `All ${revokedCount} push subscription(s) returned 404/410 and were automatically revoked.`,
    };
  }

  return {
    status: "failed",
    errorCode: "WEB_PUSH_DELIVERY_FAILED",
    errorMessage:
      errors.join("; ").slice(0, 300) || "Web Push delivery failed.",
    retryable: true,
  };
}
