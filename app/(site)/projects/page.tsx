import { ProjectStack } from "@/components/projects/project-stack";
import { ProjectsCta } from "@/components/projects/projects-cta";
import { ProjectsHero } from "@/components/projects/projects-hero";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { ProjectsMotion } from "@/components/projects/projects-motion";
import { featuredProjects, projects } from "@/lib/content/projects";

export default function ProjectsPage() {
  return (
    <main>
      <ProjectsMotion>
        <ProjectsHero />
        <ProjectsIndex projects={projects} />
        <ProjectStack projects={featuredProjects} />
        <ProjectsCta />
      </ProjectsMotion>
    </main>
  );
}
