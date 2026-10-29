"use client";

import { useEffect, useRef } from "react";
import type { MoonSceneHandle } from "@/lib/visuals/moon-scene";

type DeviceNavigator = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function Moon() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;
    const nav = navigator as DeviceNavigator;
    const lowPower =
      !!nav.connection?.saveData ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
      (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2);
    const media = window.matchMedia(
      "(min-width:1024px) and (prefers-reduced-motion:no-preference)",
    );
    let disposed = false;
    let version = 0;
    let visible = false;
    let loading = false;
    let failed = false;
    let handle: MoonSceneHandle | null = null;
    let idle = 0;
    let timer = 0;
    let readyObserver: MutationObserver | null = null;
    const hero = root.closest<HTMLElement>("#home");
    let heroHeight = hero?.offsetHeight || window.innerHeight;
    const progress = () =>
      Math.min(1, Math.max(0, window.scrollY / heroHeight));
    const allowed = () => !disposed && !failed && !lowPower && media.matches;
    const cancelLoad = () => {
      if (idle && "cancelIdleCallback" in window)
        window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
      idle = timer = 0;
    };
    const stop = () => {
      version++;
      loading = false;
      cancelLoad();
      readyObserver?.disconnect();
      readyObserver = null;
      handle?.dispose();
      handle = null;
      root.dataset.renderer = "fallback";
    };
    const activate = async () => {
      idle = timer = 0;
      if (!allowed() || !visible || loading || handle) return;
      loading = true;
      const current = ++version;
      try {
        const { createMoonScene } = await import("@/lib/visuals/moon-scene");
        if (!allowed() || current !== version) return;
        readyObserver = new MutationObserver(() => {
          if (current !== version || disposed) return;
          const canvas = host.querySelector("canvas");
          if (Number(canvas?.dataset.frameCount || 0) > 0) {
            root.dataset.renderer = "webgl";
            readyObserver?.disconnect();
            readyObserver = null;
          }
        });
        readyObserver.observe(host, {
          subtree: true,
          attributes: true,
          attributeFilter: ["data-frame-count"],
        });
        const scene = await createMoonScene(host, () => {
          if (!disposed && current === version) {
            failed = true;
            stop();
          }
        });
        if (!allowed() || current !== version) {
          scene?.dispose();
          return;
        }
        handle = scene;
        if (handle) {
          handle.setVisible(visible && document.visibilityState !== "hidden");
          handle.setProgress(progress());
        } else {
          failed = true;
          readyObserver?.disconnect();
          readyObserver = null;
          root.dataset.renderer = "fallback";
        }
      } catch {
        if (current === version) {
          failed = true;
          stop();
        }
      } finally {
        if (current === version) loading = false;
      }
    };
    const schedule = () => {
      if (!allowed() || !visible || loading || handle || idle || timer) return;
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(
          () => {
            void activate();
          },
          { timeout: 1400 },
        );
      else
        timer = window.setTimeout(() => {
          void activate();
        }, 400);
    };
    const onMode = () => {
      if (!allowed()) stop();
      else schedule();
    };
    const onScroll = () => {
      if (visible) handle?.setProgress(progress());
    };
    const onResize = () => {
      heroHeight = hero?.offsetHeight || window.innerHeight;
      handle?.resize();
      onScroll();
    };
    const onVisibility = () =>
      handle?.setVisible(visible && document.visibilityState !== "hidden");
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        handle?.setVisible(visible && document.visibilityState !== "hidden");
        if (visible) {
          onScroll();
          schedule();
        }
      },
      { threshold: 0.05 },
    );
    visibility.observe(root);
    const resize = new ResizeObserver(onResize);
    resize.observe(host);
    media.addEventListener("change", onMode);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      stop();
      visibility.disconnect();
      resize.disconnect();
      media.removeEventListener("change", onMode);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="moon-scene group/moon relative size-full"
      data-renderer="fallback"
      aria-hidden="true"
    >
      <span className="moon-css absolute inset-4 rounded-full bg-[radial-gradient(circle_at_32%_28%,#e3f6ff_0%,#72c9f0_25%,#204a63_62%,#0a1823_84%)] shadow-[0_0_70px_#49baf11e,inset_-18px_-14px_28px_#06121d] opacity-100 transition-opacity duration-300 group-data-[renderer=webgl]/moon:opacity-0 motion-reduce:transition-none" />
      <div
        ref={hostRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-data-[renderer=webgl]/moon:opacity-100 motion-reduce:transition-none [&>canvas]:size-full"
      />
    </div>
  );
}
