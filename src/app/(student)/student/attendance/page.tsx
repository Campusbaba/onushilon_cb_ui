"use client";
import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import { useAttendance } from "@/hooks/useAttendance";
import { useAuth } from "@/hooks/useAuth";
import { Attendance } from "@/types/viewModels";
import { formatDate } from "@/lib/utils";

export default function StudentAttendancePage() {
    const { referenceId } = useAuth();
    const { attendances, loading, fetchAttendances } = useAttendance({}, false);

    useEffect(() => {
        if (!referenceId) return;
        fetchAttendances({ studentId: referenceId, limit: 100 });
    }, [referenceId, fetchAttendances]);

    const columns: ColumnDef<Attendance, unknown>[] = [
        { id: "date", header: "Date", accessorFn: (r) => formatDate(r.date) },
        { id: "subject", header: "Subject", accessorFn: (r) => "General" }, // Assuming general attendance for now unless we have subject based
        { id: "status", header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge variant={String(getValue()) === "present" ? "default" : "destructive"}>{String(getValue())}</Badge> },
        { id: "remarks", accessorKey: "remarks", header: "Remarks" },
    ];

    return (
        <>
            <Header title="My Attendance" />
            <main className="p-5 space-y-4">
                <h2 className="text-base font-semibold text-[--foreground]">
                    Attendance Records
                </h2>
                {loading ? (
                    <div className="card p-10 text-center text-[--muted-foreground] text-sm">Loading…</div>
                ) : (
                    <DataTable data={attendances} columns={columns} title="Attendance" exportFilename="my-attendance" />
                )}
            </main>
        </>
    );
}
