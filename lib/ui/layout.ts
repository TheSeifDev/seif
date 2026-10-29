// Shared Tailwind utility recipes; no component stylesheets or @apply rules.
// Light-shell inset + inner padding equals the normal content gutter.
export const frame =
  "mx-auto min-w-0 w-[calc(100%_-_2_*_var(--page-gutter))] max-w-[1280px]";
export const lightFrame =
  "mx-auto min-w-0 w-[calc(100%_-_2_*_var(--surface-pad))] max-w-[1280px]";
export const lightShell =
  "relative mx-auto w-[calc(100%_-_2_*_var(--shell-margin))] max-w-[calc(1280px_+_2_*_var(--surface-pad))] rounded-[22px] bg-[#f5f5f2] py-10 text-[#171b1e] sm:rounded-[28px] sm:py-14 xl:rounded-[38px] xl:py-[76px] [color-scheme:light]";
export const darkShell = "relative py-10 text-[#f4f5f2] sm:py-14 xl:py-[76px]";
export const micro =
  "font-mono text-[9px] leading-relaxed tracking-[0.14em] text-slate-400";
