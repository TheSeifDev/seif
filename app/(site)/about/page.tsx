import Image from "next/image";
import type { Metadata } from "next";
import { Box, Code2, Layers, UserRound } from "lucide-react";
import { AboutMotion } from "@/components/about/about-motion";
import {
  Accent,
  PillLink,
  SectionHeading,
  SectionLabel,
  Tags,
  VerticalCaption,
} from "@/components/system/primitives";
import { TechnologyIcon } from "@/components/system/technology-icon";
import { PageHero } from "@/components/site/page-hero";
import {
  assets,
  education,
  experience,
  principles,
  profile,
  training,
} from "@/lib/content/profile";
import { skillGroups } from "@/lib/content/skills";
import {
  container,
  darkStage,
  h3,
  label,
  lightPanel,
  mutedOnLight,
  sectionY,
} from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Seif Ayman, a Senior Full Stack Software Developer in Alexandria, Egypt, who architects and delivers production-grade platforms across web, desktop, AI and IoT.",
};

const principleIcons = {
  box: Box,
  code: Code2,
  layers: Layers,
  user: UserRound,
} as const;

const facts = [
  { label: "Experience", value: `${profile.experienceYears} years` },
  { label: "Production platforms", value: `${profile.platforms} (CV)` },
  { label: "Based in", value: profile.location },
  { label: "Availability", value: "Open to remote" },
] as const;

export default function AboutPage() {
  return (
    <AboutMotion>
      <PageHero
        label="About"
        title={
          <>
            Engineer of the <Accent>whole product</Accent>
          </>
        }
        intro={profile.intro}
        japanese="開発・設計・解決"
        aside={
          <div className="flex flex-wrap gap-3">
            <PillLink href={profile.cvUrl} variant="accent">
              Download CV
            </PillLink>
            <PillLink href="/contact" variant="outline-dark">
              Start a conversation
            </PillLink>
          </div>
        }
      />

      <section
        id="introduction"
        className={cn(lightPanel, "overflow-hidden")}
        aria-labelledby="introduction-heading"
      >
        <div className={cn(container, sectionY)}>
          <SectionHeading
            index="01"
            label="Introduction"
            title={
              <>
                A calm engineer for <Accent>complex systems</Accent>.
              </>
            }
            tone="light"
            id="introduction-heading"
            aside={
              <VerticalCaption className="hidden text-sky-ink/70 lg:inline-flex">
                仕組み・体験・責任
              </VerticalCaption>
            }
          />

          <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div
              data-about-reveal
              data-about-portrait-wrap
              className="relative isolate mx-auto w-full max-w-md lg:col-span-5 lg:mx-0"
            >
              <div
                aria-hidden="true"
                className="absolute -inset-5 -z-10 overflow-hidden rounded-[32px] opacity-35 sm:-inset-8 lg:rounded-[40px]"
              >
                <Image
                  src={assets.aboutInk}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 42vw, 90vw"
                  className="object-cover object-[20%_50%] grayscale"
                />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-night-2 sm:rounded-[36px]">
                <Image
                  data-about-portrait
                  src={assets.portrait}
                  alt="Seif Ayman"
                  fill
                  sizes="(min-width: 1024px) 36vw, 88vw"
                  className="object-contain object-bottom"
                />
              </div>
              <p className="absolute -bottom-5 -right-3 rounded-full border border-ink/10 bg-paper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-ink shadow-sm sm:-right-5">
                Seif Ayman
              </p>
            </div>

            <div className="lg:col-span-7">
              <p
                data-about-reveal
                className="max-w-3xl text-[clamp(1.35rem,2.45vw,2.2rem)] leading-[1.28] tracking-[-0.025em] text-ink"
              >
                {profile.summary}
              </p>

              <dl
                data-about-reveal
                className="mt-12 grid border-y border-ink/10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
              >
                {facts.map((fact, index) => (
                  <div
                    key={fact.label}
                    className={cn(
                      "py-5 sm:px-4 lg:px-5",
                      index > 0 && "border-t border-ink/10 sm:border-l sm:border-t-0",
                      index > 1 && "lg:border-l",
                    )}
                  >
                    <dt className={cn(label, mutedOnLight)}>{fact.label}</dt>
                    <dd className="mt-3 text-sm font-semibold leading-snug text-ink">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section
        id="experience"
        className={cn(darkStage, sectionY)}
        aria-labelledby="experience-heading"
      >
        <div className={container}>
          <SectionHeading
            index="02"
            label="Experience"
            title={
              <>
                Ownership from <Accent>schema to screen</Accent>.
              </>
            }
            id="experience-heading"
            aside="Two roles, both grounded in building reliable systems and helping the people around them work better."
          />

          <div className="relative mt-16 space-y-14 pl-8 before:absolute before:bottom-3 before:left-[7px] before:top-2 before:w-px before:bg-white/10 lg:mt-24 lg:space-y-20 lg:pl-16 before:lg:left-1.5">
            {experience.map((item) => (
              <article
                key={`${item.organization}-${item.role}`}
                data-about-reveal
                className="relative border-b border-white/[0.08] pb-14 last:border-0 last:pb-0 lg:grid lg:grid-cols-[minmax(10rem,0.7fr)_1fr] lg:gap-12 lg:pb-20"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[calc(2rem+3px)] top-1.5 size-2.5 rounded-full bg-sky shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-sky)_14%,transparent)] lg:-left-[calc(4rem+1px)]"
                />
                <div>
                  <p className={cn(label, "text-sky")}>{item.period}</p>
                  <p className="mt-3 text-sm text-mist">{item.location}</p>
                </div>
                <div className="mt-6 lg:mt-0">
                  <h3 className={cn(h3, "max-w-2xl text-snow")}>{item.role}</h3>
                  <p className="mt-3 font-medium text-sky">{item.organization}</p>
                  <ul className="mt-7 space-y-3 text-[15px] leading-relaxed text-mist">
                    {item.points.map((point) => (
                      <li key={point} className="relative pl-5">
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-[0.7em] size-1 rounded-full bg-sky"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                  {item.stack.length > 0 ? (
                    <Tags items={item.stack} className="mt-8" />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="education"
        className={cn(darkStage, "border-t border-white/[0.06]")}
        aria-labelledby="education-heading"
      >
        <div className={cn(container, sectionY, "pt-16 lg:pt-24") }>
          <SectionHeading
            index="03"
            label="Education & training"
            title={
              <>
                Keep learning. Keep <Accent>making it useful</Accent>.
              </>
            }
            id="education-heading"
          />

          <div className="mt-16 grid gap-5 lg:mt-24 lg:grid-cols-12">
            <article
              data-about-reveal
              className="rounded-3xl border border-white/[0.08] bg-night-2 p-7 sm:p-9 lg:col-span-7"
            >
              <p className={cn(label, "text-sky")}>Education</p>
              <h3 className={cn(h3, "mt-6 max-w-xl text-snow")}>{education.degree}</h3>
              <div className="mt-12 flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.08] pt-5">
                <p className="text-sm text-mist">{education.institution}</p>
                <p className={cn(label, "text-mist")}>{education.period}</p>
              </div>
            </article>

            <article
              data-about-reveal
              className="rounded-3xl border border-white/[0.08] bg-night-2 p-7 sm:p-9 lg:col-span-5"
            >
              <p className={cn(label, "text-sky")}>Training</p>
              <div className="mt-7 space-y-7">
                {training.map((group) => (
                  <div key={group.provider}>
                    <h3 className="font-display text-xl font-bold tracking-[-0.025em] text-snow">
                      {group.provider}
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rounded-full bg-sky" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className={cn(lightPanel, "overflow-hidden")}
        aria-labelledby="capabilities-heading"
      >
        <div className={cn(container, sectionY)}>
          <SectionHeading
            index="04"
            label="Capabilities"
            title={
              <>
                A broad toolkit, organized around <Accent>product work</Accent>.
              </>
            }
            tone="light"
            id="capabilities-heading"
            aside="Fifteen skill groups, transcribed from the CV and kept visible as an index rather than reduced to a badge cloud."
          />

          <div className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            {skillGroups.map((group, groupIndex) => (
              <section
                key={group.name}
                data-about-reveal
                className={cn(
                  "border-t border-ink/10 pt-5",
                  groupIndex === 0 && "lg:col-span-2",
                )}
                aria-labelledby={`capability-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3
                    id={`capability-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className={cn(label, "text-sky-ink")}
                  >
                    {group.name}
                  </h3>
                  <span className="font-mono text-[11px] text-slate-ink">
                    {String(group.skills.length).padStart(2, "0")}
                  </span>
                </div>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {group.skills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2.5 text-sm text-slate-ink">
                      <span className="text-slate-ink/75">
                        <TechnologyIcon name={skill} size={15} />
                      </span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section
        id="principles"
        className={cn(darkStage, sectionY)}
        aria-labelledby="principles-heading"
      >
        <div className={container}>
          <SectionHeading
            index="05"
            label="Principles"
            title={
              <>
                The standard behind the <Accent>output</Accent>.
              </>
            }
            id="principles-heading"
            aside="Approach matters: these are working principles, not claims about outcomes."
          />

          <div className="mt-16 grid border-y border-white/[0.1] sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:border-l lg:border-y-0">
            {principles.map((principle) => {
              const Icon = principleIcons[principle.icon];
              return (
                <article
                  key={principle.title}
                  data-about-reveal
                  className="border-b border-white/[0.1] py-8 sm:px-7 sm:odd:border-r lg:border-b-0 lg:border-r lg:px-8 lg:py-3"
                >
                  <Icon className="size-7 text-sky" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="mt-8 font-display text-xl font-bold tracking-[-0.025em] text-snow">
                    {principle.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-mist">{principle.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-night-3" aria-labelledby="about-cta-heading">
        <div className={cn(container, "py-20 lg:py-28")}>
          <div
            data-about-reveal
            className="grid gap-10 border-t border-white/[0.1] pt-10 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-8">
              <SectionLabel index="06">Next step</SectionLabel>
              <h2 id="about-cta-heading" className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-snow">
                See what this approach looks like in <Accent>real products</Accent>.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <PillLink href="/projects" variant="accent">
                View projects
              </PillLink>
              <PillLink href="/contact" variant="outline-dark">
                Start a conversation
              </PillLink>
            </div>
          </div>
        </div>
      </section>
    </AboutMotion>
  );
}
