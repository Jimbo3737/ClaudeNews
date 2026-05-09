"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, Link2, StickyNote, BookOpen, Film, Tv2 } from "lucide-react";
import { useState } from "react";

interface CaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = "url" | "note" | "library";

export function CaptureDialog({ open, onOpenChange }: CaptureDialogProps) {
  const [mode, setMode] = useState<Mode>("url");
  const [value, setValue] = useState("");

  const tabs: { id: Mode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: "url", label: "Save URL", icon: Link2 },
    { id: "note", label: "Quick note", icon: StickyNote },
    { id: "library", label: "Add to Library", icon: Bookmark },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)" }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-50 -translate-x-1/2 w-[92vw] max-w-md rounded-xl border overflow-hidden shadow-2xl outline-none"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Dialog.Title className="px-5 pt-4 pb-3 text-sm font-semibold">
            Save to ClaudeNews
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Save a URL, jot a note, or add a book/film/show to your library.
          </Dialog.Description>

          <div
            className="flex items-center gap-1 px-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-md transition-colors"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="p-5 flex flex-col gap-3">
            {mode === "url" && (
              <>
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Article URL
                </label>
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="https://…"
                  className="px-3 py-2 rounded-lg outline-none text-sm border"
                  style={{
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border)",
                  }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {["Read later", "AI", "Cities", "Energy"].map((tag) => (
                    <button
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full hover:opacity-90"
                      style={{
                        background: "var(--surface-raised)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            {mode === "note" && (
              <>
                <input
                  autoFocus
                  placeholder="Note title…"
                  className="px-3 py-2 rounded-lg outline-none text-sm border"
                  style={{
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border)",
                  }}
                />
                <textarea
                  rows={4}
                  placeholder="Jot down a thought, link to it from any article later…"
                  className="px-3 py-2 rounded-lg outline-none text-sm border resize-none"
                  style={{
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border)",
                  }}
                />
              </>
            )}

            {mode === "library" && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {[
                    { id: "book", label: "Book", icon: BookOpen },
                    { id: "film", label: "Film", icon: Film },
                    { id: "tv", label: "TV", icon: Tv2 },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className="flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border hover:opacity-90"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <t.icon size={18} />
                      <span className="text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  placeholder="Search title or paste a link…"
                  className="px-3 py-2 rounded-lg outline-none text-sm border"
                  style={{
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between px-5 py-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Shortcut: ⇧⌘S
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-3 py-1.5 rounded-lg text-sm hover:opacity-90"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
