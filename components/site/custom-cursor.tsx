"use client";

import { useEffect, useRef } from "react";

const CURSOR_MEDIA_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const MAGNETIC_LIMIT = 4.5;
const HIDDEN_TRANSFORM = "translate3d(-2000px, -2000px, 0)";

type CursorMode =
  | "normal"
  | "link"
  | "button"
  | "project"
  | "preview"
  | "scroll-left"
  | "scroll-right";

type HotspotKind = "link" | "button" | "project" | "preview" | "scroll";

type Tone = "dark" | "light";

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

/**
 * How the spotlight reads each role: the wide ambient light changes size,
 * the small core only appears on things that respond to a click.
 */
const SPOTLIGHT: Record<CursorMode, { ambient: string; core: string }> = {
  normal: { ambient: "1", core: "0" },
  link: { ambient: "0.58", core: "1" },
  button: { ambient: "0.66", core: "1" },
  project: { ambient: "1.16", core: "1" },
  preview: { ambient: "0.86", core: "0" },
  "scroll-left": { ambient: "1.5 1.05", core: "0" },
  "scroll-right": { ambient: "1.5 1.05", core: "0" },
};

const AMBIENT_LIGHT: Record<Tone, string> = {
  dark: "radial-gradient(closest-side, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.05) 40%, rgb(255 255 255 / 0) 100%)",
  light:
    "radial-gradient(closest-side, rgb(100 116 139 / 0.12), rgb(100 116 139 / 0.05) 42%, rgb(100 116 139 / 0) 100%)",
};

const CORE_LIGHT: Record<Tone, string> = {
  dark: "radial-gradient(closest-side, rgb(255 255 255 / 0.11), rgb(255 255 255 / 0) 100%)",
  light:
    "radial-gradient(closest-side, rgb(71 85 105 / 0.1), rgb(71 85 105 / 0) 100%)",
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
  if (button) return { element: button, kind: "button", suppressed: false };

  const project = element.closest('[data-cursor="project"]');
  if (project) return { element: project, kind: "project", suppressed: false };

  const scrollRegion = element.closest('[data-cursor="scroll"]');
  const featuredRoot = scrollRegion?.closest<HTMLElement>('[data-scene="featured"]');
  if (scrollRegion && (!featuredRoot || featuredRoot.dataset.enhanced === "true")) {
    return { element: scrollRegion, kind: "scroll", suppressed: false };
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
  return pointerX < rect.left + rect.width / 2 ? "scroll-left" : "scroll-right";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Reads an opaque background luminance; translucent layers are skipped. */
function toneFromBackground(value: string): Tone | null {
  const rgb = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const alpha = parts.length > 3 ? parts[3] : 1;
    if (!(alpha >= 0.5)) return null;
    const luminance = (0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2]) / 255;
    return luminance > 0.6 ? "light" : "dark";
  }

  const perceptual = value.match(
    /^ok(?:lch|lab)\(\s*([\d.]+)(%?)[^/)]*(?:\/\s*([\d.]+)(%?))?\s*\)$/,
  );
  if (perceptual) {
    const lightness = Number(perceptual[1]) / (perceptual[2] ? 100 : 1);
    const alpha = perceptual[3]
      ? Number(perceptual[3]) / (perceptual[4] ? 100 : 1)
      : 1;
    if (!(alpha >= 0.5)) return null;
    return lightness > 0.75 ? "light" : "dark";
  }

  return null;
}

const toneCache = new WeakMap<Element, Tone>();

function toneAt(element: Element | null): Tone {
  if (!element) return "dark";
  const cached = toneCache.get(element);
  if (cached) return cached;

  let tone: Tone = "dark";
  let node: Element | null = element;
  while (node && node !== document.documentElement) {
    const explicit = node.getAttribute("data-cursor-tone");
    if (explicit === "light" || explicit === "dark") {
      tone = explicit;
      break;
    }
    const resolved = toneFromBackground(getComputedStyle(node).backgroundColor);
    if (resolved) {
      tone = resolved;
      break;
    }
    node = node.parentElement;
  }

  toneCache.set(element, tone);
  return tone;
}

/**
 * Soft spotlight that follows supported desktop pointers. The native cursor
 * stays visible; the light only adds context. Cards marked `data-spotlight`
 * receive local `--spot-x/--spot-y` coordinates for their own sheen.
 */
export function CustomCursor() {
  const followerRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLSpanElement>(null);
  const coreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const follower = followerRef.current;
    const ambient = ambientRef.current;
    const core = coreRef.current;
    if (!follower || !ambient || !core) return;

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
    let tone: Tone = "dark";
    let appliedTone: Tone | null = null;
    let spotCard: HTMLElement | null = null;
    let spotRect: DOMRect | null = null;

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

    const releaseSpotCard = () => {
      if (!spotCard) return;
      spotCard.style.removeProperty("--spot-x");
      spotCard.style.removeProperty("--spot-y");
      spotCard = null;
      spotRect = null;
    };

    const setSpotCard = (element: Element | null) => {
      const next = element?.closest<HTMLElement>("[data-spotlight]") ?? null;
      if (next === spotCard) return;
      releaseSpotCard();
      spotCard = next;
    };

    const flush = () => {
      rafId = null;
      if (!enabled) return;

      if (appliedMagnetic !== activeHotspot?.magnetic) {
        restoreMagnetic(appliedMagnetic);
        appliedMagnetic = activeHotspot?.magnetic ?? null;
      }

      const shouldShow = visible && hasPointer && !keyboardHidden && !suppressed;
      const mode = shouldShow ? modeForHotspot(activeHotspot, pointerX) : "normal";
      const look = SPOTLIGHT[mode];

      follower.dataset.mode = mode;
      follower.dataset.tone = tone;
      follower.style.opacity = shouldShow ? "1" : "0";
      follower.style.visibility = shouldShow ? "visible" : "hidden";
      follower.style.transform = shouldShow
        ? `translate3d(${pointerX}px, ${pointerY}px, 0)`
        : HIDDEN_TRANSFORM;

      if (appliedTone !== tone) {
        ambient.style.backgroundImage = AMBIENT_LIGHT[tone];
        core.style.backgroundImage = CORE_LIGHT[tone];
        appliedTone = tone;
      }
      ambient.style.scale = look.ambient;
      core.style.opacity = look.core;

      if (spotCard && shouldShow) {
        spotRect ??= spotCard.getBoundingClientRect();
        spotCard.style.setProperty("--spot-x", `${(pointerX - spotRect.left).toFixed(1)}px`);
        spotCard.style.setProperty("--spot-y", `${(pointerY - spotRect.top).toFixed(1)}px`);
      }

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

    const trackElement = (element: Element | null) => {
      setResolvedTarget(resolveTarget(element));
      tone = toneAt(element);
      setSpotCard(element);
    };

    const clearFollower = (hideForKeyboard = false) => {
      visible = false;
      hasPointer = false;
      suppressed = false;
      activeHotspot = null;
      releaseSpotCard();
      if (hideForKeyboard) keyboardHidden = true;
      scheduleFlush();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      hasPointer = true;
      keyboardHidden = false;
      trackElement(elementFromTarget(event.target));
      visible = !suppressed;
      scheduleFlush();
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;
      trackElement(elementFromTarget(event.target));
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;

      const from = elementFromTarget(event.target);
      const related = elementFromTarget(event.relatedTarget);
      if (from && related && from.contains(related)) return;

      if (related) trackElement(related);
      else clearFollower();
    };

    // Cached card and track rectangles move with the page; refresh them lazily.
    const handleScroll = () => {
      spotRect = null;
      if (activeHotspot?.kind === "scroll") {
        activeHotspot.scrollRect = (
          activeHotspot.element.parentElement ?? activeHotspot.element
        ).getBoundingClientRect();
      }
      if (activeHotspot?.magnetic) {
        activeHotspot.magnetic.rect =
          activeHotspot.magnetic.target.getBoundingClientRect();
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
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
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
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
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
      releaseSpotCard();
      restoreMagnetic(appliedMagnetic);
      appliedMagnetic = null;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      follower.style.opacity = "0";
      follower.style.visibility = "hidden";
      follower.style.transform = HIDDEN_TRANSFORM;
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
    };
  }, []);

  return (
    <div
      ref={followerRef}
      aria-hidden="true"
      data-cursor-follower="true"
      data-mode="normal"
      data-enabled="false"
      data-tone="dark"
      className="pointer-events-none fixed left-0 top-0 z-[100] size-0 select-none"
      style={{
        opacity: 0,
        transform: HIDDEN_TRANSFORM,
        visibility: "hidden",
      }}
    >
      <span
        ref={ambientRef}
        className="absolute left-0 top-0 block size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[scale] duration-500 ease-out-soft will-change-transform"
        style={{ backgroundImage: AMBIENT_LIGHT.dark }}
      />
      <span
        ref={coreRef}
        className="absolute left-0 top-0 block size-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 ease-out-soft"
        style={{ backgroundImage: CORE_LIGHT.dark }}
      />
    </div>
  );
}
