interface ReportStatCardProps {
    title: string;
    value: string;
    sub?: string;
    color?: string;
}

export function ReportStatCard({ title, value, sub, color = "text-[--foreground]" }: ReportStatCardProps) {
    return (
        <div className="card p-4">
            <p className="text-xs text-[--muted-foreground] mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-[--muted-foreground] mt-1">{sub}</p>}
        </div>
    );
}
