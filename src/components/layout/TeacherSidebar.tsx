"use client";
import { LayoutDashboard, Clock, CalendarCheck, FilePen, Users, ClipboardCheck, Bell } from "lucide-react";
import { AppSidebar } from "./Sidebar";

export function TeacherSidebar() {
    return (
        <AppSidebar
            role="teacher"
            navItems={[
                { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
                {
                    label: "Academics",
                    icon: Users,
                    items: [
                        { label: "My Routines", href: "/teacher/routines", icon: Clock },
                        { label: "Attendance", href: "/teacher/attendance", icon: CalendarCheck },
                    ],
                },
                {
                    label: "Exams",
                    icon: FilePen,
                    items: [
                        { label: "Exams", href: "/teacher/exams", icon: FilePen },
                        { label: "Exam Marks", href: "/teacher/exams/marks", icon: ClipboardCheck },
                    ],
                },
                { label: "Notices", href: "/teacher/notices", icon: Bell },
            ]}
        />
    );
}
