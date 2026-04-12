import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  employee: "/admin/dashboard",
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "";
  redirect(ROLE_HOME[role] ?? "/login");
}
