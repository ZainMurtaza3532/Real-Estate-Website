import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn, Compass } from "lucide-react";
import { auth } from "@/auth";

export const metadata = {
  title: "Access Restricted | 403 Forbidden - HavenStone Estates",
  description: "Administrator privileges are required to view this area.",
};

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function UnauthorizedPage() {
  const session = await auth();

  // If user is actually an ADMIN in DB, redirect them directly to /admin!
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (dbUser?.role === "ADMIN") {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
        <div className="size-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="size-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/70 inline-block">
            403 • Authorization Required
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Executive Access Only
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
            The Super Admin control center is strictly restricted to verified system administrators.
            {session?.user && (
              <span className="block mt-2 font-medium text-zinc-700">
                Logged in as <span className="underline">{session.user.email}</span> (
                {session.user.role || "BUYER"})
              </span>
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/login?callbackUrl=/admin"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
          >
            <LogIn className="size-4" />
            <span>Sign In with Admin Account</span>
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold hover:bg-zinc-200 transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Public Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
