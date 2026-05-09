"use client";

import { useEffect, useState } from "react";
import { digestApi, type Digest } from "./api";

export interface UseDigestResult {
  digest: Digest | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches today's digest from the backend. Returns `null` (not an error) if
 * no digest exists for today yet — the Today page falls back to mock brief
 * picks in that case.
 */
export function useDigest(): UseDigestResult {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    digestApi
      .today()
      .then((d) => {
        if (cancelled) return;
        setDigest(d);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(String(err?.message ?? err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    digest,
    loading,
    error,
    reload: () => setReloadKey((k) => k + 1),
  };
}
