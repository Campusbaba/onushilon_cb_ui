import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string;
    referenceId: string;
    accessToken: string;
    profile: any;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      referenceId: string;
      accessToken: string;
      profile: any;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    referenceId: string;
    accessToken: string;
    profile: any;
  }
}
