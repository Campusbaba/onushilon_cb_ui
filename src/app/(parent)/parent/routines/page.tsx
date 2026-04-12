"use client";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoutines } from "@/hooks/useRoutines";
import { useParents } from "@/hooks/useParents";
import { useAuth } from "@/hooks/useAuth";
import { Routine } from "@/types/viewModels";

export default function ParentRoutinesPage() {
    const { referenceId } = useAuth();
    const { children, fetchChildren } = useParents({}, false);
    const { routines, loading, fetchRoutinesByClassRoom } = useRoutines({}, false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    useEffect(() => {
        if (!referenceId) return;
        fetchChildren(referenceId).then((kids) => {
            if (kids.length > 0) setSelectedStudentId(kids[0]._id);
        });
    }, [referenceId, fetchChildren]);

    useEffect(() => {
        if (!selectedStudentId || children.length === 0) return;
        const student = children.find((c) => c._id === selectedStudentId);
        if (!student) return;
        const classRoomId = typeof student.classRoomId === "string"
            ? student.classRoomId
            : (student.classRoomId as { _id?: string })?._id;
        if (classRoomId) fetchRoutinesByClassRoom(classRoomId);
    }, [selectedStudentId, children, fetchRoutinesByClassRoom]);

    const columns: ColumnDef<Routine, unknown>[] = [
        { id: "dayOfWeek", accessorKey: "dayOfWeek", header: "Day" },
        { id: "subject", accessorKey: "subject", header: "Subject" },
        { id: "startTime", accessorKey: "startTime", header: "Start" },
        { id: "endTime", accessorKey: "endTime", header: "End" },
        { id: "roomNumber", accessorKey: "roomNumber", header: "Room" },
        {
            id: "teacher", header: "Teacher",
            accessorFn: (r) => {
                const t = r.teacherId as { firstName?: string; lastName?: string };
                return t?.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : String(r.teacherId);
            },
        },
        {
            id: "status", header: "Status", accessorKey: "status",
            cell: ({ getValue }) => <Badge variant={String(getValue()) === "active" ? "default" : "secondary"}>{String(getValue())}</Badge>,
        },
    ];

    const selectedStudent = children.find((c) => c._id === selectedStudentId);

    return (
        <>
            <Header title="My Routines" />
            <main className="p-5 space-y-4">
                {children.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[--muted-foreground]">Child:</span>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            <SelectTrigger className="w-52"><SelectValue placeholder="Select child" /></SelectTrigger>
                            <SelectContent>
                                {children.map((c) => (
                                    <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <h2 className="text-base font-semibold text-[--foreground]">
                    Class Schedule{selectedStudent ? ` — ${selectedStudent.firstName} ${selectedStudent.lastName}` : ""}
                </h2>
                {loading ? (
                    <div className="card p-10 text-center text-[--muted-foreground] text-sm">Loading…</div>
                ) : (
                    <DataTable data={routines} columns={columns} title="Routines" exportFilename="parent-routines" />
                )}
            </main>
        </>
    );
}
