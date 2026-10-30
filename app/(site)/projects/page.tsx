import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectStack } from "@/components/projects/project-stack";
import { ProjectsCta } from "@/components/projects/projects-cta";
import { ProjectsHero } from "@/components/projects/projects-hero";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { ProjectsMotion } from "@/components/projects/projects-motion";
import { createCmsPageMetadata, withCmsGraph } from "@/lib/cms/metadata";
import { getSiteContent } from "@/lib/cms/server";
import { createCollectionPageGraph } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return createCmsPageMetadata(
    {
      title: "Projects",
      description: content.seo.description,
      path: "/projects",
    },
    content,
  );
}
export default async function ProjectsPage() {
  const content = await getSiteContent();
  const projects = content.projects.filter(
    (project) => project.status === "published",
  );
  const featuredProjects = projects.filter((project) => project.featured);
  return (
    <main>
      <JsonLd
        data={withCmsGraph(
          createCollectionPageGraph({
            path: "/projects",
            name: `Projects by ${content.profile.name}`,
            description: "Published software and platform case studies.",
            breadcrumbs: [
              { name: "Home", path: "/" },
              { name: "Projects", path: "/projects" },
            ],
            items: projects.map((project) => ({
              name: project.title,
              path: `/projects/${project.slug}`,
            })),
          }),
          content,
        )}
      />
      <ProjectsMotion>
        <ProjectsHero projects={projects} content={content} />
        <ProjectsIndex projects={projects} content={content} />
        <ProjectStack projects={featuredProjects} content={content} />
        <ProjectsCta content={content} />
      </ProjectsMotion>
    </main>
  );
}
