"use client";
import { useApi } from "@/hooks/useApi";
import type { DashboardStats } from "@/types/viewModels";

export function useDashboard() {
  const stats = useApi<DashboardStats>("/dashboard/stats");
  const enrollmentRatio = useApi<unknown[]>(
    "/dashboard/student-enrollment-ratio",
  );
  const activeRatio = useApi<unknown[]>("/dashboard/active-student-ratio");
  const attendanceRatio = useApi<unknown[]>("/dashboard/attendance-ratio");
  const todaysSchedule = useApi<unknown[]>("/dashboard/todays-schedule");
  const paymentStats = useApi<unknown>("/payments/stats");

  return {
    stats,
    enrollmentRatio,
    activeRatio,
    attendanceRatio,
    todaysSchedule,
    paymentStats,
  };
}
