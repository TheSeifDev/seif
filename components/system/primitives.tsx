import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  accentText,
  h2,
  label,
  mutedOnDark,
  mutedOnLight,
} from "@/lib/ui/layout";

export type Tone = "dark" | "light";

/** Accent-colored words; resolves to the right blue for the surface. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className={accentText}>{children}</span>;
}

/** "● 01 ——— ABOUT ME" */
export function SectionLabel({
  index,
  children,
  tone = "dark",
  className,
}: {
  index?: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p
      className={cn(
        label,
        "flex items-center gap-3",
        tone === "dark" ? mutedOnDark : mutedOnLight,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full bg-(--accent-text) shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent-text)_18%,transparent)]"
      />
      {index ? <span>{index}</span> : null}
      {index ? (
        <span aria-hidden="true" className="h-px w-10 bg-current opacity-40" />
      ) : null}
      <span>{children}</span>
    </p>
  );
}

export function SectionHeading({
  index,
  label: labelText,
  title,
  aside,
  tone = "dark",
  as: Heading = "h2",
  className,
  id,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  aside?: ReactNode;
  tone?: Tone;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-8 gap-y-6 lg:grid-cols-12 lg:items-end",
        className,
      )}
    >
      <div className="lg:col-span-8">
        <SectionLabel index={index} tone={tone}>
          {labelText}
        </SectionLabel>
        <Heading id={id} className={cn(h2, "mt-6 text-balance")}>
          {title}
        </Heading>
      </div>
      {aside ? (
        <div
          className={cn(
            "max-w-sm text-[15px] leading-relaxed lg:col-span-4 lg:justify-self-end lg:text-right",
            tone === "dark" ? mutedOnDark : mutedOnLight,
          )}
        >
          {aside}
        </div>
      ) : null}
    </div>
  );
}

type PillVariant =
  | "primary"
  | "accent"
  | "ink"
  | "outline-dark"
  | "outline-light";

const pillVariants: Record<PillVariant, string> = {
  primary: "bg-snow text-night hover:bg-white",
  accent: "bg-sky text-night hover:bg-[#7cc9ff]",
  ink: "bg-ink text-snow hover:bg-night-3",
  "outline-dark":
    "border border-white/15 text-snow hover:border-sky/60 hover:text-sky",
  "outline-light":
    "border border-ink/15 text-ink hover:border-sky-ink/60 hover:text-sky-ink",
};

const pillArrow: Record<PillVariant, string> = {
  primary: "bg-night text-snow",
  accent: "bg-night text-sky",
  ink: "bg-snow text-ink",
  "outline-dark": "bg-white/10 text-current",
  "outline-light": "bg-ink/[0.06] text-current",
};

type PillLinkProps = {
  href: string;
  children: ReactNode;
  variant?: PillVariant;
  size?: "md" | "sm";
  icon?: ReactNode;
  arrow?: boolean;
  external?: boolean;
  className?: string;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">;

/** Rounded pill link used for every CTA. External links open in a new tab. */
export function PillLink({
  href,
  children,
  variant = "primary",
  size = "md",
  icon,
  arrow = true,
  external,
  className,
  ...rest
}: PillLinkProps) {
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  const classes = cn(
    "group/pill inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky",
    size === "md" ? "h-12 pl-5 pr-1.5 text-sm" : "h-10 pl-4 pr-1 text-[13px]",
    !arrow && (size === "md" ? "pr-5" : "pr-4"),
    pillVariants[variant],
    className,
  );
  const content = (
    <>
      {icon ? (
        <span aria-hidden="true" className="-ml-0.5 inline-flex">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {arrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex items-center justify-center rounded-full transition-transform duration-300 ease-out-soft group-hover/pill:rotate-45",
            size === "md" ? "size-9" : "size-8",
            pillArrow[variant],
          )}
        >
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </span>
      ) : null}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("mailto:")
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
        {...rest}
      >
        {content}
        {href.startsWith("mailto:") ? null : (
          <span className="sr-only"> (opens in a new tab)</span>
        )}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

/** Technology chips. */
export function Tags({
  items,
  tone = "dark",
  className,
  max,
}: {
  items: readonly string[];
  tone?: Tone;
  className?: string;
  max?: number;
}) {
  const shown = max ? items.slice(0, max) : items;
  const rest = max ? items.length - shown.length : 0;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {shown.map((item) => (
        <li
          key={item}
          className={cn(
            "rounded-full border px-3 py-1.5 text-[12px] font-medium leading-none",
            tone === "dark"
              ? "border-white/10 bg-white/[0.03] text-snow/80"
              : "border-ink/10 bg-white text-ink/75",
          )}
        >
          {item}
        </li>
      ))}
      {rest > 0 ? (
        <li
          className={cn(
            "rounded-full px-2 py-1.5 text-[12px] font-medium leading-none",
            tone === "dark" ? "text-mist" : "text-slate-ink",
          )}
        >
          +{rest}
        </li>
      ) : null}
    </ul>
  );
}

/** Vertical Japanese caption used as a quiet signature. */
export function VerticalCaption({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      aria-hidden="true"
      className={cn(
        "font-jp text-sm leading-[1.9] tracking-[0.35em] [writing-mode:vertical-rl]",
        className,
      )}
    >
      {children}
    </p>
  );
}
