import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  withWordmark = false,
  subtitle,
  name = "Seif Ayman",
  ariaLabel = `${name} — home`,
  className,
}: {
  withWordmark?: boolean;
  subtitle?: string;
  name?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative inline-flex h-9 items-center font-display text-[22px] font-extrabold uppercase leading-none tracking-[-0.06em] text-snow"
      >
        S
        <span className="mx-[3px] inline-block h-6 w-[3px] skew-x-[-18deg] rounded-full bg-sky transition-transform duration-500 ease-out-soft group-hover:scale-y-125" />
        A
      </span>
      {withWordmark ? (
        <span className="flex flex-col">
          <span className="font-display text-sm font-bold uppercase leading-none tracking-[0.02em] text-snow">
            {name}
          </span>
          {subtitle ? (
            <span className="mt-1 text-[12px] leading-none text-mist">
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
