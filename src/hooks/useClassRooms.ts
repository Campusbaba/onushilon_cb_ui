"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import type { ClassRoom, Pagination } from "@/types/viewModels";

export function useClassRooms(
  initialParams = {},
  autoFetch = true,
  teacherId?: string,
) {
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassRooms = useCallback(
    async (params: Record<string, unknown> = initialParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/classrooms", {
          params: { page: 1, limit: 50, ...params },
        });
        setClassRooms(res.data.data);
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

  const fetchClassRoomsByTeacher = useCallback(
    async (id: string): Promise<ClassRoom[]> => {
      const res = await api.get(`/classrooms/teacher/${id}`);
      return res.data.data as ClassRoom[];
    },
    [],
  );

  useEffect(() => {
    if (!autoFetch) return;
    if (teacherId) {
      fetchClassRoomsByTeacher(teacherId).then(setClassRooms);
    } else {
      fetchClassRooms();
    }
  }, [fetchClassRooms, fetchClassRoomsByTeacher, autoFetch, teacherId]);

  const createClassRoom = async (payload: Partial<ClassRoom>) => {
    const res = await api.post("/classrooms", payload);
    await fetchClassRooms();
    return res.data.data;
  };

  const updateClassRoom = async (id: string, payload: Partial<ClassRoom>) => {
    const res = await api.put(`/classrooms/${id}`, payload);
    await fetchClassRooms();
    return res.data.data;
  };

  const deleteClassRoom = async (id: string) => {
    await api.delete(`/classrooms/${id}`);
    await fetchClassRooms();
  };

  return {
    classRooms,
    pagination,
    loading,
    error,
    fetchClassRooms,
    createClassRoom,
    updateClassRoom,
    deleteClassRoom,
    fetchClassRoomsByTeacher,
  };
}
