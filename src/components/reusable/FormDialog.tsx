"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface FormDialogProps {
    open: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
}

export function FormDialog({
    open,
    onClose,
    title,
    children,
    className,
}: FormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className={`flex flex-col max-h-[90vh] p-0 gap-0 ${className ?? ""}`}>
                {/* Sticky header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-4">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}