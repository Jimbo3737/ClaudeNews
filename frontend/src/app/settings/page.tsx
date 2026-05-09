"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Mic, BookOpen, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { authApi, digestApi, ingestApi } from "@/lib/api";

interface GmailStatus {
  connected: boolean;
  account_email?: string;
  last_synced_at?: string | null;
  scopes?: string[];
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<TopBar title="Settings" />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const params = useSearchParams();
  const justConnected = params.get("connected") === "google";

  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreachable, setUnreachable] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [digestResult, setDigestResult] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const s = await authApi.googleStatus();
      setStatus(s);
      setUnreachable(false);
    } catch {
      setStatus({ connected: false });
      setUnreachable(true);
    } finally {
      setLoading(false);
    }
  }

  async function syncNow() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const r = await ingestApi.run(50);
      setSyncResult(
        `Fetched ${r.fetched}, added ${r.inserted} new` +
          (r.summarised ? ` (${r.summarised} summarised)` : "") +
          (r.skipped_duplicate ? `, skipped ${r.skipped_duplicate} duplicate` : "") +
          (r.skipped_empty ? `, skipped ${r.skipped_empty} empty` : "") +
          "."
      );
      await refresh();
    } catch (err) {
      setSyncResult(`Sync failed: ${(err as Error).message}`);
    } finally {
      setSyncing(false);
    }
  }

  async function generateDigest(force = false) {
    setGeneratingDigest(true);
    setDigestResult(null);
    try {
      const r = await digestApi.generate(force);
      if (r.status === "no_candidates") {
        setDigestResult("No articles in the last 36 hours — sync your inbox first.");
      } else if (r.status === "ready") {
        setDigestResult(
          `Today's brief is ready: ${r.pick_count} pick${r.pick_count === 1 ? "" : "s"} from ${r.candidate_count} candidates.`
        );
      } else {
        setDigestResult(`Status: ${r.status}`);
      }
    } catch (err) {
      setDigestResult(`Generation failed: ${(err as Error).message}`);
    } finally {
      setGeneratingDigest(false);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect Gmail? Newsletters will stop being ingested.")) return;
    try {
      await authApi.googleDisconnect();
      await refresh();
    } catch (err) {
      alert(`Failed to disconnect: ${(err as Error).message}`);
    }
  }

  return (
    <>
      <TopBar title="Settings" subtitle="Account, integrations, digest, reading" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
          {justConnected && (
            <div
              className="rounded-lg border px-4 py-3 flex items-center gap-2 text-sm"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
              Gmail connected. Click <strong>Sync now</strong> below to pull recent newsletters.
            </div>
          )}

          {/* Connected accounts */}
          <Section
            title="Connected accounts"
            description="Gmail powers newsletter ingest. Bookmark sync, podcast OPML and library imports come later."
          >
            <Card>
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: "var(--surface-raised)" }}
                >
                  <Mail size={16} style={{ color: "var(--text-secondary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Gmail (newsletter ingest)</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {unreachable
                      ? "Backend not reachable from this browser. Connect once the API is deployed."
                      : loading
                      ? "Checking…"
                      : status?.connected
                      ? `Connected as ${status.account_email ?? "unknown account"}`
                      : "Not connected"}
                  </p>
                  {!unreachable && status?.connected && status.last_synced_at && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Last synced {new Date(status.last_synced_at).toLocaleString()}
                    </p>
                  )}
                  {syncResult && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {syncResult}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {status?.connected ? (
                    <>
                      <button
                        onClick={syncNow}
                        disabled={syncing || unreachable}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                        style={{ background: "var(--accent)", color: "#fff" }}
                      >
                        <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing…" : "Sync now"}
                      </button>
                      <button
                        onClick={disconnect}
                        className="px-3 py-1.5 rounded-lg text-sm hover:opacity-90"
                        style={{
                          background: "var(--surface-raised)",
                          color: "var(--text-primary)",
                        }}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <a
                      href={authApi.googleLoginUrl()}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      Connect Gmail
                    </a>
                  )}
                </div>
              </div>
            </Card>

            <PlaceholderRow
              icon={BookOpen}
              title="Bookmarks (Chrome / Safari)"
              hint="Bulk-import your existing browser bookmarks"
            />
            <PlaceholderRow
              icon={Mic}
              title="Apple Podcasts (OPML)"
              hint="Two-way subscription sync via OPML import/export"
            />
            <PlaceholderRow
              icon={BookOpen}
              title="Goodreads / Storygraph"
              hint="CSV import for books and ratings"
            />
            <PlaceholderRow
              icon={BookOpen}
              title="Letterboxd / Trakt"
              hint="Films and TV shows synced into your Library"
            />
          </Section>

          {/* Daily digest */}
          <Section
            title="Daily digest"
            description="A short brief of the day's most relevant articles, also delivered as a private podcast."
          >
            <Card>
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: "var(--surface-raised)" }}
                >
                  <Sparkles size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Today&apos;s brief</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Generate text now; podcast pipeline lands next.
                  </p>
                  {digestResult && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {digestResult}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => generateDigest(false)}
                    disabled={generatingDigest || unreachable}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    <RefreshCw size={13} className={generatingDigest ? "animate-spin" : ""} />
                    {generatingDigest ? "Generating…" : "Generate"}
                  </button>
                  <button
                    onClick={() => generateDigest(true)}
                    disabled={generatingDigest || unreachable}
                    className="px-3 py-1.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-40"
                    style={{
                      background: "var(--surface-raised)",
                      color: "var(--text-primary)",
                    }}
                    title="Force regeneration even if today's digest already exists"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <Field label="Generate at" value="07:00 local (manual for now)" />
                <Field label="Number of stories" value="3–5" />
                <Field label="Voice" value="OpenAI · Onyx (not wired)" />
                <Field label="Episode length cap" value="~8 min" />
              </div>
            </Card>
          </Section>

          {/* Reading */}
          <Section
            title="Reading"
            description="Defaults applied when you open the reader pane."
          >
            <Card>
              <Field label="Font" value="Geist" />
              <Field label="Default density" value="Magazine" />
              <Field label="Show read articles" value="Hidden in Inbox" />
            </Card>
          </Section>

          {/* AI */}
          <Section
            title="AI"
            description="Per-article summaries, daily brief, weekly topic summaries."
          >
            <Card>
              <Field label="Model" value="Claude · Sonnet 4.6" />
              <Field label="Per-article summary" value="On ingest" />
              <Field label="Topic weekly summary" value="Sunday morning" />
            </Card>
          </Section>

          <p
            className="text-xs text-center pt-2 pb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            More toggles land alongside the features that need them.
          </p>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between py-2 border-b last:border-b-0"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function PlaceholderRow({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  hint: string;
}) {
  return (
    <div
      className="rounded-xl border p-3 flex items-center gap-3 opacity-60"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
        style={{ background: "var(--surface-raised)" }}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {hint}
        </p>
      </div>
      <span
        className="text-xs px-2 py-1 rounded-full"
        style={{ background: "var(--surface-raised)", color: "var(--text-secondary)" }}
      >
        Coming soon
      </span>
    </div>
  );
}
