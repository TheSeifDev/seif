import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { AboutMotion } from "@/components/about/about-motion";
import { AboutHero } from "@/components/about/about-hero";
import { IntroductionSection } from "@/components/about/introduction-section";
import { CapabilitiesSection } from "@/components/about/capabilities-section";
import { EducationSection } from "@/components/about/education-section";
import { ExperienceSection } from "@/components/about/experience-section";
import { PrinciplesSection } from "@/components/about/principles-section";
import { Accent, PillLink, SectionHeading, SectionLabel } from "@/components/system/primitives";
import { profile } from "@/lib/content/profile";
import { container, lightPanel, sectionY } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createFaqPageGraph, createProfilePageGraph, type FaqItem } from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "Professional background, capabilities and working approach of Seif Ayman, a Senior Full Stack Developer in Alexandria, Egypt.",
  path: "/about",
});

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
          breadcrumbs: [{ name: "Home", path: "/" }, { name: "About", path: "/about" }],
        })}
      />
      <JsonLd data={{ "@context": "https://schema.org", ...createFaqPageGraph(faqItems) }} />
      <AboutHero />
      <IntroductionSection />
      <ExperienceSection />
      <EducationSection />
      <CapabilitiesSection />
      <PrinciplesSection />

      <section className={cn(lightPanel, sectionY)} aria-labelledby="about-faq-heading">
        <div className={container}>
          <SectionHeading
            index="FAQ"
            label="A few useful answers"
            title={<>About the <Accent>work</Accent></>}
            tone="light"
            id="about-faq-heading"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-7">
                <h3 className="font-display text-xl font-bold tracking-[-0.025em] text-ink">{item.question}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-ink">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-night-3" aria-labelledby="about-cta-heading">
        <div className={cn(container, "py-20 lg:py-28")}>
          <div data-about-reveal className="grid gap-10 border-t border-white/[0.1] pt-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionLabel index="06">Next step</SectionLabel>
              <h2 id="about-cta-heading" className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-snow">
                See what this approach looks like in <Accent>real products</Accent>.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <PillLink href="/projects" variant="accent">View projects</PillLink>
              <PillLink href="/contact" variant="outline-dark">Start a conversation</PillLink>
            </div>
          </div>
        </div>
      </section>
    </AboutMotion>
  );
}
