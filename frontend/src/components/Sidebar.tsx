"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Mail,
  Bookmark,
  StickyNote,
  Library,
  Compass,
  Mic,
  Settings,
  Newspaper,
} from "lucide-react";

const nav = [
  { href: "/", label: "Feed", icon: LayoutGrid },
  { href: "/inbox", label: "Inbox", icon: Mail },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notes", label: "Notes & Quotes", icon: StickyNote },
  { href: "/library", label: "Library", icon: Library },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/digest", label: "Digest", icon: Mic },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 px-4 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Newspaper size={20} style={{ color: "var(--accent)" }} />
        <span className="font-semibold text-base tracking-tight">ClaudeNews</span>
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "font-medium"
                  : "hover:opacity-80"
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

      <div className="px-2 py-3 border-t" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
