import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectStack } from "@/components/projects/project-stack";
import { ProjectsCta } from "@/components/projects/projects-cta";
import { ProjectsHero } from "@/components/projects/projects-hero";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { ProjectsMotion } from "@/components/projects/projects-motion";
import { featuredProjects, projects } from "@/lib/content/projects";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createCollectionPageGraph,
  createProjectsIndexItems,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description:
    "Explore Seif Ayman’s published case studies across education, healthcare, AI, IoT, analytics and full-stack web platforms.",
  path: "/projects",
  keywords: ["Seif Ayman projects", "full stack case studies", "AI IoT projects", "Next.js projects"],
});

export default function ProjectsPage() {
  return (
    <main>
      <JsonLd
        data={createCollectionPageGraph({
          path: "/projects",
          name: "Projects by Seif Ayman",
          description: "Published software and platform case studies by Seif Ayman.",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
          ],
          items: createProjectsIndexItems(),
        })}
      />
      <ProjectsMotion>
        <ProjectsHero />
        <ProjectsIndex projects={projects} />
        <ProjectStack projects={featuredProjects} />
        <ProjectsCta />
      </ProjectsMotion>
    </main>
  );
}
