"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    accessToken: session?.user?.accessToken,
    role: session?.user?.role,
    referenceId: session?.user?.referenceId,
  };
}
