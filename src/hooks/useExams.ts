"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Exam, Pagination } from "@/types/viewModels";

export function useExams(initialParams = {}, autoFetch = true) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/exams", {
          params: { page: 1, limit: 20, ...params },
        });
        setExams(res.data.data);
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
    if (autoFetch) {
      fetchExams();
    }
  }, [fetchExams, autoFetch]);

  const createExam = async (payload: Partial<Exam>) => {
    const res = await api.post("/exams", payload);
    await fetchExams();
    return res.data.data;
  };

  const updateExam = async (id: string, payload: Partial<Exam>) => {
    const res = await api.put(`/exams/${id}`, payload);
    await fetchExams();
    return res.data.data;
  };

  const deleteExam = async (id: string) => {
    await api.delete(`/exams/${id}`);
    await fetchExams();
  };

  const fetchExamsByClassRooms = useCallback(
    async (classRoomIds: string[], params: Record<string, unknown> = {}) => {
      setLoading(true);
      setError(null);
      try {
        const promises = classRoomIds.map((id) =>
          api.get(`/exams/classroom/${id}`, {
            params: { page: 1, limit: 50, ...params },
          }),
        );
        const results = await Promise.all(promises);
        const allExams = results.flatMap((res) => res.data.data);
        setExams(allExams);
        return allExams;
      } catch (err) {
        setError((err as Error).message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    exams,
    pagination,
    loading,
    error,
    fetchExams,
    createExam,
    updateExam,
    deleteExam,
    fetchExamsByClassRooms,
  };
}
