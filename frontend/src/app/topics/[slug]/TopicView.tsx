"use client";

import { useState } from "react";
import { Sparkles, Rss, Plus, Settings2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ArticleCard, type Article } from "@/components/ArticleCard";
import { ReaderPane } from "@/components/ReaderPane";
import type { MockTopic } from "@/lib/mock-data";

interface TopicViewProps {
  topic: MockTopic;
  articles: Article[];
}

export function TopicView({ topic, articles: initial }: TopicViewProps) {
  const [articles, setArticles] = useState<Article[]>(initial);
  const [selected, setSelected] = useState<Article | null>(null);

  function toggleSave(id: string) {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a)));
  }
  function open(article: Article) {
    setArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, isRead: true } : a)));
    setSelected(article);
  }

  return (
    <>
      <TopBar
        title={topic.name}
        subtitle={`${topic.feedCount} feeds · ${topic.unreadCount} unread`}
        actions={
          <div className="flex items-center gap-1">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:opacity-90"
              style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
            >
              <Plus size={14} />
              Add feed
            </button>
            <button
              className="p-2 rounded-lg hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              title="Topic settings"
            >
              <Settings2 size={16} />
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div
            className="h-40 flex items-end p-6"
            style={{ background: topic.coverColor }}
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{topic.name}</h1>
              <p className="text-sm text-white/80 mt-1">{topic.description}</p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
            {/* Weekly summary */}
            <div
              className="rounded-xl border p-5 flex gap-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: "var(--surface-raised)" }}
              >
                <Sparkles size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "var(--accent)" }}
                >
                  This week in {topic.name}
                </p>
                <p className="text-sm leading-relaxed">{topic.weeklySummary}</p>
                <button
                  className="text-xs mt-3 hover:opacity-80"
                  style={{ color: "var(--accent)" }}
                >
                  Ask Claude to go deeper →
                </button>
              </div>
            </div>

            {/* Feeds in this topic */}
            <section>
              <div
                className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="flex items-center gap-1.5">
                  <Rss size={12} />
                  Feeds in this topic
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Heatmap News",
                  "MIT Technology Review",
                  "The Economist",
                  "Wired",
                  "Volts",
                  "The Verge",
                ].map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: "var(--surface)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>

            {/* Articles */}
            <section>
              <h2 className="text-base font-semibold mb-3">Latest</h2>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
              >
                {articles.map((a) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    onClick={open}
                    onSave={toggleSave}
                  />
                ))}
              </div>
            </section>
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
