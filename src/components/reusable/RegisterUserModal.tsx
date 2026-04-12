"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTeachers } from "@/hooks/useTeachers";
import { useEmployees } from "@/hooks/useEmployees";
import { useParents } from "@/hooks/useParents";
import { useStudents } from "@/hooks/useStudents";
import { Copy, Download, RefreshCw, QrCode, UserCheck, ChevronRight } from "lucide-react";
import { toast } from "@/lib/toast";

interface Props {
    open: boolean;
    onClose: () => void;
}

type Role = "teacher" | "employee" | "parent" | "student";

interface PersonOption {
    id: string;
    name: string;
    email: string;
    customId?: string;
}

/** Encode registration payload as a URL-safe base64 token (expires in 24 h) */
function buildToken(payload: {
    email: string;
    role: string;
    referenceId: string;
    name: string;
}) {
    const exp = Date.now() + 24 * 60 * 60 * 1000;
    return btoa(JSON.stringify({ ...payload, exp }))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

const ROLES: { value: Role; label: string; color: string }[] = [
    { value: "teacher", label: "Teacher", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "student", label: "Student", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { value: "employee", label: "Employee", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { value: "parent", label: "Parent", color: "bg-green-50 text-green-700 border-green-200" },
];

export function RegisterUserModal({ open, onClose }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [role, setRole] = useState<Role>("teacher");
    const [personId, setPersonId] = useState("");
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [registrationUrl, setRegistrationUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const { teachers } = useTeachers();
    const { employees } = useEmployees();
    const { parents } = useParents();
    const { students } = useStudents({ limit: 1000 });

    // Reset when role changes
    useEffect(() => {
        setPersonId("");
        setQrDataUrl(null);
        setRegistrationUrl(null);
    }, [role]);

    // Reset fully on close
    useEffect(() => {
        if (!open) {
            setStep(1);
            setRole("teacher");
            setPersonId("");
            setQrDataUrl(null);
            setRegistrationUrl(null);
            setCopied(false);
        }
    }, [open]);

    const personOptions: PersonOption[] = (() => {
        const map = (arr: any[]): PersonOption[] =>
            arr.map((p) => ({
                id: p._id,
                name: `${p.firstName} ${p.lastName}`,
                email: p.email,
                customId: p.teacherId ?? p.employeeId ?? p.studentId,
            }));

        switch (role) {
            case "teacher": return map(teachers);
            case "student": return map(students);
            case "employee": return map(employees);
            case "parent": return map(parents);
            default: return [];
        }
    })();

    const selectedPerson = personOptions.find((p) => p.id === personId);
    const selectedRole = ROLES.find((r) => r.value === role)!;

    const handleGenerate = async () => {
        if (!selectedPerson) { toast.error("Please select a person"); return; }
        setGenerating(true);
        try {
            const token = buildToken({
                email: selectedPerson.email,
                role,
                referenceId: selectedPerson.id,
                name: selectedPerson.name,
            });

            const baseUrl =
                process.env.NEXT_PUBLIC_APP_URL ||
                (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

            const url = `${baseUrl}/register/${token}`;
            setRegistrationUrl(url);

            const dataUrl = await QRCode.toDataURL(url, {
                width: 280,
                margin: 2,
                color: { dark: "#1e293b", light: "#ffffff" },
            });
            setQrDataUrl(dataUrl);
            setStep(2);
        } catch {
            toast.error("Failed to generate QR code");
        } finally {
            setGenerating(false);
        }
    };

    const handleCopyLink = () => {
        if (!registrationUrl) return;
        navigator.clipboard.writeText(registrationUrl);
        setCopied(true);
        toast.success("Registration link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadQR = () => {
        if (!qrDataUrl || !selectedPerson) return;
        const link = document.createElement("a");
        link.download = `register-${selectedPerson.name.replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = qrDataUrl;
        link.click();
    };

    const handleReset = () => {
        setStep(1);
        setPersonId("");
        setQrDataUrl(null);
        setRegistrationUrl(null);
        setCopied(false);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b bg-[--muted]/40">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[--primary]/10 flex items-center justify-center">
                            <UserCheck size={18} className="text-[--primary]" />
                        </div>
                        <div>
                            <DialogTitle className="text-base">Register New User</DialogTitle>
                            <p className="text-xs text-[--muted-foreground] mt-0.5">
                                Generate a QR code for staff to self-register
                            </p>
                        </div>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${step === 1 ? "text-[--primary]" : "text-[--muted-foreground]"}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? "bg-[--primary] text-white" : "bg-[--muted] text-[--muted-foreground]"}`}>1</span>
                            Select Person
                        </div>
                        <ChevronRight size={12} className="text-[--muted-foreground]" />
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${step === 2 ? "text-[--primary]" : "text-[--muted-foreground]"}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? "bg-[--primary] text-white" : "bg-[--muted] text-[--muted-foreground]"}`}>2</span>
                            Share QR Code
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5">
                    {/* ── STEP 1 ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Role picker */}
                            <div>
                                <Label className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide">Role</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {ROLES.map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${role === r.value ? r.color + " border-current shadow-sm" : "border-[--border] text-[--muted-foreground] hover:border-[--primary]/40 hover:text-[--foreground]"}`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Person picker */}
                            <div>
                                <Label className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide">Person</Label>
                                <Select
                                    value={personId}
                                    onValueChange={(v) => {
                                        setPersonId(v);
                                        setQrDataUrl(null);
                                        setRegistrationUrl(null);
                                    }}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select a person…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {personOptions.length === 0 ? (
                                            <div className="px-3 py-4 text-sm text-[--muted-foreground] text-center">
                                                No {role} profiles found
                                            </div>
                                        ) : (
                                            personOptions.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <p className="font-medium text-sm leading-tight">{p.name}</p>
                                                            <p className="text-xs text-[--muted-foreground]">{p.email}</p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected person preview */}
                            {selectedPerson && (
                                <div className="rounded-lg border border-[--border] bg-[--muted]/40 p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">{selectedPerson.name}</p>
                                        <p className="text-xs text-[--muted-foreground]">{selectedPerson.email}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${selectedRole.color}`}>
                                        {selectedRole.label}
                                    </span>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleGenerate}
                                disabled={!personId || generating}
                            >
                                {generating ? (
                                    <><RefreshCw size={14} className="mr-2 animate-spin" />Generating…</>
                                ) : (
                                    <><QrCode size={14} className="mr-2" />Generate QR Code</>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* ── STEP 2 ── */}
                    {step === 2 && qrDataUrl && selectedPerson && (
                        <div className="space-y-4">
                            {/* Person info */}
                            <div className="flex items-center justify-between rounded-lg border border-[--border] bg-[--muted]/40 px-3 py-2.5">
                                <div>
                                    <p className="text-sm font-semibold">{selectedPerson.name}</p>
                                    <p className="text-xs text-[--muted-foreground]">{selectedPerson.email}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${selectedRole.color}`}>
                                    {selectedRole.label}
                                </span>
                            </div>

                            {/* QR Code */}
                            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[--border] p-5 bg-white">
                                <img src={qrDataUrl} alt="Registration QR Code" className="w-52 h-52" />
                                <p className="text-xs text-center text-[--muted-foreground]">
                                    Expires in <span className="font-semibold text-[--foreground]">24 hours</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={handleCopyLink} className="w-full">
                                    <Copy size={13} className="mr-1.5" />
                                    {copied ? "Copied!" : "Copy Link"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownloadQR} className="w-full">
                                    <Download size={13} className="mr-1.5" />
                                    Download QR
                                </Button>
                            </div>

                            <Button variant="ghost" size="sm" className="w-full text-[--muted-foreground]" onClick={handleReset}>
                                <RefreshCw size={13} className="mr-1.5" />
                                Generate for another person
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
