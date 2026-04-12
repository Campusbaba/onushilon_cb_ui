"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Payment, Enrollment, Pagination } from "@/types/viewModels";

export interface PaymentStats {
  byStatus: { _id: string; count: number; totalAmount: number }[];
  totalRevenue: number;
  pendingAmount: number;
}

export function usePayments(initialParams = {}, autoFetch = true) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [enrollmentPagination, setEnrollmentPagination] =
    useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/payments", {
          params: { page: 1, limit: 20, ...params },
        });
        setPayments(res.data.data);
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

  const fetchEnrollments = useCallback(
    async (params: Record<string, unknown> = {}) => {
      setEnrollmentsLoading(true);
      try {
        const res = await api.get("/payments/enrollments", {
          params: { page: 1, limit: 50, ...params },
        });
        setEnrollments(res.data.data);
        setEnrollmentPagination(res.data.pagination ?? null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setEnrollmentsLoading(false);
      }
    },
    [],
  );

  const fetchStudentPayments = useCallback(async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/payments/student/${studentId}`);
      setPayments(res.data.data.payments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllChildrenPayments = useCallback(async (studentIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        studentIds.map((id) => api.get(`/payments/student/${id}`)),
      );
      const allPayments = results.flatMap(
        (res) => res.data.data.payments ?? [],
      );
      allPayments.sort(
        (a: Payment, b: Payment) =>
          new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
      );
      setPayments(allPayments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(
    async (params: Record<string, unknown> = {}) => {
      try {
        const res = await api.get("/payments/stats", { params });
        setStats(res.data.data);
      } catch {
        // silently ignore stats errors
      }
    },
    [],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
      fetchStats();
    }
  }, [autoFetch, fetchPayments, fetchStats]);

  const createPayment = async (payload: Partial<Payment>) => {
    const res = await api.post("/payments", payload);
    await Promise.all([fetchPayments(), fetchStats(), fetchEnrollments()]);
    return res.data.data;
  };

  const updatePayment = async (id: string, payload: Partial<Payment>) => {
    const res = await api.put(`/payments/${id}`, payload);
    await Promise.all([fetchPayments(), fetchStats(), fetchEnrollments()]);
    return res.data.data;
  };

  const deletePayment = async (id: string) => {
    await api.delete(`/payments/${id}`);
    await Promise.all([fetchPayments(), fetchStats(), fetchEnrollments()]);
  };

  const activateStudent = async (paymentId: string) => {
    const res = await api.patch(`/payments/${paymentId}/activate-student`);
    await Promise.all([fetchPayments(), fetchEnrollments()]);
    return res.data;
  };

  return {
    payments,
    enrollments,
    stats,
    pagination,
    enrollmentPagination,
    loading,
    enrollmentsLoading,
    error,
    fetchPayments,
    fetchStudentPayments,
    fetchAllChildrenPayments,
    fetchEnrollments,
    fetchStats,
    createPayment,
    updatePayment,
    deletePayment,
    activateStudent,
  };
}
