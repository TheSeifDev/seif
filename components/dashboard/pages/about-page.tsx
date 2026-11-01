"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
} from "lucide-react";
import type { FaqItemConfig, SiteContent } from "@/lib/cms/schema";
import { getFaqItems } from "@/lib/cms/schema";
import { useDashboard } from "../dashboard-context";
import {
  EditorSection,
  FieldHelp,
  NotchedPanel,
  SectionHeading,
  TextField,
  sectionLabels,
} from "../dashboard-workspace";

function FaqManager() {
  const { content, updateContent } = useDashboard();

  // Initialize from content.faq or fall back to existing copy-derived items
  const faqItems: FaqItemConfig[] = React.useMemo(() => {
    if (content.faq && content.faq.length > 0) {
      return content.faq;
    }
    // Seed with existing copy items if content.faq is empty
    return getFaqItems(content).map((item, idx) => ({
      id: `faq-${idx + 1}`,
      question: item.question,
      answer: item.answer,
    }));
  }, [content]);

  const setFaq = (next: FaqItemConfig[]) => {
    updateContent((curr) => ({
      ...curr,
      faq: next,
    }));
  };

  const updateItem = (index: number, patch: Partial<FaqItemConfig>) => {
    const next = faqItems.map((item, idx) =>
      idx === index ? { ...item, ...patch } : item,
    );
    setFaq(next);
  };

  const addItem = () => {
    const next = [
      ...faqItems,
      {
        id: `faq-${Date.now()}`,
        question: "New question?",
        answer: "Detailed answer explaining your approach or expertise.",
      },
    ];
    setFaq(next);
  };

  const deleteItem = (index: number) => {
    const next = faqItems.filter((_, idx) => idx !== index);
    setFaq(next);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= faqItems.length) return;
    const next = [...faqItems];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setFaq(next);
  };

  return (
    <NotchedPanel className="p-5 sm:p-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky/75">
              Structured Knowledge Base
            </span>
            <span className="rounded bg-sky/10 px-2 py-0.5 text-[10px] font-mono text-sky-200">
              Single Source of Truth
            </span>
          </div>
          <h3 className="mt-1 text-lg font-bold text-snow">
            Frequently Asked Questions (FAQ) Manager
          </h3>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky/30 bg-sky/15 px-3 text-xs font-semibold text-sky-200 transition hover:bg-sky/25"
        >
          <Plus className="size-3.5" />
          <span>Add Question</span>
        </button>
      </div>

      <FieldHelp>
        Questions and answers managed here serve as the single source of truth
        for both the interactive disclosures on the public <code>/about</code> page
        and the Schema.org <code>FAQPage</code> JSON-LD graph. Draft changes remain
        private until explicitly published.
      </FieldHelp>

      <div className="mt-6 space-y-4">
        {faqItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-xl border border-white/10 bg-night-2 p-4 transition hover:border-white/20"
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="font-mono text-xs font-semibold text-sky">
                FAQ #{idx + 1}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, "up")}
                  className="rounded p-1 text-mist hover:text-white disabled:opacity-20"
                  title="Move question up"
                  aria-label="Move question up"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === faqItems.length - 1}
                  onClick={() => moveItem(idx, "down")}
                  className="rounded p-1 text-mist hover:text-white disabled:opacity-20"
                  title="Move question down"
                  aria-label="Move question down"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(idx)}
                  className="rounded p-1 text-mist hover:text-red-400"
                  title="Delete question"
                  aria-label="Delete question"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <TextField
                label="Question"
                value={item.question}
                onChange={(val) => updateItem(idx, { question: val })}
                placeholder="What is your engineering background?"
              />
              <TextField
                label="Answer"
                value={item.answer}
                onChange={(val) => updateItem(idx, { answer: val })}
                multiline
                placeholder="Detailed answer..."
              />
            </div>
          </div>
        ))}

        {faqItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-mist">
            No FAQ items defined. Click &ldquo;Add Question&rdquo; to create one.
          </div>
        )}
      </div>
    </NotchedPanel>
  );
}

export function AboutPage() {
  const { content, update } = useDashboard();

  const sections = [
    "profile",
    "identity",
    "experience",
    "education",
    "training",
    "principles",
    "journey",
    "processSteps",
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Content / Profile"
        title="About & Identity"
        description="Edit the personal biography, career experience timeline, education, training certifications, core principles, journey milestones, process steps, and FAQ knowledge base."
      />

      {/* Dedicated FAQ Manager */}
      <FaqManager />

      {/* Other About Sections */}
      <div className="space-y-5">
        {sections.map((key) => (
          <EditorSection
            key={key}
            title={sectionLabels[key] || key}
            description={`Edit the ${key.toLowerCase()} records used by the public site.`}
            value={content[key as keyof SiteContent]}
            path={[key]}
            update={update}
          />
        ))}
      </div>
    </div>
  );
}
