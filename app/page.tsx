import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import {
  AboutSection,
  ProcessSection,
  ContactSection,
} from "@/components/home/sections";
import { JourneySection } from "@/components/home/journey-section";
import {
  ProjectsSection,
  MoreProjectsSection,
} from "@/components/home/work-section";
import { SkillsSection } from "@/components/home/skills-section";
import { ScrollExperience } from "@/components/motion/scroll-experience";
import { HomeScenes } from "@/components/motion/home-scenes";

export default function Home() {
  return (
    <ScrollExperience>
      <a
        href="#main-content"
        className="skip-link fixed -top-24 left-5 z-[200] rounded-lg bg-white px-5 py-3 text-sm text-slate-900 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <HomeScenes>
          <Hero />
          <AboutSection />
          <JourneySection />
          <ProjectsSection />
          <MoreProjectsSection />
          <SkillsSection />
          <ProcessSection />
          <ContactSection />
        </HomeScenes>
      </main>
      <Footer />
    </ScrollExperience>
  );
}
