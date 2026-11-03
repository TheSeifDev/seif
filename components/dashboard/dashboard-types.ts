import type { LucideIcon } from "lucide-react";
import type { SiteContent } from "@/lib/cms/schema";

export type DashboardUser = {
  name: string;
  image?: string | null;
};

export type DashboardWorkspaceProps = {
  initialContent: SiteContent;
  initialRevision: number;
  publishedRevision: number;
  user: DashboardUser;
  configured: boolean;
};

export type PathPart = string | number;
export type ContentValue = unknown;
export type Notice = { tone: "success" | "error" | "info"; message: string };

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  visibility: string;
  createdAt: string;
};

export type InboxChannelDelivery = {
  outboxId: string | null;
  channel: "email" | "web_push" | "whatsapp" | "instagram";
  status:
    | "pending"
    | "processing"
    | "sent"
    | "failed"
    | "skipped"
    | "not_configured"
    | "unavailable";
  attempts: number;
  maxAttempts: number;
  sentAt: string | null;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  providerMessageId: string | null;
  providerStatus: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
};

export type InboxMessage = {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  createdAt?: string;
  notificationStatus?: string;
  deliveries?: InboxChannelDelivery[];
  [key: string]: unknown;
};

export type RevisionItem = {
  id: string;
  revision: number;
  kind: string;
  createdAt: string;
};

export type DashboardPageKey =
  | "overview"
  | "projects"
  | "blog"
  | "about"
  | "skills"
  | "home"
  | "media"
  | "inbox"
  | "seo"
  | "settings";

export type ContentHubKey =
  | "projects"
  | "blog"
  | "about"
  | "skills"
  | "home"
  | "media"
  | "inbox"
  | "seo"
  | "settings";

export type DashboardSectionKey =
  | "command-center"
  | "metrics"
  | "analytics"
  | "schedule"
  | "activity"
  | "content-hub";

export type NavItem = {
  key: DashboardSectionKey;
  id: string;
  label: string;
  number: string;
  icon: LucideIcon;
};

export type DashboardSidebarNavItem = {
  key: DashboardPageKey;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  group: "core" | "content" | "assets" | "system";
};
