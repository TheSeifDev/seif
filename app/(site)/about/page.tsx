import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { AboutMotion } from "@/components/about/about-motion";
import { CapabilitiesSection } from "@/components/about/capabilities-section";
import { EducationSection } from "@/components/about/education-section";
import { ExperienceSection } from "@/components/about/experience-section";
import { PrinciplesSection } from "@/components/about/principles-section";
import {
  Accent,
  PillLink,
  SectionHeading,
  SectionLabel,
  VerticalCaption,
} from "@/components/system/primitives";
import { PageHero } from "@/components/site/page-hero";
import { assets, profile } from "@/lib/content/profile";
import { container, label, lightPanel, mutedOnLight, sectionY } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createFaqPageGraph,
  createProfilePageGraph,
  type FaqItem,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "Learn about Seif Ayman, a Senior Full Stack Software Developer in Alexandria, Egypt, who architects and delivers production-grade platforms across web, desktop, AI and IoT.",
  path: "/about",
  keywords: ["Seif Ayman", "full stack developer", "software architecture", "Alexandria Egypt"],
});

const facts = [
  { label: "Experience", value: `${profile.experienceYears} years` },
  { label: "Production platforms", value: `${profile.platforms} (CV)` },
  { label: "Based in", value: profile.location },
  { label: "Availability", value: "Open to remote" },
] as const;

const faqItems: readonly FaqItem[] = [
  {
    question: "Who is Seif Ayman?",
    answer:
      "Seif Ayman Ahmed (TheSeifDev) is a Senior Full Stack Software Developer based in Alexandria, Egypt, with 5+ years of experience building production-grade platforms.",
  },
  {
    question: "What does Seif work on?",
    answer:
      "He works across web and desktop products, AI and Retrieval-Augmented Generation workflows, real-time MQTT and IoT systems, APIs, databases and cloud deployment.",
  },
  {
    question: "Is Seif available for new work?",
    answer:
      "Seif is open to remote roles and freelance work. Visitors can use the contact page to describe a product, platform or technical challenge.",
  },
];

export default function AboutPage() {
  return (
    <AboutMotion>
      <JsonLd
        data={createProfilePageGraph({
          path: "/about",
          name: "About Seif Ayman",
          description: "Professional background, capabilities and working approach of Seif Ayman.",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ],
        })}
      />
      <JsonLd data={{ "@context": "https://schema.org", ...createFaqPageGraph(faqItems) }} />
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
                  loading="lazy"
                  fetchPriority="low"
                  quality={60}
                  sizes="(min-width: 1024px) 512px, min(100vw, 512px)"
                  className="object-cover object-[20%_50%] grayscale"
                />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-night-2 sm:rounded-[36px]">
                <Image
                  data-about-portrait
                  src={assets.portrait}
                  alt="Seif Ayman"
                  fill
                  loading="lazy"
                  quality={85}
                  sizes="(min-width: 1024px) 448px, min(88vw, 448px)"
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

      <ExperienceSection />
      <EducationSection />
      <CapabilitiesSection />
      <PrinciplesSection />

      <section className={cn(lightPanel, sectionY)} aria-labelledby="about-faq-heading">
        <div className={container}>
          <SectionHeading
            index="FAQ"
            label="A few useful answers"
            title={
              <>
                About the <Accent>work</Accent>
              </>
            }
            tone="light"
            id="about-faq-heading"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-7">
                <h3 className="font-display text-xl font-bold tracking-[-0.025em] text-ink">
                  {item.question}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-ink">{item.answer}</p>
              </article>
            ))}
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
