"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Student, Pagination } from "@/types/viewModels";

export function useStudents(initialParams = {}, autoFetch = true) {
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/students", {
          params: { page: 1, limit: 20, ...params },
        });
        setStudents(res.data.data);
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

  const fetchStudent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/students/${id}`);
      setStudent(res.data.data);
      return res.data.data;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchStudents();
  }, [fetchStudents, autoFetch]);

  const createStudent = async (payload: Partial<Student>) => {
    const res = await api.post("/students", payload);
    await fetchStudents();
    return res.data.data;
  };

  const updateStudent = async (id: string, payload: Partial<Student>) => {
    const res = await api.put(`/students/${id}`, payload);
    await fetchStudents();
    return res.data.data;
  };

  const deleteStudent = async (id: string) => {
    await api.delete(`/students/${id}`);
    await fetchStudents();
  };

  return {
    students,
    student,
    pagination,
    loading,
    error,
    fetchStudents,
    fetchStudent,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}
