"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface ExportButtonProps {
    data: Record<string, unknown>[];
    filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download size={14} /> Export Excel
        </Button>
    );
}
