"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CircleAlert,
  Download,
  Laptop,
  Lock,
  Mail,
  MessageSquare,
  RefreshCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../dashboard-context";
import { NotchedPanel, SectionHeading, StatusPill } from "../dashboard-workspace";

type ChannelKey = "email" | "web_push" | "whatsapp" | "instagram";

type AvailabilityState =
  | "implemented"
  | "configured"
  | "test_delivery_successful"
  | "not_configured"
  | "unavailable";

type ChannelReadinessDto = {
  channel: ChannelKey;
  implemented: boolean;
  configured: boolean;
  enabled: boolean;
  available: boolean;
  availabilityState: AvailabilityState;
  restrictionReason: string | null;
  missingEnvVars: string[];
  details: string;
  lastSentAt: string | null;
  lastTestSentAt: string | null;
  testDeliveryVerified: boolean;
};

type PushSubDto = {
  id: string;
  ownerUserId: string;
  endpointPreview: string;
  endpoint: string;
  userAgent: string | null;
  deviceLabel: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  active: boolean;
};

type OutboxHistoryDto = {
  id: string;
  contactMessageId: string | null;
  channel: ChannelKey;
  status: string;
  uiStatus:
    | "pending"
    | "processing"
    | "sent"
    | "failed"
    | "skipped"
    | "not_configured"
    | "unavailable";
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  lastAttemptAt: string | null;
  sentAt: string | null;
  providerMessageId: string | null;
  providerStatus: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  dedupeKey: string;
  createdAt: string;
};

type OverviewDto = {
  settings: {
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    webPushEnabled: boolean;
    instagramEnabled: boolean;
    updatedAt: string;
    updatedBy: string | null;
  };
  readiness: Record<ChannelKey, ChannelReadinessDto>;
  environment?: {
    vercelEnv: "production" | "preview" | "development";
    gitBranch: string | null;
    gitCommitSha: string | null;
    siteUrl: string;
    anyLiveChannelConfigured: boolean;
  };
  scheduler?: {
    cronEndpoint: string;
    cronSecretConfigured: boolean;
    mode: string;
    note: string;
  };
  vapidPublicKey: string | null;
  subscriptions: PushSubDto[];
  history: OutboxHistoryDto[];
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusPillTone(
  status: string,
): "neutral" | "success" | "warning" | "danger" {
  switch (status) {
    case "sent":
    case "test_delivery_successful":
      return "success";
    case "failed":
    case "unavailable":
      return "danger";
    case "pending":
    case "processing":
    case "configured":
    case "implemented":
      return "warning";
    default:
      return "neutral";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "sent":
      return "Sent";
    case "failed":
      return "Failed";
    case "skipped":
      return "Skipped";
    case "not_configured":
      return "Not Configured";
    case "unavailable":
      return "Unavailable";
    default:
      return status;
  }
}

function availabilityBadgeInfo(state: AvailabilityState | undefined): {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger";
} {
  switch (state) {
    case "test_delivery_successful":
      return { label: "Test Delivery Successful", tone: "success" };
    case "configured":
      return { label: "Configured", tone: "warning" };
    case "implemented":
      return { label: "Implemented", tone: "warning" };
    case "unavailable":
      return {
        label: "Unavailable (Provider/Account Restriction)",
        tone: "danger",
      };
    case "not_configured":
    default:
      return { label: "Not Configured", tone: "neutral" };
  }
}

export function NotificationsSettingsPage() {
  const { setNotice } = useDashboard();
  const [data, setData] = React.useState<OverviewDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingToggle, setSavingToggle] = React.useState<string | null>(null);
  const [testingChannel, setTestingChannel] = React.useState<ChannelKey | null>(
    null,
  );
  const [retryingId, setRetryingId] = React.useState<string | null>(null);
  const [processingQueue, setProcessingQueue] = React.useState(false);

  // PWA & Web Push browser states
  const [pushSupported, setPushSupported] = React.useState(false);
  const [permissionState, setPermissionState] =
    React.useState<NotificationPermission>("default");
  const [deviceLabel, setDeviceLabel] = React.useState("Chrome Browser");
  const [enablingPush, setEnablingPush] = React.useState(false);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [installPromptEvent, setInstallPromptEvent] =
    React.useState<BeforeInstallPromptEvent | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload?.message ??
            `Could not load notification settings (${response.status})`,
        );
      }
      setData(payload as OverviewDto);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load notification settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
      if (typeof window !== "undefined") {
        const supported =
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;
        setPushSupported(supported);
        if ("Notification" in window) {
          setPermissionState(Notification.permission);
        }
        const standalone =
          window.matchMedia?.("(display-mode: standalone)")?.matches ||
          Boolean((window.navigator as { standalone?: boolean }).standalone);
        setIsStandalone(standalone);

        const ua = navigator.userAgent || "";
        if (ua.includes("Android")) {
          setDeviceLabel("Android + Chrome");
        } else if (ua.includes("Windows")) {
          setDeviceLabel("Windows + Chrome");
        } else {
          setDeviceLabel("Chrome Browser");
        }
      }
    }, 0);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [load]);

  const toggleChannel = async (
    key:
      | "emailEnabled"
      | "webPushEnabled"
      | "whatsappEnabled"
      | "instagramEnabled",
    nextValue: boolean,
  ) => {
    setSavingToggle(key);
    setError(null);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: nextValue }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload?.message ?? "Could not update channel settings.",
        );
      }
      setData((current) =>
        current ? { ...current, settings: payload.settings } : current,
      );
      setNotice({
        tone: "success",
        message: "Notification channel preference saved.",
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update channel settings.",
      );
    } finally {
      setSavingToggle(null);
    }
  };

  const sendTest = async (channel: ChannelKey) => {
    setTestingChannel(channel);
    setError(null);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", channel }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload?.message ?? `Test notification failed (${response.status})`,
        );
      }
      const uiStatus = payload?.item?.uiStatus ?? payload?.item?.status;
      setNotice({
        tone: uiStatus === "sent" ? "success" : "info",
        message: `Test ${channel} dispatch result: ${statusLabel(uiStatus || "completed")}`,
      });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Test notification failed.",
      );
    } finally {
      setTestingChannel(null);
    }
  };

  const retryOutbox = async (outboxId: string) => {
    setRetryingId(outboxId);
    setError(null);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", outboxId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Retry failed.");
      }
      setNotice({
        tone: payload?.item?.uiStatus === "sent" ? "success" : "info",
        message: `Retry completed: ${statusLabel(payload?.item?.uiStatus || "processed")}`,
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Retry failed.");
    } finally {
      setRetryingId(null);
    }
  };

  const processDueQueue = async () => {
    setProcessingQueue(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_due" }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Queue processing failed.");
      }
      setNotice({
        tone: "success",
        message: `Processed ${payload.processedCount ?? 0} due outbox item(s).`,
      });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Queue processing failed.",
      );
    } finally {
      setProcessingQueue(false);
    }
  };

  // Explicit user-gesture Web Push registration
  const enableWebPushOnDevice = async () => {
    if (!pushSupported) {
      setError("Web Push is not supported in this browser.");
      return;
    }
    if (Notification.permission === "denied") {
      setPermissionState("denied");
      setError(
        "Notification permission is blocked in Chrome site settings. Allow notifications in the address bar lock icon to enable Web Push.",
      );
      return;
    }
    if (!data?.vapidPublicKey) {
      setError(
        "VAPID_PUBLIC_KEY is not configured on the server. Configure VAPID keys first.",
      );
      return;
    }

    setEnablingPush(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
      if (perm !== "granted") {
        setError(
          perm === "denied"
            ? "Notification permission was denied. Enable it in browser site settings if you change your mind."
            : "Notification permission prompt was dismissed.",
        );
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      const applicationServerKey = urlBase64ToUint8Array(data.vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          applicationServerKey.buffer as unknown as BufferSource,
      });

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error("Browser returned an incomplete push subscription.");
      }

      const response = await fetch("/api/admin/notifications/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth,
          },
          deviceLabel: deviceLabel.trim() || "Chrome Device",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload?.message ?? "Could not save push subscription.",
        );
      }

      setNotice({
        tone: "success",
        message: "This Chrome device is now subscribed to Web Push alerts.",
      });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not enable Web Push notifications.",
      );
    } finally {
      setEnablingPush(false);
    }
  };

  const revokeSubscription = async (id: string) => {
    setRevokingId(id);
    setError(null);
    try {
      const response = await fetch("/api/admin/notifications/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not revoke subscription.");
      }
      setNotice({
        tone: "info",
        message: "Device push subscription revoked.",
      });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not revoke device.",
      );
    } finally {
      setRevokingId(null);
    }
  };

  const triggerInstallApp = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPromptEvent(null);
      setIsStandalone(true);
    }
  };

  const channelCards: Array<{
    channel: ChannelKey;
    settingKey:
      | "emailEnabled"
      | "webPushEnabled"
      | "whatsappEnabled"
      | "instagramEnabled";
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      channel: "email",
      settingKey: "emailEnabled",
      title: "Gmail / Email (Resend)",
      subtitle:
        "Sends a rich, HTML-escaped email alert with sender metadata, safe excerpt, and direct Inbox link.",
      icon: Mail,
    },
    {
      channel: "web_push",
      settingKey: "webPushEnabled",
      title: "Chrome Web Push (Windows & Android)",
      subtitle:
        "Delivers background OS/browser notifications via RFC 8291/8292 Web Push to subscribed Chrome devices.",
      icon: Bell,
    },
    {
      channel: "whatsapp",
      settingKey: "whatsappEnabled",
      title: "WhatsApp Business Platform",
      subtitle:
        "Official Meta WhatsApp Cloud API adapter. Personal WhatsApp accounts cannot act as Cloud API senders.",
      icon: MessageSquare,
    },
    {
      channel: "instagram",
      settingKey: "instagramEnabled",
      title: "Instagram Direct Messages",
      subtitle:
        "Official Meta Instagram Messaging API assessment: Unavailable for automated website owner alerts due to Meta 24-hour user-initiated reply window.",
      icon: Lock,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading
          eyebrow="System / Omnichannel Alerts"
          title="Notification Settings & Delivery Outbox"
          description="Manage Gmail (Resend), Chrome Web Push (PWA), WhatsApp Business, and Instagram status, registered devices, and outbox retries."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-snow hover:border-white/20"
          >
            <ArrowLeft className="size-3.5" /> System Settings
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-snow hover:border-white/20"
          >
            <RefreshCcw className="size-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Deployment Environment & Real Credential Readiness Banner */}
      <NotchedPanel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                Active Runtime Environment
              </span>
              <StatusPill
                tone={
                  data?.environment?.vercelEnv === "preview"
                    ? "warning"
                    : data?.environment?.vercelEnv === "production"
                      ? "danger"
                      : "neutral"
                }
              >
                {data?.environment?.vercelEnv === "preview"
                  ? `Staging Preview (${data.environment.gitBranch || "release/rc-phase5-1"})`
                  : data?.environment?.vercelEnv === "production"
                    ? "Production (theseif.vercel.app)"
                    : "Local Development"}
              </StatusPill>
              {data?.environment?.gitCommitSha && (
                <span className="font-mono text-[11px] text-mist">
                  commit {data.environment.gitCommitSha}
                </span>
              )}
            </div>
            <p className="text-xs text-mist leading-relaxed max-w-4xl">
              {data?.environment?.vercelEnv === "production" ? (
                <>
                  Connected to the <strong className="text-snow">Production</strong> deployment (
                  <code className="font-mono text-sky">theseif.vercel.app</code>). Manage Chrome Web Push device subscriptions, Gmail (Resend) readiness, and delivery outbox records below.
                </>
              ) : (
                <>
                  Connected to isolated staging/preview environment (
                  <code className="font-mono text-sky">{data?.environment?.siteUrl || "Preview"}</code>).
                </>
              )}
            </p>
          </div>
          <StatusPill
            tone={
              data?.environment?.anyLiveChannelConfigured || Boolean(data?.vapidPublicKey)
                ? "success"
                : "warning"
            }
          >
            {data?.environment?.anyLiveChannelConfigured
              ? "Live Provider Credentials Active"
              : data?.vapidPublicKey
                ? "VAPID Keys Configured (Awaiting Device Enrollment)"
                : "No Live Provider Credentials Configured"}
          </StatusPill>
        </div>
        {data && !data.environment?.anyLiveChannelConfigured && !data.vapidPublicKey && (
          <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-3 text-xs text-amber-100 leading-relaxed">
            <strong>Real external delivery is not yet active in this environment:</strong>{" "}
            <code className="font-mono">RESEND_API_KEY</code> (Gmail) and{" "}
            <code className="font-mono">VAPID_PUBLIC_KEY</code> /{" "}
            <code className="font-mono">VAPID_PRIVATE_KEY</code> (Chrome Web Push) are currently unset. Contact messages are safely saved to the Inbox, and outbox rows are recorded as{" "}
            <strong>Not Configured</strong> until credentials are added.
          </div>
        )}
      </NotchedPanel>

      {/* Explicit Status Taxonomy Legend */}
      <NotchedPanel className="p-4 sm:p-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75 mb-2.5">
          Channel Verification & Availability Status Distinctions
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          <div className="rounded-xl border border-white/[0.07] bg-night-3/60 p-2.5">
            <StatusPill tone="warning">Implemented</StatusPill>
            <p className="mt-1.5 text-[11px] text-mist">
              Adapter code & DB schema exist, awaiting credentials or device enrollment.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-night-3/60 p-2.5">
            <StatusPill tone="warning">Configured</StatusPill>
            <p className="mt-1.5 text-[11px] text-mist">
              Required environment variables and subscriptions are set; awaiting real test delivery.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-night-3/60 p-2.5">
            <StatusPill tone="success">Test Delivery Successful</StatusPill>
            <p className="mt-1.5 text-[11px] text-mist">
              Real provider dispatch succeeded and recorded a verified timestamp in this environment.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-night-3/60 p-2.5">
            <StatusPill tone="neutral">Not Configured</StatusPill>
            <p className="mt-1.5 text-[11px] text-mist">
              Provider credentials are not set in this environment (e.g. personal WhatsApp only).
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-night-3/60 p-2.5">
            <StatusPill tone="danger">
              Unavailable (Provider/Account Restriction)
            </StatusPill>
            <p className="mt-1.5 text-[11px] text-mist">
              Official provider API rules prohibit automated website-to-owner alerts (Instagram).
            </p>
          </div>
        </div>
      </NotchedPanel>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-400/[0.08] p-4 text-sm text-red-100">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Channel Configuration Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {channelCards.map((card) => {
          const Icon = card.icon;
          const readiness = data?.readiness?.[card.channel];
          const isAvailable = readiness?.available ?? card.channel !== "instagram";
          const enabled = isAvailable
            ? (data?.settings?.[card.settingKey] ?? false)
            : false;
          const isConfigured = readiness?.configured ?? false;
          const badge = availabilityBadgeInfo(readiness?.availabilityState);

          return (
            <NotchedPanel
              key={card.channel}
              className="flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl border",
                        isAvailable
                          ? "border-sky/25 bg-sky/10 text-sky"
                          : "border-red-400/25 bg-red-400/10 text-red-300",
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-snow">
                        {card.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <StatusPill tone="warning">Implemented</StatusPill>
                        <StatusPill tone={badge.tone}>{badge.label}</StatusPill>
                        <StatusPill tone={enabled ? "success" : "neutral"}>
                          {enabled ? "Enabled" : "Disabled"}
                        </StatusPill>
                      </div>
                    </div>
                  </div>

                  {/* Modern semantic switch control */}
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-snow">
                    <input
                      type="checkbox"
                      // @ts-expect-error progressive enhancement switch attribute
                      switch=""
                      checked={enabled}
                      disabled={
                        !isAvailable ||
                        savingToggle === card.settingKey ||
                        loading
                      }
                      onChange={(e) =>
                        void toggleChannel(card.settingKey, e.target.checked)
                      }
                      aria-label={`Enable ${card.title}`}
                      className="size-4 accent-sky cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <span className="sr-only">Toggle {card.title}</span>
                  </label>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-mist">
                  {card.subtitle}
                </p>

                <div className="mt-4 rounded-xl border border-white/[0.08] bg-night-3/80 p-3 font-mono text-[11px] text-mist space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span>Implementation:</span>
                    <span className="text-snow font-semibold">Implemented</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Configuration Status:</span>
                    <span
                      className={cn(
                        "font-semibold",
                        !isAvailable
                          ? "text-red-300"
                          : isConfigured
                            ? "text-emerald-300"
                            : "text-amber-300",
                      )}
                    >
                      {!isAvailable
                        ? "Unavailable (Platform Restriction)"
                        : isConfigured
                          ? "Configured"
                          : "Not Configured"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Real Test Delivery:</span>
                    <span
                      className={cn(
                        "font-semibold",
                        readiness?.testDeliveryVerified
                          ? "text-emerald-300"
                          : "text-mist",
                      )}
                    >
                      {readiness?.testDeliveryVerified
                        ? `Test delivery successful (${formatDateTime(readiness.lastTestSentAt || readiness.lastSentAt)})`
                        : "Not yet verified with live credentials"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Last Successful Delivery:</span>
                    <span className="text-snow">
                      {formatDateTime(readiness?.lastSentAt)}
                    </span>
                  </div>
                  {readiness && readiness.missingEnvVars.length > 0 && (
                    <div className="pt-1 border-t border-white/[0.06] text-[10px] text-amber-200/90 break-words">
                      Missing env: {readiness.missingEnvVars.join(", ")}
                    </div>
                  )}
                  {readiness?.restrictionReason && (
                    <div className="pt-1 border-t border-white/[0.06] font-sans text-[11px] leading-relaxed text-amber-100/90">
                      {readiness.restrictionReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <span className="text-[11px] text-mist">
                  {isAvailable
                    ? "Owner test dispatch"
                    : "Blocked by Meta Instagram API policy"}
                </span>
                <button
                  type="button"
                  disabled={
                    !isAvailable || testingChannel === card.channel || loading
                  }
                  onClick={() => void sendTest(card.channel)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky/30 bg-sky/15 px-3 py-1.5 text-xs font-semibold text-snow hover:bg-sky/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {testingChannel === card.channel ? (
                    <RefreshCcw className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5 text-sky" />
                  )}
                  {isAvailable ? "Send Test" : "Unavailable"}
                </button>
              </div>
            </NotchedPanel>
          );
        })}
      </div>

      {/* Installable PWA + Chrome Web Push Device Enrollment */}
      <div className="grid gap-5 lg:grid-cols-2">
        <NotchedPanel className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                Installable App (PWA)
              </div>
              <h3 className="mt-1 text-base font-semibold text-snow">
                Install Dashboard on Windows & Android Chrome
              </h3>
            </div>
            <StatusPill tone={isStandalone ? "success" : "neutral"}>
              {isStandalone ? "Installed App" : "Browser Tab"}
            </StatusPill>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-mist">
            Installing the portfolio dashboard as a Progressive Web App enables
            standalone window launching and reliable background Web Push alerts
            on Windows + Chrome and Android + Chrome.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.08] bg-night-3/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-snow">
                <Laptop className="size-4 text-sky" /> Windows + Chrome
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-mist">
                Click the install icon in the Chrome address bar or open{" "}
                <span className="text-snow">
                  Menu → Save and share → Install page as app
                </span>
                .
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-night-3/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-snow">
                <Smartphone className="size-4 text-sky" /> Android + Chrome
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-mist">
                Tap the Chrome three-dot menu and select{" "}
                <span className="text-snow">
                  Add to Home screen / Install app
                </span>
                , then enable Web Push.
              </p>
            </div>
          </div>

          {installPromptEvent && !isStandalone && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => void triggerInstallApp()}
                className="inline-flex items-center gap-2 rounded-xl bg-sky px-4 py-2 text-xs font-bold text-night hover:bg-sky/90"
              >
                <Download className="size-3.5" /> Install Seif CMS App Now
              </button>
            </div>
          )}
        </NotchedPanel>

        <NotchedPanel className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                Browser Push Subscription
              </div>
              <h3 className="mt-1 text-base font-semibold text-snow">
                Subscribe This Chrome Device
              </h3>
            </div>
            <StatusPill
              tone={
                permissionState === "granted"
                  ? "success"
                  : permissionState === "denied"
                    ? "danger"
                    : "warning"
              }
            >
              Permission: {permissionState}
            </StatusPill>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-mist">
            Permission is requested only when you click the button below.
            Multiple devices (e.g., your Windows desktop and Android phone) can
            be subscribed simultaneously.
          </p>

          {permissionState === "denied" ? (
            <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100">
              Notifications are blocked for this origin in Chrome. To enable Web
              Push, click the site settings icon next to the URL bar, change{" "}
              <strong>Notifications</strong> to <strong>Allow</strong>, and
              reload this page.
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 block">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-mist mb-1">
                  Device Label
                </span>
                <input
                  type="text"
                  value={deviceLabel}
                  onChange={(e) => setDeviceLabel(e.target.value)}
                  placeholder="Windows + Chrome / Android + Chrome"
                  className="w-full rounded-xl border border-white/10 bg-night-3 px-3 py-2 text-xs text-snow outline-none focus:border-sky/50"
                />
              </label>
              <button
                type="button"
                disabled={enablingPush || !pushSupported}
                onClick={() => void enableWebPushOnDevice()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky px-4 py-2 text-xs font-bold text-night hover:bg-sky/90 disabled:opacity-50"
              >
                {enablingPush ? (
                  <RefreshCcw className="size-3.5 animate-spin" />
                ) : (
                  <Bell className="size-3.5" />
                )}
                Enable Web Push on This Device
              </button>
            </div>
          )}

          {/* Subscribed Devices List */}
          <div className="mt-5 border-t border-white/[0.08] pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
                Registered Push Subscriptions (
                {data?.subscriptions?.filter((s) => s.active).length ?? 0}{" "}
                active)
              </span>
            </div>
            {!data?.subscriptions?.length ? (
              <p className="text-xs text-mist">
                No push subscriptions registered yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {data.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-night-3/80 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-snow truncate">
                          {sub.deviceLabel}
                        </span>
                        <StatusPill tone={sub.active ? "success" : "neutral"}>
                          {sub.active ? "Active" : "Revoked"}
                        </StatusPill>
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] text-mist">
                        {sub.endpointPreview} · Last used:{" "}
                        {formatDateTime(sub.lastUsedAt)}
                      </div>
                    </div>
                    {sub.active && (
                      <button
                        type="button"
                        disabled={revokingId === sub.id}
                        onClick={() => void revokeSubscription(sub.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-400/25 bg-red-400/10 px-2.5 py-1 text-[11px] font-medium text-red-200 hover:bg-red-400/20 disabled:opacity-50"
                      >
                        <Trash2 className="size-3" /> Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </NotchedPanel>
      </div>

      {/* Outbox Scheduler & Worker Status + Delivery History Table */}
      <NotchedPanel className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
              Outbox Worker & Audit Log
            </div>
            <h3 className="mt-1 text-base font-semibold text-snow">
              Recent Notification Deliveries & Retries
            </h3>
            {data?.scheduler && (
              <p className="mt-1 text-xs text-mist max-w-3xl">
                {data.scheduler.note}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={processingQueue || loading}
            onClick={() => void processDueQueue()}
            className="inline-flex items-center gap-2 rounded-xl border border-sky/30 bg-sky/15 px-3.5 py-2 text-xs font-semibold text-snow hover:bg-sky/25 disabled:opacity-50"
          >
            {processingQueue ? (
              <RefreshCcw className="size-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5 text-sky" />
            )}
            Process Retryable Queue
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-mist">Loading delivery history…</p>
        ) : !data?.history?.length ? (
          <p className="text-xs text-mist">
            No notification outbox records yet. Submit a contact message or click
            Send Test above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] font-mono text-[10px] uppercase tracking-wider text-mist">
                  <th className="py-2.5 pr-3">Channel</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Attempts</th>
                  <th className="py-2.5 px-3">Message / Dedupe Key</th>
                  <th className="py-2.5 px-3">Provider / Error</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {data.history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3 font-mono font-semibold uppercase text-snow">
                      {item.channel}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusPill tone={statusPillTone(item.uiStatus)}>
                        {statusLabel(item.uiStatus)}
                      </StatusPill>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-mist">
                      {item.attempts}/{item.maxAttempts}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-mist">
                      {item.contactMessageId ? (
                        <Link
                          href={`/dashboard/inbox?messageId=${encodeURIComponent(
                            item.contactMessageId,
                          )}`}
                          className="text-sky hover:underline"
                        >
                          msg:{item.contactMessageId.slice(0, 8)}
                        </Link>
                      ) : (
                        <span>{item.dedupeKey}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-mist max-w-xs truncate">
                      {item.lastErrorMessage ? (
                        <span className="text-amber-200/90" title={item.lastErrorMessage}>
                          {item.lastErrorMessage}
                        </span>
                      ) : item.providerMessageId ? (
                        <span className="font-mono text-emerald-300/90">
                          id: {item.providerMessageId.slice(0, 28)}
                        </span>
                      ) : (
                        <span>{item.providerStatus || "—"}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-mist whitespace-nowrap">
                      {formatDateTime(item.sentAt || item.createdAt)}
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      {item.uiStatus === "unavailable" ? (
                        <span className="text-[11px] text-red-300/80">
                          Unavailable
                        </span>
                      ) : item.uiStatus !== "sent" ? (
                        <button
                          type="button"
                          disabled={retryingId === item.id}
                          onClick={() => void retryOutbox(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-snow hover:border-sky/40 hover:text-sky disabled:opacity-50"
                        >
                          <RefreshCcw
                            className={cn(
                              "size-3",
                              retryingId === item.id && "animate-spin",
                            )}
                          />
                          Retry
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="size-3.5" /> Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NotchedPanel>
    </div>
  );
}
