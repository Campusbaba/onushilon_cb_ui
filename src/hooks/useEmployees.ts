"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Employee, Pagination } from "@/types/viewModels";

export function useEmployees(initialParams = {}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/employees", {
          params: { page: 1, limit: 20, ...params },
        });
        setEmployees(res.data.data);
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
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (payload: Partial<Employee>) => {
    const res = await api.post("/employees", payload);
    await fetchEmployees();
    return res.data.data;
  };

  const updateEmployee = async (id: string, payload: Partial<Employee>) => {
    const res = await api.put(`/employees/${id}`, payload);
    await fetchEmployees();
    return res.data.data;
  };

  const deleteEmployee = async (id: string) => {
    await api.delete(`/employees/${id}`);
    await fetchEmployees();
  };

  return {
    employees,
    pagination,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
