"use client";

import {
  X,
  Bookmark,
  ExternalLink,
  StickyNote,
  Share2,
  Maximize2,
  Minimize2,
  Highlighter,
  Headphones,
  Type,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { Article } from "./ArticleCard";

interface ReaderPaneProps {
  article: Article | null;
  onClose: () => void;
  onSave: (id: string) => void;
}

const SAMPLE_PARAGRAPHS = [
  "Five years on from the great work-from-home shift, the picture in city centres is more nuanced than the early predictions allowed. Office vacancy is high in absolute terms but flat over the last twelve months. Footfall has stabilised at around eighty per cent of 2019 levels — but heavily weighted to Tuesday through Thursday.",
  "What comes next depends less on whether people return to the office than on whether the buildings around them adapt. Conversion to residential use, once thought prohibitively expensive, is becoming routine in cities with the right zoning.",
  "The economic question is whether the cluster effects that justified office rents will reform around hybrid patterns, or whether the cluster simply dissolves into the suburbs. Early evidence suggests the former, but only in cities that already had strong residential cores.",
];

export function ReaderPane({ article, onClose, onSave }: ReaderPaneProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [highlightOpen, setHighlightOpen] = useState(false);

  if (!article) return null;

  const sizeClass =
    fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-base";

  const containerStyle = fullscreen
    ? "fixed inset-0 z-30"
    : "w-[440px] shrink-0 h-screen sticky top-0 border-l";
  const contentMaxWidth = fullscreen ? "max-w-2xl mx-auto" : "";

  return (
    <aside
      className={`${containerStyle} flex flex-col overflow-hidden`}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Toolbar */}
      <div
        className="h-14 flex items-center justify-between px-4 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: article.isSaved ? "var(--accent)" : "var(--text-secondary)" }}
            onClick={() => onSave(article.id)}
            title={article.isSaved ? "Unsave" : "Save for later"}
          >
            <Bookmark size={16} fill={article.isSaved ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => setHighlightOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Highlight selection"
          >
            <Highlighter size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Add note"
          >
            <StickyNote size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Listen to article"
          >
            <Headphones size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Ask Claude about this article"
          >
            <Sparkles size={16} />
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Open original"
          >
            <ExternalLink size={16} />
          </a>
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <div
            className="flex items-center rounded-lg p-0.5"
            style={{ background: "var(--surface-raised)" }}
            title="Text size"
          >
            {(["sm", "md", "lg"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className="px-2 py-0.5 rounded-md transition-colors"
                style={{
                  background: fontSize === s ? "var(--surface)" : "transparent",
                  color: fontSize === s ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <Type size={s === "sm" ? 11 : s === "md" ? 13 : 15} />
              </button>
            ))}
          </div>
          <button
            onClick={() => setFullscreen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title={fullscreen ? "Exit full screen" : "Full screen"}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onClick={onClose}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Highlight popover (mock) */}
      {highlightOpen && (
        <div
          className="px-4 py-2 border-b flex items-center gap-2 text-xs"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-raised)",
            color: "var(--text-secondary)",
          }}
        >
          <span>Select text to highlight:</span>
          {[
            { c: "yellow", color: "#fde047" },
            { c: "blue", color: "#7dd3fc" },
            { c: "green", color: "#86efac" },
            { c: "pink", color: "#f9a8d4" },
          ].map((h) => (
            <button
              key={h.c}
              className="w-4 h-4 rounded-full border"
              style={{ background: h.color, borderColor: "var(--border)" }}
              title={`Highlight ${h.c}`}
            />
          ))}
          <span className="ml-auto">Add note · Copy quote</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className={contentMaxWidth}>
          <div className="mb-4">
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              {article.source}
            </span>
            <h1
              className={`font-bold leading-tight mt-1 mb-2 ${
                fullscreen ? "text-3xl" : "text-2xl"
              }`}
            >
              {article.title}
            </h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {article.publishedAt} · {article.readTimeMinutes} min read
              {article.readProgress !== undefined && article.readProgress > 0 &&
                ` · ${Math.round(article.readProgress * 100)}% read`}
            </p>
          </div>

          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt=""
              className="w-full rounded-lg mb-6 object-cover"
              style={{ maxHeight: fullscreen ? "420px" : "240px" }}
            />
          )}

          {article.summary && (
            <p
              className={`leading-relaxed mb-5 ${sizeClass}`}
              style={{ color: "var(--text-secondary)", fontStyle: "italic" }}
            >
              {article.summary}
            </p>
          )}

          <div
            className={`leading-relaxed flex flex-col gap-4 ${sizeClass}`}
            style={{ color: "var(--text-primary)" }}
          >
            {SAMPLE_PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
              Full extracted article body will appear here once Phase 2 wires up
              <code> readability-lxml</code>.
            </p>
          </div>

          {/* Continue reading footer */}
          <div
            className="mt-10 pt-6 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Up next
            </p>
            <p className="text-sm font-medium">
              Heat pumps are eating natural gas — slowly
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Heatmap News · 7 min read
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
