"use client";

import { Play, Mic, Headphones, Plus, Rss } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { MOCK_PODCASTS, MOCK_ARTICLES } from "@/lib/mock-data";

export default function ListenPage() {
  const longReads = MOCK_ARTICLES.filter((a) => a.readTimeMinutes >= 6);

  return (
    <>
      <TopBar
        title="Listen"
        subtitle="Your podcasts, daily digest, and listen-to-article queue"
        actions={
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:opacity-90"
            style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
          >
            <Plus size={14} />
            Subscribe
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-10">
          {/* Daily digest hero */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex flex-col md:flex-row">
              <div
                className="md:w-56 h-44 md:h-auto flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4f7cff, #8b5cf6)" }}
              >
                <Mic size={56} color="#fff" className="opacity-80" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                <div>
                  <p
                    className="text-xs uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "var(--accent)" }}
                  >
                    Your daily digest
                  </p>
                  <h2 className="text-xl font-semibold mb-1">
                    Friday, 9 May — 6 stories, 8 minutes
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Auto-generated from your brief. Subscribe in Apple Podcasts via your private RSS.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    <Play size={14} fill="#fff" />
                    Play digest
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:opacity-90"
                    style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
                  >
                    <Rss size={14} />
                    Copy private RSS
                  </button>
                  <button
                    className="text-xs hover:opacity-80 ml-auto"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Configure voice & length →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Subscribed podcasts */}
          <section>
            <div className="flex items-end justify-between mb-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Headphones size={16} style={{ color: "var(--text-secondary)" }} />
                Subscribed
              </h3>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {MOCK_PODCASTS.length} shows
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MOCK_PODCASTS.map((p) => (
                <div
                  key={p.id}
                  className="group rounded-xl border p-3 flex gap-3 cursor-pointer transition-colors hover:bg-[var(--surface-raised)]"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div
                    className="w-16 h-16 rounded-md shrink-0 flex items-center justify-center"
                    style={{ background: p.coverColor }}
                  >
                    <Mic size={20} color="#fff" className="opacity-80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      {p.isNew && (
                        <span
                          className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: "var(--accent)", color: "#fff" }}
                        >
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                      {p.show}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {p.publishedAt} · {p.durationMinutes} min
                    </p>
                    {p.progress !== undefined && (
                      <div
                        className="h-0.5 rounded-full mt-1.5"
                        style={{ background: "var(--surface-raised)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.progress * 100}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    className="self-center p-2 rounded-full"
                    style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Listen-to-article queue */}
          <section>
            <div className="flex items-end justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold">Listen to articles</h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  TTS playback for your saved long reads
                </p>
              </div>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {longReads.length} queued
              </span>
            </div>
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {longReads.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom:
                      i === longReads.length - 1 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <button
                    className="p-2 rounded-full shrink-0"
                    style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {a.source} · ~{Math.round(a.readTimeMinutes * 1.4)} min listen
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
