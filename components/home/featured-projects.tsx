import { featuredProjects } from "@/lib/content/projects";
import { container, label, lightPanel } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { Scene } from "@/components/motion/scene";
import {
  Accent,
  PillLink,
  SectionHeading,
  Tags,
} from "@/components/system/primitives";
import {
  BrowserFrame,
  EditorialVisual,
  ProjectActions,
} from "@/components/system/project-media";

export function FeaturedProjects() {
  const total = String(featuredProjects.length).padStart(2, "0");

  return (
    <Scene
      name="featured"
      as="section"
      id="work"
      aria-labelledby="work-title"
      className={cn(lightPanel, "group/featured")}
    >
      <div
        data-featured-pin
        className={cn(
          "overflow-hidden py-24 lg:py-32",
          `group-data-[enhanced=true]/featured:flex group-data-[enhanced=true]/featured:h-[100svh] group-data-[enhanced=true]/featured:flex-col group-data-[enhanced=true]/featured:justify-center group-data-[enhanced=true]/featured:pb-6 group-data-[enhanced=true]/featured:pt-[5.5rem]`,
        )}
      >
        <div className={container}>
          <SectionHeading
            tone="light"
            index="04"
            label="Featured projects"
            id="work-title"
            title={
              <>
                Some things <Accent>I&apos;ve built</Accent>
              </>
            }
            aside={
              <div className="flex flex-col items-start gap-5 lg:items-end">
                <p>
                  Real products, end to end — interface, API, data and
                  deployment.
                </p>
                <PillLink href="/projects" variant="outline-light" size="sm">
                  View all projects
                </PillLink>
              </div>
            }
          />

          <div className={cn("mt-12", `group-data-[enhanced=true]/featured:mt-10`)}>
            <ol
              data-featured-track
              className={cn(
                "flex flex-col gap-6",
                `group-data-[enhanced=true]/featured:w-max group-data-[enhanced=true]/featured:flex-row group-data-[enhanced=true]/featured:gap-8`,
              )}
            >
              {featuredProjects.map((project, index) => (
                <li
                  key={project.slug}
                  data-slide
                  className={cn(
                    "origin-center transition-transform duration-700 ease-out-soft",
                    `group-data-[enhanced=true]/featured:w-[min(1100px,calc(100vw-13rem))] group-data-[enhanced=true]/featured:shrink-0 group-data-[enhanced=true]/featured:scale-[0.94] group-data-[enhanced=true]/featured:data-current:scale-100`,
                  )}
                >
                  <article
                    aria-labelledby={`featured-${project.slug}`}
                    className="grid gap-4 rounded-[32px] bg-night-2 p-3 text-snow sm:p-4 lg:grid-cols-12 lg:gap-0"
                  >
                    <div className="lg:col-span-7">
                      {project.image ? (
                        <BrowserFrame
                          src={project.image.src}
                          alt={project.image.alt}
                          url={project.live?.url}
                          sizes="(min-width: 1024px) 640px, 100vw"
                        />
                      ) : (
                        <EditorialVisual project={project} className="rounded-2xl" />
                      )}
                    </div>
                    <div className="flex flex-col p-3 sm:p-5 lg:col-span-5 lg:py-6 lg:pl-10 lg:pr-6">
                      <div className="flex items-center justify-between gap-4">
                        <p className={cn(label, "flex items-center gap-3")}>
                          <span className="text-mist">
                            {String(index + 1).padStart(2, "0")} / {total}
                          </span>
                          <span className="text-sky">{project.category}</span>
                        </p>
                        <span
                          lang="ja"
                          aria-hidden="true"
                          className="font-jp text-sm tracking-[0.2em] text-snow/40"
                        >
                          {project.kanji}
                        </span>
                      </div>
                      <h3
                        id={`featured-${project.slug}`}
                        className="mt-5 font-display text-[clamp(1.75rem,2.6vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.03em]"
                      >
                        {project.title}
                      </h3>
                      <p className="mt-4 text-[15px] leading-relaxed text-mist">
                        {project.summary}
                      </p>
                      <ul className="mt-5 space-y-2 text-[14px] leading-relaxed text-snow/80">
                        {project.highlights.slice(0, 2).map((highlight) => (
                          <li key={highlight} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-[0.7em] h-px w-3 shrink-0 bg-sky"
                            />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <Tags items={project.stack} max={5} className="mt-6" />
                      <div className="mt-8 flex flex-wrap items-center gap-2.5 lg:mt-auto lg:pt-8">
                        <ProjectActions project={project} />
                        <PillLink
                          href={`/projects/${project.slug}`}
                          size="sm"
                          aria-label={`Read the ${project.title} case study`}
                        >
                          Case study
                        </PillLink>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>

          <div
            aria-hidden="true"
            className={cn("mt-8 hidden items-center gap-6", `group-data-[enhanced=true]/featured:flex`)}
          >
            <p className="font-mono text-[12px] tracking-[0.18em] text-slate-ink">
              <span data-featured-counter className="text-ink">
                01
              </span>{" "}
              / {total}
            </p>
            <span className="relative h-px flex-1 bg-ink/10">
              <span
                data-featured-fill
                className="absolute inset-0 origin-left scale-x-0 bg-sky-ink"
              />
            </span>
            <p className={cn(label, "text-slate-ink")}>Scroll</p>
          </div>
        </div>
      </div>
    </Scene>
  );
}
