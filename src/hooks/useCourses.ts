"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Course, Pagination } from "@/types/viewModels";

export function useCourses(initialParams = {}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/courses", {
          params: { page: 1, limit: 50, ...params },
        });
        setCourses(res.data.data);
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
    fetchCourses();
  }, [fetchCourses]);

  const createCourse = async (payload: Partial<Course>) => {
    const res = await api.post("/courses", payload);
    await fetchCourses();
    return res.data.data;
  };

  const updateCourse = async (id: string, payload: Partial<Course>) => {
    const res = await api.put(`/courses/${id}`, payload);
    await fetchCourses();
    return res.data.data;
  };

  const deleteCourse = async (id: string) => {
    await api.delete(`/courses/${id}`);
    await fetchCourses();
  };

  return {
    courses,
    pagination,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
