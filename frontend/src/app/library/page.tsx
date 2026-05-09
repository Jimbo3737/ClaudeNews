"use client";

import { useState } from "react";
import { BookOpen, Film, Tv2, Plus, Star } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { MOCK_LIBRARY, type MockLibraryItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TypeFilter = "all" | "book" | "film" | "tv";

export default function LibraryPage() {
  const [type, setType] = useState<TypeFilter>("all");

  const filtered =
    type === "all" ? MOCK_LIBRARY : MOCK_LIBRARY.filter((i) => i.type === type);

  const grouped: Record<string, MockLibraryItem[]> = {
    "In progress": filtered.filter((i) => i.status === "in_progress"),
    "Want to read / watch": filtered.filter((i) => i.status === "want"),
    Finished: filtered.filter((i) => i.status === "done"),
  };

  const typeChips: { id: TypeFilter; label: string; icon?: React.ComponentType<{ size?: number }> }[] = [
    { id: "all", label: "All" },
    { id: "book", label: "Books", icon: BookOpen },
    { id: "film", label: "Films", icon: Film },
    { id: "tv", label: "TV", icon: Tv2 },
  ];

  return (
    <>
      <TopBar
        title="Library"
        subtitle="Books, films, and TV in one place"
        actions={
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:opacity-90"
            style={{ background: "var(--surface-raised)", color: "var(--text-primary)" }}
          >
            <Plus size={14} />
            Add
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
          <div className="flex items-center gap-2">
            {typeChips.map((c) => {
              const active = type === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setType(c.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
                    active && "font-medium"
                  )}
                  style={{
                    background: active ? "var(--accent)" : "var(--surface-raised)",
                    color: active ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {c.icon && <c.icon size={12} />}
                  {c.label}
                </button>
              );
            })}
          </div>

          {Object.entries(grouped).map(([shelf, items]) => (
            <section key={shelf}>
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-base font-semibold">{shelf}</h2>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {items.length}
                </span>
              </div>
              {items.length === 0 ? (
                <p className="text-sm py-6" style={{ color: "var(--text-secondary)" }}>
                  Nothing on this shelf yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {items.map((item) => (
                    <LibraryCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function LibraryCard({ item }: { item: MockLibraryItem }) {
  const TypeIcon =
    item.type === "book" ? BookOpen : item.type === "film" ? Film : Tv2;
  return (
    <div className="group cursor-pointer">
      <div
        className="aspect-[2/3] rounded-lg overflow-hidden border relative"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt=""
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon size={28} style={{ color: "var(--text-secondary)" }} />
          </div>
        )}
        {item.progress !== undefined && (
          <div
            className="absolute left-0 right-0 bottom-0 h-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <div
              className="h-full"
              style={{ width: `${item.progress * 100}%`, background: "var(--accent)" }}
            />
          </div>
        )}
        <div
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
        >
          <TypeIcon size={9} />
          {item.type === "book" ? "Book" : item.type === "film" ? "Film" : "TV"}
        </div>
      </div>
      <p className="text-sm font-medium mt-2 leading-snug line-clamp-2">{item.title}</p>
      <div
        className="flex items-center gap-1 text-xs mt-0.5"
        style={{ color: "var(--text-secondary)" }}
      >
        <span className="truncate flex-1">{item.creator}</span>
        {item.rating !== undefined && (
          <span className="flex items-center gap-0.5 shrink-0">
            <Star size={10} fill="currentColor" style={{ color: "var(--accent)" }} />
            {item.rating}
          </span>
        )}
      </div>
    </div>
  );
}
