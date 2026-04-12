"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Expense, Pagination } from "@/types/viewModels";

export function useExpenses(initialParams = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/expenses", {
          params: { page: 1, limit: 20, ...params },
        });
        setExpenses(res.data.data);
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
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (payload: Partial<Expense>) => {
    const res = await api.post("/expenses", payload);
    await fetchExpenses();
    return res.data.data;
  };

  const updateExpense = async (id: string, payload: Partial<Expense>) => {
    const res = await api.put(`/expenses/${id}`, payload);
    await fetchExpenses();
    return res.data.data;
  };

  const deleteExpense = async (id: string) => {
    await api.delete(`/expenses/${id}`);
    await fetchExpenses();
  };

  return {
    expenses,
    pagination,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
