"use client";

import { useState } from "react";
import { Highlighter, StickyNote, Plus, BookOpen, Newspaper } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { MOCK_HIGHLIGHTS, MOCK_NOTES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "highlights" | "notes";

const HIGHLIGHT_BG: Record<string, string> = {
  yellow: "rgba(253, 224, 71, 0.18)",
  blue: "rgba(125, 211, 252, 0.18)",
  green: "rgba(134, 239, 172, 0.18)",
  pink: "rgba(249, 168, 212, 0.18)",
};
const HIGHLIGHT_BAR: Record<string, string> = {
  yellow: "#fde047",
  blue: "#7dd3fc",
  green: "#86efac",
  pink: "#f9a8d4",
};

export default function NotesPage() {
  const [tab, setTab] = useState<Tab>("highlights");

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }>; count: number }[] = [
    { id: "highlights", label: "Highlights", icon: Highlighter, count: MOCK_HIGHLIGHTS.length },
    { id: "notes", label: "Notes", icon: StickyNote, count: MOCK_NOTES.length },
  ];

  return (
    <>
      <TopBar
        title="Notes & Highlights"
        subtitle="One library for everything you've marked, written, or quoted"
        actions={
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:opacity-90"
            style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
          >
            <Plus size={14} />
            New note
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div
            className="flex items-center gap-1 mb-6 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    borderBottom: active
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    fontWeight: active ? 600 : 400,
                    marginBottom: "-1px",
                  }}
                >
                  <t.icon size={14} />
                  {t.label}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "var(--surface-raised)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {tab === "highlights" && (
            <div className="flex flex-col gap-3">
              {MOCK_HIGHLIGHTS.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border p-5 flex gap-4"
                  style={{
                    background: HIGHLIGHT_BG[h.color],
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="w-1 rounded-full shrink-0"
                    style={{ background: HIGHLIGHT_BAR[h.color] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base leading-relaxed mb-3">&ldquo;{h.text}&rdquo;</p>
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {h.sourceType === "book" ? (
                        <BookOpen size={12} />
                      ) : (
                        <Newspaper size={12} />
                      )}
                      <span className="font-medium">{h.source}</span>
                      <span>·</span>
                      <span>{h.createdAt}</span>
                    </div>
                    {h.note && (
                      <p
                        className="text-sm mt-3 pl-3 border-l-2"
                        style={{
                          color: "var(--text-secondary)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {h.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "notes" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_NOTES.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "rounded-xl border p-4 cursor-pointer transition-colors hover:bg-[var(--surface-raised)]"
                  )}
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <h3 className="text-sm font-semibold mb-2">{n.title}</h3>
                  <p
                    className="text-sm leading-relaxed line-clamp-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {n.body}
                  </p>
                  <div
                    className="flex items-center justify-between mt-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>{n.updatedAt}</span>
                    <div className="flex gap-1">
                      {n.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "var(--surface-raised)" }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  {n.linkedArticleTitle && (
                    <p
                      className="text-xs mt-2 pt-2 border-t truncate"
                      style={{
                        color: "var(--text-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      ↳ Linked to: {n.linkedArticleTitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
