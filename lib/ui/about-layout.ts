import { lightPanel } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

/**
 * About-only paper surface: centered at a true max width with intentional
 * gutters, while preserving the shared light-panel surface and color tokens.
 */
export const aboutLightPanel = cn(
  lightPanel,
  "mx-auto w-[calc(100%-24px)] max-w-[1280px] sm:mx-auto sm:w-[calc(100%-64px)]",
);
