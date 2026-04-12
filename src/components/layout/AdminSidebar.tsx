"use client";
import { AppSidebar } from "./Sidebar";
import {
    LayoutDashboard, Users, GraduationCap, Briefcase, UserCheck,
    BookOpen, Building2, DoorOpen, CalendarCheck, Clock, FilePen,
    CreditCard, Wallet, Bell, BarChart3, TrendingDown, DollarSign, TrendingUp, ClipboardCheck,
} from "lucide-react";

export function AdminSidebar() {
    return (
        <AppSidebar
            role="admin"
            navItems={[
                { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
                {
                    label: "Users",
                    icon: Users,
                    items: [
                        { label: "Students", href: "/admin/students", icon: GraduationCap },
                        { label: "Teachers", href: "/admin/teachers", icon: UserCheck },
                        { label: "Employees", href: "/admin/employees", icon: Briefcase },
                        { label: "Parents", href: "/admin/parents", icon: Users },
                    ],
                },
                {
                    label: "Academics",
                    icon: BookOpen,
                    items: [
                        { label: "Departments", href: "/admin/departments", icon: Building2 },
                        { label: "Courses", href: "/admin/courses", icon: BookOpen },
                        { label: "Class Rooms", href: "/admin/classrooms", icon: DoorOpen },
                        { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
                        { label: "Routines", href: "/admin/routines", icon: Clock },
                    ],
                },
                {
                    label: "Exam Management",
                    icon: FilePen,
                    items: [
                        { label: "Exams", href: "/admin/exams", icon: FilePen },
                        { label: "Exam Marks", href: "/admin/exams/marks", icon: ClipboardCheck },
                    ],
                },
                {
                    label: "Payment Management",
                    icon: CreditCard,
                    items: [
                        { label: "Payments", href: "/admin/payments", icon: CreditCard },
                    ],
                },
                {
                    label: "Expense Management",
                    icon: Wallet,
                    items: [
                        { label: "Expenses", href: "/admin/expenses", icon: Wallet },
                    ],
                },
                {
                    label: "Notice Management",
                    icon: Bell,
                    items: [
                        { label: "Notices", href: "/admin/notices", icon: Bell },
                    ],
                },
                {
                    label: "Reports",
                    icon: BarChart3,
                    items: [
                        { label: "Profit / Expense", href: "/admin/reports/profit-expense", icon: TrendingDown },
                        { label: "Income", href: "/admin/reports/income", icon: DollarSign },
                        { label: "Enrollment", href: "/admin/reports/enrollment", icon: Users },
                        { label: "Projection", href: "/admin/reports/projection", icon: TrendingUp },
                    ],
                },
            ]}
        />
    );
}
