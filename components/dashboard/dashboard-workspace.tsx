"use client";
import * as React from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FileImage,
  FolderOpen,
  Gauge,
  Globe2,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  UserCircle,
  X,
} from "lucide-react";
import type { BlogBlock, SiteContent, SiteProject } from "@/lib/cms/schema";

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

type NavKey =
  | "overview"
  | "projects"
  | "blog"
  | "about"
  | "skills"
  | "home"
  | "media"
  | "inbox"
  | "seo"
  | "settings";

type NavItem = {
  key: NavKey;
  label: string;
  icon: LucideIcon;
  group: "workspace" | "content" | "system";
};

const navItems: NavItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    group: "workspace",
  },
  { key: "projects", label: "Projects", icon: FolderOpen, group: "content" },
  { key: "blog", label: "Blog", icon: BookOpen, group: "content" },
  { key: "about", label: "About", icon: UserCircle, group: "content" },
  { key: "skills", label: "Skills", icon: Sparkles, group: "content" },
  { key: "home", label: "Home", icon: Globe2, group: "content" },
  { key: "media", label: "Media", icon: ImagePlus, group: "content" },
  { key: "inbox", label: "Inbox", icon: Inbox, group: "workspace" },
  { key: "seo", label: "SEO", icon: Gauge, group: "system" },
  { key: "settings", label: "Settings", icon: Settings, group: "system" },
];

const sectionLabels: Record<string, string> = {
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

function formatBytes(size: number) {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string) {
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
  "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-45";
const buttonSecondary = `${buttonBase} border-white/10 bg-white/[0.035] text-slate-300 hover:border-sky-300/35 hover:bg-sky-300/[0.08] hover:text-sky-100`;
const buttonPrimary = `${buttonBase} border-sky-300/50 bg-sky-300 text-[#06101b] shadow-[0_0_22px_rgba(77,182,255,0.2)] hover:bg-sky-200`;
const buttonDanger = `${buttonBase} border-red-300/20 bg-red-400/[0.08] text-red-100 hover:bg-red-400/[0.14]`;
const fieldClass =
  "w-full rounded-lg border border-white/10 bg-[#091422]/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-300/60 focus:ring-2 focus:ring-sky-300/10";

function NotchedPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cx(
        "relative rounded-t-[24px] rounded-bl-[24px] border border-sky-200/[0.08] bg-[#0c1929]/90 shadow-[0_20px_80px_rgba(0,0,0,0.24)] [background-image:radial-gradient(ellipse_at_90%_0%,rgba(65,105,245,0.07),transparent_65%)] [mask-image:radial-gradient(circle_30px_at_100%_100%,transparent_0_27px,#000_28px)] [-webkit-mask-image:radial-gradient(circle_30px_at_100%_100%,transparent_0_27px,#000_28px)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]",
        tone === "success" &&
          "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
        tone === "warning" &&
          "border-amber-300/20 bg-amber-300/10 text-amber-100",
        tone === "danger" && "border-red-300/20 bg-red-300/10 text-red-100",
        tone === "neutral" && "border-white/10 bg-white/[0.04] text-slate-400",
      )}
    >
      {children}
    </span>
  );
}

function SectionHeading({
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
    <div className="mb-6 flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.23em] text-sky-300/75">
          {eyebrow ?? "Content"}
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-[11px] leading-5 text-slate-500">{children}</p>
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      {multiline ? (
        <textarea
          className={cx(fieldClass, "min-h-28 resize-y leading-6")}
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
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-3">
      <input
        className="mt-0.5 size-4 accent-sky-300"
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-xs font-semibold text-slate-200">
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
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
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
        <div className="rounded-lg border border-dashed border-white/10 px-4 py-5 text-center text-xs text-slate-500">
          {fixedShape
            ? "This layout requires exactly two blocks; the current value cannot be edited until it is restored to that shape."
            : "No items yet. Add the first one to start editing."}
        </div>
      )}
      {value.map((item, index) => (
        <div
          key={`${label}-${index}`}
          className="rounded-xl border border-white/8 bg-[#081320]/75 p-3"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`Move ${label} item up`}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/8 hover:text-white disabled:opacity-25"
                disabled={index === 0}
                onClick={() => update(path, moveItem(value, index, -1))}
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Move ${label} item down`}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/8 hover:text-white disabled:opacity-25"
                disabled={index === value.length - 1}
                onClick={() => update(path, moveItem(value, index, 1))}
              >
                <ArrowDown className="size-3.5" />
              </button>
              {!fixedShape && (
                <button
                  type="button"
                  aria-label={`Delete ${label} item`}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white/8 hover:text-white"
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
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
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
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/75">
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

function EditorSection({
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

function ProjectEditor({
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/75">
              Collection
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              Projects{" "}
              <span className="text-sm text-slate-500">{projects.length}</span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-sky-300/20 bg-sky-300/10 p-2 text-sky-200 hover:bg-sky-300/20"
            onClick={addProject}
            aria-label="Add project"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <label className="relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-600" />
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
                  ? "border-sky-300/35 bg-sky-300/[0.09]"
                  : "border-transparent hover:border-white/8 hover:bg-white/[0.03]",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-200">
                  {item.title}
                </span>
                <StatusPill
                  tone={item.status === "published" ? "success" : "warning"}
                >
                  {item.status}
                </StatusPill>
              </span>
              <span className="mt-1 block truncate text-[11px] text-slate-500">
                /{item.slug}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-5 text-center text-xs text-slate-500">
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
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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
                <option value="draft">Draft — keep private</option>
                <option value="published">
                  Published — visible after publish
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
          <p className="text-sm text-slate-400">Select a project to edit.</p>
        </NotchedPanel>
      )}
    </div>
  );
}

function BlogEditor({
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/75">
              Collection
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              Articles{" "}
              <span className="text-sm text-slate-500">{posts.length}</span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-sky-300/20 bg-sky-300/10 p-2 text-sky-200 hover:bg-sky-300/20"
            onClick={addPost}
            aria-label="Add article"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <label className="relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-600" />
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
                  ? "border-sky-300/35 bg-sky-300/[0.09]"
                  : "border-transparent hover:border-white/8 hover:bg-white/[0.03]",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-200">
                  {item.title}
                </span>
                <StatusPill
                  tone={item.status === "published" ? "success" : "warning"}
                >
                  {item.status}
                </StatusPill>
              </span>
              <span className="mt-1 block truncate text-[11px] text-slate-500">
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
            <p className="px-2 py-5 text-center text-xs text-slate-500">
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
                Initial draft{post.reviewRequired ? " — needs review" : ""}
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
            <span className="text-xs text-slate-500">
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
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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
                <option value="draft">Draft — keep private</option>
                <option value="published">
                  Published — visible after publish
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/75">
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
                  className="rounded-xl border border-white/8 bg-[#081320]/75 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <StatusPill>{block.type}</StatusPill>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-slate-500 hover:text-white disabled:opacity-25"
                        disabled={index === 0}
                        onClick={() =>
                          setPost({ body: moveArrayItem(post.body, index, -1) })
                        }
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-slate-500 hover:text-white disabled:opacity-25"
                        disabled={index === post.body.length - 1}
                        onClick={() =>
                          setPost({ body: moveArrayItem(post.body, index, 1) })
                        }
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-slate-500 hover:text-red-200"
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
          <p className="text-sm text-slate-400">Select an article to edit.</p>
        </NotchedPanel>
      )}
    </div>
  );
}

function MediaPanel({ onUse }: { onUse: (url: string) => void }) {
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
        <p className="text-sm text-slate-500">Loading media library…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
          <FileImage className="mx-auto mb-3 size-8 text-slate-600" />
          <p className="text-sm text-slate-400">No uploaded media yet.</p>
          <p className="mt-1 text-xs text-slate-600">
            Nothing is fabricated here; upload an image to see it appear.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-white/8 bg-[#081320]/75"
            >
              <div className="aspect-[4/3] bg-[#06101b]">
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
                    <FileImage className="size-8 text-slate-600" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-medium text-slate-200">
                  {item.name}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
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
                    className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3 text-slate-400 hover:text-white"
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

function InboxPanel() {
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
          <p className="text-sm text-slate-500">Loading inbox…</p>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
            <MessageSquare className="mx-auto mb-3 size-8 text-slate-600" />
            <p className="text-sm text-slate-400">No messages.</p>
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
                    ? "border-sky-300/35 bg-sky-300/[0.08]"
                    : "border-white/8 bg-[#081320]/75 hover:border-white/15",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {message.subject || "No subject"}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
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
                <div className="mt-3 truncate text-xs text-slate-400">
                  {message.message || "No message body"}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-600">
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
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/75">
                Message
              </div>
              <h3 className="mt-1 text-xl font-semibold text-white">
                {active.subject || "No subject"}
              </h3>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/8 hover:text-white"
              onClick={() => setSelected(null)}
            >
              <X className="size-4" />
            </button>
          </div>
          <dl className="space-y-3 border-b border-white/[0.08] pb-5 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                From
              </dt>
              <dd className="mt-1 text-slate-200">
                {active.name || "Unknown"}
                {active.email ? ` · ${active.email}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                Received
              </dt>
              <dd className="mt-1 text-slate-200">
                {formatDate(active.createdAt)}
              </dd>
            </div>
          </dl>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">
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
            <MessageSquare className="mx-auto mb-3 size-8 text-slate-700" />
            <p className="text-sm text-slate-500">
              Select a message to read it.
            </p>
          </div>
        </NotchedPanel>
      )}
    </div>
  );
}

function Overview({
  content,
  revision,
  publishedRevision,
  configured,
  setSection,
}: {
  content: SiteContent;
  revision: number;
  publishedRevision: number;
  configured: boolean;
  setSection: (section: NavKey) => void;
}) {
  const stats = [
    {
      label: "Projects",
      value: content.projects.length,
      key: "projects" as NavKey,
      detail: `${content.projects.filter((item) => item.status === "published").length} published`,
    },
    {
      label: "Articles",
      value: content.posts.length,
      key: "blog" as NavKey,
      detail: `${content.posts.filter((item) => item.status === "published").length} published`,
    },
    {
      label: "Skill groups",
      value: content.skillGroups.length,
      key: "skills" as NavKey,
      detail: `${content.skillGroups.reduce((sum, group) => sum + group.skills.length, 0)} skills`,
    },
    {
      label: "Site copy",
      value: Object.keys(content.copy).length,
      key: "home" as NavKey,
      detail: "editable strings",
    },
  ];
  return (
    <>
      <SectionHeading
        eyebrow="Workspace"
        title="Overview"
        description="A quiet control room for the portfolio CMS. Counts below are read from the content payload, not generated analytics."
        action={
          <StatusPill tone={configured ? "success" : "warning"}>
            {configured ? "CMS ready" : "Setup incomplete"}
          </StatusPill>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <button
            type="button"
            key={stat.label}
            onClick={() => setSection(stat.key)}
            className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#0a1828]/80 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-300/30"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {stat.label}
            </div>
            <div className="mt-4 font-display text-4xl font-semibold text-white">
              {stat.value}
            </div>
            <div className="mt-2 text-xs text-slate-500">{stat.detail}</div>
            <div className="absolute bottom-0 left-0 h-0.5 w-1/2 bg-sky-300/70 transition-all group-hover:w-full" />
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <NotchedPanel className="p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg border border-sky-300/20 bg-sky-300/10 p-2 text-sky-200">
              <Activity className="size-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/75">
                Revision status
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Content is versioned
              </h3>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                Working revision
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {revision}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                Published revision
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {publishedRevision}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                Public state
              </div>
              <div className="mt-2">
                <StatusPill
                  tone={revision === publishedRevision ? "success" : "warning"}
                >
                  {revision === publishedRevision
                    ? "In sync"
                    : "Changes pending"}
                </StatusPill>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-white/8 bg-white/[0.025] p-3 text-xs leading-5 text-slate-500">
            Save creates a new working revision. Publish is a separate, explicit
            action that affects the public site.
          </div>
        </NotchedPanel>
        <NotchedPanel className="p-5 sm:p-7">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/75">
            Editor map
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Structured content
          </h3>
          <div className="mt-5 space-y-2">
            {[
              "profile",
              "identity",
              "experience",
              "journey",
              "processSteps",
              "navigation",
            ].map((key) => (
              <button
                type="button"
                key={key}
                onClick={() =>
                  setSection(key === "navigation" ? "home" : "about")
                }
                className="flex w-full items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2.5 text-left text-xs text-slate-300 hover:border-sky-300/25 hover:text-white"
              >
                <span>{sectionLabels[key]}</span>
                <ChevronRight className="size-3.5 text-slate-600" />
              </button>
            ))}
          </div>
        </NotchedPanel>
      </div>
    </>
  );
}

export function DashboardWorkspace({
  initialContent,
  initialRevision,
  publishedRevision,
  user,
  configured,
}: DashboardWorkspaceProps) {
  const [content, setContent] = React.useState<SiteContent>(() =>
    clone(initialContent),
  );
  const [savedContent, setSavedContent] = React.useState<SiteContent>(() =>
    clone(initialContent),
  );
  const [revision, setRevision] = React.useState(initialRevision);
  const [published, setPublished] = React.useState(publishedRevision);
  const [section, setSection] = React.useState<NavKey>("overview");
  const [mobileNav, setMobileNav] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [confirmPublish, setConfirmPublish] = React.useState(false);
  const publishTriggerRef = React.useRef<HTMLButtonElement>(null);
  const publishCancelRef = React.useRef<HTMLButtonElement>(null);
  const dirty = JSON.stringify(content) !== JSON.stringify(savedContent);
  const update = React.useCallback(
    (path: PathPart[], value: unknown) =>
      setContent((current) => setAt(current, path, value) as SiteContent),
    [],
  );
  React.useEffect(() => {
    if (!confirmPublish) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    publishCancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setConfirmPublish(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.setTimeout(
        () => (previousFocus ?? publishTriggerRef.current)?.focus(),
        0,
      );
    };
  }, [confirmPublish]);
  const logout = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.reload();
  };
  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, expectedRevision: revision }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        setNotice({
          tone: "error",
          message:
            "This content changed elsewhere. Nothing was overwritten; reload to compare the current revision.",
        });
        return;
      }
      if (response.status === 503) {
        setNotice({
          tone: "error",
          message:
            payload?.message ??
            "CMS readiness is incomplete. No content was saved.",
        });
        return;
      }
      if (!response.ok) {
        const paths = Array.isArray(payload?.issues)
          ? ` ${payload.issues.map((issue: { path?: string[]; message?: string }) => `${issue.path?.join(".") || "content"}: ${issue.message || "invalid"}`).join(" · ")}`
          : "";
        throw new Error(
          (payload?.message ?? `Save failed (${response.status})`) + paths,
        );
      }
      setSavedContent(clone(payload.content ?? content));
      setContent(clone(payload.content ?? content));
      setRevision(Number(payload.revision ?? revision));
      setPublished(Number(payload.publishedRevision ?? published));
      setNotice({
        tone: "success",
        message: `Saved working revision ${payload.revision ?? revision}.`,
      });
    } catch (cause) {
      setNotice({
        tone: "error",
        message:
          cause instanceof Error ? cause.message : "Could not save content.",
      });
    } finally {
      setSaving(false);
    }
  };
  const publish = async () => {
    setPublishing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedRevision: revision }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        setNotice({
          tone: "error",
          message:
            "The revision changed before publish. Nothing was published.",
        });
        return;
      }
      if (!response.ok)
        throw new Error(
          payload?.message ?? `Publish failed (${response.status})`,
        );
      setPublished(
        Number(payload.publishedRevision ?? payload.revision ?? revision),
      );
      setNotice({
        tone: "success",
        message: "The selected revision is now public.",
      });
    } catch (cause) {
      setNotice({
        tone: "error",
        message: cause instanceof Error ? cause.message : "Could not publish.",
      });
    } finally {
      setPublishing(false);
      setConfirmPublish(false);
    }
  };
  const deleteItem = (key: "projects" | "posts", index: number) => {
    const item = content[key][index];
    const name = "title" in item ? item.title : "item";
    if (
      !window.confirm(
        `Delete “${name}” permanently from this working revision?`,
      )
    )
      return;
    update(
      [key],
      content[key].filter((_, itemIndex) => itemIndex !== index),
    );
  };
  const title =
    navItems.find((item) => item.key === section)?.label ?? "Overview";
  const openPublish = () => {
    publishTriggerRef.current =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;
    setConfirmPublish(true);
  };
  const sidebar = (
    <aside
      className={cx(
        "fixed inset-y-0 left-0 z-40 flex w-[230px] flex-col border-r border-white/[0.07] bg-[#07111d]/95 px-4 py-5 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
        mobileNav ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between px-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300/80">
            SEIF / CMS
          </div>
          <div className="mt-1 text-xs text-slate-500">Private workspace</div>
        </div>
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-500 hover:text-white lg:hidden"
          onClick={() => setMobileNav(false)}
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-8 flex-1 space-y-7 overflow-y-auto">
        {(["workspace", "content", "system"] as const).map((group) => (
          <div key={group}>
            <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              {group === "workspace"
                ? "Workspace"
                : group === "content"
                  ? "Content"
                  : "System"}
            </div>
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => {
                        setSection(item.key);
                        setMobileNav(false);
                      }}
                      className={cx(
                        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition",
                        section === item.key
                          ? "bg-sky-300/[0.1] text-sky-100"
                          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
                      )}
                    >
                      <Icon
                        className={cx(
                          "size-4",
                          section === item.key
                            ? "text-sky-300"
                            : "text-slate-600 group-hover:text-slate-300",
                        )}
                      />
                      {item.label}
                      {section === item.key && (
                        <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(77,182,255,0.9)]" />
                      )}
                    </button>
                  );
                })}
            </nav>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <div className="flex items-center gap-2 px-2">
          <div className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-sky-300/20 bg-sky-300/10 text-xs text-sky-100">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              user.name.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-slate-200">
              {user.name}
            </div>
            <div className="text-[10px] text-slate-600">Administrator</div>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-600 hover:text-slate-200"
            onClick={() => void logout()}
            aria-label="Log out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
  const renderSection = () => {
    if (section === "overview")
      return (
        <Overview
          content={content}
          revision={revision}
          publishedRevision={published}
          configured={configured}
          setSection={setSection}
        />
      );
    if (section === "projects")
      return (
        <>
          <SectionHeading
            eyebrow="Content / Collection"
            title="Projects"
            description="Manage case studies, featured state, visibility, and structured project detail."
          />
          <ProjectEditor
            projects={content.projects}
            update={(value) =>
              setContent((current) => ({ ...current, projects: value }))
            }
            onDelete={(index) => deleteItem("projects", index)}
          />
        </>
      );
    if (section === "blog")
      return (
        <>
          <SectionHeading
            eyebrow="Content / Collection"
            title="Blog"
            description="Write structured articles with ordered blocks and explicit draft/public states."
          />
          <BlogEditor
            posts={content.posts}
            update={(value) =>
              setContent((current) => ({ ...current, posts: value }))
            }
            onDelete={(index) => deleteItem("posts", index)}
          />
        </>
      );
    if (section === "about")
      return (
        <div className="space-y-5">
          {[
            "profile",
            "identity",
            "experience",
            "education",
            "training",
            "principles",
            "journey",
            "processSteps",
          ].map((key) => (
            <EditorSection
              key={key}
              title={sectionLabels[key]}
              description={`Edit the ${sectionLabels[key].toLowerCase()} records used by the public site.`}
              value={content[key as keyof SiteContent]}
              path={[key]}
              update={update}
            />
          ))}
        </div>
      );
    if (section === "skills")
      return (
        <div className="space-y-5">
          {["skillGroups", "marqueeRows"].map((key) => (
            <EditorSection
              key={key}
              title={sectionLabels[key]}
              description="Keep this collection ordered; the public site renders it in this sequence."
              value={content[key as keyof SiteContent]}
              path={[key]}
              update={update}
            />
          ))}
        </div>
      );
    if (section === "home")
      return (
        <div className="space-y-5">
          {["assets", "navigation", "copy"].map((key) => (
            <EditorSection
              key={key}
              title={sectionLabels[key]}
              description={
                key === "assets"
                  ? "Stable public asset paths and uploaded media URLs."
                  : undefined
              }
              value={content[key as keyof SiteContent]}
              path={[key]}
              update={update}
            />
          ))}
        </div>
      );
    if (section === "media")
      return (
        <MediaPanel
          onUse={(url) => {
            setNotice({
              tone: "info",
              message: `Stable media URL copied: ${url}`,
            });
            void navigator.clipboard?.writeText(url);
          }}
        />
      );
    if (section === "inbox") return <InboxPanel />;
    if (section === "seo")
      return (
        <EditorSection
          title="Search appearance"
          description="Public metadata and robots controls. Changes still require Save, then Publish."
          value={content.seo}
          path={["seo"]}
          update={update}
        />
      );
    return (
      <SettingsPanel
        configured={configured}
        revision={revision}
        publishedRevision={published}
        savedContent={savedContent}
        onRestore={(nextContent, nextRevision, nextPublished) => {
          setSavedContent(clone(nextContent));
          setContent(clone(nextContent));
          setRevision(nextRevision);
          setPublished(nextPublished);
        }}
        onNotice={setNotice}
      />
    );
  };
  return (
    <div className="min-h-screen bg-[#050b13] font-sans text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:linear-gradient(rgba(77,182,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(77,182,255,0.035)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative flex min-h-screen lg:pl-0">
        {sidebar}
        <div
          className={cx(
            "fixed inset-0 z-30 bg-black/60 lg:hidden",
            mobileNav ? "block" : "hidden",
          )}
          onClick={() => setMobileNav(false)}
        />
        <main id="main" className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#050b13]/85 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
            <div className="mx-auto flex max-w-[1500px] flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 p-2 text-slate-400 lg:hidden"
                  aria-label="Open admin navigation"
                  onClick={() => setMobileNav(true)}
                >
                  <Menu className="size-4" />
                </button>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Dashboard / {title}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {dirty ? (
                      <span className="text-amber-200">Unsaved changes</span>
                    ) : revision === published ? (
                      "Saved revision is published"
                    ) : (
                      "Working revision"
                    )}
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="hidden sm:block">
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => setContent(clone(savedContent))}
                    disabled={!dirty}
                  >
                    <RefreshCcw className="size-3.5" /> Discard
                  </button>
                </div>
                <button
                  type="button"
                  className={buttonPrimary}
                  onClick={() => void save()}
                  disabled={!dirty || saving || !configured}
                >
                  <Save className="size-3.5" /> {saving ? "Saving" : "Save"}
                </button>
                <button
                  ref={publishTriggerRef}
                  type="button"
                  className={buttonSecondary}
                  onClick={() =>
                    dirty
                      ? setNotice({
                          tone: "info",
                          message: "Save your changes before publishing.",
                        })
                      : openPublish()
                  }
                  disabled={publishing || !configured}
                >
                  <Send className="size-3.5" /> Publish
                </button>
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
            {notice && (
              <div
                className={cx(
                  "mb-5 flex items-start gap-3 rounded-xl border p-3 text-sm",
                  notice.tone === "success" &&
                    "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100",
                  notice.tone === "error" &&
                    "border-red-300/20 bg-red-400/[0.08] text-red-100",
                  notice.tone === "info" &&
                    "border-sky-300/20 bg-sky-300/[0.08] text-sky-100",
                )}
              >
                <div className="mt-0.5">
                  {notice.tone === "success" ? (
                    <Check className="size-4" />
                  ) : notice.tone === "error" ? (
                    <CircleAlert className="size-4" />
                  ) : (
                    <Activity className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 break-words">
                  {notice.message}
                </div>
                <button
                  type="button"
                  className="text-current/60 hover:text-current"
                  onClick={() => setNotice(null)}
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            {!configured && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-4 text-sm text-amber-100">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <div>
                  <strong className="font-semibold">
                    CMS readiness is incomplete.
                  </strong>{" "}
                  You can inspect the shell, but saves and publishing are
                  disabled until the server reports configured readiness. Secret
                  values are never shown here.
                </div>
              </div>
            )}
            {renderSection()}
          </div>
        </main>
      </div>
      {confirmPublish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-dialog-title"
            className="w-full max-w-md"
          >
            <NotchedPanel className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/75">
                    Public action
                  </div>
                  <h2
                    id="publish-dialog-title"
                    className="mt-1 text-xl font-semibold text-white"
                  >
                    Publish revision {revision}?
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-md p-1.5 text-slate-500 hover:text-white"
                  onClick={() => setConfirmPublish(false)}
                  aria-label="Close publish confirmation"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                This makes the current saved working revision visible on the
                public portfolio. It does not upload, seed, or fabricate
                content. Draft projects and posts remain private.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  ref={publishCancelRef}
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setConfirmPublish(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={buttonPrimary}
                  disabled={publishing}
                  onClick={() => void publish()}
                >
                  {publishing ? (
                    <RefreshCcw className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}{" "}
                  {publishing ? "Publishing" : "Publish revision"}
                </button>
              </div>
            </NotchedPanel>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPanel({
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
      <div className="max-w-2xl divide-y divide-white/[0.08] rounded-xl border border-white/8 bg-[#081320]/75">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-4"
          >
            <span className="text-sm text-slate-400">{row.label}</span>
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/75">
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
          <p className="text-sm text-slate-500">Loading revisions…</p>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-4 py-5 text-sm text-slate-500">
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
                  <div className="text-sm font-medium text-slate-200">
                    Revision {item.revision}{" "}
                    <StatusPill>{item.kind}</StatusPill>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
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
      <div className="mt-6 rounded-lg border border-white/8 bg-white/[0.025] p-4 text-xs leading-6 text-slate-500">
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
