"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Parent, Student, Pagination } from "@/types/viewModels";

export function useParents(initialParams = {}, autoFetch = true) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Student[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParents = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/parents", {
          params: { page: 1, limit: 20, ...params },
        });
        setParents(res.data.data);
        setPagination(res.data.pagination ?? null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (autoFetch) fetchParents();
  }, [autoFetch, fetchParents]);

  const createParent = async (payload: Partial<Parent>) => {
    const res = await api.post("/parents", payload);
    await fetchParents();
    return res.data.data;
  };

  const updateParent = async (id: string, payload: Partial<Parent>) => {
    const res = await api.put(`/parents/${id}`, payload);
    await fetchParents();
    return res.data.data;
  };

  const deleteParent = async (id: string) => {
    await api.delete(`/parents/${id}`);
    await fetchParents();
  };

  const fetchChildren = useCallback(
    async (parentId: string): Promise<Student[]> => {
      setChildrenLoading(true);
      try {
        const res = await api.get(`/parents/${parentId}/children`);
        const data: Student[] = res.data.data ?? [];
        setChildren(data);
        return data;
      } finally {
        setChildrenLoading(false);
      }
    },
    [],
  );

  return {
    parents,
    children,
    childrenLoading,
    pagination,
    loading,
    error,
    fetchParents,
    fetchChildren,
    createParent,
    updateParent,
    deleteParent,
  };
}
