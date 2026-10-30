import type { ReactNode } from "react";
import { Accent } from "@/components/system/primitives";

type CmsTitleProps = {
  text: string;
  accent: string;
};

/**
 * Render editable CMS title copy while retaining the approved accent treatment
 * for the original phrase when it is still present in the edited value.
 */
export function CmsTitle({ text, accent }: CmsTitleProps): ReactNode {
  const start = text.indexOf(accent);
  if (start < 0 || accent.length === 0) return text;

  return (
    <>
      {text.slice(0, start)}
      <Accent>{text.slice(start, start + accent.length)}</Accent>
      {text.slice(start + accent.length)}
    </>
  );
}
