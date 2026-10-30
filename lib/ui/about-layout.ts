import { lightPanel } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

/**
 * About-only paper surface: a fluid midpoint between full-bleed and the
 * rejected narrow panel; content retains the shared container and tokens.
 */
export const aboutLightPanel = cn(
  lightPanel,
  "mx-auto w-[calc(100%-24px)] max-w-[1600px] sm:mx-auto sm:w-[min(calc(100%_-_40px),calc(50%_+_640px))]",
);
