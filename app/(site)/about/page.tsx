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
import { createCmsPageMetadata, withCmsGraph } from "@/lib/cms/metadata";
import { getSiteContent } from "@/lib/cms/server";
import { getFaqItems } from "@/lib/cms/schema";
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
  const faqItems: readonly FaqItem[] = getFaqItems(content);
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
    </AboutMotion>
  );
}
