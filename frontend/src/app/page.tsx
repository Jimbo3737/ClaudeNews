"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  Clock,
  BookOpen,
  Tv2,
  Headphones,
  Bookmark,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ArticleCard, type Article } from "@/components/ArticleCard";
import { ArticleListRow } from "@/components/ArticleListRow";
import { ReaderPane } from "@/components/ReaderPane";
import { DemoBanner } from "@/components/DemoBanner";
import { useArticles } from "@/lib/use-articles";
import { useDigest } from "@/lib/use-digest";
import { articlesApi } from "@/lib/api";
import {
  MOCK_LIBRARY,
  MOCK_PODCASTS,
  TODAY_BRIEF_IDS,
} from "@/lib/mock-data";

export default function TodayPage() {
  const { articles, setArticles, isDemo } = useArticles({ limit: 50 });
  const { digest } = useDigest();
  const [selected, setSelected] = useState<Article | null>(null);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // If today's digest exists, use its picks (with the digest-specific framing
  // overlaid on each article). Otherwise fall back to the mock TODAY_BRIEF_IDS
  // pick set so the design pass still has something to render.
  const brief: Article[] = digest
    ? digest.picks.map((p) => ({
        ...p.article,
        whyItMatters: p.whyItMatters ?? p.article.whyItMatters,
      }))
    : articles.filter((a) => new Set(TODAY_BRIEF_IDS).has(a.id));
  const briefIdSet = new Set(brief.map((a) => a.id));
  const inFeeds = articles.filter((a) => !briefIdSet.has(a.id) && !a.isRead).slice(0, 6);
  const continueReading = articles.filter(
    (a) => a.readProgress !== undefined && a.readProgress > 0 && a.readProgress < 1
  );
  const savedQueue = articles.filter((a) => a.isSaved);

  const queuedMinutes = savedQueue.reduce((s, a) => s + a.readTimeMinutes, 0);

  function toggleSave(id: string) {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a))
    );
    if (!isDemo) {
      articlesApi.toggleSave(id).catch(() => {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a))
        );
      });
    }
  }
  function open(article: Article) {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, isRead: true } : a))
    );
    setSelected(article);
    if (!isDemo) articlesApi.markRead(article.id).catch(() => {});
  }

  const inProgressLibrary = MOCK_LIBRARY.filter((l) => l.status === "in_progress");
  const newPodcasts = MOCK_PODCASTS.filter((p) => p.isNew);

  return (
    <>
      <TopBar title="Today" subtitle={today} />

      <DemoBanner show={isDemo} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-12">
            {/* Brief — AI-curated picks */}
            <section>
              <SectionHeader
                title={digest?.title ?? "Your brief"}
                subtitle={
                  brief.length === 0
                    ? "No brief yet — sync your inbox to generate today's"
                    : `${brief.length} things worth your attention this morning`
                }
                icon={Sparkles}
                accent
              />
              {brief.length > 0 && (
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  {brief.map((a, i) => (
                    <BriefRow
                      key={a.id}
                      article={a}
                      index={i + 1}
                      onClick={open}
                      onSave={toggleSave}
                      isLast={i === brief.length - 1}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* In your feeds */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <SectionHeader
                  title="In your feeds"
                  subtitle="Latest from the sources you follow"
                />
                <Link
                  href="/reading"
                  className="text-xs flex items-center gap-1 hover:opacity-80"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Open Reading <ChevronRight size={12} />
                </Link>
              </div>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
              >
                {inFeeds.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={open}
                    onSave={toggleSave}
                  />
                ))}
              </div>
            </section>

            {/* Continue reading */}
            {continueReading.length > 0 && (
              <section>
                <SectionHeader
                  title="Continue reading"
                  subtitle="Pick up where you left off"
                />
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  {continueReading.map((a) => (
                    <ArticleListRow
                      key={a.id}
                      article={a}
                      onClick={open}
                      onSave={toggleSave}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Saved queue summary */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <SectionHeader
                  title="Saved for later"
                  subtitle={`${savedQueue.length} articles · ${queuedMinutes} min queued`}
                  icon={Bookmark}
                />
                <Link
                  href="/reading?tab=saved"
                  className="text-xs flex items-center gap-1 hover:opacity-80"
                  style={{ color: "var(--text-secondary)" }}
                >
                  See all <ChevronRight size={12} />
                </Link>
              </div>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
              >
                {savedQueue.slice(0, 4).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    size="sm"
                    onClick={open}
                    onSave={toggleSave}
                  />
                ))}
              </div>
            </section>

            {/* In progress: library + podcasts */}
            <section>
              <SectionHeader
                title="On your nightstand"
                subtitle="Books, shows and podcasts in progress"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                  className="rounded-xl border p-4"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div
                    className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={12} />
                      Library
                    </span>
                    <Link href="/library" className="hover:opacity-80 normal-case font-normal">
                      Open
                    </Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    {inProgressLibrary.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div
                          className="w-10 h-14 rounded shrink-0 overflow-hidden"
                          style={{ background: "var(--surface-raised)" }}
                        >
                          {item.coverUrl && (
                            <img
                              src={item.coverUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">{item.title}</span>
                            {item.type === "tv" && <Tv2 size={11} style={{ color: "var(--text-secondary)" }} />}
                          </div>
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item.creator}
                          </p>
                          {item.progress !== undefined && (
                            <div
                              className="h-1 rounded-full mt-1.5"
                              style={{ background: "var(--surface-raised)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${item.progress * 100}%`,
                                  background: "var(--accent)",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl border p-4"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div
                    className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Headphones size={12} />
                      New podcasts
                    </span>
                    <Link href="/listen" className="hover:opacity-80 normal-case font-normal">
                      Open
                    </Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    {newPodcasts.map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-md shrink-0"
                          style={{ background: p.coverColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.title}</p>
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {p.show} · {p.durationMinutes} min
                          </p>
                        </div>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                          style={{ background: "var(--accent)", color: "#fff" }}
                        >
                          New
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  accent,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number }>;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <span style={{ color: accent ? "var(--accent)" : "var(--text-secondary)" }}>
            <Icon size={16} />
          </span>
        )}
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

function BriefRow({
  article,
  index,
  isLast,
  onClick,
  onSave,
}: {
  article: Article;
  index: number;
  isLast: boolean;
  onClick: (a: Article) => void;
  onSave: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(article)}
      className="flex items-start gap-4 p-5 cursor-pointer transition-colors hover:bg-[var(--surface-raised)]"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
    >
      <div
        className="text-xl font-bold w-7 shrink-0 leading-none mt-1"
        style={{ color: "var(--accent)" }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="flex items-center gap-2 text-xs mb-1"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="font-medium uppercase tracking-wide" style={{ color: "var(--accent)" }}>
            {article.source}
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock size={10} />
            {article.readTimeMinutes}m
          </span>
          {article.tags.slice(0, 1).map((t) => (
            <span key={t}>· {t}</span>
          ))}
        </div>
        <h3 className="text-base font-semibold leading-snug mb-1.5">{article.title}</h3>
        {article.whyItMatters && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            <span style={{ color: "var(--accent)" }}>Why it matters — </span>
            {article.whyItMatters}
          </p>
        )}
      </div>
      <button
        className="p-1.5 rounded transition-colors hover:bg-[var(--surface)] shrink-0"
        style={{ color: article.isSaved ? "var(--accent)" : "var(--text-secondary)" }}
        onClick={(e) => {
          e.stopPropagation();
          onSave(article.id);
        }}
        title={article.isSaved ? "Unsave" : "Save for later"}
      >
        <Bookmark size={15} fill={article.isSaved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
