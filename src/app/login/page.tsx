// "use client";

// import { useState, useEffect, useRef } from "react";
// import Image from "next/image";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "@/lib/toast";
// import api from "@/lib/axios";
// import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
// import logo from "../../../public/logos/onushilon-logo.png";


// type Mode = "login" | "register";

// const blankReg = {
//     firstName: "", lastName: "", email: "", phone: "",
//     occupation: "", relationship: "father" as "father" | "mother" | "guardian",
//     street: "", city: "", state: "", zipCode: "", country: "",
//     password: "", confirmPassword: "",
//     studentId: "",
// };

// export default function LoginPage() {
//     const router = useRouter();

//     const [mode, setMode] = useState<Mode>("login");

//     // Login state
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     // Register state
//     const [reg, setReg] = useState(blankReg);
//     const r = (k: keyof typeof blankReg, v: string) =>
//         setReg((p) => ({ ...p, [k]: v }));

//     const [isLoading, setIsLoading] = useState(false);

//     // Student ID lookup
//     type LookupState = "idle" | "searching" | "found" | "not-found";
//     const [lookupState, setLookupState] = useState<LookupState>("idle");
//     const [foundStudent, setFoundStudent] = useState<{ _id: string; firstName: string; lastName: string; studentId: string } | null>(null);
//     const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//     useEffect(() => {
//         const sid = reg.studentId.trim().toUpperCase();
//         if (!sid) {
//             setLookupState("idle");
//             setFoundStudent(null);
//             return;
//         }
//         setLookupState("searching");
//         setFoundStudent(null);
//         if (debounceRef.current) clearTimeout(debounceRef.current);
//         debounceRef.current = setTimeout(async () => {
//             try {
//                 const res = await api.get(`/students?search=${encodeURIComponent(sid)}&limit=1`);
//                 const items: any[] = res.data?.data ?? [];
//                 const match = items.find(
//                     (s: any) => s.studentId?.toUpperCase() === sid
//                 );
//                 if (match) {
//                     setFoundStudent({ _id: match._id, firstName: match.firstName, lastName: match.lastName, studentId: match.studentId });
//                     setLookupState("found");
//                 } else {
//                     setLookupState("not-found");
//                 }
//             } catch {
//                 setLookupState("not-found");
//             }
//         }, 600);
//         return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
//     }, [reg.studentId]);

//     const handleLogin = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);
//         try {
//             const result = await signIn("credentials", { email, password, redirect: false });
//             if (result?.error) {
//                 toast.error(result.error);
//             } else if (result?.ok) {
//                 toast.success("Login successful!");
//                 // Let the middleware/root page redirect to the role-specific dashboard
//                 router.push("/");
//                 router.refresh();
//             }
//         } catch (err: any) {
//             toast.error(err.message || "An error occurred during login");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleRegister = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (reg.password !== reg.confirmPassword) {
//             toast.error("Passwords do not match");
//             return;
//         }
//         if (reg.password.length < 6) {
//             toast.error("Password must be at least 6 characters");
//             return;
//         }
//         // If a student ID was entered, it must have resolved to a real student
//         if (reg.studentId.trim() && lookupState !== "found") {
//             toast.error("Student ID not found. Please check the ID or leave it blank.");
//             return;
//         }
//         setIsLoading(true);
//         try {
//             // 1. Create the parent profile
//             const profileRes = await api.post("/parents", {
//                 firstName: reg.firstName,
//                 lastName: reg.lastName,
//                 email: reg.email,
//                 phone: reg.phone,
//                 occupation: reg.occupation || undefined,
//                 relationship: reg.relationship,
//                 address: {
//                     street: reg.street,
//                     city: reg.city,
//                     state: reg.state,
//                     zipCode: reg.zipCode,
//                     country: reg.country,
//                 },
//             });

//             const referenceId = profileRes.data.data._id;

//             // 2. If a student was found, link the parent to that student
//             if (foundStudent) {
//                 await api.put(`/students/${foundStudent._id}`, { parentId: referenceId });
//             }

//             // 3. Create the user account linked to that parent profile
//             await api.post("/auth/register", {
//                 email: reg.email,
//                 password: reg.password,
//                 role: "parent",
//                 referenceId,
//             });

//             toast.success(
//                 foundStudent
//                     ? `Account created and linked to ${foundStudent.firstName} ${foundStudent.lastName}!`
//                     : "Account created! You can now sign in."
//             );
//             setMode("login");
//             setEmail(reg.email);
//             setReg(blankReg);
//             setLookupState("idle");
//             setFoundStudent(null);
//         } catch (err: any) {
//             toast.error(err.message || "Registration failed");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const switchMode = (next: Mode) => {
//         setMode(next);
//         setEmail(""); setPassword("");
//         setReg(blankReg);
//         setLookupState("idle");
//         setFoundStudent(null);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-[--background] p-4">
//             <div className="w-full max-w-md">
//                 <div className="card p-8">
//                     <div className="text-center mb-2">
//                         {mode === "login" && (
//                             <div className="mb-3 flex justify-center">
//                                 <Image
//                                     src={logo}
//                                     alt="Onushilon logo"
//                                     // width={50}
//                                     // height={50}
//                                     className="h-20 w-50 object-contain"
//                                     priority
//                                 />
//                             </div>
//                         )}
//                         {/* <h1 className="text-2xl font-bold mb-1">
//                             {mode === "login" ? "Onushilon Academy" : "Parent Registration"}
//                         </h1> */}
//                         <p className="text-[--muted-foreground] text-sm">
//                             {mode === "login"
//                                 ? "Sign in to your Onushilon account"
//                                 : "Create a parent account to access the portal"}
//                         </p>
//                     </div>

//                     {mode === "login" ? (
//                         <form onSubmit={handleLogin} className="space-y-4">
//                             <div>
//                                 <Label htmlFor="email">Email</Label>
//                                 <Input id="email" type="email" placeholder="Enter your email"
//                                     value={email} onChange={(e) => setEmail(e.target.value)}
//                                     required disabled={isLoading} />
//                             </div>
//                             <div>
//                                 <Label htmlFor="password">Password</Label>
//                                 <Input id="password" type="password" placeholder="Enter your password"
//                                     value={password} onChange={(e) => setPassword(e.target.value)}
//                                     required disabled={isLoading} />
//                             </div>
//                             <Button type="submit" className="w-full" disabled={isLoading}>
//                                 {isLoading ? "Signing in…" : "Sign In"}
//                             </Button>
//                         </form>
//                     ) : (
//                         <form onSubmit={handleRegister} className="space-y-4">
//                             {/* Personal info */}
//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <Label>First Name *</Label>
//                                     <Input placeholder="First name" value={reg.firstName}
//                                         onChange={(e) => r("firstName", e.target.value)} required disabled={isLoading} />
//                                 </div>
//                                 <div>
//                                     <Label>Last Name *</Label>
//                                     <Input placeholder="Last name" value={reg.lastName}
//                                         onChange={(e) => r("lastName", e.target.value)} required disabled={isLoading} />
//                                 </div>
//                             </div>
//                             <div>
//                                 <Label>Email *</Label>
//                                 <Input type="email" placeholder="your@email.com" value={reg.email}
//                                     onChange={(e) => r("email", e.target.value)} required disabled={isLoading} />
//                             </div>
//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <Label>Phone *</Label>
//                                     <Input placeholder="Phone number" value={reg.phone}
//                                         onChange={(e) => r("phone", e.target.value)} required disabled={isLoading} />
//                                 </div>
//                                 <div>
//                                     <Label>Relationship *</Label>
//                                     <Select value={reg.relationship} onValueChange={(v) => r("relationship", v)} disabled={isLoading}>
//                                         <SelectTrigger><SelectValue /></SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="father">Father</SelectItem>
//                                             <SelectItem value="mother">Mother</SelectItem>
//                                             <SelectItem value="guardian">Guardian</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                             </div>
//                             <div>
//                                 <Label>Occupation</Label>
//                                 <Input placeholder="Optional" value={reg.occupation}
//                                     onChange={(e) => r("occupation", e.target.value)} disabled={isLoading} />
//                             </div>

//                             {/* Student linkage */}
//                             <div>
//                                 <Label>
//                                     Student ID{" "}
//                                     <span className="text-[--muted-foreground] font-normal text-xs">(optional — link your child)</span>
//                                 </Label>
//                                 <div className="relative">
//                                     <Input
//                                         placeholder="e.g. STU-0001"
//                                         value={reg.studentId}
//                                         onChange={(e) => r("studentId", e.target.value.toUpperCase())}
//                                         disabled={isLoading}
//                                         className={
//                                             lookupState === "found"
//                                                 ? "border-green-500 pr-8"
//                                                 : lookupState === "not-found"
//                                                     ? "border-red-500 pr-8"
//                                                     : "pr-8"
//                                         }
//                                     />
//                                     <span className="absolute right-2 top-1/2 -translate-y-1/2">
//                                         {lookupState === "searching" && <Loader2 size={15} className="animate-spin text-[--muted-foreground]" />}
//                                         {lookupState === "found" && <CheckCircle2 size={15} className="text-green-600" />}
//                                         {lookupState === "not-found" && <XCircle size={15} className="text-red-500" />}
//                                     </span>
//                                 </div>
//                                 {lookupState === "found" && foundStudent && (
//                                     <p className="text-xs text-green-700 mt-1">
//                                         ✓ Found: <span className="font-medium">{foundStudent.firstName} {foundStudent.lastName}</span>
//                                     </p>
//                                 )}
//                                 {lookupState === "not-found" && reg.studentId.trim() && (
//                                     <p className="text-xs text-red-600 mt-1">
//                                         No student found with ID "{reg.studentId}". Registration will be blocked.
//                                     </p>
//                                 )}
//                             </div>
//                             <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide pt-1">Address</p>
//                             <div>
//                                 <Label>Street *</Label>
//                                 <Input placeholder="Street address" value={reg.street}
//                                     onChange={(e) => r("street", e.target.value)} required disabled={isLoading} />
//                             </div>
//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <Label>City *</Label>
//                                     <Input placeholder="City" value={reg.city}
//                                         onChange={(e) => r("city", e.target.value)} required disabled={isLoading} />
//                                 </div>
//                                 <div>
//                                     <Label>State *</Label>
//                                     <Input placeholder="State" value={reg.state}
//                                         onChange={(e) => r("state", e.target.value)} required disabled={isLoading} />
//                                 </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <Label>Zip Code *</Label>
//                                     <Input placeholder="Zip code" value={reg.zipCode}
//                                         onChange={(e) => r("zipCode", e.target.value)} required disabled={isLoading} />
//                                 </div>
//                                 <div>
//                                     <Label>Country *</Label>
//                                     <Input placeholder="Country" value={reg.country}
//                                         onChange={(e) => r("country", e.target.value)} required disabled={isLoading} />
//                                 </div>
//                             </div>

//                             {/* Password */}
//                             <p className="text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide pt-1">Set Password</p>
//                             <div>
//                                 <Label>Password *</Label>
//                                 <Input type="password" placeholder="At least 6 characters" value={reg.password}
//                                     onChange={(e) => r("password", e.target.value)} required disabled={isLoading} />
//                             </div>
//                             <div>
//                                 <Label>Confirm Password *</Label>
//                                 <Input type="password" placeholder="Re-enter password" value={reg.confirmPassword}
//                                     onChange={(e) => r("confirmPassword", e.target.value)} required disabled={isLoading} />
//                             </div>

//                             <Button type="submit" className="w-full" disabled={isLoading}>
//                                 {isLoading ? "Creating account…" : "Create Parent Account"}
//                             </Button>
//                         </form>
//                     )}

//                     {/* <div className="mt-5 text-center">
//                         {mode === "login" ? (
//                             <button type="button" onClick={() => switchMode("register")}
//                                 className="text-sm text-[--primary] hover:underline" disabled={isLoading}>
//                                 Parent? Register here
//                             </button>
//                         ) : (
//                             <button type="button" onClick={() => switchMode("login")}
//                                 className="text-sm text-[--primary] hover:underline" disabled={isLoading}>
//                                 Already have an account? Sign in
//                             </button>
//                         )}
//                     </div> */}

//                     <div className="mt-4 text-center text-xs text-[--muted-foreground]">
//                         <p>CampusBaba - Your Campus Portal</p>
//                         {mode === "login" && (
//                             <>
//                                 <p className="mt-0.5">Powered by <a href="https://campusbaba.com" className="text-[--primary] hover:underline animate-pulse" target="_blank" rel="noopener noreferrer">campusbaba.com</a></p>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//             {/* <div className="fixed bottom-4 bg-white border-dashed border-2 p-2 rounded-sm text-xs max-w-sm z-50">
//                 <h3 className="font-semibold text-center">Roles Credentials</h3>
//                 <table className="w-full text-left">
//                     <thead>
//                         <tr className="text-[--muted-foreground] border-b">
//                             <th className="pb-1 pr-4 font-medium">Role</th>
//                             <th className="pb-1 pr-4 font-medium">Email</th>
//                             <th className="pb-1 font-medium">Password</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr className="border-b last:border-0 border-dashed">
//                             <td className="py-2 pr-4 font-semibold text-blue-600">Admin</td>
//                             <td className="py-2 pr-4 font-mono">zaman@gmail.com</td>
//                             <td className="py-2 font-mono">eram1234</td>
//                         </tr>
//                         <tr>
//                             <td className="py-2 pr-4 font-semibold text-purple-600">Teacher</td>
//                             <td className="py-2 pr-4 font-mono">asif@gmail.com</td>
//                             <td className="py-2 font-mono">eram1234</td>
//                         </tr>
//                         <tr>
//                             <td className="py-2 pr-4 font-semibold text-purple-600">Parent</td>
//                             <td className="py-2 pr-4 font-mono">mokbul@gmail.com</td>
//                             <td className="py-2 font-mono">eram1234</td>
//                         </tr>
//                         <tr>
//                             <td className="py-2 pr-4 font-semibold text-purple-600">Student</td>
//                             <td className="py-2 pr-4 font-mono">aminul@gmail.com</td>
//                             <td className="py-2 font-mono">eram1234</td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div> */}
//         </div>
//     );
// }


"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import schoolImage from "../../../public/images/school.jpg";
import { Clipboard, Check } from "lucide-react";
import logo from "../../../public/logos/onushilon-logo.png";

const batchInfo = {
    batchName: "English Batch 2026",
    timings: "Sat-Thu, 9:00 AM - 11:00 AM",
    studentsEnrolled: "128 students",
    phone: "+880 1712-345678",
    email: "milon.sir@campusbaba.com",
};


export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await signIn("credentials", { email, password, redirect: false });
            if (result?.error) {
                toast.error(result.error);
            } else if (result?.ok) {
                toast.success("Login successful!");
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (key: string, text: string, label: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(key);
        toast.success(`${label} copied`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-blue-100">
            <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
                {/* <section className="flex flex-col gap-6 bg-gradient-to-b from-white via-white to-sky-50/70 px-4 py-6 sm:px-8 lg:border-r lg:border-slate-200 lg:px-14 "> */}
                <section className="order-1 flex flex-col gap-6 bg-gradient-to-b from-white via-white to-sky-50/70 px-4 py-6 sm:px-6 sm:py-8 md:px-10 lg:min-h-screen lg:justify-center lg:border-r lg:border-slate-200 lg:px-14 lg:py-10">
                    <div className="w-full max-w-xl mx-auto">
                        <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:p-8">
                            {/* <div className="mb-6">
                                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                                    Welcome back
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Sign in to your CampusBaba account
                                </p>
                            </div> */}
                            <div className="mb-2 flex justify-center">
                                    <Image
                                        src={logo}
                                        alt="Onushilon logo"
                                        width={200}
                                        height={200}
                                        className="h-20 w-50 object-contain"
                                        priority
                                    />
                                </div>
                            {/* <header className="flex items-center gap-3 mx-auto mb-6">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">
                                        Milon Sir (English Batch)
                                    </p>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                        Login panel
                                    </p>
                                </div>
                            </header> */}


                            <form onSubmit={handleLogin} className="grid gap-4">
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
                                <Button type="submit" className="h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-300 text-white shadow-sm hover:from-blue-600 hover:to-sky-400" disabled={isLoading}>
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="mt-5 text-center text-xs text-slate-500">
                                <p>CampusBaba - Your Campus Portal</p>
                                <p className="mt-1">Powered by <a href="https://campusbaba.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline">campusbaba.com</a></p>
                            </div>
                        </div>
                    </div>

                    {/* <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-200 bg-sky-50/80 p-5 shadow-sm">
                        <h3 className="text-center text-sm font-semibold text-slate-900">Role Credentials</h3>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-slate-500">
                                        <th className="pb-2 pr-4">Role</th>
                                        <th className="pb-2 pr-4">Email</th>
                                        <th className="pb-2">Password</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-800">
                                    <tr className="border-t border-slate-200">
                                        <td className="py-2 pr-4 font-semibold text-blue-700">Admin</td>
                                        <td className="py-2 pr-4 font-mono">zaman@gmail.com</td>
                                        <td className="py-2 font-mono">password123</td>
                                    </tr>
                                    <tr className="border-t border-slate-200">
                                        <td className="py-2 pr-4 font-semibold text-slate-700">Teacher</td>
                                        <td className="py-2 pr-4 font-mono">lavern_howe@yahoo.com</td>
                                        <td className="py-2 font-mono">password123</td>
                                    </tr>
                                    <tr className="border-t border-slate-200">
                                        <td className="py-2 pr-4 font-semibold text-slate-700">Parent</td>
                                        <td className="py-2 pr-4 font-mono">tiara_wunsch@hotmail.com</td>
                                        <td className="py-2 font-mono">password123</td>
                                    </tr>
                                    <tr className="border-t border-slate-200">
                                        <td className="py-2 pr-4 font-semibold text-slate-700">Student</td>
                                        <td className="py-2 pr-4 font-mono">gabriella.harber@yahoo.com</td>
                                        <td className="py-2 font-mono">password123</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> 
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-slate-500">
                                        <th className="pb-2 pr-4">Role</th>
                                        <th className="pb-2 pr-4">Email</th>
                                        <th className="pb-2">Password</th>
                                    </tr>
                                </thead>

                                <tbody className="text-slate-800">
                                    {[
                                        {
                                            role: "Admin",
                                            email: "admin@gmail.com",
                                            password: "password123",
                                            color: "text-blue-700",
                                        },
                                        {
                                            role: "Teacher",
                                            email: "lavern_howe@yahoo.com",
                                            password: "password123",
                                            color: "text-slate-700",
                                        },
                                        {
                                            role: "Parent",
                                            email: "tiara_wunsch@hotmail.com",
                                            password: "password123",
                                            color: "text-slate-700",
                                        },
                                        {
                                            role: "Student",
                                            email: "gabriella.harber@yahoo.com",
                                            password: "password123",
                                            color: "text-slate-700",
                                        },
                                    ].map((user) => (
                                        <tr
                                            key={user.role}
                                            className="border-t border-slate-200 hover:bg-slate-50"
                                        >
                                            <td
                                                className={`py-2 pr-4 font-semibold ${user.color}`}
                                            >
                                                {user.role}
                                            </td>

                                            <td className="py-2 pr-4 font-mono">
                                                <span className="flex items-center gap-1.5">
                                                    {user.email}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                `${user.role}-email`,
                                                                user.email,
                                                                `${user.role} email`
                                                            )
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 shrink-0"
                                                    >
                                                        {copiedField === `${user.role}-email` ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Clipboard className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </span>
                                            </td>

                                            <td className="py-2 font-mono">
                                                <span className="flex items-center gap-1.5">
                                                    {user.password}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                `${user.role}-password`,
                                                                user.password,
                                                                `${user.role} password`
                                                            )
                                                        }
                                                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 shrink-0"
                                                    >
                                                        {copiedField === `${user.role}-password` ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Clipboard className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div> */}
                </section>


                <aside className="relative flex min-h-[400px] items-end justify-center overflow-hidden p-4 sm:p-8 lg:min-h-screen lg:items-center">
                    <Image src={schoolImage} alt="School background" fill className="object-cover object-center" priority />
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-slate-900/60 to-slate-900/90" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,197,253,0.25),transparent_60%)]" />
                    <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl border border-white/10 bg-slate-900/70 p-0 text-white shadow-2xl backdrop-blur-md">

                        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                            {[
                                { label: "Batch Name", value: batchInfo.batchName, highlight: true },
                                { label: "Batch Timings", value: batchInfo.timings },
                                { label: "Students Enrolled", value: batchInfo.studentsEnrolled },
                                { label: "Phone", value: batchInfo.phone },
                                { label: "Email", value: batchInfo.email },
                            ].map((item, i) => (
                                <div key={item.label}>
                                    {i > 0 && <div className="h-px bg-white/10 mb-3" />}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-white/50 uppercase tracking-wider shrink-0">{item.label}</span>
                                        <span className={`text-right text-sm min-w-0 ${item.highlight ? "font-semibold text-sky-300" : "font-medium text-white"}`}>{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div> 
                    </div>
                </aside>
            </div>
        </div >
    );
}



