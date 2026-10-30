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
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Home",
  description:
    "Senior Full Stack Developer in Alexandria, Egypt, building web, desktop, AI and IoT products end to end.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={createHomeGraph()} />
      {/* Hero stays sticky while the About panel slides over it. */}
      <Scene name="hero" className="relative">
        <Hero />
        <About />
      </Scene>
      {/* Signature moment: philosophy, portrait and moon, pinned on desktop. */}
      <Identity />
      <Journey />
      <FeaturedProjects />
      <MoreProjects />
      <Skills />
      <Process />
      <ConnectCta />
    </>
  );
}
