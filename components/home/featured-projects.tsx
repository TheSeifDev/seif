import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteContent, SiteProject } from "@/lib/cms/schema";
import { getCopy } from "@/lib/cms/copy";
import { isUnoptimizedCmsImage } from "@/components/site/cms-image";
import { container, label } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import { PillLink, SectionHeading } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import {
  EditorialVisual,
  ProjectActions,
} from "@/components/system/project-media";
import { FeaturedTechFilter } from "./featured-filter";

/** Panel width on desktop; slides are 80% of it so the next project peeks. */
const PANEL_WIDTH = "lg:w-[min(90vw,1680px)]";
const SLIDE_WIDTH = "group-data-[enhanced=true]/featured:w-[min(72vw,1344px)]";
export function FeaturedProjects({ content }: { content: SiteContent }) {
  const { projects, copy } = content;
  const featuredProjects = projects.filter((project) => project.featured);
  const featuredTechnologies = Array.from(
    new Set(featuredProjects.flatMap((project) => project.stack)),
  );
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const total = String(featuredProjects.length).padStart(2, "0");

  return (
    <Scene
      name="featured"
      as="section"
      id="work"
      aria-labelledby="work-title"
      className="group/featured relative bg-night"
    >
      <div
        data-featured-pin
        className={cn(
          "py-3 sm:py-4",
          "group-data-[enhanced=true]/featured:flex group-data-[enhanced=true]/featured:h-[100svh]",
        )}
      >
        <div
          data-featured-panel
          className={cn(
            "relative mx-2 overflow-hidden rounded-[28px] bg-white py-20 text-ink [--accent-text:var(--color-sky-ink)] [color-scheme:light] sm:mx-3 lg:mx-auto lg:rounded-[40px] lg:py-28",
            PANEL_WIDTH,
            "group-data-[enhanced=true]/featured:flex group-data-[enhanced=true]/featured:h-full group-data-[enhanced=true]/featured:flex-col group-data-[enhanced=true]/featured:justify-center group-data-[enhanced=true]/featured:pb-5 group-data-[enhanced=true]/featured:pt-[4.75rem]",
          )}
        >
          <div className={cn(container, "max-w-none")}>
            <SectionHeading
              index="04"
              label={c("home.featured.sectionLabel", "Featured projects")}
              id="work-title"
              tone="light"
              title={
                <>
                  <CmsTitle
                    text={c("home.featured.title", "Some things I've built")}
                    accent="I've built"
                  />
                </>
              }
              aside={
                <div className="flex flex-col items-start gap-5 lg:items-end">
                  <p>
                    {c(
                      "home.featured.aside",
                      "Real products, end to end — interface, API, data and deployment.",
                    )}
                  </p>
                  <PillLink href="/projects" variant="outline-light" size="sm">
                    {c("home.featured.viewAllCta", "View all projects")}
                  </PillLink>
                </div>
              }
            />

            <FeaturedTechFilter
              technologies={featuredTechnologies}
              total={featuredProjects.length}
            />

            <div
              className={cn("mt-8", "group-data-[enhanced=true]/featured:mt-8")}
            >
              <ol
                data-featured-track
                data-cursor="scroll"
                aria-label={c(
                  "home.featured.sectionLabel",
                  "Featured projects",
                )}
                className={cn(
                  "flex flex-col gap-6",
                  "group-data-[enhanced=true]/featured:w-max group-data-[enhanced=true]/featured:flex-row group-data-[enhanced=true]/featured:gap-6",
                )}
              >
                {featuredProjects.map((project, index) => (
                  <li
                    key={project.slug}
                    data-slide
                    data-project-slug={project.slug}
                    data-tech-stack={project.stack.join("|")}
                    className={cn(
                      "w-full shrink-0",
                      "group-data-[enhanced=true]/featured:h-[min(520px,calc(100svh-25rem))]",
                      SLIDE_WIDTH,
                      "short:group-data-[enhanced=true]/featured:h-[min(410px,calc(100svh-20rem))]",
                    )}
                  >
                    <FeaturedCard project={project} index={index} copy={copy} />
                  </li>
                ))}
              </ol>
            </div>

            <div
              aria-hidden="true"
              className={cn(
                "mt-8 hidden items-center gap-6",
                "group-data-[enhanced=true]/featured:mt-6 group-data-[enhanced=true]/featured:flex",
              )}
            >
              <p className="font-mono text-[12px] tracking-[0.18em] text-slate-ink">
                <span data-featured-counter className="text-ink">
                  01
                </span>{" "}
                / <span data-featured-total>{total}</span>
              </p>
              <span className="relative h-px flex-1 bg-ink/10">
                <span
                  data-featured-fill
                  className="absolute inset-0 origin-left scale-x-0 bg-ink"
                />
              </span>
              <p className={cn(label, "text-slate-ink")}>
                {c("home.featured.scrollHint", "Scroll to explore")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

type FeaturedProject = SiteProject;

function FeaturedCard({
  project,
  index,
  copy,
}: {
  project: FeaturedProject;
  index: number;
  copy: Record<string, string>;
}) {
  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);
  const reverse = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      data-spotlight
      data-cursor="preview"
      aria-labelledby={`featured-${project.slug}`}
      className="group/card relative isolate h-full rounded-[28px] bg-[#1c2431] p-px text-snow shadow-[0_40px_80px_-44px_rgb(10_13_18/0.7)] lg:rounded-[32px]"
    >
      {/* Border light, visible only through the 1px gap around the surface. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(320px_circle_at_var(--spot-x,50%)_var(--spot-y,0px),rgb(125_200_255/0.28),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      />

      <div className="relative grid h-full overflow-hidden rounded-[27px] bg-night-2 lg:grid-cols-12 lg:rounded-[31px]">
        {/* Surface sheen that follows the pointer. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(520px_circle_at_var(--spot-x,50%)_var(--spot-y,0px),rgb(77_182_255/0.03),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        />

        <div
          className={cn(
            "relative p-2.5 sm:p-3 lg:col-span-6 lg:p-3.5 xl:col-span-7",
            reverse && "lg:col-start-7 lg:row-start-1 xl:col-start-6",
          )}
        >
          <Link
            href={`/projects/${project.slug}`}
            data-cursor="project"
            aria-label={c(
              "home.featured.readCaseStudy",
              "Read the {title} case study",
            ).replace("{title}", project.title)}
            className="group/media relative block aspect-[16/10] overflow-hidden rounded-[20px] bg-night ring-1 ring-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky lg:aspect-auto lg:h-full lg:min-h-[340px] lg:rounded-[24px] group-data-[enhanced=true]/featured:lg:min-h-0"
          >
            {project.image ? (
              <Image
                src={project.image.src}
                unoptimized={isUnoptimizedCmsImage(project.image.src)}
                alt={project.image.alt}
                fill
                loading="lazy"
                quality={85}
                sizes="(min-width: 1280px) 760px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover object-top transition-transform duration-[900ms] ease-out-soft group-hover/card:scale-[1.03]"
              />
            ) : (
              <EditorialVisual
                project={project}
                className="absolute inset-0 aspect-auto h-full"
              />
            )}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night-2/70 to-transparent"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-snow text-night shadow-lg transition-transform duration-500 ease-out-soft group-hover/media:rotate-45"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </div>

        <div
          className={cn(
            "relative flex min-w-0 flex-col px-5 pb-6 pt-4 sm:px-7 sm:pb-8 lg:col-span-6 lg:px-9 lg:py-9 xl:col-span-5 xl:px-11 short:lg:py-6",
            reverse && "lg:col-start-1 lg:row-start-1",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <p
              className={cn(label, "flex min-w-0 items-center gap-3 text-mist")}
            >
              <span className="text-sky">{number}</span>
              <span aria-hidden="true" className="h-px w-8 bg-white/15" />
              <span>{project.category}</span>
            </p>
            <span
              aria-hidden="true"
              className="shrink-0 font-jp text-sm tracking-[0.2em] text-snow/60"
            >
              {project.kanji}
            </span>
          </div>

          <div className="lg:my-auto lg:py-6 short:lg:py-4">
            <h3
              id={`featured-${project.slug}`}
              className="mt-5 font-display text-[clamp(1.9rem,3vw,2.85rem)] font-bold leading-[1] tracking-[-0.035em] text-snow lg:mt-0"
            >
              <Link
                href={`/projects/${project.slug}`}
                data-cursor="project"
                className="transition-colors duration-300 hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
              >
                {project.title}
              </Link>
            </h3>

            <p
              data-featured-summary
              className="mt-4 line-clamp-4 text-[15px] leading-relaxed text-mist short:lg:line-clamp-2"
            >
              {project.summary}
            </p>

            <p className="mt-4 line-clamp-2 text-[12px] leading-relaxed text-mist short:lg:mt-3 short:lg:line-clamp-1">
              {project.stack.join("  ·  ")}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-white/[0.08] pt-5 lg:mt-0">
            <ProjectActions project={project} />
            <Link
              href={`/projects/${project.slug}`}
              data-cursor="project"
              aria-label={c(
                "home.featured.readCaseStudy",
                "Read the {title} case study",
              ).replace("{title}", project.title)}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-snow ring-1 ring-white/15 transition-[background-color,color,rotate] duration-300 hover:rotate-45 hover:bg-snow hover:text-night focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
            >
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
