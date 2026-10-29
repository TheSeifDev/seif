// One shared geometry system; all presentation remains Tailwind utilities.
export const frame =
  "mx-auto min-w-0 w-[calc(100%_-_2_*_var(--page-gutter))] max-w-[1280px]";
export const lightFrame =
  "mx-auto min-w-0 w-[calc(100%_-_2_*_var(--surface-pad))] max-w-[1280px]";
export const lightShell =
  "relative mx-auto w-[calc(100%_-_2_*_var(--shell-margin))] max-w-[calc(1280px_+_2_*_var(--surface-pad))] rounded-[var(--section-radius)] bg-[#f5f5f2] py-12 text-[#171b1e] sm:py-16 xl:py-20 [color-scheme:light]";
export const darkShell = "relative py-14 text-[#f4f5f2] sm:py-20 xl:py-24";
export const micro =
  "font-mono text-[10px] leading-relaxed tracking-[0.13em] text-slate-400";
