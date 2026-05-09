"use client";

import Link from "next/link";
import { Plus, Hash, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { MOCK_TOPICS } from "@/lib/mock-data";

export default function TopicsPage() {
  return (
    <>
      <TopBar
        title="Topics"
        subtitle="Curated boards — your way to dive deeper"
        actions={
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
          >
            <Plus size={14} />
            New topic
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_TOPICS.map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}`}
                className="group rounded-xl border overflow-hidden transition-all hover:translate-y-[-1px] hover:shadow-lg"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div
                  className="h-28 relative flex items-end p-4"
                  style={{ background: t.coverColor }}
                >
                  <Hash
                    size={56}
                    className="absolute -right-2 -top-2 opacity-20"
                    color="#fff"
                  />
                  <h3 className="text-lg font-semibold tracking-tight text-white relative z-10">
                    {t.name}
                  </h3>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <p
                    className="text-sm leading-snug"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t.description}
                  </p>
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>{t.feedCount} feeds</span>
                    <span>·</span>
                    <span>{t.unreadCount} unread</span>
                  </div>
                  <div
                    className="rounded-md p-2.5 text-xs leading-snug flex gap-2"
                    style={{ background: "var(--surface-raised)", color: "var(--text-secondary)" }}
                  >
                    <Sparkles size={12} className="shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                    <span className="line-clamp-2">{t.weeklySummary}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
