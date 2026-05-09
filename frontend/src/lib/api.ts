// API client for the ClaudeNews backend.
//
// Base URL is read from NEXT_PUBLIC_API_URL at build time. When the env var
// isn't set (or the backend isn't reachable from the browser), pages fall
// back to mock fixtures and surface a small "demo data" banner.

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export type ArticleSourceKind = "rss" | "newsletter" | "saved" | "suggested" | "manual";

export interface Article {
  id: string;
  title: string;
  source: string;
  sourceKind: ArticleSourceKind;
  summary?: string;
  imageUrl?: string;
  url: string;
  publishedAt: string;
  readTimeMinutes: number;
  readProgress?: number;
  isRead: boolean;
  isSaved: boolean;
  tags: string[];
  whyItMatters?: string;
}

interface ArticleApiResponse {
  id: string;
  url: string;
  title: string;
  author: string | null;
  image_url: string | null;
  summary: string | null;
  why_it_matters: string | null;
  read_time_minutes: number | null;
  status: string;
  is_saved: boolean;
  published_at: string | null;
  created_at: string;
  source: string | null;
  source_kind: string | null;
  external_source: string | null;
  tags: string[];
}

function mapApiArticle(a: ArticleApiResponse): Article {
  const sourceKind = (a.source_kind ??
    (a.external_source === "gmail" ? "newsletter" : "rss")) as ArticleSourceKind;
  return {
    id: a.id,
    title: a.title,
    source: a.source ?? "Unknown source",
    sourceKind,
    summary: a.summary ?? undefined,
    whyItMatters: a.why_it_matters ?? undefined,
    imageUrl: a.image_url ?? undefined,
    url: a.url,
    publishedAt: relativeTime(a.published_at ?? a.created_at),
    readTimeMinutes: a.read_time_minutes ?? estimateReadTime(a.summary),
    isRead: a.status === "read",
    isSaved: a.is_saved,
    tags: a.tags,
  };
}

function estimateReadTime(text: string | null): number {
  if (!text) return 1;
  return Math.max(1, Math.round(text.split(/\s+/).length / 220));
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export interface ListArticlesParams {
  status?: "unread" | "read" | "archived";
  isSaved?: boolean;
  limit?: number;
  offset?: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!resp.ok) {
    throw new Error(`API ${resp.status}: ${await resp.text().catch(() => resp.statusText)}`);
  }
  return resp.json() as Promise<T>;
}

export const articlesApi = {
  async list(params: ListArticlesParams = {}): Promise<Article[]> {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.isSaved !== undefined) qs.set("is_saved", String(params.isSaved));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    const data = await request<ArticleApiResponse[]>(
      `/api/articles/${qs.toString() ? `?${qs}` : ""}`
    );
    return data.map(mapApiArticle);
  },

  async toggleSave(id: string): Promise<{ is_saved: boolean }> {
    return request(`/api/articles/${id}/save`, { method: "POST" });
  },

  async markRead(id: string): Promise<{ ok: true }> {
    return request(`/api/articles/${id}/read`, { method: "POST" });
  },
};

export const ingestApi = {
  async run(maxMessages = 25): Promise<{
    fetched: number;
    inserted: number;
    skipped_duplicate: number;
    skipped_empty: number;
    summarised: number;
  }> {
    return request(`/api/ingest/run?max_messages=${maxMessages}`, { method: "POST" });
  },
};

export const authApi = {
  googleLoginUrl: () => `${API_BASE}/auth/google`,
  async googleStatus(): Promise<{
    connected: boolean;
    account_email?: string;
    last_synced_at?: string | null;
    scopes?: string[];
  }> {
    return request(`/auth/google/status`);
  },
  async googleDisconnect(): Promise<{ ok: true }> {
    return request(`/auth/google/disconnect`, { method: "POST" });
  },
};
