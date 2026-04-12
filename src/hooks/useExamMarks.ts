"use client";
import { useState, useCallback } from "react";
import api from "@/lib/axios";
import type { ExamMark } from "@/types/viewModels";

export function useExamMarks() {
  const [marks, setMarks] = useState<ExamMark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMarks = useCallback(async (examId: string) => {
    setLoading(true);
    try {
      const res = await api.get("/exams/marks", {
        params: { examId, limit: 200 },
      });
      setMarks(res.data.data ?? []);
    } catch {
      setMarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMark = async (payload: {
    examId: string;
    studentId: string;
    marksObtained: number;
    grade?: string;
    remarks?: string;
    status?: string;
  }) => {
    const res = await api.post("/exams/marks", payload);
    return res.data.data as ExamMark;
  };

  const updateMark = async (
    id: string,
    payload: Partial<{
      marksObtained: number;
      grade: string;
      remarks: string;
      status: string;
    }>,
  ) => {
    const res = await api.put(`/exams/marks/${id}`, payload);
    return res.data.data as ExamMark;
  };

  const deleteMark = async (id: string) => {
    await api.delete(`/exams/marks/${id}`);
  };

  const fetchMarksByClassRoom = useCallback(
    async (classRoomId: string, params: Record<string, unknown> = {}) => {
      setLoading(true);
      try {
        const res = await api.get(`/exams/marks/classroom/${classRoomId}`, {
          params: { page: 1, limit: 200, ...params },
        });
        return res.data.data as ExamMark[];
      } catch {
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchMarksByClassRooms = useCallback(
    async (classRoomIds: string[], params: Record<string, unknown> = {}) => {
      setLoading(true);
      try {
        const promises = classRoomIds.map((id) =>
          api.get(`/exams/marks/classroom/${id}`, {
            params: { page: 1, limit: 200, ...params },
          }),
        );
        const results = await Promise.all(promises);
        const allMarks = results.flatMap((res) => res.data.data);
        setMarks(allMarks);
        return allMarks;
      } catch {
        setMarks([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchStudentExamResults = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/exams/marks/student/${studentId}`);
      const data: ExamMark[] = res.data.data ?? [];
      setMarks(data);
      return data;
    } catch {
      setMarks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    marks,
    loading,
    fetchMarks,
    createMark,
    updateMark,
    deleteMark,
    fetchMarksByClassRoom,
    fetchMarksByClassRooms,
    fetchStudentExamResults,
  };
}
