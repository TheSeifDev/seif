"use client";

import * as React from "react";
import type { SiteContent } from "@/lib/cms/schema";
import type {
  DashboardUser,
  InboxMessage,
  MediaItem,
  Notice,
  PathPart,
  RevisionItem,
} from "./dashboard-types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isDirty(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

function setIn(target: unknown, path: PathPart[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...tail] = path;
  if (Array.isArray(target)) {
    const copy = [...target];
    const index = Number(head);
    copy[index] = setIn(copy[index], tail, value);
    return copy;
  }
  if (target && typeof target === "object") {
    const copy = { ...(target as Record<string, unknown>) };
    const key = String(head);
    copy[key] = setIn(copy[key], tail, value);
    return copy;
  }
  const nextTarget = typeof head === "number" ? [] : {};
  return setIn(nextTarget, path, value);
}

export type DashboardContextValue = {
  content: SiteContent;
  savedContent: SiteContent;
  revision: number;
  publishedRevision: number;
  dirty: boolean;
  configured: boolean;
  user: DashboardUser;
  saving: boolean;
  publishing: boolean;
  notice: Notice | null;
  setNotice: (notice: Notice | null) => void;
  messages: InboxMessage[];
  setMessages: React.Dispatch<React.SetStateAction<InboxMessage[]>>;
  unreadMessagesCount: number;
  mediaItems: MediaItem[];
  revisions: RevisionItem[];
  restoringRevisionId: string | null;
  confirmPublish: boolean;
  setConfirmPublish: (confirm: boolean) => void;
  openPublishModal: () => void;
  publishTriggerRef: React.RefObject<HTMLButtonElement | null>;
  publishCancelRef: React.RefObject<HTMLButtonElement | null>;
  save: () => Promise<void>;
  publish: () => Promise<void>;
  discard: () => void;
  downloadBackup: () => void;
  restoreRevision: (item: RevisionItem) => Promise<void>;
  applyRestoredRevision: (
    content: SiteContent,
    revision: number,
    publishedRevision: number,
  ) => void;
  update: (path: PathPart[], value: unknown) => void;
  updateContent: (updater: (prev: SiteContent) => SiteContent) => void;
  deleteItem: (key: "projects" | "posts", index: number) => void;
  logout: () => Promise<void>;
  loadMessages: () => Promise<void>;
  loadMedia: () => Promise<void>;
  loadRevisions: () => Promise<void>;
};

const DashboardContext = React.createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

export function DashboardProvider({
  initialContent,
  initialRevision,
  publishedRevision: initialPublishedRevision,
  user,
  configured,
  children,
}: {
  initialContent: SiteContent;
  initialRevision: number;
  publishedRevision: number;
  user: DashboardUser;
  configured: boolean;
  children: React.ReactNode;
}) {
  const [savedContent, setSavedContent] = React.useState<SiteContent>(() =>
    clone(initialContent),
  );
  const [content, setContent] = React.useState<SiteContent>(() =>
    clone(initialContent),
  );
  const [revision, setRevision] = React.useState(initialRevision);
  const [published, setPublished] = React.useState(initialPublishedRevision);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [confirmPublish, setConfirmPublish] = React.useState(false);
  const [restoringRevisionId, setRestoringRevisionId] = React.useState<
    string | null
  >(null);

  const [revisions, setRevisions] = React.useState<RevisionItem[]>([]);
  const [messages, setMessages] = React.useState<InboxMessage[]>([]);
  const [mediaItems, setMediaItems] = React.useState<MediaItem[]>([]);

  const publishTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const publishCancelRef = React.useRef<HTMLButtonElement | null>(null);

  const dirty = React.useMemo(
    () => isDirty(content, savedContent),
    [content, savedContent],
  );

  const loadRevisions = React.useCallback(async () => {
    try {
      const response = await fetch("/api/admin/revisions", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (response.ok && Array.isArray(payload.items)) {
        setRevisions(payload.items);
      }
    } catch {
      // Ignore background refresh failure
    }
  }, []);

  const loadMessages = React.useCallback(async () => {
    try {
      const response = await fetch("/api/admin/messages", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (response.ok && Array.isArray(payload.items)) {
        setMessages(payload.items);
      }
    } catch {
      // Ignore background refresh failure
    }
  }, []);

  const loadMedia = React.useCallback(async () => {
    try {
      const response = await fetch("/api/admin/media", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (response.ok && Array.isArray(payload.items)) {
        setMediaItems(payload.items);
      }
    } catch {
      // Ignore background refresh failure
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    const fetchInitialData = async () => {
      try {
        const [revRes, msgRes, medRes] = await Promise.allSettled([
          fetch("/api/admin/revisions", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/admin/messages", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/admin/media", { cache: "no-store" }).then((r) => r.json()),
        ]);
        if (ignore) return;
        if (revRes.status === "fulfilled" && Array.isArray(revRes.value?.items)) {
          setRevisions(revRes.value.items);
        }
        if (msgRes.status === "fulfilled" && Array.isArray(msgRes.value?.items)) {
          setMessages(msgRes.value.items);
        }
        if (medRes.status === "fulfilled" && Array.isArray(medRes.value?.items)) {
          setMediaItems(medRes.value.items);
        }
      } catch {
        // Ignore background load error
      }
    };
    void fetchInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  const update = React.useCallback((path: PathPart[], value: unknown) => {
    setContent((current) => setIn(current, path, value) as SiteContent);
  }, []);

  const updateContent = React.useCallback(
    (updater: (prev: SiteContent) => SiteContent) => {
      setContent(updater);
    },
    [],
  );

  const deleteItem = React.useCallback(
    (key: "projects" | "posts", index: number) => {
      const item = content[key][index];
      const name = "title" in item ? item.title : "item";
      if (
        !window.confirm(
          `Delete “${name}” permanently from this working revision?`,
        )
      )
        return;
      update(
        [key],
        content[key].filter((_, itemIndex) => itemIndex !== index),
      );
    },
    [content, update],
  );

  const discard = React.useCallback(() => {
    setContent(clone(savedContent));
    setNotice({
      tone: "info",
      message: "Unsaved modifications discarded. Restored saved snapshot.",
    });
  }, [savedContent]);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.reload();
  }, []);

  const save = React.useCallback(async () => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, expectedRevision: revision }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        setNotice({
          tone: "error",
          message:
            "This content changed elsewhere. Nothing was overwritten; reload to compare the current revision.",
        });
        return;
      }
      if (response.status === 503) {
        setNotice({
          tone: "error",
          message:
            payload?.message ??
            "CMS readiness is incomplete. No content was saved.",
        });
        return;
      }
      if (!response.ok) {
        const paths = Array.isArray(payload?.issues)
          ? ` ${payload.issues.map((issue: { path?: string[]; message?: string }) => `${issue.path?.join(".") || "content"}: ${issue.message || "invalid"}`).join(" · ")}`
          : "";
        throw new Error(
          (payload?.message ?? `Save failed (${response.status})`) + paths,
        );
      }
      setSavedContent(clone(payload.content ?? content));
      setContent(clone(payload.content ?? content));
      setRevision(Number(payload.revision ?? revision));
      setPublished(Number(payload.publishedRevision ?? published));
      setNotice({
        tone: "success",
        message: `Saved working revision ${payload.revision ?? revision}.`,
      });
      void loadRevisions();
    } catch (cause) {
      setNotice({
        tone: "error",
        message:
          cause instanceof Error ? cause.message : "Could not save content.",
      });
    } finally {
      setSaving(false);
    }
  }, [content, revision, published, loadRevisions]);

  const publish = React.useCallback(async () => {
    setPublishing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedRevision: revision }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        setNotice({
          tone: "error",
          message:
            "The revision changed before publish. Nothing was published.",
        });
        return;
      }
      if (!response.ok)
        throw new Error(
          payload?.message ?? `Publish failed (${response.status})`,
        );
      setPublished(
        Number(payload.publishedRevision ?? payload.revision ?? revision),
      );
      setNotice({
        tone: "success",
        message: "The selected revision is now public.",
      });
      void loadRevisions();
    } catch (cause) {
      setNotice({
        tone: "error",
        message: cause instanceof Error ? cause.message : "Could not publish.",
      });
    } finally {
      setPublishing(false);
      setConfirmPublish(false);
    }
  }, [revision, loadRevisions]);

  const restoreRevision = React.useCallback(
    async (item: RevisionItem) => {
      if (
        !window.confirm(
          `Restore revision ${item.revision} as the working draft? This will not publish it.`,
        )
      )
        return;
      setRestoringRevisionId(item.id);
      try {
        const response = await fetch("/api/admin/revisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, expectedRevision: revision }),
        });
        const payload = await response.json().catch(() => null);
        if (response.status === 409)
          throw new Error(
            payload?.message ??
              "The working revision changed. Nothing was restored.",
          );
        if (!response.ok || payload?.ok !== true || !payload.content)
          throw new Error(
            payload?.message ??
              `Could not restore revision (${response.status})`,
          );
        setSavedContent(clone(payload.content as SiteContent));
        setContent(clone(payload.content as SiteContent));
        setRevision(Number(payload.revision));
        setPublished(Number(payload.publishedRevision ?? published));
        setNotice({
          tone: "success",
          message: `Restored revision ${item.revision} as draft revision ${payload.revision}. It was not published.`,
        });
        void loadRevisions();
      } catch (cause) {
        setNotice({
          tone: "error",
          message:
            cause instanceof Error
              ? cause.message
              : "Could not restore revision. Nothing was published.",
        });
      } finally {
        setRestoringRevisionId(null);
      }
    },
    [revision, published, loadRevisions],
  );

  const applyRestoredRevision = React.useCallback(
    (
      nextContent: SiteContent,
      nextRevision: number,
      nextPublishedRevision: number,
    ) => {
      setSavedContent(clone(nextContent));
      setContent(clone(nextContent));
      setRevision(nextRevision);
      setPublished(nextPublishedRevision);
      void loadRevisions();
    },
    [loadRevisions],
  );

  const downloadBackup = React.useCallback(() => {
    const blob = new Blob([JSON.stringify(savedContent, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `site-content-revision-${revision}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [savedContent, revision]);

  const openPublishModal = React.useCallback(() => {
    publishTriggerRef.current =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;
    setConfirmPublish(true);
  }, []);

  const unreadMessagesCount = React.useMemo(
    () =>
      messages.filter((m) => m.status !== "read" && m.status !== "archived")
        .length,
    [messages],
  );

  const value = React.useMemo<DashboardContextValue>(
    () => ({
      content,
      savedContent,
      revision,
      publishedRevision: published,
      dirty,
      configured,
      user,
      saving,
      publishing,
      notice,
      setNotice,
      messages,
      setMessages,
      unreadMessagesCount,
      mediaItems,
      revisions,
      restoringRevisionId,
      confirmPublish,
      setConfirmPublish,
      openPublishModal,
      publishTriggerRef,
      publishCancelRef,
      save,
      publish,
      discard,
      downloadBackup,
      restoreRevision,
      applyRestoredRevision,
      update,
      updateContent,
      deleteItem,
      logout,
      loadMessages,
      loadMedia,
      loadRevisions,
    }),
    [
      content,
      savedContent,
      revision,
      published,
      dirty,
      configured,
      user,
      saving,
      publishing,
      notice,
      messages,
      setMessages,
      unreadMessagesCount,
      mediaItems,
      revisions,
      restoringRevisionId,
      confirmPublish,
      openPublishModal,
      save,
      publish,
      discard,
      downloadBackup,
      restoreRevision,
      applyRestoredRevision,
      update,
      updateContent,
      deleteItem,
      logout,
      loadMessages,
      loadMedia,
      loadRevisions,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

let cachedNowSnapshot = 0;
const nowListeners = new Set<() => void>();
let nowIntervalTimer: ReturnType<typeof setInterval> | null = null;

function handleNowTick() {
  cachedNowSnapshot = Date.now();
  nowListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener errors
    }
  });
}

function subscribeNow(onStoreChange: () => void) {
  nowListeners.add(onStoreChange);
  if (nowListeners.size === 1) {
    if (cachedNowSnapshot === 0) {
      cachedNowSnapshot = Date.now();
    }
    nowIntervalTimer = setInterval(handleNowTick, 30_000);
  }
  return () => {
    nowListeners.delete(onStoreChange);
    if (nowListeners.size === 0 && nowIntervalTimer) {
      clearInterval(nowIntervalTimer);
      nowIntervalTimer = null;
    }
  };
}

function getNowSnapshot(): number {
  if (cachedNowSnapshot === 0 && typeof window !== "undefined") {
    cachedNowSnapshot = Date.now();
  }
  return cachedNowSnapshot;
}

function getServerSnapshot(): number {
  return 0;
}

export function useNow(): number {
  return React.useSyncExternalStore(subscribeNow, getNowSnapshot, getServerSnapshot);
}

