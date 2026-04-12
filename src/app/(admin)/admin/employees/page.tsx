"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { FormDialog } from "@/components/reusable/FormDialog";
import { ConfirmDialog } from "@/components/reusable/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/reusable/FormCombobox";
import { useEmployees } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { Employee } from "@/types/viewModels";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { formatDate } from "@/lib/utils";

type TF = { employeeId: string, firstName: string; lastName: string; email: string; phone: string; dateOfBirth: string; gender: string; street: string; city: string; state: string; zipCode: string; country: string; position: string; department: string; joiningDate: string; salary: string; status: string; emergencyName: string; emergencyRelationship: string; emergencyPhone: string };
const blank: TF = { employeeId: "", firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", gender: "male", street: "", city: "", state: "", zipCode: "", country: "", position: "", department: "", joiningDate: "", salary: "", status: "active", emergencyName: "", emergencyRelationship: "", emergencyPhone: "" };

const basicFields: { key: keyof TF; label: string; type: string; required: boolean; placeholder?: string; readOnly?: boolean }[] = [
    { key: "employeeId", label: "Employee ID", type: "text", required: false, placeholder: "EMP-001", readOnly: false },
    { key: "firstName", label: "First Name", type: "text", required: true },
    { key: "lastName", label: "Last Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "text", required: true },
    { key: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
];

const addressFields: { key: keyof TF; label: string; type: string; required: boolean }[] = [
    { key: "street", label: "Street", type: "text", required: true },
    { key: "city", label: "City", type: "text", required: true },
    { key: "state", label: "State", type: "text", required: true },
    { key: "zipCode", label: "Zip Code", type: "text", required: true },
    { key: "country", label: "Country", type: "text", required: true },
];

const employmentFields: { key: keyof TF; label: string; type: string; required: boolean }[] = [
    { key: "joiningDate", label: "Joining Date", type: "date", required: false },
    { key: "salary", label: "Salary", type: "number", required: true },
];

const positionOptions = [
    { value: "admin", label: "Admin" },
    // { value: "teacher", label: "Teacher" },
    // { value: "staff", label: "Staff" },
    // { value: "accountant", label: "Accountant" },
    // { value: "librarian", label: "Librarian" },
    // { value: "security", label: "Security" },
    // { value: "janitor", label: "Janitor" },
];

const emergencyFields: { key: keyof TF; label: string; type: string; required: boolean }[] = [
    { key: "emergencyName", label: "Name", type: "text", required: true },
    { key: "emergencyRelationship", label: "Relationship", type: "text", required: true },
    { key: "emergencyPhone", label: "Phone", type: "text", required: true },
];

const genderOptions = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }];
const statusOptions = [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "on-leave", label: "On Leave" }];

export default function EmployeesPage() {
    const { employees, loading, pagination, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
    const { departments } = useDepartments();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [form, setForm] = useState<TF>(blank);
    const [confirm, setConfirm] = useState<Employee | null>(null);
    const [busy, setBusy] = useState(false);
    const f = (k: keyof TF, v: string) => setForm(p => ({ ...p, [k]: v }));

    function openAdd() { setEditing(null); setForm(blank); setOpen(true); }
    function openEdit(emp: Employee) {
        setEditing(emp);
        const addr = emp.address as { street?: string; city?: string; state?: string; zipCode?: string; country?: string } | undefined;
        const ec = emp.emergencyContact as { name?: string; relationship?: string; phone?: string } | undefined;
        setForm({
            employeeId: emp.employeeId ?? "",
            firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone,
            dateOfBirth: emp.dateOfBirth?.slice(0, 10) ?? "", gender: emp.gender,
            street: addr?.street ?? "", city: addr?.city ?? "", state: addr?.state ?? "",
            zipCode: addr?.zipCode ?? "", country: addr?.country ?? "",
            position: emp.position, department: (emp.department as { _id?: string })?._id ?? String(emp.department),
            joiningDate: emp.joiningDate?.slice(0, 10) ?? "", salary: String(emp.salary ?? ""), status: emp.status,
            emergencyName: ec?.name ?? "", emergencyRelationship: ec?.relationship ?? "", emergencyPhone: ec?.phone ?? ""
        });
        setOpen(true);
    }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setBusy(true);
        try {
            const payload = {
                employeeId: form.employeeId,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                dateOfBirth: form.dateOfBirth,
                gender: form.gender as "male" | "female" | "other",
                address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode, country: form.country },
                position: form.position, department: form.department, joiningDate: form.joiningDate,
                salary: Number(form.salary), status: form.status as "active" | "inactive" | "on-leave",
                emergencyContact: { name: form.emergencyName, relationship: form.emergencyRelationship, phone: form.emergencyPhone }
            };
            if (editing) { await updateEmployee(editing._id, payload); toast.success("Employee updated"); }
            else { await createEmployee(payload); toast.success("Employee added"); }
            setOpen(false);
        } catch { toast.error("Failed to save"); } finally { setBusy(false); }
    }
    async function handleDelete() {
        if (!confirm) return; setBusy(true);
        try { await deleteEmployee(confirm._id); toast.success("Employee deleted"); setConfirm(null); }
        catch { toast.error("Failed to delete"); } finally { setBusy(false); }
    }

    const columns: ColumnDef<Employee, unknown>[] = [
        {
            id: "employeeId", accessorKey: "employeeId", header: "Employee ID",
            cell: ({ getValue }) => <span className="font-mono text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{String(getValue() ?? "—")}</span>
        },
        {
            id: "name", header: "Employee", accessorFn: r => `${r.firstName} ${r.lastName}`,
            cell: ({ row: { original: r } }) => (<div className="flex items-center gap-2"><div><p className="font-medium text-sm">{r.firstName} {r.lastName}</p><p className="text-xs text-[--muted-foreground]">{r.email}</p></div></div>)
        },
        { id: "phone", accessorKey: "phone", header: "Phone" },
        { id: "gender", accessorKey: "gender", header: "Gender" },
        { id: "position", accessorKey: "position", header: "Position" },
        { id: "address", accessorKey: "address", header: "Address", cell: ({ getValue }) => { const addr = getValue() as { street?: string; city?: string; state?: string; zipCode?: string; country?: string } | undefined; return <span>{[addr?.street, addr?.city, addr?.state, addr?.zipCode, addr?.country].filter(Boolean).join(", ") || "—"}</span> } },
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
        // { id: "department", header: "Department", accessorFn: r => (r.department as { name?: string })?.name ?? "—" },
        { id: "joiningDate", header: "Joined", accessorFn: r => formatDate(r.joiningDate) },
        { id: "salary", header: "Salary", accessorFn: r => `৳${(r.salary ?? 0).toLocaleString()}` },
        { id: "status", header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge variant={String(getValue()) === "active" ? "default" : "secondary"}>{String(getValue())}</Badge> },
        { id: "createdAt", header: "Created", accessorFn: r => formatDate(r.createdAt) },
        { id: "updatedAt", header: "Updated", accessorFn: r => formatDate(r.updatedAt) },
        { id: "actions", header: "", cell: ({ row: { original: r } }) => (<div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil size={13} /></Button><Button variant="ghost" size="icon" className="text-[--danger]" onClick={() => setConfirm(r)}><Trash2 size={13} /></Button></div>) },
    ];

    return (
        <>
            <Header title="Employees" />
            <main className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div><h2 className="text-base font-semibold">All Employees</h2><p className="text-sm text-[--muted-foreground]">{pagination?.totalItems ?? 0} total</p></div>
                    <Button onClick={openAdd}><Plus size={15} className="mr-1" />Add Employee</Button>
                </div>
                {loading ? <div className="card p-10 text-center text-sm text-[--muted-foreground]">Loading…</div>
                    : <DataTable data={employees} columns={columns} title="Employees" exportFilename="employees" />}
            </main>
            <FormDialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Employee" : "Add Employee"}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {basicFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} placeholder={field.placeholder} readOnly={field.readOnly} className={field.readOnly ? "bg-muted cursor-not-allowed" : ""} />
                            </div>
                        ))}
                        <div>
                            <Label>Gender *</Label>
                            <FormCombobox
                                items={genderOptions}
                                value={form.gender}
                                onValueChange={v => f("gender", v)}
                                placeholder="Select gender"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                            />
                        </div>
                    </div>
                    <div className="col-span-2 pt-2"><Label className="font-semibold">Address</Label></div>
                    <div className="grid grid-cols-2 gap-3">
                        {addressFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} />
                            </div>
                        ))}
                    </div>
                    <div className="col-span-2 pt-2"><Label className="font-semibold">Employment Details</Label></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Position / Role *</Label>
                            <FormCombobox
                                items={positionOptions}
                                value={form.position}
                                onValueChange={v => f("position", v)}
                                placeholder="Select role"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                            />
                        </div>
                        <div>
                            <Label>Department *</Label>
                            <FormCombobox
                                items={departments}
                                value={form.department}
                                onValueChange={v => f("department", v)}
                                placeholder="Select department"
                                renderItem={dept => dept.name}
                                getItemValue={dept => dept._id}
                                getItemLabel={dept => dept.name}
                            />
                        </div>
                        {employmentFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} />
                            </div>
                        ))}
                        <div>
                            <Label>Status *</Label>
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
                    <div className="col-span-2 pt-2"><Label className="font-semibold">Emergency Contact</Label></div>
                    <div className="grid grid-cols-2 gap-3">
                        {emergencyFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} />
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
