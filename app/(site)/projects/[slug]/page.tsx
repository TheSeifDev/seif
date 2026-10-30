import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { CaseStudyMedia } from "@/components/projects/case-study-media";
import { ProjectActions } from "@/components/system/project-media";
import {
  Accent,
  PillLink,
  SectionLabel,
  Tags,
} from "@/components/system/primitives";
import { getNextProject, getProject, projects, type Project } from "@/lib/content/projects";
import {
  container,
  darkStage,
  display,
  h2,
  label,
  lightPanel,
  mutedOnDark,
  mutedOnLight,
  sectionY,
} from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createProjectGraph } from "@/lib/seo/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);

  if (!project) notFound();

  return createPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
    keywords: [...project.domains, ...project.stack],
  });
}

function ArchitectureFlow({
  architecture,
}: {
  architecture: NonNullable<Project["architecture"]>;
}) {
  return (
    <div className="mt-10">
      <ol className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-0">
        {architecture.steps.map((step, index) => (
          <li key={step.name} className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-center">
            <div className="h-full rounded-2xl border border-white/12 bg-night-2 p-5 lg:min-h-36 lg:flex-1">
              <p className={cn(label, "text-sky")}>{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-5 font-display text-xl font-bold tracking-[-0.02em] text-snow">
                {step.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{step.detail}</p>
            </div>
            {index < architecture.steps.length - 1 ? (
              <>
                <ArrowRight
                  className="mx-auto my-1 hidden size-5 shrink-0 text-sky lg:mx-4 lg:my-0 lg:block"
                  aria-hidden="true"
                />
                <ArrowDown
                  className="mx-auto my-1 size-5 shrink-0 text-sky lg:hidden"
                  aria-hidden="true"
                />
              </>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-8 max-w-3xl border-l border-sky pl-5 text-[15px] leading-relaxed text-mist">
        {architecture.note}
      </p>
    </div>
  );
}

function Overview({ project }: { project: Project }) {
  return (
    <section className={cn(lightPanel, sectionY)} aria-labelledby="overview-heading">
      <div className={container}>
        <SectionLabel index="01" tone="light">
          Overview
        </SectionLabel>
        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="overview-heading" className={h2}>
              The work, <Accent>clearly</Accent>
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="max-w-3xl text-lg leading-[1.7] text-slate-ink">{project.description}</p>
            <ol className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              {project.highlights.map((highlight, index) => (
                <li key={highlight} className="grid gap-4 py-5 sm:grid-cols-[3rem_1fr] sm:gap-6">
                  <span className={cn(label, "text-sky-ink")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink/80">{highlight}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Architecture({ project }: { project: Project }) {
  if (!project.architecture) return null;

  return (
    <section className={cn(darkStage, sectionY)} aria-labelledby="architecture-heading">
      <div className={container}>
        <SectionLabel index="02" tone="dark">
          Architecture
        </SectionLabel>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="architecture-heading" className={cn(h2, "lg:col-span-8")}>
            A clear path from <Accent>signal</Accent> to interface
          </h2>
          <p className={cn("max-w-sm text-sm leading-relaxed lg:col-span-4 lg:justify-self-end lg:text-right", mutedOnDark)}>
            The system is split into focused services, with the backend mediating the assistant and the desktop interface.
          </p>
        </div>
        <ArchitectureFlow architecture={project.architecture} />
      </div>
    </section>
  );
}

function Features({ project }: { project: Project }) {
  if (!project.features) return null;

  return (
    <section className={cn(lightPanel, sectionY)} aria-labelledby="features-heading">
      <div className={container}>
        <SectionLabel index="02" tone="light">
          Features
        </SectionLabel>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h2 id="features-heading" className={h2}>
            What it <Accent>holds</Accent>
          </h2>
          <p className={cn("max-w-sm text-sm leading-relaxed lg:text-right", mutedOnLight)}>
            Capabilities documented for the product, including the boundaries that keep its analytics honest.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {project.features.map((group, index) => (
            <article key={group.title} className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className={cn(label, "text-sky-ink")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-ink/10" aria-hidden="true" />
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold tracking-[-0.025em]">{group.title}</h3>
              <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-slate-ink">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-sky-ink" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackAndSources({ project }: { project: Project }) {
  return (
    <section className={cn(darkStage, sectionY)} aria-labelledby="stack-heading">
      <div className={container}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionLabel index={project.features ? "03" : project.architecture ? "03" : "02"}>
              Stack
            </SectionLabel>
            <h2 id="stack-heading" className={cn(h2, "mt-6")}>
              Tools with a <Accent>purpose</Accent>
            </h2>
            <Tags items={project.stack} className="mt-8" />
          </div>
          <div className="lg:col-span-5 lg:pt-1">
            <SectionLabel tone="dark">Sources</SectionLabel>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-mist">
              {project.sources.map((source) => (
                <li key={source} className="border-b border-white/10 pb-3">{source}</li>
              ))}
            </ul>
            {project.repo?.note ? (
              <p className="mt-6 border-l border-sky pl-4 text-sm leading-relaxed text-mist">
                {project.repo.note}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function ProjectCaseStudyPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = getProject(slug);

  if (!project) notFound();

  const nextProject = getNextProject(project.slug);

  return (
    <main>
      <JsonLd data={createProjectGraph(project)} />
      <section className="relative isolate overflow-hidden bg-night pb-20 pt-32 text-snow sm:pt-40 lg:pb-28 lg:pt-48">
        <div aria-hidden="true" className="pointer-events-none absolute right-[-4vw] top-24 hidden font-jp text-[22rem] leading-none text-white/[0.035] lg:block">
          {project.kanji}
        </div>
        <div className={container}>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-mist transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All projects
          </Link>
          <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="relative z-10 lg:col-span-8">
              <SectionLabel>{project.category}</SectionLabel>
              <h1 className={cn(display, "mt-7 max-w-5xl text-balance")}>{project.title}</h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-mist sm:text-xl">{project.summary}</p>
            </div>
            <div className="relative z-10 lg:col-span-4 lg:justify-self-end">
              <p className="font-jp text-5xl tracking-[0.2em] text-snow/80">{project.kanji}</p>
              <p className={cn(label, "mt-3 text-mist")}>{project.kanjiMeaning}</p>
            </div>
          </div>
          <dl className="mt-16 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-3 lg:mt-24">
            <div>
              <dt className={cn(label, "text-mist")}>Domain</dt>
              <dd className="mt-3 text-sm leading-relaxed text-snow">{project.domains.join(" · ")}</dd>
            </div>
            <div>
              <dt className={cn(label, "text-mist")}>Stack</dt>
              <dd className="mt-3 text-sm leading-relaxed text-snow">{project.stack.slice(0, 4).join(" · ")}</dd>
            </div>
            <div>
              <dt className={cn(label, "text-mist")}>Links</dt>
              <dd className="mt-3">
                <ProjectActions project={project} tone="dark" size="md" />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="bg-night px-5 pb-24 sm:px-8 lg:px-12 lg:pb-36" aria-label={`${project.title} preview`}>
        <CaseStudyMedia project={project} />
      </section>

      <Overview project={project} />
      <Architecture project={project} />
      <Features project={project} />
      <StackAndSources project={project} />

      <section className={cn(darkStage, "border-t border-white/10 py-20 lg:py-28")}>
        <div className={container}>
          <SectionLabel index="→" tone="dark">Next project</SectionLabel>
          <Link
            href={`/projects/${nextProject.slug}`}
            className="group mt-8 flex items-end justify-between gap-8 border-b border-white/15 pb-6 transition-colors hover:border-sky focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-sky"
          >
            <span>
              <span className={cn(label, "text-mist")}>{nextProject.category}</span>
              <span className="mt-4 block font-display text-[clamp(2.5rem,6vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-snow transition-colors group-hover:text-sky">
                {nextProject.title}
              </span>
            </span>
            <ArrowUpRight className="mb-2 size-8 shrink-0 text-sky transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:size-12" aria-hidden="true" />
          </Link>
          <div className="mt-8">
            <PillLink href="/projects" variant="outline-dark" size="sm">View all projects</PillLink>
          </div>
        </div>
      </section>
    </main>
  );
}
