"use client";

import { useEffect, useRef } from "react";

const CURSOR_MEDIA_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const POINTER_OFFSET = 14;
const MAGNETIC_LIMIT = 4.5;

type CursorMode =
  | "normal"
  | "link"
  | "button"
  | "project"
  | "preview"
  | "scroll-left"
  | "scroll-right";

type HotspotKind = "link" | "button" | "project" | "preview" | "scroll";

type MagneticState = {
  target: HTMLElement;
  rect: DOMRect;
  originalTranslate: string;
  originalTransition: string;
};

type Hotspot = {
  element: Element;
  kind: HotspotKind;
  scrollRect?: DOMRect;
  magnetic?: MagneticState;
};

type ResolvedTarget = {
  element: Element | null;
  kind?: HotspotKind;
  magneticAnchor?: HTMLAnchorElement;
  suppressed: boolean;
};

function elementFromTarget(target: EventTarget | null): Element | null {
  return target instanceof Element ? target : null;
}

function isMagneticAnchor(element: Element): element is HTMLAnchorElement {
  return element instanceof HTMLAnchorElement && element.dataset.magnetic === "true";
}

function getMagneticState(anchor: HTMLAnchorElement): MagneticState | undefined {
  if (!isMagneticAnchor(anchor)) return undefined;

  const target =
    anchor.querySelector<HTMLElement>("[data-magnetic-target]") ?? anchor;
  const style = target.style;

  return {
    target,
    rect: target.getBoundingClientRect(),
    originalTranslate: style.getPropertyValue("translate"),
    originalTransition: style.getPropertyValue("transition"),
  };
}

function resolveTarget(target: EventTarget | null): ResolvedTarget {
  const element = elementFromTarget(target);
  if (!element) return { element: null, suppressed: false };

  const editingElement = element.closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
  );
  if (editingElement) return { element: null, suppressed: true };

  // Interactive controls win over an enclosing project or horizontal-scroll region.
  const anchor = element.closest("a");
  if (anchor) {
    return {
      element: anchor,
      kind: anchor.dataset.cursor === "project" ? "project" : "link",
      magneticAnchor: isMagneticAnchor(anchor) ? anchor : undefined,
      suppressed: false,
    };
  }

  const button = element.closest('button, [role="button"]');
  if (button) {
    return {
      element: button,
      kind: "button",
      suppressed: false,
    };
  }

  const project = element.closest('[data-cursor="project"]');
  if (project) {
    return {
      element: project,
      kind: "project",
      suppressed: false,
    };
  }

  const scrollRegion = element.closest('[data-cursor="scroll"]');
  const featuredRoot = scrollRegion?.closest<HTMLElement>('[data-scene="featured"]');
  if (scrollRegion && (!featuredRoot || featuredRoot.dataset.enhanced === "true")) {
    return {
      element: scrollRegion,
      kind: "scroll",
      suppressed: false,
    };
  }

  const preview = element.closest('[data-cursor="preview"]');
  if (preview) return { element: preview, kind: "preview", suppressed: false };

  return { element: null, suppressed: false };
}

function modeForHotspot(hotspot: Hotspot | null, pointerX: number): CursorMode {
  if (!hotspot) return "normal";
  if (hotspot.kind === "link") return "link";
  if (hotspot.kind === "button") return "button";
  if (hotspot.kind === "project") return "project";
  if (hotspot.kind === "preview") return "preview";

  const rect = hotspot.scrollRect;
  if (!rect || rect.width <= 0) return "scroll-right";
  return pointerX < rect.left + rect.width / 2
    ? "scroll-left"
    : "scroll-right";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * A deliberately small, native-cursor-preserving pointer follower for supported
 * desktop pointers. It is inert on touch, reduced-motion, and keyboard-only use.
 */
export function CustomCursor() {
  const followerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const projectIconRef = useRef<HTMLSpanElement>(null);
  const scrollLeftIconRef = useRef<HTMLSpanElement>(null);
  const scrollRightIconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const follower = followerRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const projectIcon = projectIconRef.current;
    const scrollLeftIcon = scrollLeftIconRef.current;
    const scrollRightIcon = scrollRightIconRef.current;
    if (
      !follower ||
      !ring ||
      !dot ||
      !projectIcon ||
      !scrollLeftIcon ||
      !scrollRightIcon
    ) {
      return;
    }

    const media = window.matchMedia(CURSOR_MEDIA_QUERY);
    let enabled = false;
    let rafId: number | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;
    let keyboardHidden = false;
    let suppressed = false;
    let visible = false;
    let activeHotspot: Hotspot | null = null;
    let appliedMagnetic: MagneticState | null = null;

    const setDataState = (mode: CursorMode, isEnabled: boolean) => {
      follower.dataset.mode = mode;
      follower.dataset.enabled = String(isEnabled);
    };

    const restoreMagnetic = (state: MagneticState | null) => {
      if (!state) return;
      if (state.originalTranslate) {
        state.target.style.setProperty("translate", state.originalTranslate);
      } else {
        state.target.style.removeProperty("translate");
      }
      if (state.originalTransition) {
        state.target.style.setProperty("transition", state.originalTransition);
      } else {
        state.target.style.removeProperty("transition");
      }
    };

    const applyMagnetic = (state: MagneticState, x: number, y: number) => {
      const centerX = state.rect.left + state.rect.width / 2;
      const centerY = state.rect.top + state.rect.height / 2;
      const xRatio = state.rect.width > 0 ? (x - centerX) / state.rect.width : 0;
      const yRatio = state.rect.height > 0 ? (y - centerY) / state.rect.height : 0;
      const offsetX = clamp(xRatio * MAGNETIC_LIMIT * 2, -MAGNETIC_LIMIT, MAGNETIC_LIMIT);
      const offsetY = clamp(yRatio * MAGNETIC_LIMIT * 2, -MAGNETIC_LIMIT, MAGNETIC_LIMIT);

      state.target.style.setProperty(
        "transition",
        "translate 180ms cubic-bezier(0.22, 1, 0.36, 1)",
      );
      state.target.style.setProperty("translate", `${offsetX}px ${offsetY}px`);
    };

    const flush = () => {
      rafId = null;
      if (!enabled) return;

      if (appliedMagnetic !== activeHotspot?.magnetic) {
        restoreMagnetic(appliedMagnetic);
        appliedMagnetic = activeHotspot?.magnetic ?? null;
      }

      const shouldShow = visible && hasPointer && !keyboardHidden && !suppressed;
      const mode = shouldShow
        ? modeForHotspot(activeHotspot, pointerX)
        : "normal";
      const isDirectional = mode === "project" || mode.startsWith("scroll-");
      const ringSize =
        mode === "normal"
          ? 24
          : mode === "link"
            ? 34
            : mode === "button"
              ? 40
              : 42;

      follower.dataset.mode = mode;
      follower.style.opacity = shouldShow ? "1" : "0";
      follower.style.visibility = shouldShow ? "visible" : "hidden";
      follower.style.transform = shouldShow
        ? `translate3d(${pointerX + POINTER_OFFSET - 24}px, ${pointerY + POINTER_OFFSET - 24}px, 0)`
        : "translate3d(-100px, -100px, 0)";

      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.borderStyle = mode === "preview" ? "dashed" : "solid";
      ring.style.borderColor = isDirectional
        ? "rgb(77 182 255 / 0.82)"
        : "rgb(77 182 255 / 0.62)";
      ring.style.backgroundColor = isDirectional
        ? "rgb(77 182 255 / 0.08)"
        : "rgb(77 182 255 / 0.035)";

      dot.style.opacity = isDirectional ? "0" : "1";
      projectIcon.style.opacity = mode === "project" ? "1" : "0";
      scrollLeftIcon.style.opacity = mode === "scroll-left" ? "1" : "0";
      scrollRightIcon.style.opacity = mode === "scroll-right" ? "1" : "0";

      if (appliedMagnetic && shouldShow) {
        applyMagnetic(appliedMagnetic, pointerX, pointerY);
      }
    };

    const scheduleFlush = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(flush);
    };

    const setResolvedTarget = (resolved: ResolvedTarget) => {
      const sameTarget =
        activeHotspot?.element === resolved.element &&
        activeHotspot?.kind === resolved.kind;

      if (!sameTarget) {
        activeHotspot =
          resolved.element && resolved.kind
            ? {
                element: resolved.element,
                kind: resolved.kind,
                scrollRect:
                  resolved.kind === "scroll"
                    ? (resolved.element.parentElement ?? resolved.element).getBoundingClientRect()
                    : undefined,
                magnetic:
                  resolved.kind === "link" && resolved.magneticAnchor
                    ? getMagneticState(resolved.magneticAnchor)
                    : undefined,
              }
            : null;
      }
      suppressed = resolved.suppressed;

      if (suppressed) {
        visible = false;
        scheduleFlush();
      }
    };

    const clearFollower = (hideForKeyboard = false) => {
      visible = false;
      hasPointer = false;
      suppressed = false;
      activeHotspot = null;
      if (hideForKeyboard) keyboardHidden = true;
      scheduleFlush();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      hasPointer = true;
      keyboardHidden = false;
      setResolvedTarget(resolveTarget(event.target));
      visible = !suppressed;
      scheduleFlush();
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;
      setResolvedTarget(resolveTarget(event.target));
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;

      const from = elementFromTarget(event.target);
      const related = elementFromTarget(event.relatedTarget);
      if (from && related && from.contains(related)) return;

      if (related) {
        setResolvedTarget(resolveTarget(related));
      } else {
        clearFollower();
      }
    };

    const handlePointerLeave = () => clearFollower();
    const handleKeyDown = () => clearFollower(true);
    const handleWindowFocus = () => clearFollower(true);
    const handleVisibilityChange = () => clearFollower(true);

    const addPointerListeners = () => {
      document.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("pointerover", handlePointerOver, { passive: true });
      document.addEventListener("pointerout", handlePointerOut, { passive: true });
      document.addEventListener("pointerleave", handlePointerLeave, { passive: true });
      document.addEventListener("mouseleave", handlePointerLeave, { passive: true });
      document.addEventListener("keydown", handleKeyDown, { passive: true });
      document.addEventListener("visibilitychange", handleVisibilityChange, {
        passive: true,
      });
      window.addEventListener("blur", handleWindowFocus, { passive: true });
      window.addEventListener("focus", handleWindowFocus, { passive: true });
    };

    const removePointerListeners = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowFocus);
      window.removeEventListener("focus", handleWindowFocus);
    };

    const disable = () => {
      if (enabled) removePointerListeners();
      enabled = false;
      visible = false;
      hasPointer = false;
      suppressed = false;
      activeHotspot = null;
      restoreMagnetic(appliedMagnetic);
      appliedMagnetic = null;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      follower.style.opacity = "0";
      follower.style.visibility = "hidden";
      follower.style.transform = "translate3d(-100px, -100px, 0)";
      setDataState("normal", false);
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      keyboardHidden = false;
      setDataState("normal", true);
      addPointerListeners();
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
      restoreMagnetic(activeHotspot?.magnetic ?? null);
    };
  }, []);

  return (
    <div
      ref={followerRef}
      aria-hidden="true"
      data-cursor-follower="true"
      data-mode="normal"
      data-enabled="false"
      className="pointer-events-none fixed left-0 top-0 z-[100] size-12 select-none"
      style={{
        opacity: 0,
        transform: "translate3d(-100px, -100px, 0)",
        visibility: "hidden",
      }}
    >
      <span
        ref={ringRef}
        className="absolute left-1/2 top-1/2 block size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky/60 bg-sky/[0.035] shadow-[0_0_24px_rgb(77_182_255_/_0.12)] transition-[width,height,border-color,background-color] duration-200 ease-out-soft"
      />
      <span
        ref={dotRef}
        className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky shadow-[0_0_10px_rgb(77_182_255_/_0.5)] transition-opacity duration-150"
      />
      <span
        ref={projectIconRef}
        className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 text-sky opacity-0 transition-opacity duration-150"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none">
          <path
            d="M5 19 19 5M9 5h10v10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span
        ref={scrollLeftIconRef}
        className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 text-sky opacity-0 transition-opacity duration-150"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none">
          <path
            d="m15 6-6 6 6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span
        ref={scrollRightIconRef}
        className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 text-sky opacity-0 transition-opacity duration-150"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none">
          <path
            d="m9 6 6 6-6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
    </div>
  );
}
