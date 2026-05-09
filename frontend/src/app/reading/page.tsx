"use client";

import { useMemo, useState } from "react";
import {
  LayoutGrid,
  List,
  AlignLeft,
  Inbox,
  Bookmark,
  Archive,
  Filter,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ArticleCard, type Article } from "@/components/ArticleCard";
import { ArticleListRow } from "@/components/ArticleListRow";
import { ReaderPane } from "@/components/ReaderPane";
import { MOCK_ARTICLES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "inbox" | "saved" | "archive";
type Density = "magazine" | "list" | "title";

export default function ReadingPage() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [tab, setTab] = useState<Tab>("inbox");
  const [density, setDensity] = useState<Density>("magazine");
  const [tag, setTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Article | null>(null);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [articles]);

  const filtered = articles.filter((a) => {
    const tabOk =
      tab === "inbox" ? !a.isRead && !a.isSaved
      : tab === "saved" ? a.isSaved
      : a.isRead && !a.isSaved; // archive
    const tagOk = !tag || a.tags.includes(tag);
    return tabOk && tagOk;
  });

  function toggleSave(id: string) {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a)));
  }
  function open(article: Article) {
    setArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, isRead: true } : a)));
    setSelected(article);
  }

  const counts = {
    inbox: articles.filter((a) => !a.isRead && !a.isSaved).length,
    saved: articles.filter((a) => a.isSaved).length,
    archive: articles.filter((a) => a.isRead && !a.isSaved).length,
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }>; count: number }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: counts.inbox },
    { id: "saved", label: "Saved", icon: Bookmark, count: counts.saved },
    { id: "archive", label: "Archive", icon: Archive, count: counts.archive },
  ];

  const densityOptions: { id: Density; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { id: "magazine", icon: LayoutGrid, label: "Magazine" },
    { id: "list", icon: List, label: "List" },
    { id: "title", icon: AlignLeft, label: "Titles" },
  ];

  return (
    <>
      <TopBar
        title="Reading"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
        actions={
          <div
            className="flex items-center rounded-lg p-0.5"
            style={{ background: "var(--surface-raised)" }}
          >
            {densityOptions.map((d) => (
              <button
                key={d.id}
                onClick={() => setDensity(d.id)}
                className="p-1.5 rounded-md transition-colors"
                style={{
                  background: density === d.id ? "var(--surface)" : "transparent",
                  color: density === d.id ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                title={d.label}
              >
                <d.icon size={14} />
              </button>
            ))}
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div
            className="flex items-center gap-1 px-6 pt-3 border-b shrink-0"
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

          {/* Filter chips */}
          <div
            className="flex items-center gap-2 px-6 py-3 border-b overflow-x-auto shrink-0"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ color: "var(--text-secondary)", background: "transparent" }}
              title="More filters"
            >
              <Filter size={12} />
              Filter
            </button>
            <button
              onClick={() => setTag(null)}
              className={cn(
                "px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors",
                tag === null && "font-medium"
              )}
              style={{
                background: tag === null ? "var(--accent)" : "var(--surface-raised)",
                color: tag === null ? "#fff" : "var(--text-secondary)",
              }}
            >
              All
            </button>
            {allTags.map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t}
                  onClick={() => setTag(active ? null : t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors",
                    active && "font-medium"
                  )}
                  style={{
                    background: active ? "var(--accent)" : "var(--surface-raised)",
                    color: active ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div
                className="flex flex-col items-center justify-center h-64 gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <p className="text-sm">Nothing here.</p>
                <p className="text-xs">
                  {tab === "inbox" ? "You're all caught up." : tab === "saved" ? "Save articles to read them later." : "Archive will fill up as you read."}
                </p>
              </div>
            )}

            {density === "magazine" && filtered.length > 0 && (
              <div
                className="grid gap-4 p-6"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
              >
                {filtered.map((a, i) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    size={i === 0 && tab === "inbox" ? "lg" : "md"}
                    onClick={open}
                    onSave={toggleSave}
                  />
                ))}
              </div>
            )}

            {density !== "magazine" && filtered.length > 0 && (
              <div className="flex flex-col">
                {filtered.map((a) => (
                  <ArticleListRow
                    key={a.id}
                    article={a}
                    density={density === "list" ? "list" : "title"}
                    onClick={open}
                    onSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <ReaderPane
          article={selected}
          onClose={() => setSelected(null)}
          onSave={toggleSave}
        />
      </div>
    </>
  );
}
