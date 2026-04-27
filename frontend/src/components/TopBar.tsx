"use client";

import { Search, Bell, RefreshCw } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b shrink-0 sticky top-0 z-10"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm w-56"
          style={{ background: "var(--surface-raised)", color: "var(--text-secondary)" }}
        >
          <Search size={14} />
          <span>Search...</span>
        </div>
        <button
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
        <button
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
          title="Notifications"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
