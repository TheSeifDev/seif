import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Scene } from "@/components/motion/scene";
import { About } from "@/components/home/about";
import { ConnectCta } from "@/components/home/connect-cta";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { Hero } from "@/components/home/hero";
import { Identity } from "@/components/home/identity";
import { Journey } from "@/components/home/journey";
import { MoreProjects } from "@/components/home/more-projects";
import { Process } from "@/components/home/process";
import { Skills } from "@/components/home/skills";
import { createHomeGraph } from "@/lib/seo/structured-data";
import { createCmsPageMetadata, withCmsGraph } from "@/lib/cms/metadata";
import { getSiteContent } from "@/lib/cms/server";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return createCmsPageMetadata(
    { title: "Home", description: content.seo.description, path: "/" },
    content,
  );
}

export default async function HomePage() {
  const content = await getSiteContent();
  return (
    <>
      <JsonLd data={withCmsGraph(createHomeGraph(), content)} />
      <Scene name="hero" className="relative">
        <Hero content={content} />
        <About content={content} />
      </Scene>
      <Identity content={content} />
      <Journey content={content} />
      <FeaturedProjects content={content} />
      <MoreProjects content={content} />
      <Skills content={content} />
      <Process content={content} />
      <ConnectCta content={content} />
    </>
  );
}
