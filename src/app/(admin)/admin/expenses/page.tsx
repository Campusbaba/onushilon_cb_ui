"use client";
import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/reusable/FormDialog";
import { ConfirmDialog } from "@/components/reusable/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/reusable/FormCombobox";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense } from "@/types/viewModels";
import { Plus, Pencil, Trash2, Zap, Wifi, Building2, Droplets, ShieldCheck, Wrench, GraduationCap, Phone } from "lucide-react";
import { toast } from "@/lib/toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type TF = { category: string; subcategory: string; amount: string; description: string; date: string; paymentMethod: string; transactionId: string; status: string; remarks: string };
const blank: TF = { category: "other", subcategory: "", amount: "", description: "", date: "", paymentMethod: "cash", transactionId: "", status: "pending", remarks: "" };

const basicFields: { key: keyof TF; label: string; type: string; required: boolean }[] = [
    { key: "subcategory", label: "Subcategory", type: "text", required: false },
    { key: "amount", label: "Amount", type: "number", required: true },
    { key: "date", label: "Date", type: "date", required: false },
    { key: "transactionId", label: "Transaction ID", type: "text", required: false },
];

const categoryOptions = [{ value: "salary", label: "Salary" }, { value: "fixed", label: "Fixed" }, { value: "other", label: "Other" }];
const paymentMethodOptions = [{ value: "cash", label: "Cash" }, { value: "card", label: "Card" }, { value: "bank-transfer", label: "Bank Transfer" }, { value: "cheque", label: "Cheque" }];
const statusOptions = [{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "paid", label: "Paid" }, { value: "rejected", label: "Rejected" }];

const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", approved: "#3b82f6", paid: "#10b981", rejected: "#ef4444" };
const CATEGORY_COLORS: Record<string, string> = { salary: "#6366f1", fixed: "#0ea5e9", other: "#f59e0b" };
const SUB_CATEGORY_COLORS: Record<string, string> = {
    "salary - Staff Salary": "#6366f1",
    "fixed - Electricity Bill": "#facc15",
    "fixed - Internet Bill": "#0ea5e9",
    "fixed - Rent": "#8b5cf6",
    "fixed - Water Bill": "#06b6d4",
    "fixed - Communication": "#f43f5e",
    "fixed - Security Service": "#22c55e",
    "other - Maintenance": "#f97316",
};

type RecurringTemplate = { label: string; icon: React.ReactNode; category: string; subcategory: string; description: string; color: string };
const RECURRING_TEMPLATES: RecurringTemplate[] = [
    { label: "Electricity", icon: <Zap size={18} />, category: "fixed", subcategory: "Electricity Bill", description: "Monthly electricity bill", color: "text-yellow-500 bg-yellow-50" },
    { label: "Internet", icon: <Wifi size={18} />, category: "fixed", subcategory: "Internet Bill", description: "Monthly internet bill", color: "text-blue-500 bg-blue-50" },
    { label: "Rent", icon: <Building2 size={18} />, category: "fixed", subcategory: "Rent", description: "Monthly rent payment", color: "text-purple-500 bg-purple-50" },
    { label: "Water", icon: <Droplets size={18} />, category: "fixed", subcategory: "Water Bill", description: "Monthly water bill", color: "text-cyan-500 bg-cyan-50" },
    { label: "Security", icon: <ShieldCheck size={18} />, category: "fixed", subcategory: "Security Service", description: "Monthly security service", color: "text-green-500 bg-green-50" },
    { label: "Maintenance", icon: <Wrench size={18} />, category: "other", subcategory: "Maintenance", description: "Monthly maintenance cost", color: "text-orange-500 bg-orange-50" },
    { label: "Staff Salary", icon: <GraduationCap size={18} />, category: "salary", subcategory: "Staff Salary", description: "Monthly staff salary", color: "text-indigo-500 bg-indigo-50" },
    { label: "Phone/Comm", icon: <Phone size={18} />, category: "fixed", subcategory: "Communication", description: "Monthly phone/communication bill", color: "text-rose-500 bg-rose-50" },
];

export default function ExpensesPage() {
    const isMobile = useIsMobile();
    const { expenses, loading, pagination, createExpense, updateExpense, deleteExpense } = useExpenses();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const [form, setForm] = useState<TF>(blank);
    const [confirm, setConfirm] = useState<Expense | null>(null);
    const [busy, setBusy] = useState(false);
    const f = (k: keyof TF, v: string) => setForm(p => ({ ...p, [k]: v }));

    // ── Derived stats ───────────────────────────────────────────────────────
    const now = new Date();
    const thisMonthExpenses = useMemo(() =>
        expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }),
        [expenses]
    );
    const totalThisMonth = useMemo(() => thisMonthExpenses.reduce((s, e) => s + (e.amount ?? 0), 0), [thisMonthExpenses]);
    const totalPaid = useMemo(() => expenses.filter(e => e.status === "paid").reduce((s, e) => s + (e.amount ?? 0), 0), [expenses]);
    const totalPending = useMemo(() => expenses.filter(e => e.status === "pending").reduce((s, e) => s + (e.amount ?? 0), 0), [expenses]);

    const categoryChartData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach(e => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const subcategoryChartData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach(e => { const key = `${e.category} - ${e.subcategory}`; map[key] = (map[key] ?? 0) + e.amount; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const statusChartData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach(e => { map[e.status] = (map[e.status] ?? 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const monthlyChartData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach(e => {
            const d = new Date(e.date);
            const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
            map[key] = (map[key] ?? 0) + e.amount;
        });
        return Object.entries(map).slice(-6).map(([month, total]) => ({ month, total }));
    }, [expenses]);

    // ── Handlers ────────────────────────────────────────────────────────────
    function openAdd() { setEditing(null); setForm(blank); setOpen(true); }
    function openFromTemplate(t: RecurringTemplate) {
        setEditing(null);
        setForm({ ...blank, category: t.category, subcategory: t.subcategory, description: t.description, date: new Date().toISOString().slice(0, 10) });
        setOpen(true);
    }
    function openEdit(ex: Expense) {
        setEditing(ex);
        setForm({
            category: ex.category, subcategory: ex.subcategory, amount: String(ex.amount),
            description: ex.description, date: ex.date?.slice(0, 10) ?? "",
            paymentMethod: ex.paymentMethod, transactionId: ex.transactionId ?? "",
            status: ex.status, remarks: ex.remarks ?? ""
        });
        setOpen(true);
    }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setBusy(true);
        try {
            const payload = {
                ...form,
                amount: Number(form.amount),
                category: form.category as "salary" | "fixed" | "other",
                paymentMethod: form.paymentMethod as "cash" | "card" | "bank-transfer" | "cheque",
                status: form.status as "pending" | "approved" | "paid" | "rejected",
            };
            if (editing) { await updateExpense(editing._id, payload); toast.success("Expense updated"); }
            else { await createExpense(payload); toast.success("Expense added"); }
            setOpen(false);
        } catch { toast.error("Failed to save"); } finally { setBusy(false); }
    }
    async function handleDelete() {
        if (!confirm) return; setBusy(true);
        try { await deleteExpense(confirm._id); toast.success("Expense deleted"); setConfirm(null); }
        catch { toast.error("Failed to delete"); } finally { setBusy(false); }
    }

    const columns: ColumnDef<Expense, unknown>[] = [
        { id: "category", accessorKey: "category", header: "Category" },
        { id: "subcategory", accessorKey: "subcategory", header: "Subcategory" },
        { id: "amount", header: "Amount", accessorFn: r => formatCurrency(r.amount) },
        { id: "paymentMethod", accessorKey: "paymentMethod", header: "Method" },
        { id: "date", header: "Date", accessorFn: r => formatDate(r.date) },
        { id: "status", header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge variant={String(getValue()) === "approved" ? "default" : "secondary"}>{String(getValue())}</Badge> },
        { id: "actions", header: "", cell: ({ row: { original: r } }) => (<div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil size={13} /></Button><Button variant="ghost" size="icon" className="text-[--danger]" onClick={() => setConfirm(r)}><Trash2 size={13} /></Button></div>) },
    ];

    return (
        <>
            <Header title="Expenses" />
            <main className="p-5 space-y-5">

                {/* ── Stat Cards ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4 space-y-1">
                        <p className="text-xs text-[--muted-foreground]">This Month</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalThisMonth)}</p>
                        <p className="text-xs text-[--muted-foreground]">{thisMonthExpenses.length} expenses</p>
                    </div>
                    <div className="card p-4 space-y-1">
                        <p className="text-xs text-[--muted-foreground]">Total Paid</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="card p-4 space-y-1">
                        <p className="text-xs text-[--muted-foreground]">Pending</p>
                        <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalPending)}</p>
                    </div>
                </div>

                {/* ── Charts ───────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4">
                        <p className="text-xs font-semibold text-[--muted-foreground] mb-3">Monthly Spend (Last 6 Months)</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={monthlyChartData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs font-semibold text-[--muted-foreground] mb-3">By Category</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label={({ name }) => name} fontSize={11}>
                                    {categoryChartData.map((entry) => (
                                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#94a3b8"} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                                {!isMobile && <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />}
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs font-semibold text-[--muted-foreground] mb-3">By subcategory</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={subcategoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label={({ name }) => name} fontSize={11}>
                                    {subcategoryChartData.map((entry) => (
                                        <Cell key={entry.name} fill={SUB_CATEGORY_COLORS[entry.name] ?? "#94a3b8"} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                                {!isMobile && <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />}
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Status breakdown ─────────────────────────────────────── */}
                <div className="flex flex-wrap gap-3">
                    {statusChartData.map(s => (
                        <div key={s.name} className="card px-4 py-2 flex items-center gap-2 flex-1">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.name] ?? "#94a3b8" }} />
                            <span className="text-xs capitalize text-[--muted-foreground]">{s.name}</span>
                            <span className="ml-auto text-sm font-semibold">{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* ── Recurring Templates ──────────────────────────────────── */}
                <div>
                    <h3 className="text-sm font-semibold mb-3">Monthly Recurring Expenses</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {RECURRING_TEMPLATES.map(t => (
                            <button key={t.label} onClick={() => openFromTemplate(t)}
                                className="card p-3 flex items-center gap-3 hover:border-[--primary] hover:shadow-sm transition-all text-left group">
                                <span className={`p-2 rounded-lg ${t.color}`}>{t.icon}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{t.label}</p>
                                    <p className="text-xs text-[--muted-foreground] capitalize">{t.category}</p>
                                </div>
                                <Plus size={14} className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 text-[--primary] transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div><h2 className="text-base font-semibold">All Expenses</h2><p className="text-sm text-[--muted-foreground]">{pagination?.totalItems ?? 0} total</p></div>
                    <Button onClick={openAdd}><Plus size={15} className="mr-1" />Add Expense</Button>
                </div>
                {loading ? <div className="card p-10 text-center text-sm text-[--muted-foreground]">Loading…</div>
                    : <DataTable data={expenses} columns={columns} title="Expenses" exportFilename="expenses" />}
            </main>

            <FormDialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Expense" : "Add Expense"}>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label>Category</Label>
                            <FormCombobox
                                items={categoryOptions}
                                value={form.category}
                                onValueChange={v => f("category", v)}
                                placeholder="Select category"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                            />
                        </div>
                        {basicFields.map(field => (
                            <div key={field.key}>
                                <Label>{field.label}{field.required && " *"}</Label>
                                <Input type={field.type} value={form[field.key] as string} onChange={e => f(field.key, e.target.value)} required={field.required} />
                            </div>
                        ))}
                        <div>
                            <Label>Payment Method</Label>
                            <FormCombobox
                                items={paymentMethodOptions}
                                value={form.paymentMethod}
                                onValueChange={v => f("paymentMethod", v)}
                                placeholder="Select payment method"
                                renderItem={opt => opt.label}
                                getItemValue={opt => opt.value}
                                getItemLabel={opt => opt.label}
                            />
                        </div>
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
                        <div className="col-span-2"><Label>Description</Label><Input value={form.description} onChange={e => f("description", e.target.value)} /></div>
                        <div className="col-span-2"><Label>Remarks</Label><Input value={form.remarks} onChange={e => f("remarks", e.target.value)} /></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button size="sm" type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </FormDialog>
            <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} loading={busy}
                message="Delete this expense record? This cannot be undone." />
        </>
    );
}