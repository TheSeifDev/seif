"use client";

import { useEffect, useRef } from "react";
import { motionQueries } from "@/components/motion/gsap";
import { MOON_EVENT, type MoonState } from "@/lib/visuals/identity-moon-config";
import type { IdentityMoonHandle } from "@/lib/visuals/identity-moon-scene";

type DeviceNavigator = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const isLowPower = () => {
  const nav = navigator as DeviceNavigator;
  return (
    Boolean(nav.connection?.saveData) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2)
  );
};

/**
 * Moon behind the Identity portrait. The CSS disc is always rendered and is
 * the moon on mobile, with reduced motion, without WebGL or on low-power
 * devices. In pinned stage mode the Three.js renderer is imported once the
 * section is within a viewport and the browser is idle, then crossfades in.
 * Scroll state arrives from the master timeline via `MOON_EVENT`; this
 * component creates no ScrollTrigger.
 */
export function IdentityMoon() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;

    const scene = root.closest<HTMLElement>('[data-scene="identity"]') ?? root;
    const media = window.matchMedia(motionQueries.stage);
    const lowPower = isLowPower();
    let disposed = false;
    let failed = false;
    let near = false;
    let loading = false;
    let version = 0;
    let idle = 0;
    let timer = 0;
    let handle: IdentityMoonHandle | null = null;

    const readState = (): MoonState => ({
      rise: Number(scene.dataset.moonRise) || 0,
      exit: Number(scene.dataset.moonExit) || 0,
    });
    const allowed = () => !disposed && !failed && !lowPower && media.matches;
    const setRenderer = (mode: "fallback" | "webgl") => {
      root.dataset.renderer = mode;
    };

    const cancelSchedule = () => {
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
      idle = 0;
      timer = 0;
    };

    const stop = () => {
      version += 1;
      loading = false;
      cancelSchedule();
      handle?.dispose();
      handle = null;
      setRenderer("fallback");
    };

    const activate = async () => {
      idle = 0;
      timer = 0;
      if (!allowed() || !near || loading || handle) return;
      loading = true;
      const current = ++version;
      try {
        const { createIdentityMoon } = await import("@/lib/visuals/identity-moon-scene");
        if (!allowed() || current !== version) return;
        const created = await createIdentityMoon(host, {
          onReady: () => {
            if (current === version && !disposed) setRenderer("webgl");
          },
          onFailure: () => {
            if (current !== version || disposed) return;
            failed = true;
            stop();
          },
        });
        if (!created) return;
        if (!allowed() || current !== version) {
          created.dispose();
          return;
        }
        handle = created;
        handle.setVisible(near && !document.hidden);
        handle.setState(readState());
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
      if (!allowed() || !near || loading || handle || idle || timer) return;
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(() => void activate(), { timeout: 1200 });
      } else {
        timer = window.setTimeout(() => void activate(), 300);
      }
    };

    const onMoon = (event: Event) => {
      handle?.setState((event as CustomEvent<MoonState>).detail);
    };
    const onMedia = () => {
      if (allowed()) schedule();
      else stop();
    };
    const onVisibility = () => handle?.setVisible(near && !document.hidden);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        near = Boolean(entry?.isIntersecting);
        handle?.setVisible(near && !document.hidden);
        if (near) schedule();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    const resize = new ResizeObserver(() => handle?.resize());

    scene.addEventListener(MOON_EVENT, onMoon);
    media.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);
    intersection.observe(scene);
    resize.observe(host);

    return () => {
      disposed = true;
      stop();
      intersection.disconnect();
      resize.disconnect();
      scene.removeEventListener(MOON_EVENT, onMoon);
      media.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-renderer="fallback"
      aria-hidden="true"
      className="group/moon absolute inset-0"
    >
      {/* The wrapper is moved by the timeline; the disc fades out once WebGL is live. */}
      <div data-identity-moon-disc className="absolute inset-0">
        <span className="absolute left-1/2 top-1/2 size-[43%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_36%_30%,#f4f9ff_0%,#d3e7f6_26%,#86b9dc_56%,#2b5272_80%,#0d1b29_100%)] shadow-[0_0_90px_24px_rgba(77,182,255,0.22)] transition-opacity duration-500 group-data-[renderer=webgl]/moon:opacity-0 motion-reduce:transition-none" />
      </div>
      <div
        ref={hostRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-data-[renderer=webgl]/moon:opacity-100 motion-reduce:transition-none [&>canvas]:block [&>canvas]:size-full"
      />
    </div>
  );
}
