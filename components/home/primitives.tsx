import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionLabel({
  number,
  children,
}: {
  number?: string;
  children: ReactNode;
}) {
  return (
    <div className="section-label">
      <span className="section-dot" />
      {number && <span className="section-number">{number}</span>}
      <span className="label-rule" />
      <span>{children}</span>
    </div>
  );
}

export function SectionHeading({
  children,
  note,
}: {
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="section-heading" data-reveal>
      <h2>{children}</h2>
      {note && <p className="section-note">{note}</p>}
    </div>
  );
}

export function ActionLink({
  href,
  children,
  secondary = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  external?: boolean;
}) {
  return (
    <a
      className={`action-link${secondary ? " action-secondary" : ""}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
