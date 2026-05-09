"use client";

import { Compass, Plus, Sparkles, Rss, Hash } from "lucide-react";
import { TopBar } from "@/components/TopBar";

const STARTER_PACKS = [
  {
    title: "AI Policy Essentials",
    description: "11 feeds covering EU AI Act, US executive orders, and frontier-lab safety.",
    color: "linear-gradient(135deg, #4f7cff, #2c4cb8)",
  },
  {
    title: "UK Politics & Policy",
    description: "9 feeds — broadsheets, think tanks, and substack analysts.",
    color: "linear-gradient(135deg, #d97706, #92400e)",
  },
  {
    title: "Climate & Energy",
    description: "13 feeds with strong technical signal.",
    color: "linear-gradient(135deg, #3ecf8e, #166534)",
  },
  {
    title: "The Small Web",
    description: "Personal blogs, makers, and the corners of the internet that still feel handmade.",
    color: "linear-gradient(135deg, #8b5cf6, #4c1d95)",
  },
];

const RECOMMENDED_FEEDS = [
  { name: "Construction Physics", description: "Brian Potter on how things get built." },
  { name: "Works in Progress", description: "Long-form essays on technology and progress." },
  { name: "Heatmap News", description: "Climate and energy reporting that goes deep." },
  { name: "Stratechery", description: "Strategy and the business of tech." },
  { name: "Astral Codex Ten", description: "Slate Star Codex's heir, on ideas and rationality." },
  { name: "Read Max", description: "Internet culture, weekly." },
];

const TRENDING = [
  { name: "AI Policy", count: 47 },
  { name: "Heat pumps", count: 31 },
  { name: "London housing", count: 22 },
  { name: "Substack video", count: 18 },
  { name: "Rapamycin", count: 12 },
];

export default function DiscoverPage() {
  return (
    <>
      <TopBar
        title="Discover"
        subtitle="Find new sources, packs, and trending topics"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-10">
          {/* Search hero */}
          <div
            className="rounded-2xl border p-6 flex items-center gap-4"
            style={{
              background:
                "linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Compass size={18} color="#fff" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">Search the open web for feeds</h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Paste a website URL and we&apos;ll find its RSS, OPML, or newsletter sign-up.
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Plus size={14} />
              Add feed
            </button>
          </div>

          {/* Starter packs */}
          <section>
            <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
              <Sparkles size={14} style={{ color: "var(--accent)" }} />
              Starter packs
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              One-tap collections curated for new accounts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STARTER_PACKS.map((p) => (
                <div
                  key={p.title}
                  className="group rounded-xl border overflow-hidden cursor-pointer transition-all hover:translate-y-[-1px] hover:shadow-lg"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="h-20" style={{ background: p.color }} />
                  <div className="p-3">
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p
                      className="text-xs mt-0.5 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended feeds */}
          <section>
            <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
              <Rss size={14} style={{ color: "var(--text-secondary)" }} />
              Recommended for you
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Based on what you read most.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RECOMMENDED_FEEDS.map((f) => (
                <div
                  key={f.name}
                  className="rounded-xl border p-4 flex items-center gap-3"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ background: "var(--surface-raised)" }}
                  >
                    <Rss size={14} style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {f.description}
                    </p>
                  </div>
                  <button
                    className="text-xs px-2.5 py-1.5 rounded-lg hover:opacity-90"
                    style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Trending */}
          <section>
            <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
              <Hash size={14} style={{ color: "var(--text-secondary)" }} />
              Trending in your network
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Topics with the most coverage across your feeds this week.
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <span
                  key={t.name}
                  className="text-sm px-3 py-1.5 rounded-full"
                  style={{
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                  }}
                >
                  #{t.name}{" "}
                  <span style={{ color: "var(--text-secondary)" }}>· {t.count}</span>
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
