"use client";
import { useState, useEffect } from "react";
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
import { useStudents } from "@/hooks/useStudents";
import { useParents } from "@/hooks/useParents";
import { useClassRooms } from "@/hooks/useClassRooms";
import { Student } from "@/types/viewModels";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/toast";



type TF = {
    firstName: string; lastName: string; email: string; phone: string; gender: string; dateOfBirth: string; status: string;
    street: string; city: string; state: string; zipCode: string; country: string;
    emergencyName: string; emergencyRelationship: string; emergencyPhone: string;
    parentId: string; classRoomId: string;
};
const blank: TF = {
    firstName: "", lastName: "", email: "", phone: "", gender: "male", dateOfBirth: "", status: "active",
    street: "", city: "", state: "", zipCode: "", country: "",
    emergencyName: "", emergencyRelationship: "", emergencyPhone: "",
    parentId: "", classRoomId: ""
};

export default function StudentsPage() {
    const { students, loading, pagination, createStudent, updateStudent, deleteStudent } = useStudents();
    const { parents } = useParents();
    const { classRooms } = useClassRooms();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [form, setForm] = useState<TF>(blank);
    const [confirm, setConfirm] = useState<Student | null>(null);
    const [busy, setBusy] = useState(false);
    const f = (k: keyof TF, v: string) => setForm(p => ({ ...p, [k]: v }));

    const basicFields = [
        { key: "firstName" as keyof TF, label: "First Name", type: "text", required: true },
        { key: "lastName" as keyof TF, label: "Last Name", type: "text", required: true },
        { key: "email" as keyof TF, label: "Email", type: "email", required: true },
        { key: "phone" as keyof TF, label: "Phone", type: "text", required: true },
        { key: "dateOfBirth" as keyof TF, label: "Date of Birth", type: "date", required: true },
    ];

    const addressFields = [
        { key: "street" as keyof TF, label: "Street", required: true },
        { key: "city" as keyof TF, label: "City", required: true },
        { key: "state" as keyof TF, label: "State", required: true },
        { key: "zipCode" as keyof TF, label: "Zip Code", required: true },
        { key: "country" as keyof TF, label: "Country", required: true },
    ];

    const emergencyFields = [
        { key: "emergencyName" as keyof TF, label: "Name", required: true },
        { key: "emergencyRelationship" as keyof TF, label: "Relationship", required: true },
        { key: "emergencyPhone" as keyof TF, label: "Phone", required: true },
    ];

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
    ];

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "graduated", label: "Graduated" },
        { value: "suspended", label: "Suspended" },
    ];

    function openAdd() { setEditing(null); setForm(blank); setOpen(true); }
    function openEdit(s: Student) {
        setEditing(s);
        setForm({
            firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone,
            gender: s.gender, dateOfBirth: s.dateOfBirth?.slice(0, 10) ?? "", status: s.status,
            street: s.address?.street ?? "", city: s.address?.city ?? "", state: s.address?.state ?? "",
            zipCode: s.address?.zipCode ?? "", country: s.address?.country ?? "",
            emergencyName: s.emergencyContact?.name ?? "", emergencyRelationship: s.emergencyContact?.relationship ?? "",
            emergencyPhone: s.emergencyContact?.phone ?? "",
            parentId: typeof s.parentId === 'string' ? s.parentId : (s.parentId as any)?._id ?? "",
            classRoomId: typeof s.classRoomId === 'string' ? s.classRoomId : (s.classRoomId as any)?._id ?? ""
        });
        setOpen(true);
    }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setBusy(true);
        try {
            const payload: any = {
                firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
                gender: form.gender, dateOfBirth: form.dateOfBirth, status: form.status, enrollmentDate: editing?.enrollmentDate ?? new Date().toISOString(),
                address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode, country: form.country },
                emergencyContact: { name: form.emergencyName, relationship: form.emergencyRelationship, phone: form.emergencyPhone }
            };
            if (form.parentId) payload.parentId = form.parentId;
            if (form.classRoomId) payload.classRoomId = form.classRoomId;
            if (editing) { await updateStudent(editing._id, payload); toast.success("Student updated"); }
            else { await createStudent(payload); toast.success("Student added"); }
            setOpen(false);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ?? err?.message ?? "Something went wrong";
            toast.error(message);
        }
        finally { setBusy(false); }
    }
    async function handleDelete() {
        if (!confirm) return; setBusy(true);
        try { await deleteStudent(confirm._id); toast.success("Student deleted"); setConfirm(null); }
        catch { toast.error("Failed to delete"); } finally { setBusy(false); }
    }

    const columns: ColumnDef<Student, unknown>[] = [
        {
            id: "studentId", accessorKey: "studentId", header: "Student ID",
            cell: ({ getValue }) => <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{String(getValue() ?? "—")}</span>
        },
        {
            id: "name", header: "Student", accessorFn: r => `${r.firstName} ${r.lastName}`,
            cell: ({ row: { original: r } }) => (<div className="flex items-center gap-2"><div><p className="font-medium text-sm">{r.firstName} {r.lastName}</p><p className="text-xs text-[--muted-foreground]">{r.email}</p></div></div>)
        },
        { id: "email", accessorKey: "email", header: "Email" },
        { id: "phone", accessorKey: "phone", header: "Phone" },
        { id: "gender", accessorKey: "gender", header: "Gender", cell: ({ getValue }) => <span className="capitalize">{String(getValue())}</span> },
        { id: "dob", header: "DOB", accessorFn: r => formatDate(r.dateOfBirth) },
        {
            id: "address", header: "Address",
            accessorFn: r => r.address ? `${r.address.street}, ${r.address.city}, ${r.address.state} ${r.address.zipCode}` : "—",
            cell: ({ row: { original: r } }) => r.address ? (
                <div className="text-xs">
                    <p>{r.address.street}</p>
                    <p className="text-[--muted-foreground]">{r.address.city}, {r.address.state} {r.address.zipCode}</p>
                    <p className="text-[--muted-foreground]">{r.address.country}</p>
                </div>
            ) : "—"
        },
        {
            id: "emergency", header: "Emergency Contact",
            accessorFn: r => r.emergencyContact ? `${r.emergencyContact.name} (${r.emergencyContact.relationship})` : "—",
            cell: ({ row: { original: r } }) => r.emergencyContact ? (
                <div className="text-xs">
                    <p>{r.emergencyContact.name}</p>
                    <p className="text-[--muted-foreground]">{r.emergencyContact.relationship}</p>
                    <p className="text-[--muted-foreground]">{r.emergencyContact.phone}</p>
                </div>
            ) : "—"
        },
        { id: "class", header: "Class", accessorFn: r => (r.classRoomId as { name?: string })?.name ?? "—" },
        {
            id: "parent", header: "Parent", accessorFn: r => {
                const parent = r.parentId as { firstName?: string; lastName?: string } | undefined;
                return parent ? `${parent.firstName} ${parent.lastName}` : "—";
            }
        },
        { id: "enrollmentDate", header: "Enrolled", accessorFn: r => formatDate(r.enrollmentDate) },
        { id: "status", header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge variant={String(getValue()) === "active" ? "default" : "secondary"}>{String(getValue())}</Badge> },
        { id: "actions", header: "", cell: ({ row: { original: r } }) => (<div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil size={13} /></Button><Button variant="ghost" size="icon" className="text-[--danger]" onClick={() => setConfirm(r)}><Trash2 size={13} /></Button></div>) },
    ];

    return (
        <>
            <Header title="Students" />
            <main className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div><h2 className="text-base font-semibold">All Students</h2><p className="text-sm text-[--muted-foreground]">{pagination?.totalItems ?? 0} total</p></div>
                    <Button onClick={openAdd}><Plus size={15} className="mr-1" />Add Student</Button>
                </div>
                {loading ? <div className="card p-10 text-center text-sm text-[--muted-foreground]">Loading…</div>
                    : <DataTable data={students} columns={columns} title="Students" exportFilename="students" />}
            </main>
            <FormDialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Student" : "Add Student"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {basicFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && "*"}</Label>
                                <Input
                                    type={field.type}
                                    value={form[field.key]}
                                    onChange={e => f(field.key, e.target.value)}
                                    required={field.required}
                                />
                            </div>
                        ))}
                        <div>
                            <Label>Gender*</Label>
                            <FormCombobox
                                items={genderOptions}
                                value={form.gender}
                                onValueChange={v => f("gender", v ?? "")}
                                placeholder="Select gender"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide mt-2">Address</p>
                        </div>
                        {addressFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && "*"}</Label>
                                <Input
                                    value={form[field.key]}
                                    onChange={e => f(field.key, e.target.value)}
                                    required={field.required}
                                />
                            </div>
                        ))}
                        <div>
                            <Label>Status</Label>
                            <FormCombobox
                                items={statusOptions}
                                value={form.status}
                                onValueChange={v => f("status", v ?? "")}
                                placeholder="Select status"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                            />
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide mt-2">Assignment</p>
                        </div>
                        <div>
                            <Label>Parent</Label>
                            <FormCombobox
                                items={parents}
                                value={form.parentId}
                                onValueChange={v => f("parentId", v ?? "")}
                                placeholder="Select parent"
                                getItemValue={p => p._id}
                                getItemLabel={p => `${p.firstName} ${p.lastName}`}
                                renderItem={p => (
                                    <>
                                        {p.parentId ? <span className="font-mono text-xs text-blue-600 mr-2">{p.parentId}</span> : null}
                                        {p.firstName} {p.lastName}
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <Label>ClassRoom</Label>
                            <FormCombobox
                                items={classRooms}
                                value={form.classRoomId}
                                onValueChange={v => f("classRoomId", v ?? "")}
                                placeholder="Select classroom"
                                getItemValue={c => c._id}
                                getItemLabel={c => `${c.name} - ${c.roomNumber}`}
                                renderItem={c => `${c.name} - ${c.roomNumber}`}
                            />
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide mt-2">Emergency Contact</p>
                        </div>
                        {emergencyFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && "*"}</Label>
                                <Input
                                    value={form[field.key]}
                                    onChange={e => f(field.key, e.target.value)}
                                    required={field.required}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button size="sm" type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </FormDialog>
            <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} loading={busy}
                message={`Delete ${confirm?.firstName} ${confirm?.lastName}? This cannot be undone.`} />
        </>
    );
}

