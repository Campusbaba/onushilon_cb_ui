import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <TeacherSidebar />
            <SidebarInset className="flex flex-col min-w-0 bg-[--background]">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
