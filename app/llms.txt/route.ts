import { getPublishedPosts } from "@/lib/content/blog";
import { experience, profile } from "@/lib/content/profile";
import { projects } from "@/lib/content/projects";
import { siteUrl } from "@/lib/seo/metadata";

export function GET() {
  const publishedPosts = getPublishedPosts();
  const lines = [
    `# ${profile.fullName}`,
    "",
    `> ${profile.role} based in ${profile.location}. ${profile.availability}.`,
    "",
    "## Summary",
    "",
    profile.summary,
    "",
    "## Current experience",
    "",
    ...experience.map((role) => `- ${role.role} — ${role.organization}. ${role.period}.`),
    "",
    "## Canonical navigation",
    "",
    `- [Home](${siteUrl("/")}) — portfolio overview and professional identity.`,
    `- [About](${siteUrl("/about")}) — experience, education, capabilities, and working principles.`,
    `- [Projects](${siteUrl("/projects")}) — published project case studies.`,
    `- [Contact](${siteUrl("/contact")}) — contact form, public email, and availability.`,
    "",
    "## Published projects",
    "",
    ...projects.flatMap((project) => [
      `- [${project.title}](${siteUrl(`/projects/${project.slug}`)}) — ${project.summary} Domains: ${project.domains.join(", ")}. Stack: ${project.stack.join(", ")}.`,
    ]),
    "",
    "## Published writing",
    "",
    ...(publishedPosts.length
      ? publishedPosts.map(
          (post) =>
            `- [${post.title}](${siteUrl(`/blog/${post.slug}`)}) — ${post.description}`,
        )
      : ["No blog articles are published yet; draft posts are intentionally excluded."]),
    "",
    "## Identity facts",
    "",
    `- Display name: ${profile.name}`,
    `- Handle: ${profile.handle}`,
    `- Role: ${profile.role}`,
    `- Experience: ${profile.experienceYears} years`,
    `- Location: ${profile.location}`,
    `- Public GitHub: ${profile.githubUrl}`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
