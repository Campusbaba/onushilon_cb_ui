"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Teacher, Pagination } from "@/types/viewModels";

export function useTeachers(initialParams = {}) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/teachers", {
          params: { page: 1, limit: 20, ...params },
        });
        setTeachers(res.data.data);
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
    fetchTeachers();
  }, [fetchTeachers]);

  const createTeacher = async (payload: Partial<Teacher>) => {
    const res = await api.post("/teachers", payload);
    await fetchTeachers();
    return res.data.data;
  };

  const updateTeacher = async (id: string, payload: Partial<Teacher>) => {
    const res = await api.put(`/teachers/${id}`, payload);
    await fetchTeachers();
    return res.data.data;
  };

  const deleteTeacher = async (id: string) => {
    await api.delete(`/teachers/${id}`);
    await fetchTeachers();
  };

  return {
    teachers,
    pagination,
    loading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  };
}
