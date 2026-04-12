"use client";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParents } from "@/hooks/useParents";
import { useAuth } from "@/hooks/useAuth";
import { Student, ClassRoom } from "@/types/viewModels";
import { formatDate } from "@/lib/utils";
import { GraduationCap, Phone, Mail, Calendar, MapPin, Droplet, User } from "lucide-react";

const statusVariant = (s: string) =>
    s === "active" ? "default" : s === "graduated" ? "secondary" : "destructive";

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2">
            <Icon size={14} className="mt-0.5 shrink-0 text-[--muted-foreground]" />
            <div>
                <p className="text-xs text-[--muted-foreground]">{label}</p>
                <p className="text-sm text-[--foreground]">{value}</p>
            </div>
        </div>
    );
}

function ChildCard({ student }: { student: Student }) {
    const classroom = student.classRoomId as ClassRoom | undefined;
    const classroomName = classroom?.name ?? (typeof student.classRoomId === "string" ? student.classRoomId : "—");
    const address = student.address
        ? [student.address.street, student.address.city, student.address.state].filter(Boolean).join(", ")
        : null;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={student.profileImage} alt={`${student.firstName} ${student.lastName}`} />
                        <AvatarFallback className="text-lg font-semibold bg-[--primary]/10 text-[--primary]">
                            {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base">{student.firstName} {student.lastName}</CardTitle>
                            <Badge variant={statusVariant(student.status)}>{student.status}</Badge>
                        </div>
                        {student.studentId && (
                            <p className="text-xs text-[--muted-foreground] mt-0.5">ID: {student.studentId}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow icon={GraduationCap} label="Class" value={classroomName} />
                    <InfoRow icon={Mail} label="Email" value={student.email} />
                    <InfoRow icon={Phone} label="Phone" value={student.phone} />
                    <InfoRow icon={User} label="Gender" value={student.gender} />
                    <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? formatDate(student.dateOfBirth) : null} />
                    <InfoRow icon={Calendar} label="Enrolled" value={student.enrollmentDate ? formatDate(student.enrollmentDate) : null} />
                    {address && <InfoRow icon={MapPin} label="Address" value={address} />}
                    {student.medicalInfo?.bloodGroup && (
                        <InfoRow icon={Droplet} label="Blood Group" value={student.medicalInfo.bloodGroup} />
                    )}
                </div>

                {student.emergencyContact?.name && (
                    <div className="mt-4 pt-3 border-t border-[--border]">
                        <p className="text-xs font-medium text-[--muted-foreground] mb-2">Emergency Contact</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoRow icon={User} label="Name" value={student.emergencyContact.name} />
                            <InfoRow icon={Phone} label="Phone" value={student.emergencyContact.phone} />
                            {student.emergencyContact.relationship && (
                                <InfoRow icon={User} label="Relationship" value={student.emergencyContact.relationship} />
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function MyChildrenPage() {
    const { referenceId } = useAuth();
    const { children, childrenLoading, fetchChildren } = useParents({}, false);

    useEffect(() => {
        if (!referenceId) return;
        fetchChildren(referenceId);
    }, [referenceId, fetchChildren]);

    return (
        <>
            <Header title="My Children" />
            <main className="p-5 space-y-4">
                <h2 className="text-base font-semibold text-[--foreground]">
                    {childrenLoading ? "Loading…" : `${children.length} Child${children.length !== 1 ? "ren" : ""} Registered`}
                </h2>
                {childrenLoading ? (
                    <div className="card p-10 text-center text-[--muted-foreground] text-sm">Loading…</div>
                ) : children.length === 0 ? (
                    <div className="card p-10 text-center text-[--muted-foreground] text-sm">No children found.</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {children.map((child) => (
                            <ChildCard key={child._id} student={child} />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
