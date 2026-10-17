import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types/next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [], // Configured with Node dependencies in auth.ts
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role || "BUYER";
        token.phone = (user as { phone?: string | null }).phone;
        token.whatsappNumber = (user as { whatsappNumber?: string | null }).whatsappNumber;
        token.agencyName = (user as { agencyName?: string | null }).agencyName;
      }

      // Handle session updates (e.g., when role or profile is edited)
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.role = session.user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as UserRole) || "BUYER";
        session.user.phone = token.phone as string | null | undefined;
        session.user.whatsappNumber = token.whatsappNumber as string | null | undefined;
        session.user.agencyName = token.agencyName as string | null | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
