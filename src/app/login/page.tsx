"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/toast";
import api from "@/lib/axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import logo from "../../../public/logos/onushilon-logo.png";


type Mode = "login" | "register";

const blankReg = {
    firstName: "", lastName: "", email: "", phone: "",
    occupation: "", relationship: "father" as "father" | "mother" | "guardian",
    street: "", city: "", state: "", zipCode: "", country: "",
    password: "", confirmPassword: "",
    studentId: "",
};

export default function LoginPage() {
    const router = useRouter();

    const [mode, setMode] = useState<Mode>("login");

    // Login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register state
    const [reg, setReg] = useState(blankReg);
    const r = (k: keyof typeof blankReg, v: string) =>
        setReg((p) => ({ ...p, [k]: v }));

    const [isLoading, setIsLoading] = useState(false);

    // Student ID lookup
    type LookupState = "idle" | "searching" | "found" | "not-found";
    const [lookupState, setLookupState] = useState<LookupState>("idle");
    const [foundStudent, setFoundStudent] = useState<{ _id: string; firstName: string; lastName: string; studentId: string } | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const sid = reg.studentId.trim().toUpperCase();
        if (!sid) {
            setLookupState("idle");
            setFoundStudent(null);
            return;
        }
        setLookupState("searching");
        setFoundStudent(null);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get(`/students?search=${encodeURIComponent(sid)}&limit=1`);
                const items: any[] = res.data?.data ?? [];
                const match = items.find(
                    (s: any) => s.studentId?.toUpperCase() === sid
                );
                if (match) {
                    setFoundStudent({ _id: match._id, firstName: match.firstName, lastName: match.lastName, studentId: match.studentId });
                    setLookupState("found");
                } else {
                    setLookupState("not-found");
                }
            } catch {
                setLookupState("not-found");
            }
        }, 600);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [reg.studentId]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await signIn("credentials", { email, password, redirect: false });
            if (result?.error) {
                toast.error(result.error);
            } else if (result?.ok) {
                toast.success("Login successful!");
                // Let the middleware/root page redirect to the role-specific dashboard
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reg.password !== reg.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (reg.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        // If a student ID was entered, it must have resolved to a real student
        if (reg.studentId.trim() && lookupState !== "found") {
            toast.error("Student ID not found. Please check the ID or leave it blank.");
            return;
        }
        setIsLoading(true);
        try {
            // 1. Create the parent profile
            const profileRes = await api.post("/parents", {
                firstName: reg.firstName,
                lastName: reg.lastName,
                email: reg.email,
                phone: reg.phone,
                occupation: reg.occupation || undefined,
                relationship: reg.relationship,
                address: {
                    street: reg.street,
                    city: reg.city,
                    state: reg.state,
                    zipCode: reg.zipCode,
                    country: reg.country,
                },
            });

            const referenceId = profileRes.data.data._id;

            // 2. If a student was found, link the parent to that student
            if (foundStudent) {
                await api.put(`/students/${foundStudent._id}`, { parentId: referenceId });
            }

            // 3. Create the user account linked to that parent profile
            await api.post("/auth/register", {
                email: reg.email,
                password: reg.password,
                role: "parent",
                referenceId,
            });

            toast.success(
                foundStudent
                    ? `Account created and linked to ${foundStudent.firstName} ${foundStudent.lastName}!`
                    : "Account created! You can now sign in."
            );
            setMode("login");
            setEmail(reg.email);
            setReg(blankReg);
            setLookupState("idle");
            setFoundStudent(null);
        } catch (err: any) {
            toast.error(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (next: Mode) => {
        setMode(next);
        setEmail(""); setPassword("");
        setReg(blankReg);
        setLookupState("idle");
        setFoundStudent(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--background] p-4">
            <div className="w-full max-w-md">
                <div className="card p-8">
                    <div className="text-center mb-2">
                        {mode === "login" && (
                            <div className="mb-3 flex justify-center">
                                <Image
                                    src={logo}
                                    alt="Onushilon logo"
                                    // width={50}
                                    // height={50}
                                    className="h-20 w-50 object-contain"
                                    priority
                                />
                            </div>
                        )}
                        {/* <h1 className="text-2xl font-bold mb-1">
                            {mode === "login" ? "Onushilon Academy" : "Parent Registration"}
                        </h1> */}
                        <p className="text-[--muted-foreground] text-sm">
                            {mode === "login"
                                ? "Sign in to your Onushilon account"
                                : "Create a parent account to access the portal"}
                        </p>
                    </div>

                    {mode === "login" ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Enter your email"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    required disabled={isLoading} />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="Enter your password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    required disabled={isLoading} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in…" : "Sign In"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Personal info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>First Name *</Label>
                                    <Input placeholder="First name" value={reg.firstName}
                                        onChange={(e) => r("firstName", e.target.value)} required disabled={isLoading} />
                                </div>
                                <div>
                                    <Label>Last Name *</Label>
                                    <Input placeholder="Last name" value={reg.lastName}
                                        onChange={(e) => r("lastName", e.target.value)} required disabled={isLoading} />
                                </div>
                            </div>
                            <div>
                                <Label>Email *</Label>
                                <Input type="email" placeholder="your@email.com" value={reg.email}
                                    onChange={(e) => r("email", e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Phone *</Label>
                                    <Input placeholder="Phone number" value={reg.phone}
                                        onChange={(e) => r("phone", e.target.value)} required disabled={isLoading} />
                                </div>
                                <div>
                                    <Label>Relationship *</Label>
                                    <Select value={reg.relationship} onValueChange={(v) => r("relationship", v)} disabled={isLoading}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="father">Father</SelectItem>
                                            <SelectItem value="mother">Mother</SelectItem>
                                            <SelectItem value="guardian">Guardian</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>Occupation</Label>
                                <Input placeholder="Optional" value={reg.occupation}
                                    onChange={(e) => r("occupation", e.target.value)} disabled={isLoading} />
                            </div>

                            {/* Student linkage */}
                            <div>
                                <Label>
                                    Student ID{" "}
                                    <span className="text-[--muted-foreground] font-normal text-xs">(optional — link your child)</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        placeholder="e.g. STU-0001"
                                        value={reg.studentId}
                                        onChange={(e) => r("studentId", e.target.value.toUpperCase())}
                                        disabled={isLoading}
                                        className={
                                            lookupState === "found"
                                                ? "border-green-500 pr-8"
                                                : lookupState === "not-found"
                                                    ? "border-red-500 pr-8"
                                                    : "pr-8"
                                        }
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                        {lookupState === "searching" && <Loader2 size={15} className="animate-spin text-[--muted-foreground]" />}
                                        {lookupState === "found" && <CheckCircle2 size={15} className="text-green-600" />}
                                        {lookupState === "not-found" && <XCircle size={15} className="text-red-500" />}
                                    </span>
                                </div>
                                {lookupState === "found" && foundStudent && (
                                    <p className="text-xs text-green-700 mt-1">
                                        ✓ Found: <span className="font-medium">{foundStudent.firstName} {foundStudent.lastName}</span>
                                    </p>
                                )}
                                {lookupState === "not-found" && reg.studentId.trim() && (
                                    <p className="text-xs text-red-600 mt-1">
                                        No student found with ID "{reg.studentId}". Registration will be blocked.
                                    </p>
                                )}
                            </div>
                            <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide pt-1">Address</p>
                            <div>
                                <Label>Street *</Label>
                                <Input placeholder="Street address" value={reg.street}
                                    onChange={(e) => r("street", e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>City *</Label>
                                    <Input placeholder="City" value={reg.city}
                                        onChange={(e) => r("city", e.target.value)} required disabled={isLoading} />
                                </div>
                                <div>
                                    <Label>State *</Label>
                                    <Input placeholder="State" value={reg.state}
                                        onChange={(e) => r("state", e.target.value)} required disabled={isLoading} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Zip Code *</Label>
                                    <Input placeholder="Zip code" value={reg.zipCode}
                                        onChange={(e) => r("zipCode", e.target.value)} required disabled={isLoading} />
                                </div>
                                <div>
                                    <Label>Country *</Label>
                                    <Input placeholder="Country" value={reg.country}
                                        onChange={(e) => r("country", e.target.value)} required disabled={isLoading} />
                                </div>
                            </div>

                            {/* Password */}
                            <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide pt-1">Set Password</p>
                            <div>
                                <Label>Password *</Label>
                                <Input type="password" placeholder="At least 6 characters" value={reg.password}
                                    onChange={(e) => r("password", e.target.value)} required disabled={isLoading} />
                            </div>
                            <div>
                                <Label>Confirm Password *</Label>
                                <Input type="password" placeholder="Re-enter password" value={reg.confirmPassword}
                                    onChange={(e) => r("confirmPassword", e.target.value)} required disabled={isLoading} />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Creating account…" : "Create Parent Account"}
                            </Button>
                        </form>
                    )}

                    {/* <div className="mt-5 text-center">
                        {mode === "login" ? (
                            <button type="button" onClick={() => switchMode("register")}
                                className="text-sm text-[--primary] hover:underline" disabled={isLoading}>
                                Parent? Register here
                            </button>
                        ) : (
                            <button type="button" onClick={() => switchMode("login")}
                                className="text-sm text-[--primary] hover:underline" disabled={isLoading}>
                                Already have an account? Sign in
                            </button>
                        )}
                    </div> */}

                    <div className="mt-4 text-center text-xs text-[--muted-foreground]">
                        <p>CampusBaba - Your Campus Portal</p>
                        {mode === "login" && (
                            <>
                                <p className="mt-0.5">Powered by <a href="https://campusbaba.com" className="text-[--primary] hover:underline animate-pulse" target="_blank" rel="noopener noreferrer">campusbaba.com</a></p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* <div className="fixed bottom-4 bg-white border-dashed border-2 p-2 rounded-sm text-xs max-w-sm z-50">
                <h3 className="font-semibold text-center">Roles Credentials</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[--muted-foreground] border-b">
                            <th className="pb-1 pr-4 font-medium">Role</th>
                            <th className="pb-1 pr-4 font-medium">Email</th>
                            <th className="pb-1 font-medium">Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b last:border-0 border-dashed">
                            <td className="py-2 pr-4 font-semibold text-blue-600">Admin</td>
                            <td className="py-2 pr-4 font-mono">zaman@gmail.com</td>
                            <td className="py-2 font-mono">eram1234</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4 font-semibold text-purple-600">Teacher</td>
                            <td className="py-2 pr-4 font-mono">asif@gmail.com</td>
                            <td className="py-2 font-mono">eram1234</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4 font-semibold text-purple-600">Parent</td>
                            <td className="py-2 pr-4 font-mono">mokbul@gmail.com</td>
                            <td className="py-2 font-mono">eram1234</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4 font-semibold text-purple-600">Student</td>
                            <td className="py-2 pr-4 font-mono">aminul@gmail.com</td>
                            <td className="py-2 font-mono">eram1234</td>
                        </tr>
                    </tbody>
                </table>
            </div> */}
        </div>
    );
}

