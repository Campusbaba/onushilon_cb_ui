"use client";
import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/hooks/useAuth";
import { Payment } from "@/types/viewModels";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentPaymentsPage() {
    const { referenceId } = useAuth();
    const { payments, loading, fetchStudentPayments } = usePayments({}, false);

    useEffect(() => {
        if (!referenceId) return;
        fetchStudentPayments(referenceId);
    }, [referenceId, fetchStudentPayments]);

    const columns: ColumnDef<Payment, unknown>[] = [
        { id: "academicYear", header: "Year", accessorKey: "academicYear" },
        { id: "semester", header: "Semester", accessorKey: "semester" },
        {
            id: "paymentType", header: "Type",
            accessorFn: (r) => r.paymentType ? r.paymentType.charAt(0).toUpperCase() + r.paymentType.slice(1) : "Unknown"
        },
        {
            id: "amount", header: "Amount",
            accessorFn: (r) => formatCurrency(r.amount)
        },
        { id: "dueDate", header: "Due Date", accessorFn: (r) => formatDate(r.dueDate) },
        {
            id: "paidDate", header: "Paid Date",
            accessorFn: (r) => r.paidDate ? formatDate(r.paidDate) : "—"
        },
        {
            id: "paymentStatus", header: "Status", accessorKey: "paymentStatus",
            cell: ({ getValue }) => {
                const status = String(getValue());
                const variant = status === "paid" ? "default" : status === "pending" ? "secondary" : "destructive";
                return <Badge variant={variant as any} className="capitalize">{status}</Badge>;
            }
        },
    ];

    return (
        <>
            <Header title="My Payments" />
            <main className="p-5 space-y-4">
                <h2 className="text-base font-semibold text-[--foreground]">Payment History</h2>
                {loading ? (
                    <div className="card p-10 text-center text-[--muted-foreground] text-sm">Loading…</div>
                ) : (
                    <DataTable data={payments} columns={columns} title="Payments" exportFilename="my-payments" />
                )}
            </main>
        </>
    );
}
