"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Payment, Student, Course } from "@/types/viewModels";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Printer, Download, Share2, X } from "lucide-react";
import logo from "../../../public/logos/onushilon-logo.png";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    payment: Payment | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStudent(p: Payment): Student | null {
    return typeof p.studentId === "object" ? (p.studentId as Student) : null;
}
function getCourse(p: Payment): Course | null {
    return typeof p.courseId === "object" ? (p.courseId as Course) : null;
}
function statusColor(s: string) {
    switch (s) {
        case "paid": return "bg-emerald-100 text-emerald-700";
        case "pending": return "bg-yellow-100 text-yellow-700";
        case "overdue": return "bg-red-100 text-red-700";
        case "cancelled": return "bg-gray-100 text-gray-500";
        default: return "bg-gray-100 text-gray-500";
    }
}
function invoiceNumber(payment: Payment): string {
    return `INV-${payment._id.slice(-8).toUpperCase()}`;
}

// ─── Invoice Layout (also used for print/pdf) ─────────────────────────────────
function InvoiceLayout({ payment }: { payment: Payment }) {
    const student = getStudent(payment);
    const course = getCourse(payment);
    const inv = invoiceNumber(payment);

    return (
        <div id="invoice-content" className="bg-white text-gray-900 font-sans">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="mb-1">
                    <Image
                        src={logo}
                        alt="Onushilon logo"
                        width={200}
                        height={60}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">INVOICE</p>
                    <p className="text-sm font-semibold text-gray-600 mt-1">{inv}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusColor(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6" />

            {/* Bill To / Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Student info</p>
                    {student ? (
                        <>
                            <p className="text-base font-bold text-gray-900">{student.firstName} {student.lastName}</p>
                            {student.studentId && <p className="text-sm text-gray-500">ID: {student.studentId}</p>}
                            <p className="text-sm text-gray-500">{student.email}</p>
                            {student.phone && <p className="text-sm text-gray-500">{student.phone}</p>}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">{String(payment.studentId)}</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Invoice Details</p>
                    <table className="ml-auto text-sm">
                        <tbody>
                            <tr>
                                <td className="text-gray-500 pr-4 py-0.5">Issue Date</td>
                                <td className="font-medium text-gray-800">{formatDate(payment.createdAt)}</td>
                            </tr>
                            <tr>
                                <td className="text-gray-500 pr-4 py-0.5">Due Date</td>
                                <td className="font-medium text-gray-800">{formatDate(payment.dueDate)}</td>
                            </tr>
                            {payment.paidDate && (
                                <tr>
                                    <td className="text-gray-500 pr-4 py-0.5">Paid Date</td>
                                    <td className="font-medium text-emerald-600">{formatDate(payment.paidDate)}</td>
                                </tr>
                            )}
                            <tr>
                                <td className="text-gray-500 pr-4 py-0.5">Academic Year</td>
                                <td className="font-medium text-gray-800">{payment.academicYear}</td>
                            </tr>
                            <tr>
                                <td className="text-gray-500 pr-4 py-0.5">Semester</td>
                                <td className="font-medium text-gray-800">{payment.semester}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-900 text-white">
                            <th className="text-left px-4 py-3 rounded-tl-lg font-semibold">Description</th>
                            <th className="text-left px-4 py-3 font-semibold">Course</th>
                            <th className="text-left px-4 py-3 font-semibold">Method</th>
                            {payment.transactionId && (
                                <th className="text-left px-4 py-3 font-semibold">Txn ID</th>
                            )}
                            <th className="text-right px-4 py-3 rounded-tr-lg font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="px-4 py-4">
                                <p className="font-medium capitalize">{payment.paymentType} Fee</p>
                                <p className="text-xs text-gray-400 mt-0.5">Payment for {payment.semester}</p>
                            </td>
                            <td className="px-4 py-4 text-gray-600">
                                {course ? (
                                    <>
                                        <p className="font-medium">{course.name}</p>
                                        <p className="text-xs text-gray-400">{course.code}</p>
                                    </>
                                ) : "—"}
                            </td>
                            <td className="px-4 py-4 text-gray-600 capitalize">
                                {payment.paymentMethod ?? "—"}
                            </td>
                            {payment.transactionId && (
                                <td className="px-4 py-4 text-gray-500 text-xs font-mono">
                                    {payment.transactionId}
                                </td>
                            )}
                            <td className="px-4 py-4 text-right font-semibold">
                                {formatCurrency(payment.amount)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-8">
                <div className="w-64">
                    <div className="flex justify-between py-2 text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-500">
                        <span>Tax / Discount</span>
                        <span>—</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-3 flex justify-between text-base font-bold text-gray-900">
                        <span>Total</span>
                        <span>{formatCurrency(payment.amount)}</span>
                    </div>
                    {payment.paymentStatus === "paid" && (
                        <div className="mt-3 text-center py-2 bg-emerald-50 rounded-lg">
                            <span className="text-emerald-600 font-semibold text-sm">✓ Payment Received</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Remarks */}
            {payment.remarks && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Remarks</p>
                    <p className="text-sm text-gray-600">{payment.remarks}</p>
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
                <p className="text-xs text-gray-400">Powered by <a href="https://campusbaba.com" className="text-[--primary] hover:underline" target="_blank" rel="noopener noreferrer">campusbaba.com</a></p>
                <p className="text-xs text-gray-400">Invoice {inv}</p>
            </div>
        </div>
    );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────
export function InvoiceDialog({ open, onClose, payment }: InvoiceDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!payment) return null;
    const p: Payment = payment; // narrowed non-null reference for closures
    const student = getStudent(p);
    const inv = invoiceNumber(p);

    // ── Print ─────────────────────────────────────────────────────────────────
    function handlePrint() {
        const el = document.getElementById("invoice-content");
        if (!el) return;
        const original = document.body.innerHTML;
        const style = `
            <style>
                @page { margin: 20mm; }
                body { font-family: sans-serif; color: #111; background: white; }
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            </style>
        `;
        document.body.innerHTML = style + el.outerHTML;
        window.print();
        document.body.innerHTML = original;
        window.location.reload();
    }

    // ── PDF Download ──────────────────────────────────────────────────────────
    async function handleDownload() {
        const el = printRef.current;
        if (!el) return;

        const imgData = await toPng(el, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
        });

        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        img.src = imgData;

        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx?.drawImage(img, 0, 0);
                resolve();
            };
            img.onerror = () => reject(new Error("Failed to load invoice image for PDF export"));
        });

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0 - 5, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0 - 5, position, imgWidth, imgHeight, undefined, "FAST");
            heightLeft -= pageHeight;
        }

        pdf.save(`${inv}.pdf`);
    }

    // ── WhatsApp Share ────────────────────────────────────────────────────────
    function handleWhatsApp() {
        const course = getCourse(p);
        const lines = [
            `📄 *PAYMENT INVOICE — ${inv}*`,
            ``,
            `👤 *Student:* ${student ? `${student.firstName} ${student.lastName}` : String(p.studentId)}`,
            student?.studentId ? `🆔 *Student ID:* ${student.studentId}` : "",
            `📚 *Course:* ${course ? `${course.name} (${course.code})` : String(p.courseId)}`,
            `💳 *Fee Type:* ${p.paymentType.charAt(0).toUpperCase() + p.paymentType.slice(1)}`,
            `💰 *Amount:* ${formatCurrency(p.amount)}`,
            `📅 *Due Date:* ${formatDate(p.dueDate)}`,
            p.paidDate ? `✅ *Paid Date:* ${formatDate(p.paidDate)}` : "",
            `🏫 *Academic Year:* ${p.academicYear} | ${p.semester}`,
            `📌 *Status:* ${p.paymentStatus.toUpperCase()}`,
            p.transactionId ? `🔖 *Transaction ID:* ${p.transactionId}` : "",
            p.remarks ? `📝 *Remarks:* ${p.remarks}` : "",
            ``,
            `_Powered by Campusbaba (campusbaba.com)_`,
        ].filter(Boolean).join("\n");

        const url = `https://wa.me/?text=${encodeURIComponent(lines)}`;
        window.open(url, "_blank");
    }

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex flex-col"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    {/* Scrim */}
                    <div className="absolute inset-0 bg-black/50" onClick={onClose} />

                    {/* Panel */}
                    <div className="relative z-10 m-auto flex flex-col rounded-xl shadow-2xl overflow-hidden bg-white"
                        style={{ width: 720, maxWidth: "95vw", maxHeight: "92vh" }}
                    >
                        {/* Toolbar */}
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 shrink-0">
                            <p className="font-semibold text-sm text-gray-700">{inv}</p>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
                                    <Printer size={14} /> Print
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5">
                                    <Download size={14} /> Download PDF
                                </Button>
                                <Button size="sm" className="gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white" onClick={handleWhatsApp}>
                                    <Share2 size={14} /> WhatsApp
                                </Button>
                                <Button size="icon" variant="ghost" onClick={onClose}><X size={16} /></Button>
                            </div>
                        </div>

                        {/* Invoice Preview */}
                        <div className="overflow-y-auto flex-1 p-6 bg-gray-100">
                            <div
                                ref={printRef}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 mx-auto"
                                style={{ maxWidth: 640 }}
                            >
                                <InvoiceLayout payment={payment} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
