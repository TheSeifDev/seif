import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import {
  AboutSection,
  StatsSection,
  ProjectsSection,
  MoreProjectsSection,
  SkillsSection,
  ContactSection,
} from "@/components/home/sections";
import { ScrollExperience } from "@/components/motion/scroll-experience";

export default function Home() {
  return (
    <ScrollExperience>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <AboutSection />
        <StatsSection />
        <ProjectsSection />
        <MoreProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
    </ScrollExperience>
  );
}
