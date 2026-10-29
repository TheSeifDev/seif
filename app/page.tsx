import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import {
  AboutSection,
  StatsSection,
  ProcessSection,
  ContactSection,
} from "@/components/home/sections";
import {
  ProjectsSection,
  MoreProjectsSection,
} from "@/components/home/work-section";
import { SkillsSection } from "@/components/home/skills-section";
import { ScrollExperience } from "@/components/motion/scroll-experience";

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
      <div
        className="scroll-track pointer-events-none fixed top-[40%] right-1.5 z-30 hidden h-[115px] w-0.5 bg-slate-400/15 lg:block"
        aria-hidden="true"
      >
        <span className="block size-full origin-top scale-y-[var(--scroll-progress)] bg-identity shadow-sm shadow-identity/40" />
      </div>
      <main id="main-content">
        <Hero />
        <AboutSection />
        <StatsSection />
        <ProjectsSection />
        <MoreProjectsSection />
        <SkillsSection />
        <ProcessSection />
        <ContactSection />
      </main>
      <Footer />
    </ScrollExperience>
  );
}
