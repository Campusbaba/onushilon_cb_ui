import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "—";
  try {
    return format(new Date(date), "MMM dd, yyyy");
  } catch {
    return "—";
  }
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "৳0";
  return `৳${amount.toLocaleString()}`;
}
