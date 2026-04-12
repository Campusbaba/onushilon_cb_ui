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
import { useClassRooms } from "@/hooks/useClassRooms";
import { useDepartments } from "@/hooks/useDepartments";
import { useCourses } from "@/hooks/useCourses";
import { ClassRoom, Department, Course } from "@/types/viewModels";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";

type TF = { classRoomId: string; name: string; roomNumber: string; departmentId: string; courseId: string; capacity: string; academicYear: string; semester: string; status: string };
const blank: TF = { classRoomId: "", name: "", roomNumber: "", departmentId: "", courseId: "", capacity: "", academicYear: "", semester: "", status: "active" };

const basicFields: { key: keyof TF; label: string; type: string; required: boolean; placeholder?: string }[] = [
    { key: "name", label: "Class Name", type: "text", required: true },
    { key: "roomNumber", label: "Room Number", type: "text", required: true },
];

const detailFields: { key: keyof TF; label: string; type: string; required: boolean; placeholder?: string }[] = [
    { key: "capacity", label: "Capacity", type: "number", required: true },
    { key: "academicYear", label: "Academic Year", type: "text", required: true, placeholder: "2024-2025" },
    { key: "semester", label: "Semester", type: "text", required: true, placeholder: "Spring" },
];

const statusOptions = [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "completed", label: "Completed" }];

export default function ClassRoomsPage() {
    const { classRooms, loading, pagination, createClassRoom, updateClassRoom, deleteClassRoom } = useClassRooms();
    const { departments } = useDepartments();
    const { courses } = useCourses();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<ClassRoom | null>(null);
    const [form, setForm] = useState<TF>(blank);
    const [confirm, setConfirm] = useState<ClassRoom | null>(null);
    const [busy, setBusy] = useState(false);
    const f = (k: keyof TF, v: string) => setForm(p => ({ ...p, [k]: v }));

    function openAdd() { setEditing(null); setForm(blank); setOpen(true); }
    function openEdit(c: ClassRoom) {
        setEditing(c);
        setForm({
            classRoomId: c.classRoomId ?? "", name: c.name, roomNumber: c.roomNumber,
            departmentId: typeof c.departmentId === 'string' ? c.departmentId : (c.departmentId as any)?._id ?? "",
            courseId: typeof c.courseId === 'string' ? c.courseId : (c.courseId as any)?._id ?? "",
            capacity: String(c.capacity), academicYear: c.academicYear, semester: c.semester, status: c.status
        });
        setOpen(true);
    }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setBusy(true);
        try {
            const payload: any = { ...form, capacity: Number(form.capacity), currentEnrollment: 0 };
            if (editing) { await updateClassRoom(editing._id, payload); toast.success("Classroom updated"); }
            else { await createClassRoom(payload); toast.success("Classroom added"); }
            setOpen(false);
        } catch { toast.error("Failed to save"); } finally { setBusy(false); }
    }
    async function handleDelete() {
        if (!confirm) return; setBusy(true);
        try { await deleteClassRoom(confirm._id); toast.success("Classroom deleted"); setConfirm(null); }
        catch { toast.error("Failed to delete"); } finally { setBusy(false); }
    }

    const columns: ColumnDef<ClassRoom, unknown>[] = [
        { id: "classRoomId", accessorKey: "classRoomId", header: "ID" },
        { id: "name", accessorKey: "name", header: "Class Name" },
        { id: "roomNumber", accessorKey: "roomNumber", header: "Room No." },
        { id: "course", header: "Course", accessorFn: r => (r.courseId as { name?: string })?.name ?? "—" },
        { id: "department", header: "Department", accessorFn: r => (r.departmentId as { name?: string })?.name ?? "—" },
        { id: "capacity", accessorKey: "capacity", header: "Capacity" },
        { id: "enrolled", accessorKey: "currentEnrollment", header: "Enrolled" },
        { id: "academicYear", accessorKey: "academicYear", header: "Academic Year" },
        { id: "semester", accessorKey: "semester", header: "Semester" },
        { id: "status", header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge variant={String(getValue()) === "active" ? "default" : String(getValue()) === "completed" ? "secondary" : "secondary"}>{String(getValue())}</Badge> },
        { id: "actions", header: "", cell: ({ row: { original: r } }) => (<div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil size={13} /></Button><Button variant="ghost" size="icon" className="text-[--danger]" onClick={() => setConfirm(r)}><Trash2 size={13} /></Button></div>) },
    ];

    return (
        <>
            <Header title="Classrooms" />
            <main className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div><h2 className="text-base font-semibold">All Classrooms</h2><p className="text-sm text-[--muted-foreground]">{pagination?.totalItems ?? 0} total</p></div>
                    <Button onClick={openAdd}><Plus size={15} className="mr-1" />Add Classroom</Button>
                </div>
                {loading ? <div className="card p-10 text-center text-sm text-[--muted-foreground]">Loading…</div>
                    : <DataTable data={classRooms} columns={columns} title="Classrooms" exportFilename="classrooms" />}
            </main>
            <FormDialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Classroom" : "Add Classroom"}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label>Class ID</Label>
                            <Input value={form.classRoomId} onChange={e => f("classRoomId", e.target.value)} placeholder="e.g. CR-0001" />
                        </div>
                        {basicFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} placeholder={field.placeholder} />
                            </div>
                        ))}
                        <div>
                            <Label>Department *</Label>
                            <FormCombobox
                                items={departments}
                                value={form.departmentId}
                                onValueChange={v => f("departmentId", v)}
                                placeholder="Select department"
                                renderItem={dept => dept.name}
                                getItemValue={dept => dept._id}
                                getItemLabel={dept => dept.name}
                            />
                        </div>
                        <div>
                            <Label>Course *</Label>
                            <FormCombobox
                                items={courses}
                                value={form.courseId}
                                onValueChange={v => f("courseId", v)}
                                placeholder="Select course"
                                renderItem={course => course.name}
                                getItemValue={course => course._id}
                                getItemLabel={course => course.name}
                            />
                        </div>
                        {detailFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} placeholder={field.placeholder} />
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
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button size="sm" type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </FormDialog>
            <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} loading={busy}
                message={`Delete classroom "${confirm?.name}"? This cannot be undone.`} />
        </>
    );
}
