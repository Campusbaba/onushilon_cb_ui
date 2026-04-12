"use client";
import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function CustomToast(props: ToasterProps) {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            toastOptions={{
                classNames: {
                    toast: "rounded-lg border shadow-md text-sm font-medium px-4 py-3 flex items-center gap-3",
                    success: "bg-white text-gray-800 border-gray-200",
                    info: "bg-white text-gray-800 border-gray-200",
                    warning: "bg-white text-amber-700 border-amber-200",
                    error: "!bg-red-600 !text-white !border-red-700",
                    loading: "bg-white text-gray-800 border-gray-200",
                    icon: "shrink-0",
                },
            }}
            style={
                {
                    "--border-radius": "var(--radius)",
                } as React.CSSProperties
            }
            {...props}
        />
    );
}
