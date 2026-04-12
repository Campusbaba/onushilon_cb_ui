"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import api from "@/lib/axios";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, Eye, EyeOff, GraduationCap } from "lucide-react";

interface TokenPayload {
    email: string;
    role: string;
    referenceId: string;
    name: string;
    exp: number;
}

function decodeToken(token: string): TokenPayload | null {
    try {
        const std = token
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(token.length + (4 - (token.length % 4)) % 4, "=");
        const decoded = JSON.parse(atob(std));
        return decoded as TokenPayload;
    } catch {
        return null;
    }
}

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
    admin: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    teacher: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    employee: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    student: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
    parent: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
};

function StatusScreen({ icon, title, message, btnText, onBtn }: {
    icon: React.ReactNode; title: string; message: string; btnText: string; onBtn: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[--background] p-4">
            <div className="w-full max-w-sm">
                <div className="card p-8 text-center space-y-4">
                    <div className="flex justify-center">{icon}</div>
                    <div>
                        <h2 className="text-lg font-bold text-[--foreground]">{title}</h2>
                        <p className="text-[--muted-foreground] text-sm mt-1">{message}</p>
                    </div>
                    <Button onClick={onBtn} className="w-full">{btnText}</Button>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [payload, setPayload] = useState<TokenPayload | null>(null);
    const [expired, setExpired] = useState(false);
    const [invalid, setInvalid] = useState(false);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!token) { setInvalid(true); return; }
        const data = decodeToken(token);
        if (!data) { setInvalid(true); return; }
        if (data.exp && Date.now() > data.exp) { setExpired(true); return; }
        setPayload(data);
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
        if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
        setIsLoading(true);
        try {
            await api.post("/auth/register", {
                email: payload!.email,
                password,
                role: payload!.role,
                referenceId: payload!.referenceId,
            });
            toast.success("Account created! You can now sign in.");
            setDone(true);
        } catch (err: any) {
            toast.error(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (invalid) return (
        <StatusScreen
            icon={<div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center"><AlertTriangle size={26} className="text-red-500" /></div>}
            title="Invalid Link"
            message="This registration link is not valid. Please ask your administrator for a new one."
            btnText="Go to Login"
            onBtn={() => router.push("/login")}
        />
    );

    if (expired) return (
        <StatusScreen
            icon={<div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center"><Clock size={26} className="text-amber-500" /></div>}
            title="Link Expired"
            message="This registration link has expired (24h limit). Please ask your administrator to generate a new one."
            btnText="Go to Login"
            onBtn={() => router.push("/login")}
        />
    );

    if (done) return (
        <StatusScreen
            icon={<div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center"><CheckCircle2 size={26} className="text-green-600" /></div>}
            title="Account Created!"
            message="Your account has been set up successfully. You can now sign in with your email and password."
            btnText="Go to Login"
            onBtn={() => router.push("/login")}
        />
    );

    if (!payload) return (
        <div className="min-h-screen flex items-center justify-center bg-[--background]">
            <div className="text-[--muted-foreground] text-sm animate-pulse">Loading…</div>
        </div>
    );

    const roleStyle = ROLE_STYLES[payload.role] ?? { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--background] p-4">
            <div className="w-full max-w-md space-y-4">

                {/* Branding */}
                <div className="text-center space-y-1">
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[--primary]/10 flex items-center justify-center">
                            <GraduationCap size={24} className="text-[--primary]" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[--foreground]">Complete Your Registration</h1>
                    <p className="text-sm text-[--muted-foreground]">Set a password to activate your Onushilon account</p>
                </div>

                <div className="card p-6 space-y-5">
                    {/* Identity banner */}
                    <div className="rounded-lg border bg-[--muted]/40 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[--muted-foreground] font-medium uppercase tracking-wide">Account Details</span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${roleStyle.bg} ${roleStyle.color}`}>
                                {payload.role}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[--muted-foreground]">Name</span>
                                <span className="text-sm font-semibold text-[--foreground]">{payload.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[--muted-foreground]">Email</span>
                                <span className="text-sm text-[--foreground]">{payload.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Password form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="password" className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide">Password</Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="password"
                                    type={showPw ? "text" : "password"}
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pr-10"
                                />
                                <button type="button" onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted-foreground] hover:text-[--foreground]">
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide">Confirm Password</Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pr-10"
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted-foreground] hover:text-[--foreground]">
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                "Creating account…"
                            ) : (
                                <><ShieldCheck size={15} className="mr-2" />Create Account</>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-[--muted-foreground]">
                    Already have an account?{" "}
                    <button onClick={() => router.push("/login")} className="text-[--primary] hover:underline font-medium">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
