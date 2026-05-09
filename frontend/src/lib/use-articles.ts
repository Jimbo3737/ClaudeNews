"use client";

import { useEffect, useState } from "react";
import { articlesApi, type Article, type ListArticlesParams } from "./api";
import { MOCK_ARTICLES } from "./mock-data";

export interface UseArticlesResult {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  isDemo: boolean;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches articles from the backend, falling back to MOCK_ARTICLES if the
 * backend isn't reachable (e.g. on the Vercel preview before we deploy the API).
 *
 * `isDemo` is true when we're showing mock data so callers can render a banner.
 */
export function useArticles(params: ListArticlesParams = {}): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Stable string key so we don't re-fetch on every render.
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    articlesApi
      .list(params)
      .then((data) => {
        if (cancelled) return;
        setArticles(data);
        setIsDemo(false);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        // Quiet fall-back — mock data is already in state from initial useState.
        setIsDemo(true);
        setError(String(err?.message ?? err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, reloadKey]);

  return {
    articles,
    setArticles,
    isDemo,
    loading,
    error,
    reload: () => setReloadKey((k) => k + 1),
  };
}
