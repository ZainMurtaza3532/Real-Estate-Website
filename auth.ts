import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import type { UserRole } from "@/types/next-auth";
import { Agent, setGlobalDispatcher } from "undici";

// Enforce IPv4 for all external HTTP requests in Node to prevent ETIMEDOUT on dual-stack Windows interfaces
try {
  setGlobalDispatcher(
    new Agent({
      connect: {
        family: 4,
      },
    })
  );
} catch {
  // Ignore in environments where undici is unavailable
}

import { cookies } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role as UserRole,
          phone: user.phone,
          agencyName: user.agencyName,
        };
      },
    }),
  ],
  events: {
    /**
     * Triggered immediately when a new user is created in the database via an OAuth adapter.
     * Reads the selected_role cookie to assign SELLER/AGENT role instead of default BUYER.
     */
    async createUser({ user }) {
      if (!user?.id) return;
      try {
        const cookieStore = await cookies();
        const selectedRole =
          cookieStore.get("selected_role")?.value ||
          cookieStore.get("oauth_signup_role")?.value;

        if (selectedRole === "AGENT" || selectedRole === "SELLER") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "SELLER" },
          });
        }

        try {
          cookieStore.delete("selected_role");
          cookieStore.delete("oauth_signup_role");
        } catch {
          // Cookie deletion may not be supported in all Next.js contexts
        }
      } catch (err) {
        console.error("Error setting custom OAuth role in createUser event:", err);
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      const cleanEmail = (user.email || "").toLowerCase().trim();
      const configuredAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
      const isDesignatedAdmin = !!configuredAdminEmail && cleanEmail === configuredAdminEmail;

      // 1. Strictly enforce single ADMIN_EMAIL: only this specific email can be ADMIN
      if (isDesignatedAdmin) {
        (user as { role?: UserRole }).role = "ADMIN";
        try {
          await prisma.user.updateMany({
            where: { email: cleanEmail },
            data: { role: "ADMIN", isVerified: true },
          });
        } catch (e) {
          console.error("Error setting ADMIN role in DB on signIn:", e);
        }
        return true;
      }

      // If any non-admin email claims role = 'ADMIN', revert to BUYER
      if ((user as { role?: UserRole }).role === "ADMIN") {
        (user as { role?: UserRole }).role = "BUYER";
      }

      // 2. Google OAuth Role Assignment for non-admins
      if (account?.provider === "google" && user?.email) {
        try {
          const cookieStore = await cookies();
          const selectedRole =
            cookieStore.get("selected_role")?.value ||
            cookieStore.get("oauth_signup_role")?.value;

          const existingUser = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });

          const requestedRole =
            selectedRole === "AGENT" || selectedRole === "SELLER" ? "SELLER" : "BUYER";

          if (existingUser) {
            // Upgrade existing BUYER account to SELLER if user explicitly signed up on the AGENT tab
            // (Never downgrade an existing SELLER)
            if (existingUser.role === "BUYER" && requestedRole === "SELLER") {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: "SELLER" },
              });
              existingUser.role = "SELLER";
            }
            (user as { role?: UserRole }).role = existingUser.role as UserRole;
          } else {
            // New user registration
            (user as { role?: UserRole }).role = requestedRole as UserRole;
          }

          try {
            cookieStore.delete("selected_role");
            cookieStore.delete("oauth_signup_role");
          } catch {
            // Ignore
          }
        } catch (e) {
          console.error("Error handling selected_role in signIn callback:", e);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) || "BUYER";
        token.phone = user.phone;
        token.whatsappNumber = user.whatsappNumber;
        token.agencyName = user.agencyName;
      }

      // Handle session updates (e.g., when role or profile is edited)
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.role = session.user.role;
      }

      // Always fetch fresh user from database using token.id, token.sub, or token.email
      const lookupId = (token.id as string) || (token.sub as string);
      const lookupEmail = token.email ? token.email.toLowerCase().trim() : undefined;

      // Strictly single admin check from process.env.ADMIN_EMAIL
      const configuredAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
      const isDesignatedAdmin = !!configuredAdminEmail && !!lookupEmail && lookupEmail === configuredAdminEmail;

      if (lookupId || lookupEmail) {
        try {
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                ...(lookupId ? [{ id: lookupId }] : []),
                ...(lookupEmail ? [{ email: lookupEmail }] : []),
              ],
            },
            select: {
              id: true,
              role: true,
              phone: true,
              agencyName: true,
              whatsappNumber: true,
              createdAt: true,
            },
          });

          // Single admin enforcement:
          // If this user is the designated admin, ensure role = 'ADMIN'
          if (isDesignatedAdmin && dbUser) {
            if (dbUser.role !== "ADMIN") {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: "ADMIN", isVerified: true },
                select: {
                  id: true,
                  role: true,
                  phone: true,
                  agencyName: true,
                  whatsappNumber: true,
                  createdAt: true,
                },
              });
            }
          } else if (!isDesignatedAdmin && dbUser?.role === "ADMIN") {
            // If user has ADMIN role in DB but is NOT the designated admin email, demote them!
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: "BUYER" },
              select: {
                id: true,
                role: true,
                phone: true,
                agencyName: true,
                whatsappNumber: true,
                createdAt: true,
              },
            });
          }

          // Ensure OAuth newly created or upgraded user receives fresh role in token
          if (account?.provider === "google" && dbUser && !isDesignatedAdmin) {
            try {
              const cookieStore = await cookies();
              const selectedRole =
                cookieStore.get("selected_role")?.value ||
                cookieStore.get("oauth_signup_role")?.value;

              if (
                (selectedRole === "AGENT" || selectedRole === "SELLER") &&
                dbUser.role === "BUYER"
              ) {
                dbUser = await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { role: "SELLER" },
                  select: {
                    id: true,
                    role: true,
                    phone: true,
                    agencyName: true,
                    whatsappNumber: true,
                    createdAt: true,
                  },
                });
                try {
                  cookieStore.delete("selected_role");
                  cookieStore.delete("oauth_signup_role");
                } catch {}
              }
            } catch {
              // Ignore cookie read failures in background tasks
            }
          }

          if (dbUser) {
            token.id = dbUser.id;
            token.role = isDesignatedAdmin ? "ADMIN" : (dbUser.role as UserRole) || "BUYER";
            token.phone = dbUser.phone;
            token.whatsappNumber = dbUser.whatsappNumber;
            token.agencyName = dbUser.agencyName;
          } else if (isDesignatedAdmin) {
            token.role = "ADMIN";
          }
        } catch {
          if (isDesignatedAdmin) {
            token.role = "ADMIN";
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
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
});

