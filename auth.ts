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
  callbacks: {
    async jwt({ token, user, trigger, session }) {
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

      // Always sync fresh role and contact details from DB so promotions to ADMIN take effect immediately
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true, phone: true, agencyName: true, whatsappNumber: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role as UserRole;
            token.phone = dbUser.phone;
            token.whatsappNumber = dbUser.whatsappNumber;
            token.agencyName = dbUser.agencyName;
          }
        } catch {
          // Fall back to existing token values if DB is unreachable
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
