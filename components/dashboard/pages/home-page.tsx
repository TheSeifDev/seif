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
  Eye,
  EyeOff,
  GripVertical,
  Laptop,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDashboard } from "../dashboard-context";
import {
  FieldHelp,
  NotchedPanel,
  SectionHeading,
  TextField,
} from "../dashboard-workspace";
import {
  DEFAULT_HOME_SECTIONS,
  getHomeSections,
  type HomeSectionConfig,
  type HomeSectionId,
  type SiteContent,
} from "@/lib/cms/schema";

const SECTION_METADATA: Record<
  HomeSectionId,
  { name: string; description: string; badge: string }
> = {
  hero: {
    name: "Hero & About Scene",
    description: "Cinematic WebGL canvas, personal introduction, and Japanese motto.",
    badge: "Interactive Scene",
  },
  identity: {
    name: "Identity Statements",
    description: "Core philosophy, dual-column statements, and kanji copy blocks.",
    badge: "Typography",
  },
  journey: {
    name: "Journey Milestones",
    description: "Chronological engineering journey, milestones, and career facts.",
    badge: "Timeline",
  },
  featuredProjects: {
    name: "Featured Projects Reel",
    description: "Pinned horizontal case-study reel showcasing primary work.",
    badge: "Portfolio Showcase",
  },
  moreProjects: {
    name: "More Projects Grid",
    description: "Secondary project cards across healthcare, IoT, and analytics.",
    badge: "Project Grid",
  },
  skills: {
    name: "Skills & Technologies",
    description: "Infinite marquee rows and structured engineering capabilities directory.",
    badge: "Technical Index",
  },
  process: {
    name: "Engineering Process",
    description: "End-to-end methodology steps, key deliverables, and outputs.",
    badge: "Methodology",
  },
  connectCta: {
    name: "Connect & Contact CTA",
    description: "Closing callout scene with communication links and moon visual.",
    badge: "Call to Action",
  },
};

interface SortableSectionRowProps {
  section: HomeSectionConfig;
  index: number;
  onToggle: (enabled: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function SortableSectionRow({
  section,
  index,
  onToggle,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SortableSectionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : section.enabled ? 1 : 0.6,
    zIndex: isDragging ? 50 : "auto",
  };

  const meta = SECTION_METADATA[section.id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
        section.enabled
          ? "border-white/10 bg-night-2 hover:border-white/20 hover:bg-white/[0.02]"
          : "border-white/5 bg-night/50 opacity-60 hover:opacity-80"
      }`}
    >
      {/* Drag handle & section description */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="cursor-grab text-mist/60 hover:text-mist active:cursor-grabbing p-1 -m-1"
          title="Drag to reorder section"
          aria-label="Drag to reorder section"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/5 font-mono text-[11px] font-bold text-mist">
          {index + 1}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`truncate text-xs font-semibold ${
                section.enabled ? "text-snow" : "text-mist line-through"
              }`}
            >
              {meta?.name || section.id}
            </span>
            <span className="rounded bg-sky/10 px-1.5 py-0.5 text-[9px] font-medium text-sky-200">
              {meta?.badge}
            </span>
          </div>
          <p className="truncate text-[11px] text-mist/70">
            {meta?.description}
          </p>
        </div>
      </div>

      {/* Reorder arrows & visibility toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="rounded p-1 text-mist hover:text-sky disabled:opacity-20"
          title="Move section up"
          aria-label="Move section up"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="rounded p-1 text-mist hover:text-sky disabled:opacity-20"
          title="Move section down"
          aria-label="Move section down"
        >
          <ArrowDown className="size-3.5" />
        </button>

        {/* Enable / Disable toggle switch */}
        <button
          type="button"
          onClick={() => onToggle(!section.enabled)}
          className={`ml-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
            section.enabled
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              : "border-white/10 bg-white/5 text-mist hover:text-white"
          }`}
          title={section.enabled ? "Section is visible" : "Section is hidden"}
        >
          {section.enabled ? (
            <>
              <Eye className="size-3" />
              <span>Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="size-3" />
              <span>Hidden</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export function HomePage() {
  const { content, updateContent } = useDashboard();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const [viewportMode, setViewportMode] = React.useState<ViewportMode>("desktop");
  const [mobileTab, setMobileTab] = React.useState<"editor" | "preview">("editor");
  const [showCopyEditor, setShowCopyEditor] = React.useState<boolean>(false);
  const [iframeKey, setIframeKey] = React.useState<number>(0);

  const sections = React.useMemo(() => {
    return [...getHomeSections(content)];
  }, [content]);

  // Sync content with iframe on changes
  const postContentToPreview = React.useCallback(
    (targetContent: SiteContent) => {
      if (!iframeRef.current?.contentWindow) return;
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "PREVIEW_CONTENT_UPDATE",
            content: targetContent,
          },
          window.location.origin, // Explicit origin, never wildcard
        );
      } catch {
        // Safe fallback
      }
    },
    [],
  );

  // Sync on content updates
  React.useEffect(() => {
    postContentToPreview(content);
  }, [content, postContentToPreview]);

  // Listen for preview iframe ready handshake
  React.useEffect(() => {
    const handleHandshake = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "PREVIEW_FRAME_READY") {
        postContentToPreview(content);
      }
    };
    window.addEventListener("message", handleHandshake);
    return () => window.removeEventListener("message", handleHandshake);
  }, [content, postContentToPreview]);

  const updateSections = (nextSections: HomeSectionConfig[]) => {
    updateContent((curr) => {
      const updated = {
        ...curr,
        home: {
          sections: nextSections,
        },
      };
      postContentToPreview(updated);
      return updated;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sections, oldIndex, newIndex).map(
      (sec, idx) => ({ ...sec, order: idx }),
    );
    updateSections(reordered);
  };

  const moveSection = (id: HomeSectionId, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s.id === id);
    if (currentIndex < 0) return;
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = arrayMove(sections, currentIndex, targetIndex).map(
      (sec, idx) => ({ ...sec, order: idx }),
    );
    updateSections(reordered);
  };

  const toggleSection = (id: HomeSectionId, enabled: boolean) => {
    const next = sections.map((sec) =>
      sec.id === id ? { ...sec, enabled } : sec,
    );
    updateSections(next);
  };

  const resetToDefault = () => {
    updateSections(
      DEFAULT_HOME_SECTIONS.map((sec, idx) => ({ ...sec, order: idx })),
    );
  };

  const enableAll = () => {
    updateSections(sections.map((sec) => ({ ...sec, enabled: true })));
  };

  const reloadPreview = () => {
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow="Visual Builder / Public Home"
          title="Home Split Live Preview"
          description="Reorder sections, toggle visibility, and edit global copy with instant real-time public preview sync."
        />

        {/* Mobile Viewport Toggle (hidden on xl screens) */}
        <div className="flex xl:hidden rounded-lg border border-white/10 bg-night p-1">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              mobileTab === "editor"
                ? "bg-white/15 text-white"
                : "text-mist hover:text-snow"
            }`}
          >
            Sections Board
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              mobileTab === "preview"
                ? "bg-sky/20 text-sky-200"
                : "text-mist hover:text-snow"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)] items-start">
        {/* Left Column: Section Ordering Board & Quick Copy Editor */}
        <div
          className={`space-y-5 ${
            mobileTab === "preview" ? "hidden xl:block" : "block"
          }`}
        >
          <NotchedPanel className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                  Section Hierarchy
                </div>
                <h3 className="mt-0.5 text-base font-bold text-snow">
                  Home Page Sections ({sections.filter((s) => s.enabled).length}/{sections.length} active)
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-mist hover:border-white/20 hover:text-white"
                  title="Reset to default order"
                >
                  <RotateCcw className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={enableAll}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20"
                >
                  Enable All
                </button>
              </div>
            </div>

            <FieldHelp>
              Drag rows to reorder how sections appear on the public home page.
              Toggle visibility to hide sections. Changes sync immediately to the
              live preview frame on the right.
            </FieldHelp>

            {/* Dnd Section List */}
            <div className="mt-4 space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section, idx) => (
                    <SortableSectionRow
                      key={section.id}
                      section={section}
                      index={idx}
                      onToggle={(enabled) => toggleSection(section.id, enabled)}
                      onMoveUp={() => moveSection(section.id, "up")}
                      onMoveDown={() => moveSection(section.id, "down")}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < sections.length - 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </NotchedPanel>

          {/* Quick Copy & Identity Accordion */}
          <NotchedPanel className="p-5">
            <button
              type="button"
              onClick={() => setShowCopyEditor((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
                  Hero Copy & Motto
                </div>
                <div className="mt-0.5 text-sm font-semibold text-snow">
                  Headline & Japanese Motto
                </div>
              </div>
              <div className="rounded-lg border border-white/10 p-1 text-mist">
                {showCopyEditor ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </div>
            </button>

            {showCopyEditor && (
              <div className="mt-4 space-y-3 border-t border-white/[0.08] pt-4">
                <TextField
                  label="Role / Headline"
                  value={content.profile.role}
                  onChange={(val) =>
                    updateContent((curr) => ({
                      ...curr,
                      profile: { ...curr.profile, role: val },
                    }))
                  }
                />
                <TextField
                  label="Availability Badge"
                  value={content.profile.availability}
                  onChange={(val) =>
                    updateContent((curr) => ({
                      ...curr,
                      profile: { ...curr.profile, availability: val },
                    }))
                  }
                />
                <TextField
                  label="Japanese Motto (Kanji)"
                  value={content.profile.japaneseMotto}
                  onChange={(val) =>
                    updateContent((curr) => ({
                      ...curr,
                      profile: { ...curr.profile, japaneseMotto: val },
                    }))
                  }
                />
                <TextField
                  label="Japanese Motto Meaning"
                  value={content.profile.japaneseMottoMeaning}
                  onChange={(val) =>
                    updateContent((curr) => ({
                      ...curr,
                      profile: { ...curr.profile, japaneseMottoMeaning: val },
                    }))
                  }
                />
              </div>
            )}
          </NotchedPanel>
        </div>

        {/* Right Column: Real-Time Live Preview Frame */}
        <div
          className={`${
            mobileTab === "editor" ? "hidden xl:block" : "block"
          }`}
        >
          <NotchedPanel className="p-3 sm:p-4">
            {/* Viewport & Preview Control Bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-night p-1">
                <button
                  type="button"
                  onClick={() => setViewportMode("desktop")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    viewportMode === "desktop"
                      ? "bg-white/15 text-white"
                      : "text-mist hover:text-snow"
                  }`}
                  title="Desktop 100% viewport"
                >
                  <Laptop className="size-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode("tablet")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    viewportMode === "tablet"
                      ? "bg-white/15 text-white"
                      : "text-mist hover:text-snow"
                  }`}
                  title="Tablet 768px viewport"
                >
                  <Tablet className="size-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode("mobile")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    viewportMode === "mobile"
                      ? "bg-white/15 text-white"
                      : "text-mist hover:text-snow"
                  }`}
                  title="Mobile 390px viewport"
                >
                  <Smartphone className="size-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              {/* Reload & External open actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={reloadPreview}
                  className="rounded-lg border border-white/10 p-1.5 text-mist hover:border-sky/40 hover:text-sky"
                  title="Reload preview frame"
                >
                  <RefreshCw className="size-3.5" />
                </button>
                <a
                  href="/dashboard/preview/home"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-snow hover:border-sky/40 hover:text-sky"
                  title="Open live preview in separate window"
                >
                  <ExternalLink className="size-3" />
                  <span className="hidden sm:inline">Open Full Window</span>
                </a>
              </div>
            </div>

            {/* Iframe Viewport Container */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-2xl flex justify-center h-[750px] transition-all">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src="/dashboard/preview/home"
                title="Public Home Live Preview"
                className={`h-full border-0 transition-all duration-300 ${
                  viewportMode === "desktop"
                    ? "w-full"
                    : viewportMode === "tablet"
                      ? "w-[768px] border-x border-white/10"
                      : "w-[390px] border-x border-white/10"
                }`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </NotchedPanel>
        </div>
      </div>
    </div>
  );
}
