import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: { absolute: "Seif Ayman — Senior Full Stack Developer" },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
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
