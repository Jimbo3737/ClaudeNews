"use client";

import { Bookmark, ExternalLink, Clock, Rss, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockArticle, ArticleSourceKind } from "@/lib/mock-data";

// Re-export so existing imports of `Article` from this file keep working
export type Article = MockArticle;

interface ArticleCardProps {
  article: Article;
  size?: "sm" | "md" | "lg";
  onClick?: (article: Article) => void;
  onSave?: (id: string) => void;
}

const SOURCE_KIND_ICON: Record<ArticleSourceKind, React.ComponentType<{ size?: number }>> = {
  rss: Rss,
  newsletter: Mail,
  saved: Bookmark,
  suggested: Sparkles,
  manual: Bookmark,
};

const SOURCE_KIND_LABEL: Record<ArticleSourceKind, string> = {
  rss: "RSS",
  newsletter: "Newsletter",
  saved: "Saved by you",
  suggested: "Suggested",
  manual: "Saved by you",
};

export function ArticleCard({ article, size = "md", onClick, onSave }: ArticleCardProps) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";
  const KindIcon = SOURCE_KIND_ICON[article.sourceKind];

  return (
    <article
      className={cn(
        "group relative rounded-xl overflow-hidden border cursor-pointer transition-all hover:translate-y-[-1px] hover:shadow-lg",
        article.isRead && "opacity-60"
      )}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      onClick={() => onClick?.(article)}
    >
      {article.imageUrl && (
        <div
          className={cn(
            "w-full overflow-hidden shrink-0",
            isLarge ? "h-52" : isSmall ? "h-28" : "h-36"
          )}
        >
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              title={SOURCE_KIND_LABEL[article.sourceKind]}
              style={{ color: "var(--text-secondary)" }}
            >
              <KindIcon size={11} />
            </span>
            <span
              className="text-xs font-medium uppercase tracking-wide truncate"
              style={{ color: "var(--accent)" }}
            >
              {article.source}
            </span>
          </div>
          <button
            className="p-1 rounded transition-colors hover:bg-[var(--surface-raised)]"
            style={{ color: article.isSaved ? "var(--accent)" : "var(--text-secondary)" }}
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(article.id);
            }}
            title={article.isSaved ? "Unsave" : "Save for later"}
          >
            <Bookmark size={13} fill={article.isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <h3
          className={cn(
            "font-semibold leading-snug line-clamp-3",
            isLarge ? "text-lg" : isSmall ? "text-xs" : "text-sm"
          )}
        >
          {article.title}
        </h3>

        {article.summary && !isSmall && (
          <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {article.summary}
          </p>
        )}

        {article.tags.length > 0 && !isSmall && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {article.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--text-secondary)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div
          className="flex items-center justify-between mt-auto pt-1 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="truncate">{article.publishedAt}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-0.5">
              <Clock size={10} />
              {article.readTimeMinutes}m
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
              title="Open original"
            >
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {article.readProgress !== undefined && article.readProgress > 0 && (
          <div
            className="absolute left-0 right-0 bottom-0 h-0.5"
            style={{ background: "var(--surface-raised)" }}
          >
            <div
              className="h-full"
              style={{
                width: `${Math.round(article.readProgress * 100)}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
