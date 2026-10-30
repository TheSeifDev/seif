import { getSiteContent } from "@/lib/cms/server";
import { cmsUrl } from "@/lib/cms/metadata";
export async function GET() {
  const content = await getSiteContent();
  const { profile, projects, posts, experience } = content;
  const url = (path: string) => cmsUrl(path, content);
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
    ...experience.map(
      (role) => `- ${role.role} — ${role.organization}. ${role.period}.`,
    ),
    "",
    "## Canonical navigation",
    "",
    ...content.navigation.map((item) => `- [${item.label}](${url(item.href)})`),
    "",
    "## Published projects",
    "",
    ...projects.map(
      (project) =>
        `- [${project.title}](${url(`/projects/${project.slug}`)}) — ${project.summary} Domains: ${project.domains.join(", ")}. Stack: ${project.stack.join(", ")}.`,
    ),
    "",
    "## Published writing",
    "",
    ...(posts.length
      ? posts.map(
          (post) =>
            `- [${post.title}](${url(`/blog/${post.slug}`)}) — ${post.description}`,
        )
      : [
          "No blog articles are published yet; draft posts are intentionally excluded.",
        ]),
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
