"use client";

import { Bookmark, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Article {
  id: string;
  title: string;
  source: string;
  summary?: string;
  imageUrl?: string;
  url: string;
  publishedAt: string;
  readTimeMinutes?: number;
  isRead: boolean;
  isSaved: boolean;
  tags?: string[];
}

interface ArticleCardProps {
  article: Article;
  size?: "sm" | "md" | "lg";
  onClick?: (article: Article) => void;
  onSave?: (id: string) => void;
}

export function ArticleCard({ article, size = "md", onClick, onSave }: ArticleCardProps) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden border cursor-pointer transition-all hover:border-opacity-80",
        isLarge ? "flex flex-col" : "flex flex-col",
        article.isRead && "opacity-60"
      )}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      onClick={() => onClick?.(article)}
    >
      {article.imageUrl && (
        <div className={cn("w-full overflow-hidden shrink-0", isLarge ? "h-48" : isSmall ? "h-28" : "h-36")}>
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-medium uppercase tracking-wide truncate"
            style={{ color: "var(--accent)" }}
          >
            {article.source}
          </span>
          <div className="flex items-center gap-1 shrink-0" style={{ color: "var(--text-secondary)" }}>
            {article.readTimeMinutes && (
              <span className="flex items-center gap-0.5 text-xs">
                <Clock size={10} />
                {article.readTimeMinutes}m
              </span>
            )}
          </div>
        </div>

        <h3
          className={cn(
            "font-semibold leading-snug line-clamp-3",
            isLarge ? "text-base" : isSmall ? "text-xs" : "text-sm"
          )}
        >
          {article.title}
        </h3>

        {article.summary && !isSmall && (
          <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {article.publishedAt}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 rounded transition-colors hover:opacity-80"
              style={{ color: article.isSaved ? "var(--accent)" : "var(--text-secondary)" }}
              onClick={(e) => { e.stopPropagation(); onSave?.(article.id); }}
              title={article.isSaved ? "Unsave" : "Save"}
            >
              <Bookmark size={14} fill={article.isSaved ? "currentColor" : "none"} />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              onClick={(e) => e.stopPropagation()}
              title="Open original"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
