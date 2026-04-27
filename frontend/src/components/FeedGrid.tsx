"use client";

import { useState } from "react";
import { ArticleCard, type Article } from "./ArticleCard";
import { ReaderPane } from "./ReaderPane";

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "The future of AI assistants: from tools to collaborators",
    source: "MIT Technology Review",
    summary: "As large language models become more capable, the line between tool and collaborator is blurring in ways that challenge how we think about productivity and creativity.",
    imageUrl: "https://picsum.photos/seed/ai1/600/400",
    url: "https://example.com/1",
    publishedAt: "2h ago",
    readTimeMinutes: 6,
    isRead: false,
    isSaved: false,
    tags: ["AI", "Technology"],
  },
  {
    id: "2",
    title: "Apple's new spatial computing strategy for 2026",
    source: "The Verge",
    summary: "Leaked roadmap documents suggest Apple is doubling down on visionOS with a lighter, cheaper headset aimed at mainstream consumers.",
    imageUrl: "https://picsum.photos/seed/apple2/600/400",
    url: "https://example.com/2",
    publishedAt: "4h ago",
    readTimeMinutes: 4,
    isRead: true,
    isSaved: true,
    tags: ["Apple", "Hardware"],
  },
  {
    id: "3",
    title: "How remote work reshaped city centres — and what comes next",
    source: "The Economist",
    summary: "Five years after the pandemic forced offices empty, urban planners are only beginning to understand the lasting effects on city layout and commercial real estate.",
    imageUrl: "https://picsum.photos/seed/city3/600/400",
    url: "https://example.com/3",
    publishedAt: "6h ago",
    readTimeMinutes: 8,
    isRead: false,
    isSaved: false,
    tags: ["Cities", "Work"],
  },
  {
    id: "4",
    title: "Inside the race to build a better battery",
    source: "Wired",
    imageUrl: "https://picsum.photos/seed/battery4/600/400",
    url: "https://example.com/4",
    publishedAt: "8h ago",
    readTimeMinutes: 5,
    isRead: false,
    isSaved: false,
    tags: ["Energy", "Climate"],
  },
  {
    id: "5",
    title: "Substack's pivot to video is working — for some",
    source: "Nieman Lab",
    summary: "A growing cohort of newsletter writers are finding video the best way to deepen reader relationships, but the economics remain fragile.",
    url: "https://example.com/5",
    publishedAt: "10h ago",
    readTimeMinutes: 3,
    isRead: true,
    isSaved: false,
    tags: ["Media"],
  },
  {
    id: "6",
    title: "What the new EU AI Act means for developers",
    source: "Ars Technica",
    summary: "The Act's tiered risk framework creates compliance obligations that differ significantly depending on the use case. Here's what engineers need to know.",
    imageUrl: "https://picsum.photos/seed/eu6/600/400",
    url: "https://example.com/6",
    publishedAt: "Yesterday",
    readTimeMinutes: 7,
    isRead: false,
    isSaved: true,
    tags: ["AI", "Policy"],
  },
  {
    id: "7",
    title: "The quiet comeback of RSS",
    source: "Hacker Newsletter",
    url: "https://example.com/7",
    publishedAt: "Yesterday",
    readTimeMinutes: 2,
    isRead: false,
    isSaved: false,
    tags: ["Web"],
  },
  {
    id: "8",
    title: "Why sleep researchers are rethinking the 8-hour myth",
    source: "New Scientist",
    summary: "Segmented sleep — two distinct periods separated by wakefulness — may be more natural than the consolidated eight-hour block most of us aim for.",
    imageUrl: "https://picsum.photos/seed/sleep8/600/400",
    url: "https://example.com/8",
    publishedAt: "Yesterday",
    readTimeMinutes: 5,
    isRead: false,
    isSaved: false,
    tags: ["Health", "Science"],
  },
];

const FILTERS = ["All", "Unread", "Saved", "AI", "Technology", "Science", "Media"];

export function FeedGrid() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = articles.filter((a) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !a.isRead;
    if (activeFilter === "Saved") return a.isSaved;
    return a.tags?.includes(activeFilter);
  });

  function handleSave(id: string) {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a))
    );
  }

  function handleClick(article: Article) {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, isRead: true } : a))
    );
    setSelectedArticle(article);
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div
          className="flex items-center gap-2 px-6 py-3 border-b overflow-x-auto shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                background: activeFilter === f ? "var(--accent)" : "var(--surface-raised)",
                color: activeFilter === f ? "#fff" : "var(--text-secondary)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Magazine grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {filtered.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                size={i === 0 ? "lg" : i < 3 ? "md" : "sm"}
                onClick={handleClick}
                onSave={handleSave}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No articles match this filter.
              </p>
            </div>
          )}
        </div>
      </div>

      <ReaderPane
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSave={handleSave}
      />
    </div>
  );
}
