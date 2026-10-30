"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const FOOTER_GRAIN_MEDIA_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const REVEAL_OPACITY = "0.095";

type FooterGrainProps = {
  texture: string;
};

/**
 * A quiet grain stays behind the footer content; a small brighter patch follows
 * supported desktop pointers. The layer never receives pointer events.
 */
export function FooterGrain({ texture }: FooterGrainProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const footer = root?.closest<HTMLElement>("[data-site-footer]");
    if (!root || !footer) return;

    const media = window.matchMedia(FOOTER_GRAIN_MEDIA_QUERY);
    let enabled = false;
    let frameId: number | null = null;
    let revealX = 0;
    let revealY = 0;

    const flush = () => {
      frameId = null;
      if (!enabled) return;

      root.style.setProperty("--grain-x", `${revealX.toFixed(1)}px`);
      root.style.setProperty("--grain-y", `${revealY.toFixed(1)}px`);
      root.style.setProperty("--grain-reveal-opacity", REVEAL_OPACITY);
    };

    const scheduleFlush = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(flush);
    };

    const clearReveal = () => {
      root.dataset.tracking = "false";
      root.style.setProperty("--grain-reveal-opacity", "0");
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;

      const rect = root.getBoundingClientRect();
      revealX = event.clientX - rect.left;
      revealY = event.clientY - rect.top;
      root.dataset.tracking = "true";
      scheduleFlush();
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      root.dataset.enabled = "true";
      footer.addEventListener("pointermove", handlePointerMove, { passive: true });
      footer.addEventListener("pointerleave", clearReveal, { passive: true });
    };

    const disable = () => {
      if (enabled) {
        footer.removeEventListener("pointermove", handlePointerMove);
        footer.removeEventListener("pointerleave", clearReveal);
      }
      enabled = false;
      root.dataset.enabled = "false";
      clearReveal();
    };

    const reconfigure = () => {
      if (media.matches) enable();
      else disable();
    };

    reconfigure();
    media.addEventListener("change", reconfigure);

    return () => {
      media.removeEventListener("change", reconfigure);
      disable();
    };
  }, []);

  const revealStyle: CSSProperties = {
    backgroundImage: texture,
    maskImage:
      "radial-gradient(circle 190px at var(--grain-x, 50%) var(--grain-y, 50%), black 0%, transparent 72%)",
    WebkitMaskImage:
      "radial-gradient(circle 190px at var(--grain-x, 50%) var(--grain-y, 50%), black 0%, transparent 72%)",
    opacity: "var(--grain-reveal-opacity, 0)",
  };

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-footer-grain-interaction
      data-enabled="false"
      data-tracking="false"
      className="pointer-events-none absolute -inset-[12%] z-0"
    >
      <span
        data-footer-grain
        className="absolute inset-0 bg-cover bg-no-repeat opacity-[0.055] mix-blend-screen motion-safe:animate-footer-grain motion-reduce:animate-none"
        style={{ backgroundImage: texture }}
      />
      <span
        data-footer-grain-reveal
        className="absolute inset-0 bg-cover bg-no-repeat mix-blend-screen transition-opacity duration-300 motion-safe:animate-footer-grain motion-reduce:animate-none"
        style={revealStyle}
      />
    </div>
  );
}
