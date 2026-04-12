"use client";
import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import { useExams } from "@/hooks/useExams";
import { useParents } from "@/hooks/useParents";
import { useAuth } from "@/hooks/useAuth";
import { Exam } from "@/types/viewModels";
import { formatDate } from "@/lib/utils";

const statusVariant = (s: string) =>
    s === "completed" ? "default" : s === "ongoing" ? "destructive" : "secondary";

export default function ParentExamsPage() {
    const { referenceId } = useAuth();
    const { children, fetchChildren } = useParents({}, false);
    const { exams, loading, fetchExamsByClassRooms } = useExams({}, false);

    useEffect(() => {
        if (!referenceId) return;
        fetchChildren(referenceId).then((kids) => {
            if (kids.length === 0) return;
            const classRoomIds = kids
                .map((k) => typeof k.classRoomId === "string" ? k.classRoomId : (k.classRoomId as { _id?: string })?._id)
                .filter((id): id is string => Boolean(id));
            const uniqueIds = [...new Set(classRoomIds)];
            if (uniqueIds.length > 0) fetchExamsByClassRooms(uniqueIds);
        });
    }, [referenceId, fetchChildren, fetchExamsByClassRooms]);

    const columns: ColumnDef<Exam, unknown>[] = [
        { id: "name", accessorKey: "name", header: "Exam" },
        { id: "examId", accessorKey: "examId", header: "Exam ID" },
        {
            id: "student", header: "Student",
            accessorFn: (r) => {
                const crId = typeof r.classRoomId === "string" ? r.classRoomId : (r.classRoomId as { _id?: string })?._id;
                const child = children.find((c) => {
                    const cId = typeof c.classRoomId === "string" ? c.classRoomId : (c.classRoomId as { _id?: string })?._id;
                    return cId === crId;
                });
                return child ? `${child.firstName} ${child.lastName}` : "—";
            },
        },
        { id: "examType", accessorKey: "examType", header: "Type" },
        {
            id: "course", header: "Course",
            accessorFn: (r) => (r.courseId as { name?: string })?.name ?? String(r.courseId ?? "—"),
        },
        {
            id: "classroom", header: "Class",
            accessorFn: (r) => (r.classRoomId as { name?: string })?.name ?? String(r.classRoomId ?? "—"),
        },
        {
            id: "room", header: "Room",
            accessorFn: (r) => (r.classRoomId as { roomNumber?: string })?.roomNumber ?? "—",
        },
        { id: "date", header: "Date", accessorFn: (r) => formatDate(r.date) },
        { id: "startTime", accessorKey: "startTime", header: "Start" },
        { id: "endTime", accessorKey: "endTime", header: "End" },
        { id: "totalMarks", accessorKey: "totalMarks", header: "Total Marks" },
        { id: "passingMarks", accessorKey: "passingMarks", header: "Passing Marks" },
        { id: "instructions", accessorKey: "instructions", header: "Instructions" },
        {
            id: "status", header: "Status", accessorKey: "status",
            cell: ({ getValue }) => <Badge variant={statusVariant(String(getValue()))}>{String(getValue())}</Badge>,
        },
    ];

    return (
        <>
            <Header title="Exams" />
            <main className="p-5 space-y-4">
                <h2 className="text-base font-semibold text-[--foreground]">Upcoming &amp; Past Exams</h2>
                {loading ? (
                    <div className="card p-10 text-center text-[--muted-foreground] text-sm">Loading…</div>
                ) : (
                    <DataTable data={exams} columns={columns} title="Exams" exportFilename="parent-exams" />
                )}
            </main>
        </>
    );
}
