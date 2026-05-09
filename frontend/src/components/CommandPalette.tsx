"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  Sparkles,
  Newspaper,
  Layers,
  Headphones,
  Library,
  StickyNote,
  Hash,
  Plus,
  RefreshCw,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MOCK_TOPICS, MOCK_ARTICLES } from "@/lib/mock-data";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Item {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ComponentType<{ size?: number }>;
  href?: string;
  onSelect?: () => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const items: Item[] = [
    { id: "go-today", label: "Go to Today", group: "Navigate", icon: Sparkles, href: "/" },
    { id: "go-reading", label: "Go to Reading", group: "Navigate", icon: Newspaper, href: "/reading" },
    { id: "go-topics", label: "Go to Topics", group: "Navigate", icon: Layers, href: "/topics" },
    { id: "go-listen", label: "Go to Listen", group: "Navigate", icon: Headphones, href: "/listen" },
    { id: "go-library", label: "Go to Library", group: "Navigate", icon: Library, href: "/library" },
    { id: "go-notes", label: "Go to Notes & Highlights", group: "Navigate", icon: StickyNote, href: "/notes" },

    { id: "act-save", label: "Save URL…", hint: "⇧⌘S", group: "Actions", icon: Plus },
    { id: "act-mark-read", label: "Mark all as read", group: "Actions", icon: RefreshCw },
    { id: "act-digest", label: "Generate today's digest", group: "Actions", icon: Mic },
    { id: "act-ask-claude", label: "Ask Claude about this week…", group: "Actions", icon: Sparkles },

    ...MOCK_TOPICS.map<Item>((t) => ({
      id: `topic-${t.slug}`,
      label: t.name,
      hint: `${t.unreadCount} unread`,
      group: "Topics",
      icon: Hash,
      href: `/topics/${t.slug}`,
    })),

    ...MOCK_ARTICLES.slice(0, 5).map<Item>((a) => ({
      id: `art-${a.id}`,
      label: a.title,
      hint: a.source,
      group: "Articles",
      icon: Newspaper,
    })),
  ];

  const filtered = query
    ? items.filter((i) =>
        (i.label + " " + (i.hint ?? "")).toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.group] ??= []).push(i);
    return acc;
  }, {});

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)" }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-[15%] z-50 -translate-x-1/2 w-[92vw] max-w-xl rounded-xl border overflow-hidden shadow-2xl outline-none"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Dialog.Title className="sr-only">Search and commands</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search articles, jump to a section, or run actions.
          </Dialog.Description>

          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <Search size={16} style={{ color: "var(--text-secondary)" }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, jump to, or run command…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
            <kbd
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: "var(--surface-raised)", color: "var(--text-secondary)" }}
            >
              ESC
            </kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto py-2">
            {Object.keys(grouped).length === 0 && (
              <div
                className="px-4 py-8 text-sm text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                No matches.
              </div>
            )}
            {Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group} className="mb-2">
                <div
                  className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {group}
                </div>
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const inner = (
                    <div
                      className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[var(--surface-raised)]"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => onOpenChange(false)}
                    >
                      <Icon size={14} />
                      <span className="flex-1 text-sm truncate">{item.label}</span>
                      {item.hint && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.hint}
                        </span>
                      )}
                    </div>
                  );
                  return item.href ? (
                    <Link key={item.id} href={item.href}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={item.id}>{inner}</div>
                  );
                })}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
