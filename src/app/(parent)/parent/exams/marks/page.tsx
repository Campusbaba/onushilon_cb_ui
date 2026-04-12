"use client";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExamMarks } from "@/hooks/useExamMarks";
import { useParents } from "@/hooks/useParents";
import { useAuth } from "@/hooks/useAuth";
import { ExamMark, Exam } from "@/types/viewModels";
import { formatDate } from "@/lib/utils";

export default function ParentExamMarksPage() {
    const { referenceId } = useAuth();
    const { children, fetchChildren } = useParents({}, false);
    const { marks, loading, fetchStudentExamResults } = useExamMarks();
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    useEffect(() => {
        if (!referenceId) return;
        fetchChildren(referenceId).then((kids) => {
            if (kids.length > 0) setSelectedStudentId(kids[0]._id);
        });
    }, [referenceId, fetchChildren]);

    useEffect(() => {
        if (!selectedStudentId) return;
        fetchStudentExamResults(selectedStudentId);
    }, [selectedStudentId, fetchStudentExamResults]);

    const columns: ColumnDef<ExamMark, unknown>[] = [
        {
            id: "exam", header: "Exam",
            accessorFn: (r) => (r.examId as Exam)?.name ?? String(r.examId),
        },
        {
            id: "examType", header: "Type",
            accessorFn: (r) => (r.examId as Exam)?.examType ?? "—",
        },
        {
            id: "date", header: "Date",
            accessorFn: (r) => {
                const d = (r.examId as Exam)?.date;
                return d ? formatDate(d) : "—";
            },
        },
        {
            id: "totalMarks", header: "Total Marks",
            accessorFn: (r) => (r.examId as Exam)?.totalMarks ?? "—",
        },
        { id: "marksObtained", accessorKey: "marksObtained", header: "Marks Obtained" },
        { id: "grade", accessorKey: "grade", header: "Grade" },
        {
            id: "result", header: "Result",
            accessorFn: (r) => {
                const exam = r.examId as Exam;
                if (!exam?.passingMarks) return "—";
                return r.marksObtained >= exam.passingMarks ? "Pass" : "Fail";
            },
            cell: ({ getValue }) => (
                <Badge variant={String(getValue()) === "Pass" ? "default" : String(getValue()) === "Fail" ? "destructive" : "secondary"}>
                    {String(getValue())}
                </Badge>
            ),
        },
        { id: "remarks", accessorKey: "remarks", header: "Remarks" },
    ];

    const selectedStudent = children.find((c) => c._id === selectedStudentId);

    return (
        <>
            <Header title="Exam Marks" />
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
                    Exam Results{selectedStudent ? ` — ${selectedStudent.firstName} ${selectedStudent.lastName}` : ""}
                </h2>
                {loading ? (
                    <div className="card p-10 text-center text-[--muted-foreground] text-sm">Loading…</div>
                ) : (
                    <DataTable data={marks} columns={columns} title="Exam Marks" exportFilename="parent-exam-marks" />
                )}
            </main>
        </>
    );
}
