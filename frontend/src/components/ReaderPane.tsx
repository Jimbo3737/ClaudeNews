"use client";

import { X, Bookmark, ExternalLink, StickyNote, Share2 } from "lucide-react";
import type { Article } from "./ArticleCard";

interface ReaderPaneProps {
  article: Article | null;
  onClose: () => void;
  onSave: (id: string) => void;
}

export function ReaderPane({ article, onClose, onSave }: ReaderPaneProps) {
  if (!article) return null;

  return (
    <aside
      className="w-[420px] shrink-0 h-screen sticky top-0 flex flex-col border-l overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div
        className="h-14 flex items-center justify-between px-4 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => onSave(article.id)}
            title={article.isSaved ? "Unsave" : "Save"}
          >
            <Bookmark size={16} fill={article.isSaved ? "currentColor" : "none"}
              style={{ color: article.isSaved ? "var(--accent)" : undefined }} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Add note"
          >
            <StickyNote size={16} />
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Open original"
          >
            <ExternalLink size={16} />
          </a>
          <button
            className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
        <button
          className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--accent)" }}>
            {article.source}
          </span>
          <h1 className="text-xl font-bold leading-snug mt-1 mb-2">{article.title}</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {article.publishedAt}
            {article.readTimeMinutes && ` · ${article.readTimeMinutes} min read`}
          </p>
        </div>

        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="w-full rounded-lg mb-5 object-cover max-h-52"
          />
        )}

        {article.summary && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            {article.summary}
          </p>
        )}

        <div
          className="text-sm leading-relaxed prose-placeholder"
          style={{ color: "var(--text-primary)" }}
        >
          <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
            Full article content will be rendered here after extraction from the source URL.
          </p>
        </div>
      </div>
    </aside>
  );
}
