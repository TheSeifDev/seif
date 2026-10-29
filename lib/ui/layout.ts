/**
 * Shared Tailwind recipes. Every page composes these so spacing, radius,
 * surfaces and type stay consistent across routes.
 */

/** Page content width. */
export const container = "mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12";

/** Vertical rhythm for full sections. */
export const sectionY = "py-24 lg:py-36";

/** Rounded paper sheet that sits on the night background. */
export const lightPanel =
  "relative mx-2 rounded-[28px] bg-paper text-ink [--accent-text:var(--color-sky-ink)] [color-scheme:light] sm:mx-3 lg:rounded-[40px]";

/** Dark stage section. */
export const darkStage = "relative bg-night text-snow";

/** Raised dark surface (cards inside dark stages or light panels). */
export const darkCard =
  "rounded-3xl border border-white/[0.08] bg-night-2 text-snow";

/** Raised light surface (cards inside light panels). */
export const lightCard =
  "rounded-3xl border border-ink/[0.07] bg-white text-ink shadow-[0_1px_0_rgba(10,13,18,0.04),0_24px_48px_-32px_rgba(10,13,18,0.25)]";

/** Small mono label. */
export const label =
  "font-mono text-[11px] font-medium uppercase leading-none tracking-[0.2em]";

/** Display type scale. */
export const displayXL =
  "font-display text-[clamp(4.25rem,11vw,10rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.045em]";
export const display =
  "font-display text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]";
export const h2 =
  "font-display text-[clamp(2.25rem,4.2vw,3.75rem)] font-bold leading-[1] tracking-[-0.035em]";
export const h3 =
  "font-display text-[clamp(1.5rem,2.2vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em]";
export const bodyLg = "text-[1.0625rem] leading-[1.7] sm:text-lg";

/** Muted copy per surface. */
export const mutedOnDark = "text-mist";
export const mutedOnLight = "text-slate-ink";

/** Accent text for the current surface (set by lightPanel). */
export const accentText = "text-(--accent-text)";
