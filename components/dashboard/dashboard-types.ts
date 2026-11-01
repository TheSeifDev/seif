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

export type InboxMessage = {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type RevisionItem = {
  id: string;
  revision: number;
  kind: string;
  createdAt: string;
};

export type DashboardSectionKey =
  | "command-center"
  | "metrics"
  | "analytics"
  | "schedule"
  | "activity"
  | "content-hub";

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

export type NavItem = {
  key: DashboardSectionKey;
  id: string;
  label: string;
  number: string;
  icon: LucideIcon;
};

