"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  GripVertical,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useDashboard } from "../dashboard-context";
import {
  FieldHelp,
  NotchedPanel,
  ProjectOptionalFields,
  SectionHeading,
  StatusPill,
  StructuredValue,
  TextField,
  buttonDanger,
  buttonSecondary,
  fieldClass,
  setAt,
  type PathPart,
} from "../dashboard-workspace";
import {
  normalizeProjectPlacement,
  type ProjectPlacement,
  type SiteProject,
} from "@/lib/cms/schema";

type BoardFilter = "all" | "featured" | "more";

function getPlacementBadge(placement: ProjectPlacement) {
  const feat = placement.featured.enabled;
  const more = placement.more.enabled;
  if (feat && more) {
    return { label: "Both Boards", tone: "accent" as const };
  }
  if (feat) {
    return { label: "Featured", tone: "info" as const };
  }
  if (more) {
    return { label: "More Projects", tone: "neutral" as const };
  }
  return { label: "Unlisted", tone: "warning" as const };
}

interface SortableProjectRowProps {
  project: SiteProject;
  index: number;
  isActive: boolean;
  activeBoard: BoardFilter;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onOrderChange: (newOrder: number) => void;
  onToggleFeatured: (enabled: boolean) => void;
  onToggleMore: (enabled: boolean) => void;
  onToggleStatus: (status: "draft" | "published") => void;
  onDelete: () => void;
}

function SortableProjectRow({
  project,
  index,
  isActive,
  activeBoard,
  onSelect,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onOrderChange,
  onToggleFeatured,
  onToggleMore,
  onToggleStatus,
  onDelete,
}: SortableProjectRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const placement = normalizeProjectPlacement(project);
  const badge = getPlacementBadge(placement);
  const currentOrder =
    activeBoard === "featured"
      ? placement.featured.order
      : activeBoard === "more"
        ? placement.more.order
        : index;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition ${
        isActive
          ? "border-sky/50 bg-sky/[0.07] shadow-[0_4px_20px_-8px_rgba(56,189,248,0.25)]"
          : "border-white/10 bg-night-2 hover:border-white/20 hover:bg-white/[0.02]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Drag handle & basic info */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="cursor-grab text-mist/60 hover:text-mist active:cursor-grabbing p-1 -m-1"
            title="Drag to reorder"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>

          <button
            type="button"
            onClick={onSelect}
            className="flex min-w-0 flex-col text-left focus:outline-none"
          >
            <span className="truncate text-sm font-semibold text-snow group-hover:text-white">
              {project.title || "Untitled Project"}
            </span>
            <span className="truncate text-xs text-mist">
              /{project.slug} ·{" "}
              <span className="text-slate-ink">{project.category}</span>
            </span>
          </button>
        </div>

        {/* Center / Right Quick Controls & Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order control */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-night px-2 py-1">
            <span className="text-[10px] font-mono uppercase text-mist">
              Pos
            </span>
            <input
              type="number"
              min={0}
              value={currentOrder}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!Number.isNaN(val)) onOrderChange(val);
              }}
              className="w-12 bg-transparent text-center font-mono text-xs text-snow focus:outline-none focus:text-sky"
              title="Explicit sort position"
              aria-label="Sort order position"
            />
            <div className="flex flex-col">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="text-mist/70 hover:text-sky disabled:opacity-20"
                title="Move up"
                aria-label="Move up"
              >
                <ArrowUp className="size-3" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="text-mist/70 hover:text-sky disabled:opacity-20"
                title="Move down"
                aria-label="Move down"
              >
                <ArrowDown className="size-3" />
              </button>
            </div>
          </div>

          {/* Placement Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              badge.tone === "accent"
                ? "border border-sky/30 bg-sky/15 text-sky-200"
                : badge.tone === "info"
                  ? "border border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : badge.tone === "neutral"
                    ? "border border-indigo-500/30 bg-indigo-500/10 text-indigo-200"
                    : "border border-white/10 bg-white/5 text-mist"
            }`}
          >
            {badge.label === "Featured" && <Star className="size-3" />}
            {badge.label}
          </span>

          {/* Publication Status Pill */}
          <button
            type="button"
            onClick={() =>
              onToggleStatus(
                project.status === "published" ? "draft" : "published",
              )
            }
            title="Click to toggle publication status"
          >
            <StatusPill
              tone={project.status === "published" ? "success" : "warning"}
            >
              {project.status}
            </StatusPill>
          </button>

          {/* Preview button */}
          <a
            href={`/dashboard/preview/project/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 p-1.5 text-mist hover:border-sky/40 hover:text-sky"
            title="Preview project draft"
          >
            <ExternalLink className="size-3.5" />
          </a>

          {/* Edit / Select Button */}
          <button
            type="button"
            onClick={onSelect}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              isActive
                ? "border-sky/40 bg-sky/20 text-sky"
                : "border-white/10 bg-white/5 text-snow hover:border-white/25 hover:text-white"
            }`}
          >
            {isActive ? "Editing" : "Edit"}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/15 p-1.5 text-red-400 hover:border-red-500/40 hover:bg-red-500/10"
            title="Delete project"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Quick placement toggles row */}
      <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-2.5 text-xs text-mist">
        <label className="flex cursor-pointer items-center gap-1.5 hover:text-snow">
          <input
            type="checkbox"
            checked={placement.featured.enabled}
            onChange={(e) => onToggleFeatured(e.target.checked)}
            className="size-3.5 rounded accent-sky"
          />
          <span>Featured Board</span>
        </label>

        <label className="flex cursor-pointer items-center gap-1.5 hover:text-snow">
          <input
            type="checkbox"
            checked={placement.more.enabled}
            onChange={(e) => onToggleMore(e.target.checked)}
            className="size-3.5 rounded accent-sky"
          />
          <span>More Projects Board</span>
        </label>

        <div className="ml-auto text-[11px] text-slate-ink">
          Stack: {project.stack?.slice(0, 3).join(", ") || "None"}
          {(project.stack?.length ?? 0) > 3 ? "..." : ""}
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { content, updateContent, deleteItem } = useDashboard();
  const projects = React.useMemo(
    () => content.projects || [],
    [content.projects],
  );

  const [activeBoard, setActiveBoard] = React.useState<BoardFilter>("all");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>(
    projects[0]?.id || "",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Compute stats
  const publishedCount = projects.filter((p) => p.status === "published").length;
  const featuredCount = projects.filter(
    (p) => normalizeProjectPlacement(p).featured.enabled,
  ).length;
  const moreCount = projects.filter(
    (p) => normalizeProjectPlacement(p).more.enabled,
  ).length;
  const draftsCount = projects.filter((p) => p.status === "draft").length;

  // Filter projects by board and search query
  const filteredProjects = React.useMemo(() => {
    return projects
      .filter((project) => {
        const placement = normalizeProjectPlacement(project);
        if (activeBoard === "featured" && !placement.featured.enabled) return false;
        if (activeBoard === "more" && !placement.more.enabled) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          const match =
            project.title.toLowerCase().includes(q) ||
            project.slug.toLowerCase().includes(q) ||
            project.category.toLowerCase().includes(q) ||
            project.stack.some((s) => s.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aP = normalizeProjectPlacement(a);
        const bP = normalizeProjectPlacement(b);
        if (activeBoard === "featured") {
          return aP.featured.order - bP.featured.order;
        }
        if (activeBoard === "more") {
          return aP.more.order - bP.more.order;
        }
        return 0;
      });
  }, [projects, activeBoard, query]);

  // Selected project for the editor
  const activeProject =
    projects.find((p) => p.id === selectedId) ||
    filteredProjects[0] ||
    projects[0];
  const activeIndex = projects.findIndex((p) => p.id === activeProject?.id);

  // Updates full projects array
  const setProjects = React.useCallback(
    (next: SiteProject[]) => {
      updateContent((curr) => ({ ...curr, projects: next }));
    },
    [updateContent],
  );

  // Update a single project
  const updateProject = React.useCallback(
    (patch: Partial<SiteProject>) => {
      if (!activeProject) return;
      setProjects(
        projects.map((item) =>
          item.id === activeProject.id ? { ...item, ...patch } : item,
        ),
      );
    },
    [activeProject, projects, setProjects],
  );

  // Update nested structured path
  const updateProjectAt = React.useCallback(
    (path: PathPart[], value: unknown) => {
      if (activeIndex < 0) return;
      const relativePath = path.slice(2);
      const next = structuredClone(projects);
      next[activeIndex] = setAt(next[activeIndex], relativePath, value) as SiteProject;
      setProjects(next);
    },
    [activeIndex, projects, setProjects],
  );

  // Handle Drag & Drop reorder
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredProjects.findIndex((p) => p.id === active.id);
    const newIndex = filteredProjects.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedFiltered = arrayMove(filteredProjects, oldIndex, newIndex);

    // Apply updated order numbers based on current active board
    const updatedProjects = projects.map((orig) => {
      const idxInReordered = reorderedFiltered.findIndex((r) => r.id === orig.id);
      if (idxInReordered < 0) return orig;

      const norm = normalizeProjectPlacement(orig);
      if (activeBoard === "featured") {
        return {
          ...orig,
          placement: {
            ...norm,
            featured: { ...norm.featured, order: idxInReordered },
          },
        };
      }
      if (activeBoard === "more") {
        return {
          ...orig,
          placement: {
            ...norm,
            more: { ...norm.more, order: idxInReordered },
          },
        };
      }
      return orig;
    });

    setProjects(updatedProjects);
  };

  // Move item up or down 1 step
  const moveItem = (projectId: string, direction: "up" | "down") => {
    const currentIndex = filteredProjects.findIndex((p) => p.id === projectId);
    if (currentIndex < 0) return;
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredProjects.length) return;

    const reorderedFiltered = arrayMove(filteredProjects, currentIndex, targetIndex);
    const updatedProjects = projects.map((orig) => {
      const idxInReordered = reorderedFiltered.findIndex((r) => r.id === orig.id);
      if (idxInReordered < 0) return orig;
      const norm = normalizeProjectPlacement(orig);
      if (activeBoard === "featured") {
        return {
          ...orig,
          placement: {
            ...norm,
            featured: { ...norm.featured, order: idxInReordered },
          },
        };
      }
      if (activeBoard === "more") {
        return {
          ...orig,
          placement: {
            ...norm,
            more: { ...norm.more, order: idxInReordered },
          },
        };
      }
      return orig;
    });
    setProjects(updatedProjects);
  };

  // Update order directly by number
  const handleOrderChange = (projectId: string, newOrder: number) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      const norm = normalizeProjectPlacement(p);
      if (activeBoard === "featured") {
        return {
          ...p,
          placement: {
            ...norm,
            featured: { ...norm.featured, order: Math.max(0, newOrder) },
          },
        };
      }
      if (activeBoard === "more") {
        return {
          ...p,
          placement: {
            ...norm,
            more: { ...norm.more, order: Math.max(0, newOrder) },
          },
        };
      }
      return p;
    });
    setProjects(updated);
  };

  // Toggle placement featured
  const handleToggleFeatured = (projectId: string, enabled: boolean) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      const norm = normalizeProjectPlacement(p);
      return {
        ...p,
        featured: enabled, // keep boolean in sync
        placement: {
          ...norm,
          featured: { ...norm.featured, enabled },
        },
      };
    });
    setProjects(updated);
  };

  // Toggle placement more
  const handleToggleMore = (projectId: string, enabled: boolean) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      const norm = normalizeProjectPlacement(p);
      return {
        ...p,
        placement: {
          ...norm,
          more: { ...norm.more, enabled },
        },
      };
    });
    setProjects(updated);
  };

  // Toggle publication status
  const handleToggleStatus = (
    projectId: string,
    status: "draft" | "published",
  ) => {
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, status } : p,
    );
    setProjects(updated);
  };

  // Add new project
  const addProject = () => {
    const newId = `project-${Date.now()}`;
    const newSlug = `new-project-${projects.length + 1}`;
    const newProject: SiteProject = {
      id: newId,
      slug: newSlug,
      title: "New project",
      category: "Full Stack",
      domains: ["Web"],
      kanji: "創",
      kanjiMeaning: "Create",
      summary: "Short summary of the case study.",
      description: "Detailed description of the engineering architecture and impact.",
      highlights: ["Core highlight or achievement"],
      stack: ["Next.js", "TypeScript"],
      featured: false,
      placement: {
        featured: { enabled: false, order: 0 },
        more: { enabled: true, order: moreCount },
      },
      status: "draft",
      sources: ["Client brief"],
    };
    setProjects([...projects, newProject]);
    setSelectedId(newId);
  };

  return (
    <div className="space-y-6">
      {/* Top Heading & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow="Collection / Showcase"
          title="Projects Management"
          description="Manage case studies, independent placement on Featured & More Projects boards, drag-and-drop sort orders, and publication status."
        />
        <button
          type="button"
          onClick={addProject}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky/30 bg-sky/15 px-4 text-xs font-semibold text-sky-200 transition hover:bg-sky/25"
        >
          <Plus className="size-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist">
            Total Projects
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-snow">
            {projects.length}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Published
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-300">
            {publishedCount}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Featured Board
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-300">
            {featuredCount}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
            More Projects
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-sky-300">
            {moreCount}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-2 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist">
            Drafts
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-mist">
            {draftsCount}
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Board / List, Right Detailed Editor */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
        {/* Left: Board & Sortable List */}
        <NotchedPanel className="p-5">
          {/* Board Selector Tabs & Search */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-white/10 bg-night p-1">
              <button
                type="button"
                onClick={() => setActiveBoard("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activeBoard === "all"
                    ? "bg-white/15 text-white"
                    : "text-mist hover:text-snow"
                }`}
              >
                All ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveBoard("featured")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activeBoard === "featured"
                    ? "bg-amber-500/20 text-amber-200"
                    : "text-mist hover:text-snow"
                }`}
              >
                <Star className="size-3" />
                <span>Featured ({featuredCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveBoard("more")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activeBoard === "more"
                    ? "bg-sky/20 text-sky-200"
                    : "text-mist hover:text-snow"
                }`}
              >
                <Sparkles className="size-3" />
                <span>More Projects ({moreCount})</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-mist" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-white/10 bg-night-2 pl-8 pr-3 text-xs text-snow placeholder-mist/60 focus:border-sky/50 focus:outline-none sm:w-48"
              />
            </div>
          </div>

          <FieldHelp>
            {activeBoard === "featured"
              ? "Reorder the Featured Projects board using drag-and-drop, Up/Down arrows, or numeric positions. Changes update the public home hero reel upon publishing."
              : activeBoard === "more"
                ? "Reorder the More Projects board. Projects appear in this exact sequence in the secondary showcase."
                : "All projects in the collection. Select any project to edit its details."}
          </FieldHelp>

          {/* Dnd Sortable List */}
          <div className="mt-4 space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredProjects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredProjects.map((project, idx) => (
                  <SortableProjectRow
                    key={project.id}
                    project={project}
                    index={idx}
                    isActive={project.id === activeProject?.id}
                    activeBoard={activeBoard}
                    onSelect={() => setSelectedId(project.id)}
                    onMoveUp={() => moveItem(project.id, "up")}
                    onMoveDown={() => moveItem(project.id, "down")}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < filteredProjects.length - 1}
                    onOrderChange={(val) => handleOrderChange(project.id, val)}
                    onToggleFeatured={(val) =>
                      handleToggleFeatured(project.id, val)
                    }
                    onToggleMore={(val) => handleToggleMore(project.id, val)}
                    onToggleStatus={(val) => handleToggleStatus(project.id, val)}
                    onDelete={() => {
                      const origIdx = projects.findIndex(
                        (p) => p.id === project.id,
                      );
                      if (origIdx >= 0) deleteItem("projects", origIdx);
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {filteredProjects.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-mist">
                No projects match this board filter or search query.
              </div>
            )}
          </div>
        </NotchedPanel>

        {/* Right: Full Detail Project Editor */}
        {activeProject ? (
          <NotchedPanel className="p-5 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                  Case Study Editor
                </div>
                <div className="mt-1 text-lg font-bold text-snow">
                  {activeProject.title || "Untitled Project"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  tone={
                    activeProject.status === "published"
                      ? "success"
                      : "warning"
                  }
                >
                  {activeProject.status}
                </StatusPill>
                <a
                  className={buttonSecondary}
                  href={`/dashboard/preview/project/${activeProject.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3.5" /> Preview Draft
                </a>
                <button
                  type="button"
                  className={buttonDanger}
                  onClick={() => {
                    if (activeIndex >= 0) deleteItem("projects", activeIndex);
                  }}
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </div>

            {/* Core Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Title"
                value={activeProject.title}
                onChange={(value) => updateProject({ title: value })}
              />
              <TextField
                label="Slug"
                value={activeProject.slug}
                onChange={(value) => updateProject({ slug: value })}
                help="Lowercase kebab-case; used in public URLs."
              />
              <TextField
                label="Category"
                value={activeProject.category}
                onChange={(value) => updateProject({ category: value })}
              />
              <TextField
                label="Kanji"
                value={activeProject.kanji}
                onChange={(value) => updateProject({ kanji: value })}
              />
              <div className="sm:col-span-2">
                <TextField
                  label="Summary"
                  value={activeProject.summary}
                  onChange={(value) => updateProject({ summary: value })}
                  multiline
                />
              </div>
              <div className="sm:col-span-2">
                <TextField
                  label="Description"
                  value={activeProject.description}
                  onChange={(value) => updateProject({ description: value })}
                  multiline
                />
              </div>
            </div>

            {/* Board Placements & Orders Box */}
            <div className="mt-6 rounded-xl border border-sky/20 bg-sky/[0.04] p-4">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-sky-200">
                Independent Board Placements & Ordering
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Featured Placement */}
                <div className="rounded-lg border border-white/10 bg-night p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-snow">
                      Featured Board
                    </span>
                    <input
                      type="checkbox"
                      checked={
                        normalizeProjectPlacement(activeProject).featured.enabled
                      }
                      onChange={(e) =>
                        handleToggleFeatured(activeProject.id, e.target.checked)
                      }
                      className="size-4 rounded accent-sky"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-mist">
                    <span>Sort Position:</span>
                    <input
                      type="number"
                      min={0}
                      value={
                        normalizeProjectPlacement(activeProject).featured.order
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!Number.isNaN(val)) {
                          const norm = normalizeProjectPlacement(activeProject);
                          updateProject({
                            placement: {
                              ...norm,
                              featured: { ...norm.featured, order: val },
                            },
                          });
                        }
                      }}
                      className="w-16 rounded border border-white/15 bg-night-2 px-2 py-1 text-center font-mono text-snow"
                    />
                  </div>
                </div>

                {/* More Projects Placement */}
                <div className="rounded-lg border border-white/10 bg-night p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-snow">
                      More Projects Board
                    </span>
                    <input
                      type="checkbox"
                      checked={
                        normalizeProjectPlacement(activeProject).more.enabled
                      }
                      onChange={(e) =>
                        handleToggleMore(activeProject.id, e.target.checked)
                      }
                      className="size-4 rounded accent-sky"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-mist">
                    <span>Sort Position:</span>
                    <input
                      type="number"
                      min={0}
                      value={
                        normalizeProjectPlacement(activeProject).more.order
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!Number.isNaN(val)) {
                          const norm = normalizeProjectPlacement(activeProject);
                          updateProject({
                            placement: {
                              ...norm,
                              more: { ...norm.more, order: val },
                            },
                          });
                        }
                      }}
                      className="w-16 rounded border border-white/15 bg-night-2 px-2 py-1 text-center font-mono text-snow"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility & Structured Values */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">
                  Publication Status
                </span>
                <select
                  className={fieldClass}
                  value={activeProject.status}
                  onChange={(event) =>
                    updateProject({
                      status: event.target.value as SiteProject["status"],
                    })
                  }
                >
                  <option value="draft">Draft (keep private)</option>
                  <option value="published">Published (visible on live site)</option>
                </select>
                <FieldHelp>
                  Saving records this change in your draft. Explicit Publish puts it live.
                </FieldHelp>
              </label>

              <TextField
                label="Availability"
                value={activeProject.availability || ""}
                onChange={(value) => updateProject({ availability: value })}
                placeholder="e.g. In production, Closed-source"
              />
            </div>

            {/* Details & Structured Values */}
            <div className="mt-7 border-t border-white/[0.08] pt-6">
              <StructuredValue
                value={{
                  domains: activeProject.domains,
                  kanjiMeaning: activeProject.kanjiMeaning,
                  highlights: activeProject.highlights,
                  stack: activeProject.stack,
                  sources: activeProject.sources,
                }}
                path={["projects", activeIndex]}
                label="Structured Lists & Meta"
                update={updateProjectAt}
              />
              <div className="mt-6">
                <ProjectOptionalFields
                  project={activeProject}
                  update={updateProject}
                />
              </div>
            </div>
          </NotchedPanel>
        ) : (
          <NotchedPanel className="p-8 text-center text-mist">
            Select a project from the left board to view and edit its details.
          </NotchedPanel>
        )}
      </div>
    </div>
  );
}
