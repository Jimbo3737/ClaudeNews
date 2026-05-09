"use client";

import { Play, SkipBack, SkipForward, X } from "lucide-react";
import { useState } from "react";

export function MiniPlayer() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  // Mocked "now playing"
  const np = {
    title: "Inside the AGI lab",
    show: "Hard Fork",
    cover: "linear-gradient(135deg, #4f7cff, #1e3a8a)",
    progress: 0.32,
  };

  return (
    <div
      className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:bottom-4 md:w-[420px] z-20 rounded-xl border shadow-lg flex items-center gap-3 px-3 py-2"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="w-10 h-10 rounded-md shrink-0" style={{ background: np.cover }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{np.title}</p>
        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
          {np.show}
        </p>
        <div
          className="h-0.5 rounded-full mt-1.5"
          style={{ background: "var(--surface-raised)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${np.progress * 100}%`, background: "var(--accent)" }}
          />
        </div>
      </div>
      <div
        className="flex items-center gap-0.5 shrink-0"
        style={{ color: "var(--text-secondary)" }}
      >
        <button
          className="p-1.5 rounded hover:bg-[var(--surface-raised)]"
          title="Previous 15s"
        >
          <SkipBack size={14} />
        </button>
        <button
          className="p-2 rounded-full"
          style={{ background: "var(--accent)", color: "#fff" }}
          title="Play"
        >
          <Play size={14} fill="#fff" />
        </button>
        <button
          className="p-1.5 rounded hover:bg-[var(--surface-raised)]"
          title="Next 30s"
        >
          <SkipForward size={14} />
        </button>
        <button
          className="p-1.5 rounded hover:bg-[var(--surface-raised)] ml-1"
          onClick={() => setVisible(false)}
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
