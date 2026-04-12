"use client";
import { LayoutDashboard, CreditCard, CalendarCheck, Clock, FilePen, ClipboardCheck, BookOpen } from "lucide-react";
import { AppSidebar } from "./Sidebar";

export function StudentSidebar() {
    return (
        <AppSidebar
            role="student"
            navItems={[
                { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
                { label: "Payments", href: "/student/payments", icon: CreditCard },
                {
                    label: "Academics",
                    icon: BookOpen,
                    items: [
                        { label: "My Routines", href: "/student/routines", icon: Clock },
                        { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
                    ],
                },
                {
                    label: "Exams",
                    icon: FilePen,
                    items: [
                        { label: "Exam Schedule", href: "/student/exams", icon: FilePen },
                        { label: "Exam Marks", href: "/student/exams/marks", icon: ClipboardCheck },
                    ],
                },
            ]}
        />
    );
}
