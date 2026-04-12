import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  employee: "/admin/dashboard",
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/login`,
            {
              method: "POST",
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              headers: { "Content-Type": "application/json" },
            },
          );

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.message || "Invalid credentials");
          }

          return {
            id: data.data.user.id,
            email: data.data.user.email,
            role: data.data.user.role,
            referenceId: data.data.user.referenceId,
            name: `${data.data.user.profile.firstName} ${data.data.user.profile.lastName}`,
            image: data.data.user.profile.profileImage,
            accessToken: data.data.token,
            profile: data.data.user.profile,
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.referenceId = user.referenceId;
        token.accessToken = user.accessToken;
        token.profile = user.profile;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.referenceId = token.referenceId as string;
        session.user.accessToken = token.accessToken as string;
        session.user.profile = token.profile as any;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }: any) {
      // After sign-in, send user straight to their role dashboard
      const role = token?.role as string | undefined;
      if (role && ROLE_HOME[role]) {
        return `${baseUrl}${ROLE_HOME[role]}`;
      }
      // Honor explicit callback URLs that are on the same origin
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
