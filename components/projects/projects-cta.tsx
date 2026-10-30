import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionLabel } from "@/components/system/primitives";
import { container } from "@/lib/ui/layout";

/** 04 Closing: one large line and a magnetic arrow disc to /contact. */
export function ProjectsCta() {
  return (
    <section
      aria-labelledby="projects-cta-title"
      className="relative isolate overflow-hidden bg-night py-28 text-snow lg:py-40"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_85%_100%,rgb(77_182_255/0.14),transparent_70%)]"
      />
      <div className={container}>
        <SectionLabel index="04">Next</SectionLabel>
        <Link
          href="/contact"
          data-magnetic="true"
          className="group/cta mt-10 grid items-end gap-10 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-sky lg:grid-cols-12"
        >
          <h2
            id="projects-cta-title"
            data-cta-title
            className="font-display text-[clamp(3rem,6.4vw,7rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.05em] lg:col-span-9"
          >
            Have a product <span className="text-sky">worth building?</span>
          </h2>
          <span className="flex lg:col-span-3 lg:justify-end">
            <span
              data-magnetic-target
              className="grid size-24 shrink-0 place-items-center rounded-full bg-sky text-night transition-[scale] duration-500 ease-out-soft group-hover/cta:scale-105 sm:size-32 lg:size-40"
            >
              <ArrowUpRight
                aria-hidden="true"
                className="size-8 transition-[rotate] duration-500 ease-out-soft group-hover/cta:rotate-45 lg:size-12"
                strokeWidth={1.75}
              />
            </span>
          </span>
        </Link>
        <p className="mt-12 max-w-md border-t border-white/10 pt-8 text-[15px] leading-relaxed text-mist">
          Tell me what you are building and where it is stuck — the contact page has the
          form and direct details.
        </p>
      </div>
    </section>
  );
}
