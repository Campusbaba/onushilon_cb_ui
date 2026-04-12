"use client";

import { useRouter } from "next/navigation";
import { TrendingDown, DollarSign, Users, BarChart3, ArrowRight } from "lucide-react";

const reportCards = [
    {
        title: "Profit / Expense Report",
        description: "Compare total income vs expenses, net profit trends over months.",
        icon: TrendingDown,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        href: "/admin/reports/profit-expense",
    },
    {
        title: "Income Report",
        description: "Breakdown of all income sources: tuition, exams, library and more.",
        icon: DollarSign,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        href: "/admin/reports/income",
    },
    {
        title: "Student Enrollment Report",
        description: "Monthly and yearly enrollment trends by class and gender.",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        href: "/admin/reports/enrollment",
    },
    {
        title: "Business Projection",
        description: "Forecast future revenue, expenses and growth based on historical data.",
        icon: BarChart3,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        href: "/admin/reports/projection",
    },
];

export default function ReportsPage() {
    const router = useRouter();
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[--foreground]">Reports</h1>
                <p className="text-sm text-[--muted-foreground] mt-1">
                    View analytics, download Excel exports and track school performance.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {reportCards.map(card => (
                    <button
                        key={card.href}
                        onClick={() => router.push(card.href)}
                        className="card p-5 text-left hover:border-[--primary]/40 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                    >
                        <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${card.bg} mb-4`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <h3 className="font-semibold text-[--foreground] text-sm mb-1">{card.title}</h3>
                        <p className="text-xs text-[--muted-foreground] leading-relaxed">{card.description}</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[--primary] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Report <ArrowRight size={12} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
