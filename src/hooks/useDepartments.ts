"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Department, Pagination } from "@/types/viewModels";

export function useDepartments(initialParams = {}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/departments", {
          params: { page: 1, limit: 50, ...params },
        });
        setDepartments(res.data.data);
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
    fetchDepartments();
  }, [fetchDepartments]);

  const createDepartment = async (payload: Partial<Department>) => {
    const res = await api.post("/departments", payload);
    await fetchDepartments();
    return res.data.data;
  };

  const updateDepartment = async (id: string, payload: Partial<Department>) => {
    const res = await api.put(`/departments/${id}`, payload);
    await fetchDepartments();
    return res.data.data;
  };

  const deleteDepartment = async (id: string) => {
    await api.delete(`/departments/${id}`);
    await fetchDepartments();
  };

  return {
    departments,
    pagination,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}
