"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, Sparkles } from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { CaptureDialog } from "./CaptureDialog";

interface TopBarProps {
  title: string;
  subtitle?: string;
  /** Optional content rendered on the right (e.g. density toggle, tab actions). */
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

  // Cmd/Ctrl + K opens the palette globally
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className="h-14 flex items-center justify-between gap-3 px-6 border-b shrink-0 sticky top-0 z-10"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-semibold leading-tight truncate">{title}</h1>
          {subtitle && (
            <p
              className="text-xs truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}

          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm w-64 hover:opacity-90 transition-opacity"
            style={{
              background: "var(--surface-raised)",
              color: "var(--text-secondary)",
            }}
            title="Search & commands (⌘K)"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
            >
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setCaptureOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)", color: "#fff" }}
            title="Save URL or quick note"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          <button
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
            title="Ask Claude about your feed"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <CaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />
    </>
  );
}
