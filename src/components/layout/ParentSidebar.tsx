"use client";
import { LayoutDashboard, Users, CreditCard, CalendarCheck, Clock, FilePen, ClipboardCheck, BookOpen } from "lucide-react";
import { AppSidebar } from "./Sidebar";

export function ParentSidebar() {
    return (
        <AppSidebar
            role="parent"
            navItems={[
                { label: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
                { label: "My Children", href: "/parent/children", icon: Users },
                { label: "Payments", href: "/parent/payments", icon: CreditCard },
                {
                    label: "Academics",
                    icon: BookOpen,
                    items: [
                        { label: "My Routines", href: "/parent/routines", icon: Clock },
                        { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
                    ],
                },
                {
                    label: "Exams",
                    icon: FilePen,
                    items: [
                        { label: "Exams", href: "/parent/exams", icon: FilePen },
                        { label: "Exam Marks", href: "/parent/exams/marks", icon: ClipboardCheck },
                    ],
                },
            ]}
        />
    );
}
