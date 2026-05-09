"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

interface DemoBannerProps {
  show: boolean;
}

/**
 * Shown on pages that fell back to mock fixtures because the backend isn't
 * reachable. Links to Settings where the user connects their Gmail.
 */
export function DemoBanner({ show }: DemoBannerProps) {
  if (!show) return null;
  return (
    <div
      className="mx-6 mt-3 mb-1 px-4 py-2.5 rounded-lg border flex items-center gap-3 text-xs"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border)",
        color: "var(--text-secondary)",
      }}
    >
      <Sparkles size={14} style={{ color: "var(--accent)" }} />
      <span className="flex-1">
        Showing demo content. Connect your Gmail to start ingesting real newsletters.
      </span>
      <Link
        href="/settings"
        className="text-xs font-medium hover:opacity-80"
        style={{ color: "var(--accent)" }}
      >
        Settings →
      </Link>
    </div>
  );
}
