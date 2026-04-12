"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/reusable/FormDialog";
import { ConfirmDialog } from "@/components/reusable/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/reusable/FormCombobox";
import { useExams } from "@/hooks/useExams";
import { useCourses } from "@/hooks/useCourses";
import { useClassRooms } from "@/hooks/useClassRooms";
import { Exam, Course, ClassRoom } from "@/types/viewModels";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { formatDate } from "@/lib/utils";

type TF = { examId: string, name: string; examType: string; courseId: string; classRoomId: string; date: string; startTime: string; endTime: string; totalMarks: string; passingMarks: string; instructions: string; status: string };
const blank: TF = { examId: "", name: "", examType: "midterm", courseId: "", classRoomId: "", date: "", startTime: "", endTime: "", totalMarks: "", passingMarks: "", instructions: "", status: "scheduled" };

const basicFields: { key: keyof TF; label: string; type: string; required: boolean; placeholder?: string }[] = [
    { key: "examId", label: "Exam ID", type: "text", required: true, placeholder: "e.g. CS-Q-25-01" },
    { key: "name", label: "Exam Name", type: "text", required: true, placeholder: "e.g. Mid-Term Examination" },
];

const scheduleFields: { key: keyof TF; label: string; type: string; required: boolean; placeholder?: string }[] = [
    { key: "date", label: "Date", type: "date", required: false },
    { key: "startTime", label: "Start Time", type: "time", required: false },
    { key: "endTime", label: "End Time", type: "time", required: false },
];

const marksFields: { key: keyof TF; label: string; type: string; required: boolean; placeholder?: string }[] = [
    { key: "totalMarks", label: "Total Marks", type: "number", required: false, placeholder: "e.g. 100" },
    { key: "passingMarks", label: "Passing Marks", type: "number", required: false, placeholder: "e.g. 40" },
];

const examTypeOptions = [{ value: "midterm", label: "Midterm" }, { value: "final", label: "Final" }, { value: "quiz", label: "Quiz" }, { value: "assignment", label: "Assignment" }, { value: "practical", label: "Practical" }];
const statusOptions = [{ value: "scheduled", label: "Scheduled" }, { value: "ongoing", label: "Ongoing" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }];

export default function ExamsPage() {
    const { exams, loading, pagination, createExam, updateExam, deleteExam } = useExams();
    const { courses } = useCourses();
    const { classRooms } = useClassRooms();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Exam | null>(null);
    const [form, setForm] = useState<TF>(blank);
    const [confirm, setConfirm] = useState<Exam | null>(null);
    const [busy, setBusy] = useState(false);
    const f = (k: keyof TF, v: string) => setForm(p => ({ ...p, [k]: v }));
    const filteredClassRooms = classRooms.filter(cr => {
        const id = typeof cr.courseId === "string" ? cr.courseId : (cr.courseId as any)?._id;
        return id === form.courseId;
    });

    function openAdd() { setEditing(null); setForm(blank); setOpen(true); }
    function openEdit(ex: Exam) {
        setEditing(ex);
        setForm({
            examId: ex.examId,
            name: ex.name, examType: ex.examType,
            courseId: String(typeof ex.courseId === "object" ? (ex.courseId as { _id: string })._id : ex.courseId),
            classRoomId: String(typeof ex.classRoomId === "object" ? (ex.classRoomId as { _id: string })._id : ex.classRoomId),
            date: ex.date?.slice(0, 10) ?? "", startTime: ex.startTime, endTime: ex.endTime,
            totalMarks: String(ex.totalMarks), passingMarks: String(ex.passingMarks),
            instructions: ex.instructions ?? "", status: ex.status
        });
        setOpen(true);
    }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setBusy(true);
        try {
            const payload = {
                ...form,
                totalMarks: Number(form.totalMarks),
                passingMarks: Number(form.passingMarks),
                examType: form.examType as "midterm" | "final" | "quiz" | "assignment" | "practical",
                status: form.status as "scheduled" | "ongoing" | "completed" | "cancelled"
            };
            if (editing) { await updateExam(editing._id, payload); toast.success("Exam updated"); }
            else { await createExam(payload); toast.success("Exam added"); }
            setOpen(false);
        } catch { toast.error("Failed to save"); } finally { setBusy(false); }
    }
    async function handleDelete() {
        if (!confirm) return; setBusy(true);
        try { await deleteExam(confirm._id); toast.success("Exam deleted"); setConfirm(null); }
        catch { toast.error("Failed to delete"); } finally { setBusy(false); }
    }

    const columns: ColumnDef<Exam, unknown>[] = [
        { id: "examId", accessorKey: "examId", header: "Exam ID" },
        { id: "name", accessorKey: "name", header: "Exam Name" },
        { id: "examType", accessorKey: "examType", header: "Type" },
        { id: "course", header: "Course", accessorFn: r => { const c = r.courseId; return typeof c === "object" ? (c as { name: string }).name : String(c); } },
        { id: "class", header: "Classroom", accessorFn: r => { const c = r.classRoomId; return typeof c === "object" ? (c as { name: string }).name : String(c); } },
        { id: "date", header: "Date", accessorFn: r => formatDate(r.date) },
        { id: "time", header: "Time", accessorFn: r => `${r.startTime} - ${r.endTime}` },
        { id: "totalMarks", accessorKey: "totalMarks", header: "Total Marks" },
        { id: "passingMarks", accessorKey: "passingMarks", header: "Pass Marks" },
        { id: "status", header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge variant={String(getValue()) === "completed" ? "default" : String(getValue()) === "scheduled" ? "secondary" : "secondary"}>{String(getValue())}</Badge> },
        { id: "actions", header: "", cell: ({ row: { original: r } }) => (<div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil size={13} /></Button><Button variant="ghost" size="icon" className="text-[--danger]" onClick={() => setConfirm(r)}><Trash2 size={13} /></Button></div>) },
    ];

    return (
        <>
            <Header title="Exams" />
            <main className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div><h2 className="text-base font-semibold">All Exams</h2><p className="text-sm text-[--muted-foreground]">{pagination?.totalItems ?? 0} total</p></div>
                    <Button onClick={openAdd}><Plus size={15} className="mr-1" />Add Exam</Button>
                </div>
                {loading ? <div className="card p-10 text-center text-sm text-[--muted-foreground]">Loading…</div>
                    : <DataTable data={exams} columns={columns} title="Exams" exportFilename="exams" />}
            </main>
            <FormDialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Exam" : "Add Exam"}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {basicFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} placeholder={field.placeholder} />
                            </div>
                        ))}
                        <div>
                            <Label>Course *</Label>
                            <FormCombobox
                                items={courses}
                                value={form.courseId}
                                onValueChange={v => { f("courseId", v); f("classRoomId", ""); }}
                                required
                                placeholder="Select course"
                                renderItem={c => c.name}
                                getItemValue={c => c._id}
                                getItemLabel={c => c.name}
                            />
                        </div>
                        <div>
                            <Label>Classroom *</Label>
                            <FormCombobox
                                items={filteredClassRooms}
                                value={form.classRoomId}
                                onValueChange={v => f("classRoomId", v)}
                                required
                                placeholder={form.courseId ? "Select classroom" : "Select course first"}
                                renderItem={cr => `${cr.name}${cr.roomNumber ? ` — Room ${cr.roomNumber}` : ""}`}
                                getItemValue={cr => cr._id}
                                getItemLabel={cr => `${cr.name}${cr.roomNumber ? ` — Room ${cr.roomNumber}` : ""}`}
                            />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <FormCombobox
                                items={examTypeOptions}
                                value={form.examType}
                                onValueChange={v => f("examType", v)}
                                placeholder="Select exam type"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                            />
                        </div>
                        {scheduleFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} placeholder={field.placeholder} />
                            </div>
                        ))}
                        {marksFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} placeholder={field.placeholder} />
                            </div>
                        ))}
                        <div>
                            <Label>Status</Label>
                            <FormCombobox
                                items={statusOptions}
                                value={form.status}
                                onValueChange={v => f("status", v)}
                                placeholder="Select status"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                            />
                        </div>
                        <div className="col-span-2"><Label>Instructions</Label><Input value={form.instructions} onChange={e => f("instructions", e.target.value)} /></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button size="sm" type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </FormDialog>
            <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} loading={busy}
                message={`Delete exam "${confirm?.name}"? This cannot be undone.`} />
        </>
    );
}
