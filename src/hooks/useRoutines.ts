"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { Routine, Pagination } from "@/types/viewModels";

export function useRoutines(initialParams = {}, autoFetch = true) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/routines", {
          params: { page: 1, limit: 50, ...params },
        });
        setRoutines(res.data.data);
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
    if (autoFetch) fetchRoutines();
  }, [fetchRoutines]);

  const createRoutine = async (payload: Partial<Routine>) => {
    const res = await api.post("/routines", payload);
    await fetchRoutines();
    return res.data.data;
  };

  const updateRoutine = async (id: string, payload: Partial<Routine>) => {
    const res = await api.put(`/routines/${id}`, payload);
    await fetchRoutines();
    return res.data.data;
  };

  const deleteRoutine = async (id: string) => {
    await api.delete(`/routines/${id}`);
    await fetchRoutines();
  };

  const fetchRoutinesByClassRoom = useCallback(
    async (classRoomId: string): Promise<Record<string, Routine[]>> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/routines/classroom/${classRoomId}`);
        const grouped = res.data.data as Record<string, Routine[]>;
        setRoutines(Object.values(grouped).flat());
        return grouped;
      } catch (err) {
        setError((err as Error).message);
        setRoutines([]);
        return {};
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchRoutinesByTeacher = useCallback(
    async (teacherId: string): Promise<Record<string, Routine[]>> => {
      const res = await api.get(`/routines/teacher/${teacherId}`);
      return res.data.data as Record<string, Routine[]>;
    },
    [],
  );

  return {
    routines,
    pagination,
    loading,
    error,
    fetchRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    fetchRoutinesByClassRoom,
    fetchRoutinesByTeacher,
  };
}
