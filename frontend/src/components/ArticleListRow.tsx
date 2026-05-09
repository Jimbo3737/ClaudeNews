"use client";

import { Bookmark, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockArticle } from "@/lib/mock-data";

interface ArticleListRowProps {
  article: MockArticle;
  /** "title" = single-line title only; "list" = title + summary + meta */
  density?: "title" | "list";
  onClick?: (article: MockArticle) => void;
  onSave?: (id: string) => void;
}

export function ArticleListRow({
  article,
  density = "list",
  onClick,
  onSave,
}: ArticleListRowProps) {
  const compact = density === "title";

  return (
    <div
      onClick={() => onClick?.(article)}
      className={cn(
        "group flex items-start gap-3 px-4 border-b cursor-pointer transition-colors hover:bg-[var(--surface-raised)]",
        compact ? "py-2" : "py-3",
        article.isRead && "opacity-60"
      )}
      style={{ borderColor: "var(--border)" }}
    >
      {!compact && article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          className="w-20 h-20 rounded-md object-cover shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <div
          className="flex items-center gap-2 text-xs mb-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <span
            className="font-medium uppercase tracking-wide truncate"
            style={{ color: "var(--accent)" }}
          >
            {article.source}
          </span>
          <span>·</span>
          <span>{article.publishedAt}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock size={10} />
            {article.readTimeMinutes}m
          </span>
        </div>
        <h3
          className={cn(
            "font-semibold leading-snug",
            compact ? "text-sm line-clamp-1" : "text-sm line-clamp-2"
          )}
        >
          {article.title}
        </h3>
        {!compact && article.summary && (
          <p
            className="text-xs mt-1 line-clamp-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {article.summary}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          className="p-1.5 rounded transition-colors hover:bg-[var(--surface)]"
          style={{ color: article.isSaved ? "var(--accent)" : "var(--text-secondary)" }}
          onClick={(e) => {
            e.stopPropagation();
            onSave?.(article.id);
          }}
          title={article.isSaved ? "Unsave" : "Save for later"}
        >
          <Bookmark size={14} fill={article.isSaved ? "currentColor" : "none"} />
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded transition-colors hover:bg-[var(--surface)]"
          style={{ color: "var(--text-secondary)" }}
          onClick={(e) => e.stopPropagation()}
          title="Open original"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
