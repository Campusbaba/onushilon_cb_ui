import type { Attendance } from "@/types/viewModels";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function buildMonthlyChartData(attendances: Attendance[]) {
  const today = new Date();
  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (2 - i), 1);
    return { label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` };
  });

  const grouped: Record<string, { present: number; total: number }> = {};
  for (const { label } of months) {
    grouped[label] = { present: 0, total: 0 };
  }

  for (const a of attendances) {
    const d = new Date(a.date);
    const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    if (grouped[label]) {
      grouped[label].total += 1;
      if (a.status === "present" || a.status === "late")
        grouped[label].present += 1;
    }
  }

  return months.map(({ label }) => ({
    month: label,
    "Attendance Rate":
      grouped[label].total > 0
        ? Math.round((grouped[label].present / grouped[label].total) * 100)
        : null,
  }));
}
