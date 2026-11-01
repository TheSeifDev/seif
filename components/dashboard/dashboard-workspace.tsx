"use client";
import * as React from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleAlert,
  ExternalLink,
  FileImage,
  MessageSquare,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { BlogBlock, SiteContent, SiteProject } from "@/lib/cms/schema";
import { DashboardProvider } from "./dashboard-context";
import { DashboardShell } from "./dashboard-shell";
import { OverviewControlCenter } from "./overview-control-center";








import { darkCard, label as labelClass } from "@/lib/ui/layout";

export type DashboardUser = {
  name: string;
  image?: string | null;
};

export type DashboardWorkspaceProps = {
  initialContent: SiteContent;
  initialRevision: number;
  publishedRevision: number;
  user: DashboardUser;
  configured: boolean;
};

type PathPart = string | number;
type ContentValue = unknown;
type Notice = { tone: "success" | "error" | "info"; message: string };
type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  visibility: string;
  createdAt: string;
};
type InboxMessage = {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
};
type RevisionItem = {
  id: string;
  revision: number;
  kind: string;
  createdAt: string;
};

export const sectionLabels: Record<string, string> = {
  profile: "Profile",
  assets: "Assets",
  identity: "Identity",
  experience: "Experience",
  education: "Education",
  training: "Training",
  principles: "Principles",
  journey: "Journey",
  processSteps: "Process steps",
  navigation: "Navigation",
  skillGroups: "Skill groups",
  marqueeRows: "Marquee rows",
  copy: "Site copy",
  seo: "Search appearance",
};

const emptyFor = (value: unknown): unknown => {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, emptyFor(child)]),
    );
  }
  return "";
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function setAt(
  root: ContentValue,
  path: PathPart[],
  value: ContentValue,
): ContentValue {
  const next = clone(root);
  if (path.length === 0) return value;
  let cursor = next as Record<string | number, ContentValue>;
  path.slice(0, -1).forEach((part) => {
    const current = cursor[part];
    cursor[part] = Array.isArray(current)
      ? [...current]
      : { ...(current as Record<string, ContentValue>) };
    cursor = cursor[part] as Record<string | number, ContentValue>;
  });
  cursor[path[path.length - 1]] = value;
  return next;
}

function fieldTitle(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isLongText(key: string, value: string) {
  return (
    value.length > 120 ||
    [
      "body",
      "description",
      "summary",
      "detail",
      "intro",
      "headline",
      "code",
      "text",
      "note",
      "meaning",
    ].some((hint) => key.toLowerCase().includes(hint))
  );
}

function isUrlKey(key: string) {
  return /url|src|image|asset|href|ogImage/i.test(key);
}

export function formatBytes(size: number) {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value?: string) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
}

function formatDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function arrayTemplateForPath(path: PathPart[], sample: unknown): unknown {
  if (path.length === 1) {
    const templates: Record<string, unknown> = {
      experience: {
        role: "",
        organization: "",
        location: "",
        period: "",
        points: [""],
        stack: [],
      },
      training: { provider: "", items: [""] },
      principles: { title: "", body: "", icon: "" },
      journey: {
        id: "",
        index: "",
        kanji: "",
        reading: "",
        meaning: "",
        period: "",
        title: "",
        body: "",
        facts: [{ label: "", value: "" }],
      },
      processSteps: {
        id: "",
        index: "",
        title: "",
        kanji: "",
        summary: "",
        detail: "",
        outputs: [""],
      },
      navigation: { href: "", label: "" },
      skillGroups: { name: "", skills: [""] },
      marqueeRows: { label: "", caption: "", direction: "left", items: [""] },
    };
    if (path[0] in templates) return clone(templates[path[0] as string]);
  }

  const leaf = path[path.length - 1];
  if (
    path[0] === "identity" &&
    path[1] === "statement" &&
    (leaf === "a" || leaf === "b")
  ) {
    return { text: "", accent: "" };
  }
  if (path[0] === "journey" && leaf === "facts") {
    return { label: "", value: "" };
  }
  if (
    leaf === "domains" ||
    leaf === "highlights" ||
    leaf === "stack" ||
    leaf === "sources" ||
    leaf === "points" ||
    leaf === "items" ||
    leaf === "skills" ||
    leaf === "outputs"
  ) {
    return [""];
  }
  return clone(sample === undefined ? "" : emptyFor(sample));
}

function isFixedIdentityBlocks(path: PathPart[]) {
  return path.length === 2 && path[0] === "identity" && path[1] === "blocks";
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-sky";
export const buttonSecondary = `${buttonBase} h-10 px-4 text-[13px] border border-white/15 bg-white/[0.04] text-snow hover:border-sky/60 hover:text-sky`;
export const buttonPrimary = `${buttonBase} h-10 px-5 text-[13px] bg-snow text-night hover:bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]`;
export const buttonDanger = `${buttonBase} h-10 px-4 text-[13px] border border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/20`;
export const buttonAccent = `${buttonBase} h-10 px-5 text-[13px] bg-sky text-night hover:bg-[#7cc9ff] shadow-[0_8px_24px_-12px_rgba(77,182,255,0.3)]`;
export const fieldClass =
  "w-full rounded-xl border border-white/10 bg-night-3 px-4 py-2.5 text-[14px] text-snow outline-none transition-colors placeholder:text-mist/50 focus:border-sky focus:ring-1 focus:ring-sky/40";

export function NotchedPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cx(
        darkCard, "p-6 sm:p-8 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "sky";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider",
        tone === "success" &&
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
        tone === "warning" &&
          "border-amber-500/25 bg-amber-500/10 text-amber-300",
        tone === "danger" &&
          "border-red-500/25 bg-red-500/10 text-red-300",
        tone === "sky" &&
          "border-sky/25 bg-sky/10 text-sky",
        tone === "neutral" && "border-white/10 bg-white/[0.04] text-mist",
      )}
    >
      {tone === "success" && (
        <span className="size-1.5 rounded-full bg-emerald-400" />
      )}
      {tone === "warning" && (
        <span className="size-1.5 rounded-full bg-amber-400" />
      )}
      {tone === "danger" && (
        <span className="size-1.5 rounded-full bg-red-400" />
      )}
      {tone === "sky" && (
        <span className="size-1.5 rounded-full bg-sky" />
      )}
      <span>{children}</span>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-sky" />
          <span>{eyebrow ?? "Content"}</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-snow">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function FieldHelp({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs leading-relaxed text-mist">{children}</p>
  );
}

function TextField({
  label,
  value,
  onChange,
  help,
  multiline,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: React.ReactNode;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={cx(labelClass, "mb-2 block text-mist")}>
        {label}
      </span>
      {multiline ? (
        <textarea
          className={cx(fieldClass, "min-h-28 resize-y leading-relaxed")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={fieldClass}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
      {help && <FieldHelp>{help}</FieldHelp>}
    </label>
  );
}

function BooleanField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  help?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-night-3 p-4 transition-colors hover:border-white/20">
      <input
        className="mt-1 size-4 accent-sky rounded"
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-xs font-semibold text-snow">
          {label}
        </span>
        {help && <FieldHelp>{help}</FieldHelp>}
      </span>
    </label>
  );
}

function ArrayEditor({
  value,
  path,
  label,
  update,
  depth = 0,
  template,
}: {
  value: unknown[];
  path: PathPart[];
  label: string;
  update: (path: PathPart[], value: unknown) => void;
  depth?: number;
  template?: unknown;
}) {
  const sample = value[0];
  const fixedShape = isFixedIdentityBlocks(path);
  return (
    <div
      className={cx(
        "space-y-3",
        depth > 0 && "rounded-lg border border-white/8 bg-black/10 p-3",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-snow">
            {label}
          </h4>
          <FieldHelp>
            {fixedShape
              ? "Exactly two blocks are required by the public layout; edit or reorder them here."
              : `${value.length} ${value.length === 1 ? "item" : "items"}. Reorder with the arrows.`}
          </FieldHelp>
        </div>
        {!fixedShape && (
          <button
            type="button"
            className={buttonSecondary}
            onClick={() =>
              update(path, [
                ...value,
                clone(template ?? arrayTemplateForPath(path, sample)),
              ])
            }
          >
            <Plus className="size-3.5" /> Add
          </button>
        )}
      </div>
      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/10 px-4 py-5 text-center text-xs text-mist">
          {fixedShape
            ? "This layout requires exactly two blocks; the current value cannot be edited until it is restored to that shape."
            : "No items yet. Add the first one to start editing."}
        </div>
      )}
      {value.map((item, index) => (
        <div
          key={`${label}-${index}`}
          className="rounded-2xl border border-white/10 bg-night-3 p-4 sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-mist">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`Move ${label} item up`}
                className="rounded-md p-1.5 text-mist hover:bg-white/8 hover:text-white disabled:opacity-25"
                disabled={index === 0}
                onClick={() => update(path, moveItem(value, index, -1))}
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Move ${label} item down`}
                className="rounded-md p-1.5 text-mist hover:bg-white/8 hover:text-white disabled:opacity-25"
                disabled={index === value.length - 1}
                onClick={() => update(path, moveItem(value, index, 1))}
              >
                <ArrowDown className="size-3.5" />
              </button>
              {!fixedShape && (
                <button
                  type="button"
                  aria-label={`Delete ${label} item`}
                  className="rounded-md p-1.5 text-mist hover:bg-white/8 hover:text-white"
                  onClick={() =>
                    update(
                      path,
                      value.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          <StructuredValue
            value={item}
            path={[...path, index]}
            label={`${label} ${index + 1}`}
            update={update}
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  );
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function StructuredValue({
  value,
  path,
  label,
  update,
  depth = 0,
}: {
  value: unknown;
  path: PathPart[];
  label: string;
  update: (path: PathPart[], value: unknown) => void;
  depth?: number;
}) {
  if (Array.isArray(value))
    return (
      <ArrayEditor
        value={value}
        path={path}
        label={label}
        update={update}
        depth={depth}
      />
    );
  if (value && typeof value === "object") {
    return (
      <div
        className={cx(
          "grid gap-4",
          depth === 0 ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {Object.entries(value as Record<string, unknown>).map(
          ([key, child]) => (
            <div
              key={key}
              className={cx(
                depth === 0 &&
                  child &&
                  typeof child === "object" &&
                  !Array.isArray(child)
                  ? "sm:col-span-2"
                  : undefined,
              )}
            >
              <StructuredValue
                value={child}
                path={[...path, key]}
                label={fieldTitle(key)}
                update={update}
                depth={depth + 1}
              />
            </div>
          ),
        )}
      </div>
    );
  }
  if (typeof value === "boolean")
    return (
      <BooleanField
        label={label}
        value={value}
        onChange={(next) => update(path, next)}
      />
    );
  if (typeof value === "number")
    return (
      <TextField
        label={label}
        type="number"
        value={String(value)}
        onChange={(next) => update(path, Number(next))}
      />
    );
  const stringValue = value == null ? "" : String(value);
  return (
    <TextField
      label={label}
      value={stringValue}
      onChange={(next) => update(path, next)}
      multiline={isLongText(label, stringValue)}
      help={
        isUrlKey(label) ? "Use a site-relative path or HTTPS URL." : undefined
      }
    />
  );
}

function OptionalFieldCard({
  title,
  description,
  present,
  onAdd,
  onRemove,
  children,
}: {
  title: string;
  description: string;
  present: boolean;
  onAdd: () => void;
  onRemove: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-night-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-snow">
            {title}
          </h4>
          <FieldHelp>{description}</FieldHelp>
        </div>
        {present ? (
          <button type="button" className={buttonDanger} onClick={onRemove}>
            <Trash2 className="size-3.5" /> Remove
          </button>
        ) : (
          <button type="button" className={buttonSecondary} onClick={onAdd}>
            <Plus className="size-3.5" /> Add {title}
          </button>
        )}
      </div>
      {present && <div className="mt-4">{children}</div>}
    </div>
  );
}

function ProjectOptionalFields({
  project,
  update,
}: {
  project: SiteProject;
  update: (patch: Partial<SiteProject>) => void;
}) {
  const updateNested = (
    key: "live" | "repo" | "image" | "features" | "architecture",
    value: unknown,
  ) => update({ [key]: value } as Partial<SiteProject>);
  return (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
          Optional project fields
        </div>
        <FieldHelp>
          Add only the fields this case study needs. Empty inputs are
          intentionally visible so validation points to the exact field that
          still needs content before Save.
        </FieldHelp>
      </div>
      <OptionalFieldCard
        title="Live link"
        description="Optional public link for the project."
        present={Boolean(project.live)}
        onAdd={() => updateNested("live", { url: "", label: "", note: "" })}
        onRemove={() => updateNested("live", undefined)}
      >
        {project.live && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="URL"
              value={project.live.url}
              onChange={(value) =>
                updateNested("live", { ...project.live, url: value })
              }
              help="Use a site-relative path or HTTPS URL."
            />
            <TextField
              label="Label"
              value={project.live.label}
              onChange={(value) =>
                updateNested("live", { ...project.live, label: value })
              }
            />
            <div className="sm:col-span-2">
              <TextField
                label="Note"
                value={project.live.note ?? ""}
                onChange={(value) =>
                  updateNested("live", {
                    ...project.live,
                    note: value || undefined,
                  })
                }
                multiline
              />
            </div>
          </div>
        )}
      </OptionalFieldCard>
      <OptionalFieldCard
        title="Repository link"
        description="Optional source repository link for the project."
        present={Boolean(project.repo)}
        onAdd={() => updateNested("repo", { url: "", label: "", note: "" })}
        onRemove={() => updateNested("repo", undefined)}
      >
        {project.repo && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="URL"
              value={project.repo.url}
              onChange={(value) =>
                updateNested("repo", { ...project.repo, url: value })
              }
              help="Use a site-relative path or HTTPS URL."
            />
            <TextField
              label="Label"
              value={project.repo.label}
              onChange={(value) =>
                updateNested("repo", { ...project.repo, label: value })
              }
            />
            <div className="sm:col-span-2">
              <TextField
                label="Note"
                value={project.repo.note ?? ""}
                onChange={(value) =>
                  updateNested("repo", {
                    ...project.repo,
                    note: value || undefined,
                  })
                }
                multiline
              />
            </div>
          </div>
        )}
      </OptionalFieldCard>
      <OptionalFieldCard
        title="Image"
        description="Optional hero or case-study image."
        present={Boolean(project.image)}
        onAdd={() => updateNested("image", { src: "", alt: "", caption: "" })}
        onRemove={() => updateNested("image", undefined)}
      >
        {project.image && (
          <div className="grid gap-3">
            <TextField
              label="Source"
              value={project.image.src}
              onChange={(value) =>
                updateNested("image", { ...project.image, src: value })
              }
              help="Use a site-relative path or HTTPS URL."
            />
            <TextField
              label="Alt text"
              value={project.image.alt}
              onChange={(value) =>
                updateNested("image", { ...project.image, alt: value })
              }
            />
            <TextField
              label="Caption"
              value={project.image.caption}
              onChange={(value) =>
                updateNested("image", { ...project.image, caption: value })
              }
              multiline
            />
          </div>
        )}
      </OptionalFieldCard>
      <OptionalFieldCard
        title="Features"
        description="Optional grouped feature lists."
        present={Boolean(project.features)}
        onAdd={() => updateNested("features", [{ title: "", items: [""] }])}
        onRemove={() => updateNested("features", undefined)}
      >
        {project.features && (
          <ArrayEditor
            value={project.features}
            path={["projects", 0, "features"]}
            label="Feature groups"
            update={(_, value) =>
              updateNested("features", value as SiteProject["features"])
            }
            template={{ title: "", items: [""] }}
          />
        )}
      </OptionalFieldCard>
      <OptionalFieldCard
        title="Architecture"
        description="Optional implementation steps and an explanatory note."
        present={Boolean(project.architecture)}
        onAdd={() =>
          updateNested("architecture", {
            steps: [{ name: "", detail: "" }],
            note: "",
          })
        }
        onRemove={() => updateNested("architecture", undefined)}
      >
        {project.architecture && (
          <div className="space-y-4">
            <ArrayEditor
              value={project.architecture.steps}
              path={["projects", 0, "architecture", "steps"]}
              label="Architecture steps"
              update={(_, value) =>
                updateNested("architecture", {
                  ...project.architecture,
                  steps: value as typeof project.architecture.steps,
                })
              }
              template={{ name: "", detail: "" }}
            />
            <TextField
              label="Architecture note"
              value={project.architecture.note}
              onChange={(value) =>
                updateNested("architecture", {
                  ...project.architecture,
                  note: value,
                })
              }
              multiline
            />
          </div>
        )}
      </OptionalFieldCard>
    </div>
  );
}

function moveArrayItem<T>(items: T[], index: number, direction: -1 | 1) {
  return moveItem(items, index, direction);
}

export function EditorSection({
  title,
  description,
  value,
  path,
  update,
}: {
  title: string;
  description?: string;
  value: unknown;
  path: PathPart[];
  update: (path: PathPart[], value: unknown) => void;
}) {
  return (
    <NotchedPanel className="p-5 sm:p-7">
      <SectionHeading title={title} description={description} />
      <StructuredValue
        value={value}
        path={path}
        label={title}
        update={update}
      />
    </NotchedPanel>
  );
}

export function ProjectEditor({
  projects,
  update,
  onDelete,
}: {
  projects: SiteProject[];
  update: (value: SiteProject[]) => void;
  onDelete: (index: number) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(0);
  const filtered = projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) =>
      `${project.title} ${project.category} ${project.slug}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  const active =
    filtered.find(({ index }) => index === selected)?.index ??
    filtered[0]?.index ??
    0;
  const project = projects[active];
  const setProject = (patch: Partial<SiteProject>) =>
    update(
      projects.map((item, index) =>
        index === active ? { ...item, ...patch } : item,
      ),
    );
  const updateProjectAt = (path: PathPart[], value: unknown) => {
    const relativePath = path.slice(2);
    const next = clone(projects);
    next[active] = setAt(next[active], relativePath, value) as SiteProject;
    update(next);
  };
  const addProject = () => {
    const next = {
      ...(emptyFor(
        projects[0] ?? {
          id: "",
          slug: "",
          title: "",
          category: "",
          domains: [],
          kanji: "",
          kanjiMeaning: "",
          summary: "",
          description: "",
          highlights: [],
          stack: [],
          featured: false,
          status: "draft",
          sources: [],
        },
      ) as SiteProject),
      id: `project-${projects.length + 1}`,
      slug: `new-project-${projects.length + 1}`,
      title: "New project",
      status: "draft",
      featured: false,
      domains: [],
      highlights: [],
      stack: [],
      sources: [],
    } as SiteProject;
    update([...projects, next]);
    setSelected(projects.length);
  };
  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <NotchedPanel className="h-fit p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
              Collection
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              Projects{" "}
              <span className="text-sm text-mist">{projects.length}</span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-sky/20 bg-sky/10 p-2 text-sky-200 hover:bg-sky/20"
            onClick={addProject}
            aria-label="Add project"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <label className="relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-mist" />
          <input
            className={cx(fieldClass, "pl-9 text-xs")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
          />
        </label>
        <div className="space-y-1">
          {filtered.map(({ project: item, index }) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setSelected(index)}
              className={cx(
                "w-full rounded-lg border px-3 py-3 text-left transition",
                active === index
                  ? "border-sky/35 bg-sky/[0.09]"
                  : "border-transparent hover:border-white/8 hover:bg-white/[0.03]",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-snow">
                  {item.title}
                </span>
                <StatusPill
                  tone={item.status === "published" ? "success" : "warning"}
                >
                  {item.status}
                </StatusPill>
              </span>
              <span className="mt-1 block truncate text-[11px] text-mist">
                /{item.slug}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-5 text-center text-xs text-mist">
              No projects match.
            </p>
          )}
        </div>
      </NotchedPanel>
      {project ? (
        <NotchedPanel className="p-5 sm:p-7">
          <SectionHeading
            eyebrow="Project editor"
            title={project.title || "Untitled project"}
            description="Edit the structured case-study content. Status changes are saved as drafts until you explicitly publish the current revision."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  tone={project.status === "published" ? "success" : "warning"}
                >
                  {project.status}
                </StatusPill>
                <a
                  className={buttonSecondary}
                  href={`/dashboard/preview/project/${project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3.5" /> Preview saved draft
                </a>
                <button
                  type="button"
                  className={buttonDanger}
                  onClick={() => onDelete(active)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            }
          />
          <FieldHelp>
            Preview is owner-only and reads the saved draft. Save first to
            include your latest edits.
          </FieldHelp>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              value={project.title}
              onChange={(value) => setProject({ title: value })}
            />
            <TextField
              label="Slug"
              value={project.slug}
              onChange={(value) => setProject({ slug: value })}
              help="Lowercase kebab-case; used in public URLs."
            />
            <TextField
              label="Category"
              value={project.category}
              onChange={(value) => setProject({ category: value })}
            />
            <TextField
              label="Kanji"
              value={project.kanji}
              onChange={(value) => setProject({ kanji: value })}
            />
            <div className="sm:col-span-2">
              <TextField
                label="Summary"
                value={project.summary}
                onChange={(value) => setProject({ summary: value })}
                multiline
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="Description"
                value={project.description}
                onChange={(value) => setProject({ description: value })}
                multiline
              />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <BooleanField
              label="Featured project"
              value={project.featured}
              onChange={(value) => setProject({ featured: value })}
              help="Controls featured placements on the public home page."
            />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">
                Visibility status
              </span>
              <select
                className={fieldClass}
                value={project.status}
                onChange={(event) =>
                  setProject({
                    status: event.target.value as SiteProject["status"],
                  })
                }
              >
                <option value="draft">Draft keep private</option>
                <option value="published">
                  Published visible after publish
                </option>
              </select>
              <FieldHelp>
                Saving does not publish. Use Publish for the public effect.
              </FieldHelp>
            </label>
          </div>
          <div className="mt-7 border-t border-white/[0.08] pt-6">
            <StructuredValue
              value={{
                domains: project.domains,
                kanjiMeaning: project.kanjiMeaning,
                highlights: project.highlights,
                stack: project.stack,
                sources: project.sources,
                availability: project.availability,
              }}
              path={["projects", active]}
              label="Project details"
              update={updateProjectAt}
            />
            <div className="mt-6">
              <ProjectOptionalFields project={project} update={setProject} />
            </div>
          </div>
        </NotchedPanel>
      ) : (
        <NotchedPanel className="p-7">
          <p className="text-sm text-mist">Select a project to edit.</p>
        </NotchedPanel>
      )}
    </div>
  );
}

export function BlogEditor({
  posts,
  update,
  onDelete,
}: {
  posts: SiteContent["posts"];
  update: (value: SiteContent["posts"]) => void;
  onDelete: (index: number) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(0);
  const filtered = posts
    .map((post, index) => ({ post, index }))
    .filter(({ post }) =>
      `${post.title} ${post.slug} ${post.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  const active =
    filtered.find(({ index }) => index === selected)?.index ??
    filtered[0]?.index ??
    0;
  const post = posts[active];
  const setPost = (patch: Partial<(typeof posts)[number]>) =>
    update(
      posts.map((item, index) =>
        index === active ? { ...item, ...patch } : item,
      ),
    );
  const addPost = () => {
    const now = new Date().toISOString();
    const next = {
      slug: `new-post-${posts.length + 1}`,
      title: "New article",
      description: "",
      status: "draft",
      origin: "author",
      reviewRequired: false,
      updatedAt: now,
      readingMinutes: 1,
      tags: ["draft"],
      body: [{ type: "p", text: "Start writing here." }],
    } as (typeof posts)[number];
    update([...posts, next]);
    setSelected(posts.length);
  };
  const updateBlock = (index: number, block: BlogBlock) =>
    setPost({
      body: post.body.map((item, itemIndex) =>
        itemIndex === index ? block : item,
      ),
    });
  const addBlock = (type: BlogBlock["type"]) => {
    const block =
      type === "list"
        ? { type, items: ["New list item"], ordered: false }
        : type === "code"
          ? { type, language: "tsx", code: "" }
          : { type, text: "" };
    setPost({ body: [...post.body, block as BlogBlock] });
  };
  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <NotchedPanel className="h-fit p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
              Collection
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              Articles{" "}
              <span className="text-sm text-mist">{posts.length}</span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-sky/20 bg-sky/10 p-2 text-sky-200 hover:bg-sky/20"
            onClick={addPost}
            aria-label="Add article"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <label className="relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-mist" />
          <input
            className={cx(fieldClass, "pl-9 text-xs")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
          />
        </label>
        <div className="space-y-1">
          {filtered.map(({ post: item, index }) => (
            <button
              type="button"
              key={item.slug}
              onClick={() => setSelected(index)}
              className={cx(
                "w-full rounded-lg border px-3 py-3 text-left transition",
                active === index
                  ? "border-sky/35 bg-sky/[0.09]"
                  : "border-transparent hover:border-white/8 hover:bg-white/[0.03]",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-snow">
                  {item.title}
                </span>
                <StatusPill
                  tone={item.status === "published" ? "success" : "warning"}
                >
                  {item.status}
                </StatusPill>
              </span>
              <span className="mt-1 block truncate text-[11px] text-mist">
                /{item.slug}
              </span>
              {item.origin === "initial-draft" && (
                <span className="mt-2 block text-[10px] uppercase tracking-wider text-amber-200">
                  Initial draft{item.reviewRequired ? " · needs review" : ""}
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-5 text-center text-xs text-mist">
              No articles match.
            </p>
          )}
        </div>
      </NotchedPanel>
      {post ? (
        <NotchedPanel className="p-5 sm:p-7">
          <SectionHeading
            eyebrow="Article editor"
            title={post.title || "Untitled article"}
            description="Compose article metadata and ordered blocks. Draft status keeps a post private until a separate publish action."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  tone={post.status === "published" ? "success" : "warning"}
                >
                  {post.status}
                </StatusPill>
                <a
                  className={buttonSecondary}
                  href={`/dashboard/preview/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3.5" /> Preview saved draft
                </a>
                <button
                  type="button"
                  className={buttonDanger}
                  onClick={() => onDelete(active)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            }
          />
          <FieldHelp>
            Preview is owner-only and reads the saved draft. Save first to
            include your latest edits.
          </FieldHelp>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {post.origin === "initial-draft" && (
              <StatusPill tone="warning">
                Initial draft{post.reviewRequired ? " needs review" : ""}
              </StatusPill>
            )}
            <button
              type="button"
              className={buttonSecondary}
              disabled={active === 0}
              onClick={() => {
                update(moveArrayItem(posts, active, -1));
                setSelected(active - 1);
              }}
            >
              <ArrowUp className="size-3.5" /> Move article up
            </button>
            <button
              type="button"
              className={buttonSecondary}
              disabled={active === posts.length - 1}
              onClick={() => {
                update(moveArrayItem(posts, active, 1));
                setSelected(active + 1);
              }}
            >
              <ArrowDown className="size-3.5" /> Move article down
            </button>
            <span className="text-xs text-mist">
              Modified {formatDate(post.updatedAt)} · stamped automatically on
              save
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Title"
              value={post.title}
              onChange={(value) => setPost({ title: value })}
            />
            <TextField
              label="Slug"
              value={post.slug}
              onChange={(value) => setPost({ slug: value })}
              help="Lowercase kebab-case; used in public URLs."
            />
            <div className="sm:col-span-2">
              <TextField
                label="Description"
                value={post.description}
                onChange={(value) => setPost({ description: value })}
                multiline
              />
            </div>
            <TextField
              label="Reading minutes"
              type="number"
              value={String(post.readingMinutes)}
              onChange={(value) =>
                setPost({ readingMinutes: Number(value) || 1 })
              }
            />
            <TextField
              label="Published at (local time)"
              type="datetime-local"
              value={formatDateTimeLocal(post.publishedAt)}
              onChange={(value) =>
                setPost({
                  publishedAt: value
                    ? new Date(value).toISOString()
                    : undefined,
                })
              }
              help="Required when status is published. Displayed in your browser's local timezone and saved as an ISO timestamp."
            />
            <TextField
              label="Tags"
              value={post.tags.join(", ")}
              onChange={(value) =>
                setPost({
                  tags: value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
            />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">
                Visibility status
              </span>
              <select
                className={fieldClass}
                value={post.status}
                onChange={(event) =>
                  setPost({
                    status: event.target.value as (typeof post)["status"],
                  })
                }
              >
                <option value="draft">Draft keep private</option>
                <option value="published">
                  Published visible after publish
                </option>
              </select>
            </label>
            <BooleanField
              label="Review required"
              value={post.reviewRequired}
              onChange={(value) => setPost({ reviewRequired: value })}
            />
          </div>
          <div className="mt-7 border-t border-white/[0.08] pt-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                  Structured article
                </div>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Body blocks
                </h3>
                <FieldHelp>
                  Add, reorder, and edit each block without touching raw JSON.
                </FieldHelp>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["p", "h2", "h3", "quote", "list", "code"] as const).map(
                  (type) => (
                    <button
                      type="button"
                      key={type}
                      className={buttonSecondary}
                      onClick={() => addBlock(type)}
                    >
                      <Plus className="size-3" /> {type}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="space-y-3">
              {post.body.map((block, index) => (
                <div
                  key={`${block.type}-${index}`}
                  className="rounded-2xl border border-white/10 bg-night-3 p-4 sm:p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <StatusPill>{block.type}</StatusPill>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-mist hover:text-white disabled:opacity-25"
                        disabled={index === 0}
                        onClick={() =>
                          setPost({ body: moveArrayItem(post.body, index, -1) })
                        }
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-mist hover:text-white disabled:opacity-25"
                        disabled={index === post.body.length - 1}
                        onClick={() =>
                          setPost({ body: moveArrayItem(post.body, index, 1) })
                        }
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-mist hover:text-red-200"
                        onClick={() =>
                          setPost({
                            body: post.body.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          })
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  {block.type === "list" ? (
                    <div className="space-y-3">
                      <BooleanField
                        label="Ordered list"
                        value={Boolean(block.ordered)}
                        onChange={(value) =>
                          updateBlock(index, { ...block, ordered: value })
                        }
                      />
                      <ArrayEditor
                        value={block.items}
                        path={["body", index, "items"]}
                        label="List items"
                        update={(_, value) =>
                          updateBlock(index, {
                            ...block,
                            items: value as string[],
                          })
                        }
                      />
                    </div>
                  ) : block.type === "code" ? (
                    <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                      <TextField
                        label="Language"
                        value={block.language}
                        onChange={(value) =>
                          updateBlock(index, { ...block, language: value })
                        }
                      />
                      <TextField
                        label="Code"
                        value={block.code}
                        onChange={(value) =>
                          updateBlock(index, { ...block, code: value })
                        }
                        multiline
                      />
                    </div>
                  ) : (
                    <TextField
                      label={`${block.type} text`}
                      value={block.text}
                      onChange={(value) =>
                        updateBlock(index, { ...block, text: value })
                      }
                      multiline
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </NotchedPanel>
      ) : (
        <NotchedPanel className="p-7">
          <p className="text-sm text-mist">Select an article to edit.</p>
        </NotchedPanel>
      )}
    </div>
  );
}

export function MediaPanel({ onUse }: { onUse: (url: string) => void }) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload?.message ?? `Could not load media (${response.status})`,
        );
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load media.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload?.message ?? `Upload failed (${response.status})`,
        );
      if (payload.item) setItems((current) => [payload.item, ...current]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const remove = async (item: MediaItem) => {
    if (
      !window.confirm(
        `Delete “${item.name}” from the media library? This cannot be undone.`,
      )
    )
      return;
    setDeleting(item.id);
    setError(null);
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const payload = await response.json().catch(() => null);
      if (response.status === 409) {
        setError(
          payload?.message ??
          "This media item is still in use. Nothing was deleted.",
        );
        return;
      }
      if (!response.ok)
        throw new Error(
          payload?.message ?? `Could not delete media (${response.status})`,
        );
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not delete media. The server did not confirm deletion.",
      );
    } finally {
      setDeleting(null);
    }
  };
  return (
    <NotchedPanel className="p-5 sm:p-7">
      <SectionHeading
        title="Media library"
        description="Upload images through the admin endpoint, preview the real stored asset, and copy its stable URL into a content field."
        action={
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <button
              type="button"
              className={buttonPrimary}
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <RefreshCcw className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}{" "}
              {uploading ? "Uploading" : "Upload image"}
            </button>
          </>
        }
      />
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-300/20 bg-red-400/[0.08] p-3 text-sm text-red-100">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />{" "}
          <span>{error}</span>
        </div>
      )}
      {loading ? (
        <p className="text-sm text-mist">Loading media library…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
          <FileImage className="mx-auto mb-3 size-8 text-mist" />
          <p className="text-sm text-mist">No uploaded media yet.</p>
          <p className="mt-1 text-xs text-mist">
            Nothing is fabricated here; upload an image to see it appear.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-white/8 bg-night-3/75"
            >
              <div className="aspect-[4/3] bg-night">
                {item.type.startsWith("image/") ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={640}
                    height={480}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <FileImage className="size-8 text-mist" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-medium text-snow">
                  {item.name}
                </div>
                <div className="mt-1 text-[11px] text-mist">
                  {formatBytes(item.size)} · {formatDate(item.createdAt)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={cx(buttonSecondary, "flex-1")}
                    onClick={() => onUse(item.url)}
                  >
                    <Check className="size-3.5" /> Use URL
                  </button>
                  <a
                    className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3 text-mist hover:text-white"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${item.name}`}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                  <button
                    type="button"
                    className={cx(buttonDanger, "w-full")}
                    disabled={deleting === item.id}
                    onClick={() => void remove(item)}
                  >
                    {deleting === item.id ? (
                      <RefreshCcw className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}{" "}
                    {deleting === item.id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </NotchedPanel>
  );
}

export function InboxPanel() {
  const [messages, setMessages] = React.useState<InboxMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/messages", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload?.message ?? `Could not load inbox (${response.status})`,
        );
      setMessages(Array.isArray(payload.items) ? payload.items : []);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load inbox.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const patch = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload?.message ?? "Could not update message.");
      setMessages((current) =>
        current.map((message) =>
          message.id === id
            ? { ...message, ...(payload.item ?? { status }) }
            : message,
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update message.",
      );
    }
  };
  const remove = async (id: string) => {
    if (
      !window.confirm("Delete this message permanently? This cannot be undone.")
    )
      return;
    try {
      const response = await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload?.message ?? "Could not delete message.");
      setMessages((current) => current.filter((message) => message.id !== id));
      setSelected(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not delete message.",
      );
    }
  };
  const active = messages.find((message) => message.id === selected);
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <NotchedPanel className="p-5 sm:p-7">
        <SectionHeading
          title="Inbox"
          description="Messages are loaded from the admin endpoint. Empty means empty; no sample messages are inserted."
          action={
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => void load()}
            >
              <RefreshCcw className="size-3.5" /> Refresh
            </button>
          }
        />
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-300/20 bg-red-400/[0.08] p-3 text-sm text-red-100">
            <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </div>
        )}
        {loading ? (
          <p className="text-sm text-mist">Loading inbox…</p>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
            <MessageSquare className="mx-auto mb-3 size-8 text-mist" />
            <p className="text-sm text-mist">No messages.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <button
                type="button"
                key={message.id}
                onClick={() => setSelected(message.id)}
                className={cx(
                  "w-full rounded-xl border p-4 text-left transition",
                  selected === message.id
                    ? "border-sky/35 bg-sky/[0.08]"
                    : "border-white/8 bg-night-3/75 hover:border-white/15",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-snow">
                      {message.subject || "No subject"}
                    </div>
                    <div className="mt-1 truncate text-xs text-mist">
                      {message.name || "Unknown sender"}{" "}
                      {message.email ? `· ${message.email}` : ""}
                    </div>
                  </div>
                  <StatusPill
                    tone={message.status === "read" ? "success" : "warning"}
                  >
                    {message.status || "new"}
                  </StatusPill>
                </div>
                <div className="mt-3 truncate text-xs text-mist">
                  {message.message || "No message body"}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-mist">
                  {formatDate(message.createdAt)}
                </div>
              </button>
            ))}
          </div>
        )}
      </NotchedPanel>
      {active ? (
        <NotchedPanel className="h-fit p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                Message
              </div>
              <h3 className="mt-1 text-xl font-semibold text-white">
                {active.subject || "No subject"}
              </h3>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-mist hover:bg-white/8 hover:text-white"
              onClick={() => setSelected(null)}
            >
              <X className="size-4" />
            </button>
          </div>
          <dl className="space-y-3 border-b border-white/[0.08] pb-5 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-mist">
                From
              </dt>
              <dd className="mt-1 text-snow">
                {active.name || "Unknown"}
                {active.email ? ` · ${active.email}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-mist">
                Received
              </dt>
              <dd className="mt-1 text-snow">
                {formatDate(active.createdAt)}
              </dd>
            </div>
          </dl>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-snow">
            {active.message || "No message body"}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                void patch(active.id, active.status === "read" ? "new" : "read")
              }
            >
              <Check className="size-3.5" /> Mark{" "}
              {active.status === "read" ? "unread" : "read"}
            </button>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                void patch(
                  active.id,
                  active.status === "archived" ? "new" : "archived",
                )
              }
            >
              {active.status === "archived" ? "Restore to inbox" : "Archive"}
            </button>
            <button
              type="button"
              className={buttonDanger}
              onClick={() => void remove(active.id)}
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        </NotchedPanel>
      ) : (
        <NotchedPanel className="flex min-h-72 items-center justify-center p-7">
          <div className="text-center">
            <MessageSquare className="mx-auto mb-3 size-8 text-mist" />
            <p className="text-sm text-mist">
              Select a message to read it.
            </p>
          </div>
        </NotchedPanel>
      )}
    </div>
  );
}

export function DashboardWorkspace({
  initialContent,
  initialRevision,
  publishedRevision,
  user,
  configured,
}: DashboardWorkspaceProps) {
  return (
    <DashboardProvider
      initialContent={initialContent}
      initialRevision={initialRevision}
      publishedRevision={publishedRevision}
      user={user}
      configured={configured}
    >
      <DashboardShell>
        <OverviewControlCenter />
      </DashboardShell>
    </DashboardProvider>
  );
}

export function SettingsPanel({
  configured,
  revision,
  publishedRevision,
  savedContent,
  onRestore,
  onNotice,
}: {
  configured: boolean;
  revision: number;
  publishedRevision: number;
  savedContent: SiteContent;
  onRestore: (
    content: SiteContent,
    revision: number,
    publishedRevision: number,
  ) => void;
  onNotice: (notice: Notice) => void;
}) {
  const [items, setItems] = React.useState<RevisionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [restoring, setRestoring] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/revisions", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload?.message ?? `Could not load revisions (${response.status})`,
        );
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load revisions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(savedContent, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `site-content-revision-${revision}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const restore = async (item: RevisionItem) => {
    if (
      !window.confirm(
        `Restore revision ${item.revision} as the working draft? This will not publish it.`,
      )
    )
      return;
    setRestoring(item.id);
    setError(null);
    try {
      const response = await fetch("/api/admin/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, expectedRevision: revision }),
      });
      const payload = await response.json().catch(() => null);
      if (response.status === 409)
        throw new Error(
          payload?.message ??
          "The working revision changed. Nothing was restored.",
        );
      if (!response.ok || payload?.ok !== true || !payload.content)
        throw new Error(
          payload?.message ?? `Could not restore revision (${response.status})`,
        );
      onRestore(
        payload.content as SiteContent,
        Number(payload.revision),
        Number(payload.publishedRevision ?? publishedRevision),
      );
      onNotice({
        tone: "success",
        message: `Restored revision ${item.revision} as draft revision ${payload.revision}. It was not published.`,
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not restore revision. Nothing was published.",
      );
    } finally {
      setRestoring(null);
    }
  };
  const rows = [
    {
      label: "CMS service",
      value: configured ? "Ready" : "Not configured",
      tone: configured ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Working revision",
      value: String(revision),
      tone: "neutral" as const,
    },
    {
      label: "Published revision",
      value: String(publishedRevision),
      tone: "neutral" as const,
    },
    {
      label: "Authentication",
      value: "Server-controlled",
      tone: "success" as const,
    },
  ];
  return (
    <NotchedPanel className="p-5 sm:p-7">
      <SectionHeading
        title="Settings"
        description="Operational status is read-only here. Revisions can be inspected and restored as drafts; restoring never auto-publishes."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => void load()}
            >
              <RefreshCcw className="size-3.5" /> Refresh revisions
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={downloadBackup}
            >
              <DownloadIcon /> Download JSON backup
            </button>
          </div>
        }
      />
      <div className="max-w-2xl divide-y divide-white/[0.08] rounded-xl border border-white/8 bg-night-3/75">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-4"
          >
            <span className="text-sm text-mist">{row.label}</span>
            <StatusPill tone={row.tone}>{row.value}</StatusPill>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-300/20 bg-red-400/[0.08] p-3 text-sm text-red-100">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />{" "}
          <span>{error}</span>
        </div>
      )}
      <div className="mt-7">
        <div className="mb-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
            Revision history
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Restore a saved draft
          </h3>
          <FieldHelp>
            Restore replaces the working content after server-side revision
            checks. It does not publish.
          </FieldHelp>
        </div>
        {loading ? (
          <p className="text-sm text-mist">Loading revisions…</p>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-4 py-5 text-sm text-mist">
            No revisions returned by the CMS.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.025] px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-snow">
                    Revision {item.revision}{" "}
                    <StatusPill>{item.kind}</StatusPill>
                  </div>
                  <div className="mt-1 text-[11px] text-mist">
                    {formatDate(item.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className={buttonSecondary}
                  disabled={restoring === item.id || item.revision === revision}
                  onClick={() => void restore(item)}
                >
                  {restoring === item.id ? (
                    <RefreshCcw className="size-3.5 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-3.5" />
                  )}{" "}
                  {item.revision === revision ? "Current" : "Restore draft"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 rounded-lg border border-white/8 bg-white/[0.025] p-4 text-xs leading-6 text-mist">
        JSON backups contain the current saved SiteContent only. Secret values,
        authentication material, and unpublished server metadata are not
        included.
      </div>
    </NotchedPanel>
  );
}

function DownloadIcon() {
  return (
    <span aria-hidden="true" className="text-sm leading-none">
      ↓
    </span>
  );
}

export { fieldTitle };
