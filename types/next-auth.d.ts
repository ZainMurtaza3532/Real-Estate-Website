import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

export type UserRole = "BUYER" | "AGENT" | "ADMIN";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    phone?: string | null;
    agencyName?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone?: string | null;
      agencyName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    phone?: string | null;
    agencyName?: string | null;
  }
}
