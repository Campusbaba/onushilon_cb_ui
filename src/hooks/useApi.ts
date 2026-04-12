"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = { immediate: true },
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<{ success: boolean; data: T }>(url, {
          params,
        });
        setData(res.data.data ?? (res.data as unknown as T));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  useEffect(() => {
    if (options.immediate) fetch();
  }, [fetch, options.immediate]);

  return { data, loading, error, refetch: fetch };
}

export function useMutation<TData, TPayload>(
  url: string,
  method: "post" | "put" | "delete" = "post",
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (payload?: TPayload, id?: string): Promise<TData | null> => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = id ? `${url}/${id}` : url;
        const res =
          method === "delete"
            ? await api.delete<{ data: TData }>(endpoint)
            : method === "put"
              ? await api.put<{ data: TData }>(endpoint, payload)
              : await api.post<{ data: TData }>(endpoint, payload);
        return res.data.data;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method],
  );

  return { mutate, loading, error };
}
