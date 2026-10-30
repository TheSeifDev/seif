import { SectionLabel, VerticalCaption } from "@/components/system/primitives";
import { projectDomains, projects } from "@/lib/content/projects";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * /projects opening: an oversized two-line wordmark over a hairline grid,
 * a ledger of live counts and a domain ticker. Motion (character rise, line
 * drift, count-up) lives in `projects-scenes.ts`; this markup is complete and
 * readable without it.
 */
export function ProjectsHero() {
  const domains = projectDomains.filter((domain) => domain !== "All");
  const stats = [
    { label: "Projects", value: projects.length },
    { label: "Case files", value: projects.filter((project) => project.featured).length },
    { label: "Domains", value: domains.length },
  ];
  // Each ticker copy repeats the list so one copy is always wider than the viewport.
  const tickerCopy = [...domains, ...domains];

  return (
    <section
      data-projects-hero
      aria-labelledby="projects-title"
      className="relative isolate overflow-hidden bg-night pt-32 text-snow sm:pt-36 lg:pt-40"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_0%,rgb(77_182_255/0.16),transparent_70%)]" />
        <div className={cn(container, "h-full")}>
          <div className="grid h-full grid-cols-4 border-x border-white/[0.04] lg:grid-cols-12">
            {Array.from({ length: 12 }, (_, column) => (
              <span
                key={column}
                className={cn(
                  "border-white/[0.04]",
                  column > 0 && "border-l",
                  column >= 4 && "hidden lg:block",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={cn(container, "relative")}>
        <div data-hero-kanji className="absolute right-5 top-1 hidden sm:right-8 lg:right-12 lg:block">
          <VerticalCaption className="text-snow/35">作品集</VerticalCaption>
        </div>

        <div data-hero-fade>
          <SectionLabel index="01">Projects · Archive</SectionLabel>
        </div>

        <h1
          id="projects-title"
          className="mt-10 font-display text-[clamp(3.5rem,14vw,13rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.055em] lg:mt-12"
        >
          <span data-hero-line className="block">
            <span data-hero-split className="inline-block">
              Selected
            </span>
          </span>{" "}
          <span data-hero-line className="flex items-start justify-end gap-[0.08em]">
            <span data-hero-split className="inline-block text-sky">
              Work
            </span>{" "}
            <sup
              data-hero-fade
              className="mt-[0.22em] font-mono text-[clamp(0.85rem,1.5vw,1.4rem)] font-medium leading-none tracking-[0.05em] text-mist"
            >
              ({pad(projects.length)})
            </sup>
          </span>
        </h1>

        <div className="mt-12 grid gap-10 border-t border-white/10 pt-8 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <p
            data-hero-fade
            className="max-w-md text-[17px] leading-relaxed text-mist lg:col-span-5"
          >
            Products across education, healthcare, AI, analytics and the web — each one
            built end to end, from schema to screen.
          </p>
          <dl className="grid grid-cols-3 gap-4 lg:col-span-6 lg:col-start-7">
            {stats.map((stat) => (
              <div key={stat.label} data-hero-fade className="border-l border-white/10 pl-4">
                <dt className={cn(label, "text-mist")}>{stat.label}</dt>
                <dd className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
                  <span data-count={stat.value}>{pad(stat.value)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div aria-hidden="true" className="mt-14 overflow-hidden border-y border-white/10 py-4 lg:mt-20">
        <div className="flex w-max animate-marquee-left [--marquee-duration:42s] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {tickerCopy.map((domain, index) => (
                <li
                  key={`${domain}-${index}`}
                  className="flex items-center gap-8 pr-8 font-display text-2xl font-bold uppercase tracking-[-0.02em] text-snow/70 lg:text-3xl"
                >
                  <span>{domain}</span>
                  <span className="font-jp text-base text-sky">作</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
