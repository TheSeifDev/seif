import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "light" | "dark";

export function SectionLabel({
  number,
  children,
  tone = "dark",
}: {
  number?: string;
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <div
      className={`section-label mb-5 flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] sm:mb-6 sm:gap-3 ${tone === "light" ? "text-slate-500" : "text-slate-400"}`}
    >
      <span className="section-dot size-[7px] shrink-0 rounded-full bg-identity shadow-sm shadow-identity/40" />
      {number && <span className="section-number mr-1">{number}</span>}
      <span className="h-px w-7 bg-current opacity-25" />
      <span>{children}</span>
    </div>
  );
}

export function SectionHeading({
  children,
  note,
  tone = "dark",
}: {
  children: ReactNode;
  note?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div
      className="section-heading mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8 lg:mb-10"
      data-reveal
    >
      <h2 className="m-0 text-[32px] leading-[1.08] font-semibold tracking-[-0.045em] lg:text-[42px]">
        {children}
      </h2>
      {note && (
        <p
          className={`section-note m-0 max-w-[270px] text-xs leading-relaxed ${tone === "light" ? "text-slate-500" : "text-slate-400"}`}
        >
          {note}
        </p>
      )}
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
      className={`action-link inline-flex items-center gap-5 rounded-full px-[22px] py-3.5 text-xs font-semibold transition-[box-shadow,transform] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-identity motion-reduce:transform-none motion-reduce:transition-none ${secondary ? "border border-white/25 bg-transparent text-slate-100" : "bg-[#f5f5f2] text-[#111b21] shadow-lg shadow-identity/15 hover:shadow-xl hover:shadow-identity/20"}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <ArrowUpRight
        size={17}
        className="text-identity-ink"
        aria-hidden="true"
      />
    </a>
  );
}
