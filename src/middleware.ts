import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/** Map each role to its home dashboard */
const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  employee: "/admin/dashboard", // employees share the admin area
};

/** Which URL prefix each role is allowed to visit */
const ROLE_PREFIX: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  employee: "/admin",
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = (req.nextauth.token?.role as string) ?? "";
    const home = ROLE_HOME[role] ?? "/login";
    const allowed = ROLE_PREFIX[role];

    // Redirect root → role dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL(home, req.url));
    }

    // Redirect /login when already authenticated → role dashboard
    if (pathname === "/login") {
      return NextResponse.redirect(new URL(home, req.url));
    }

    // Block access to another role's section → send to own dashboard
    if (allowed && !pathname.startsWith(allowed)) {
      return NextResponse.redirect(new URL(home, req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      // Let withAuth know which routes need to be protected
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - /login, /register/* (public)
     * - _next static files, api routes, favicon
     */
    "/((?!login|register|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
