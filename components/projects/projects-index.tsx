"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  projectDomains,
  type Project,
} from "@/lib/content/projects";
import {
  BrowserFrame,
  EditorialVisual,
  ProjectActions,
} from "@/components/system/project-media";
import {
  Accent,
  PillLink,
  SectionLabel,
  Tags,
} from "@/components/system/primitives";
import {
  container,
  darkCard,
  display,
  h3,
  label,
  lightPanel,
  mutedOnDark,
  mutedOnLight,
  sectionY,
} from "@/lib/ui/layout";

type ProjectsIndexProps = {
  projects: readonly Project[];
};

function ProjectVisual({
  project,
  tone,
  priority = false,
}: {
  project: Project;
  tone: "dark" | "light";
  priority?: boolean;
}) {
  if (!project.image) {
    return <EditorialVisual project={project} />;
  }

  return (
    <BrowserFrame
      src={project.image.src}
      alt={project.image.alt}
      url={project.live?.url}
      sizes="(min-width: 1024px) 58vw, 100vw"
      priority={priority}
      tone={tone}
    />
  );
}

function ProjectCount({ count }: { count: number }) {
  return (
    <p className={cn(label, mutedOnDark)} aria-live="polite">
      {count} {count === 1 ? "project" : "projects"} shown
    </p>
  );
}

function FeaturedProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reverse = index % 2 === 1;

  return (
    <article className="grid gap-8 border-t border-ink/10 pt-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-14">
      <Link
        href={`/projects/${project.slug}`}
        className={cn(
          "group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-ink lg:col-span-7",
          reverse && "lg:col-start-6 lg:row-start-1",
        )}
        aria-label={`Read the ${project.title} case study`}
      >
        <ProjectVisual project={project} tone="light" priority={index === 0} />
        <p className={cn("mt-3 text-xs", mutedOnLight)}>
          {project.image?.caption ?? project.availability}
        </p>
      </Link>

      <div
        className={cn(
          "lg:col-span-5",
          reverse && "lg:col-start-1 lg:row-start-1",
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn(label, "text-sky-ink")}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-10 bg-sky-ink/40" aria-hidden="true" />
          <span className={cn(label, mutedOnLight)}>{project.category}</span>
        </div>
        <h3 className={cn(h3, "mt-5 max-w-md")}>
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors duration-300 hover:text-sky-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-ink"
          >
            {project.title}
          </Link>
        </h3>
        <p className={cn("mt-5 max-w-md text-[15px] leading-relaxed", mutedOnLight)}>
          {project.summary}
        </p>
        <Tags items={project.stack} tone="light" className="mt-6" max={5} />
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <ProjectActions project={project} tone="light" />
          <PillLink
            href={`/projects/${project.slug}`}
            variant="outline-light"
            size="sm"
          >
            Read case study
          </PillLink>
        </div>
        <p className="mt-7 flex items-center gap-3 text-sm text-slate-ink">
          <span aria-hidden="true" className="font-jp text-xl text-sky-ink">
            {project.kanji}
          </span>
          <span>{project.kanjiMeaning}</span>
        </p>
      </div>
    </article>
  );
}

function MoreProjectCard({ project }: { project: Project }) {
  return (
    <article className={cn(darkCard, "group flex h-full flex-col overflow-hidden")}>
      <Link
        href={`/projects/${project.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sky"
        aria-label={`Read the ${project.title} case study`}
      >
        <ProjectVisual project={project} tone="dark" />
      </Link>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <span className={cn(label, "text-sky")}>{project.category}</span>
          <span aria-hidden="true" className="font-jp text-xl text-snow/30">
            {project.kanji}
          </span>
        </div>
        <h3 className={cn(h3, "mt-5")}>
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors duration-300 hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
          >
            {project.title}
          </Link>
        </h3>
        <p className={cn("mt-4 text-[15px] leading-relaxed", mutedOnDark)}>
          {project.summary}
        </p>
        <Tags items={project.stack} className="mt-6" tone="dark" max={4} />
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
          <ProjectActions project={project} tone="dark" />
          <PillLink
            href={`/projects/${project.slug}`}
            variant="outline-dark"
            size="sm"
          >
            Read case study
          </PillLink>
        </div>
      </div>
    </article>
  );
}

export function ProjectsIndex({ projects }: ProjectsIndexProps) {
  const [activeDomain, setActiveDomain] = useState<(typeof projectDomains)[number]>(
    "All",
  );
  const filteredProjects = useMemo(
    () =>
      activeDomain === "All"
        ? projects
        : projects.filter((project) => project.domains.includes(activeDomain)),
    [activeDomain, projects],
  );
  const featured = filteredProjects.filter((project) => project.featured);
  const more = filteredProjects.filter((project) => !project.featured);

  return (
    <div className="bg-night">
      <section className="pb-12 pt-4 sm:pt-8 lg:pb-16" aria-label="Project filters">
        <div className={cn(container, "space-y-6")}>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <SectionLabel index="00" tone="dark">
                Filter by domain
              </SectionLabel>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist">
                Browse the work by the problems and platforms each project brings together.
              </p>
            </div>
            <ProjectCount count={filteredProjects.length} />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by domain">
            {projectDomains.map((domain) => {
              const isActive = activeDomain === domain;
              return (
                <button
                  key={domain}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveDomain(domain)}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky",
                    isActive
                      ? "border-sky bg-sky text-night"
                      : "border-white/15 text-snow hover:border-sky/60 hover:text-sky",
                  )}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={cn(lightPanel, sectionY)} aria-labelledby="featured-projects-heading">
        <div className={container}>
          <SectionLabel index="01" tone="light">
            Featured work
          </SectionLabel>
          <h2 id="featured-projects-heading" className={cn(display, "mt-6 max-w-4xl")}>
            Selected <Accent>work</Accent>
          </h2>
          <p className={cn("mt-6 max-w-xl text-base leading-relaxed", mutedOnLight)}>
            Three end-to-end builds across education, AI, healthcare and the web.
          </p>
          <div className="mt-12 space-y-12 lg:mt-16 lg:space-y-16">
            {featured.length > 0 ? (
              featured.map((project, index) => (
                <FeaturedProjectRow key={project.slug} project={project} index={index} />
              ))
            ) : (
              <p className={cn("border-t border-ink/10 pt-8", mutedOnLight)}>
                No featured projects match this domain yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={cn(sectionY, "bg-night")} aria-labelledby="more-projects-heading">
        <div className={container}>
          <SectionLabel index="02" tone="dark">
            More projects
          </SectionLabel>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <h2 id="more-projects-heading" className={cn(display, "max-w-3xl")}>
              More <Accent>systems</Accent>
            </h2>
            <p className={cn("max-w-sm text-sm leading-relaxed lg:text-right", mutedOnDark)}>
              Smaller surfaces, the same care for useful interfaces and dependable foundations.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {more.length > 0 ? (
              more.map((project) => <MoreProjectCard key={project.slug} project={project} />)
            ) : (
              <p className={cn("md:col-span-2 lg:col-span-3", mutedOnDark)}>
                No more projects match this domain yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
