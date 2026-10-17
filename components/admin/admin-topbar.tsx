"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
  Compass,
  Bell,
  LogOut,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  pendingCount?: number;
}

export function AdminTopbar({ user, pendingCount = 0 }: AdminTopbarProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-zinc-200/90 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open Admin Menu"
            className="md:hidden p-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition"
          >
            <Menu className="size-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-600">
              Super Admin Gateway
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {pendingCount > 0 && (
            <Link
              href="/admin/properties/pending"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition"
            >
              <Bell className="size-3.5 text-amber-600 animate-bounce" />
              <span>{pendingCount} Pending Approval</span>
            </Link>
          )}

          <Link
            href="/properties"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-950 transition"
          >
            <Compass className="size-3.5 text-zinc-500" />
            <span>Public Site</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign Out"
            className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition"
            title="Sign Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-zinc-950 shadow-2xl z-10">
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900"
            >
              <X className="size-5" />
            </button>
            <div onClick={() => setMobileDrawerOpen(false)}>
              <AdminSidebar pendingCount={pendingCount} user={user} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
