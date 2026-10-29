import { PageHero } from "@/components/site/page-hero";
import { Accent } from "@/components/system/primitives";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { projects } from "@/lib/content/projects";

export default function ProjectsPage() {
  return (
    <main>
      <PageHero
        label="Projects"
        title={
          <>
            Selected <Accent>work</Accent>
          </>
        }
        intro="Products across education, healthcare, AI, analytics and the web — built end to end."
        japanese="作品集"
      />
      <ProjectsIndex projects={projects} />
    </main>
  );
}
