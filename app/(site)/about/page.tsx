import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { AboutMotion } from "@/components/about/about-motion";
import { AboutHero } from "@/components/about/about-hero";
import { AboutFaqSection } from "@/components/about/about-faq-section";
import { IntroductionSection } from "@/components/about/introduction-section";
import { CapabilitiesSection } from "@/components/about/capabilities-section";
import { EducationSection } from "@/components/about/education-section";
import { ExperienceSection } from "@/components/about/experience-section";
import { PrinciplesSection } from "@/components/about/principles-section";
import { PillLink, SectionLabel } from "@/components/system/primitives";
import { CmsTitle } from "@/components/system/cms-title";
import { container } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";
import { getCopy } from "@/lib/cms/copy";
import { createCmsPageMetadata, withCmsGraph } from "@/lib/cms/metadata";
import { getSiteContent } from "@/lib/cms/server";
import {
  createFaqPageGraph,
  createProfilePageGraph,
  type FaqItem,
} from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return createCmsPageMetadata(
    { title: "About", description: content.profile.intro, path: "/about" },
    content,
  );
}

export default async function AboutPage() {
  const content = await getSiteContent();
  const c = (key: string, fallback: string) =>
    getCopy(content.copy, key, fallback);
  const faqItems: readonly FaqItem[] = [1, 2, 3]
    .map((index) => ({
      question: c(`about.faq.question.${index}`, ""),
      answer: c(`about.faq.answer.${index}`, ""),
    }))
    .filter((item) => item.question && item.answer);
  return (
    <AboutMotion>
      <JsonLd
        data={withCmsGraph(
          createProfilePageGraph({
            path: "/about",
            name: `About ${content.profile.name}`,
            description: content.profile.intro,
            breadcrumbs: [
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
            ],
          }),
          content,
        )}
      />
      <JsonLd
        data={withCmsGraph(
          { "@context": "https://schema.org", ...createFaqPageGraph(faqItems) },
          content,
        )}
      />
      <AboutHero content={content} />
      <IntroductionSection content={content} />
      <ExperienceSection content={content} />
      <EducationSection content={content} />
      <CapabilitiesSection content={content} />
      <PrinciplesSection content={content} />
      <AboutFaqSection items={faqItems} content={content} />
      <section className="bg-night-3" aria-labelledby="about-cta-heading">
        <div className={cn(container, "py-20 lg:py-28")}>
          <div
            data-about-reveal
            className="grid gap-10 border-t border-white/[0.1] pt-10 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-8">
              <SectionLabel index="06">
                {c("about.next.sectionLabel", "Next step")}
              </SectionLabel>
              <h2
                id="about-cta-heading"
                className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-snow"
              >
                <CmsTitle
                  text={c(
                    "about.next.title",
                    "See what this approach looks like in real products.",
                  )}
                  accent="real products"
                />
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <PillLink href="/projects" variant="accent">
                {c("about.next.viewProjectsCta", "View projects")}
              </PillLink>
              <PillLink href="/contact" variant="outline-dark">
                {c("about.next.startConversationCta", "Start a conversation")}
              </PillLink>
            </div>
          </div>
        </div>
      </section>
    </AboutMotion>
  );
}
