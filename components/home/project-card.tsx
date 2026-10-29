import { ArrowUpRight, Braces, Layers, Boxes } from "lucide-react";
import type { ProjectPreview } from "@/lib/content/home";

export function ProjectCard({
  project,
  compact = false,
}: {
  project: ProjectPreview;
  compact?: boolean;
}) {
  const Icon =
    project.visual === "code"
      ? Braces
      : project.visual === "system"
        ? Boxes
        : Layers;
  return (
    <article
      className={`project-card project-${project.visual}${compact ? " project-compact" : ""}`}
      aria-label={`${project.discipline} — placeholder, not a published project`}
    >
      <div className="project-topline">
        <Icon size={21} aria-hidden="true" />
        <span>{project.discipline}</span>
        <span className="project-index">{project.id}</span>
      </div>
      <div className="project-art" aria-hidden="true">
        {project.visual === "product" ? (
          <div className="mock-browser">
            <div className="mock-toolbar">
              <i />
              <i />
              <i />
              <span />
            </div>
            <div className="mock-content">
              <div className="mock-sidebar">
                <b />
                <b />
                <b />
                <b />
              </div>
              <div className="mock-dashboard">
                <div className="mock-line" />
                <div className="mock-metrics">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="mock-chart">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        ) : project.visual === "system" ? (
          <div className="system-art">
            <div className="system-ring ring-one" />
            <div className="system-ring ring-two" />
            <div className="system-core">
              <Boxes size={35} />
            </div>
            <span className="system-node node-a" />
            <span className="system-node node-b" />
            <span className="system-node node-c" />
            <span className="system-node node-d" />
          </div>
        ) : (
          <div className="code-window">
            <div className="code-top">
              <i />
              <i />
              <i />
            </div>
            <pre>{`const idea = {\n  purpose: 'solve',\n  approach: 'build',\n  details: 'matter'\n};\n\nship(idea);`}</pre>
            <div className="code-cursor" />
          </div>
        )}
      </div>
      <div className="project-footer">
        <div>
          <span className="placeholder-tag">CONTENT PLACEHOLDER</span>
          <h3>Case study to come</h3>
          <p>Reserved for an approved project.</p>
        </div>
        <ArrowUpRight size={19} aria-hidden="true" />
      </div>
    </article>
  );
}
