"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Newspaper,
  Layers,
  Headphones,
  Library,
  StickyNote,
  Compass,
  Settings,
  ChevronDown,
  Hash,
  Folder,
  Plus,
} from "lucide-react";
import { MOCK_SOURCE_FOLDERS, MOCK_TOPICS } from "@/lib/mock-data";

const primaryNav = [
  { href: "/", label: "Today", icon: Sparkles },
  { href: "/reading", label: "Reading", icon: Newspaper },
  { href: "/topics", label: "Topics", icon: Layers },
  { href: "/listen", label: "Listen", icon: Headphones },
  { href: "/library", label: "Library", icon: Library },
  { href: "/notes", label: "Notes & Highlights", icon: StickyNote },
  { href: "/discover", label: "Discover", icon: Compass },
];

export function Sidebar() {
  const pathname = usePathname();
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    "Daily reads": true,
  });

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className="w-64 shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2 px-4 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent)" }}
        >
          <Sparkles size={15} color="#fff" />
        </div>
        <span className="font-semibold text-base tracking-tight">ClaudeNews</span>
      </div>

      {/* Scrollable nav body */}
      <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-4">
        {/* Primary nav */}
        <nav className="flex flex-col gap-0.5">
          {primaryNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "font-medium" : "hover:opacity-80"
                )}
                style={{
                  background: active ? "var(--surface-raised)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sources tree */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSourcesOpen((v) => !v)}
            className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="flex items-center gap-1.5">
              <ChevronDown
                size={12}
                className="transition-transform"
                style={{ transform: sourcesOpen ? "none" : "rotate(-90deg)" }}
              />
              Sources
            </span>
            <Plus size={12} />
          </button>

          {sourcesOpen && (
            <div className="flex flex-col gap-0.5">
              {MOCK_SOURCE_FOLDERS.map((folder) => {
                const open = openFolders[folder.name];
                const totalUnread = folder.feeds.reduce((s, f) => s + f.unread, 0);
                return (
                  <div key={folder.name}>
                    <button
                      onClick={() =>
                        setOpenFolders((p) => ({ ...p, [folder.name]: !p[folder.name] }))
                      }
                      className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm hover:opacity-80"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Folder size={14} />
                        <span className="truncate">{folder.name}</span>
                      </span>
                      <span className="text-xs">{totalUnread}</span>
                    </button>
                    {open && (
                      <div className="flex flex-col gap-0.5 ml-5 my-0.5">
                        {folder.feeds.map((f) => (
                          <div
                            key={f.name}
                            className="flex items-center justify-between gap-2 px-3 py-1 rounded-md text-sm hover:opacity-80 cursor-pointer"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <span className="truncate">{f.name}</span>
                            {f.unread > 0 && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: "var(--surface-raised)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {f.unread}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Topics tree */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setTopicsOpen((v) => !v)}
            className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="flex items-center gap-1.5">
              <ChevronDown
                size={12}
                className="transition-transform"
                style={{ transform: topicsOpen ? "none" : "rotate(-90deg)" }}
              />
              Topics
            </span>
            <Plus size={12} />
          </button>

          {topicsOpen && (
            <div className="flex flex-col gap-0.5">
              {MOCK_TOPICS.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm hover:opacity-80",
                    pathname === `/topics/${t.slug}` && "font-medium"
                  )}
                  style={{
                    background:
                      pathname === `/topics/${t.slug}` ? "var(--surface-raised)" : "transparent",
                    color:
                      pathname === `/topics/${t.slug}`
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                  }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Hash size={13} />
                    <span className="truncate">{t.name}</span>
                  </span>
                  {t.unreadCount > 0 && (
                    <span className="text-xs">{t.unreadCount}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Settings */}
      <div className="px-2 py-3 border-t" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
