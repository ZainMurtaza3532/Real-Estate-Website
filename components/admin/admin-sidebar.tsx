"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Building2,
  Users,
  MessageSquare,
  Compass,
  ChevronRight,
  Sparkles,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

interface AdminSidebarProps {
  pendingCount?: number;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function AdminSidebar({ pendingCount = 0, user }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
      badge: null,
    },
    {
      title: "Moderation Queue",
      href: "/admin/properties/pending",
      icon: ShieldAlert,
      active: pathname.startsWith("/admin/properties/pending"),
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      title: "All Listings",
      href: "/admin/properties",
      icon: Building2,
      active: pathname === "/admin/properties",
      badge: null,
    },
    {
      title: "Analytics & Activity",
      href: "/admin/analytics",
      icon: TrendingUp,
      active: pathname.startsWith("/admin/analytics"),
      badge: "PRO",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      title: "Users & Sellers",
      href: "/admin/users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
      badge: null,
    },
    {
      title: "Leads & Inquiries",
      href: "/admin/inquiries",
      icon: MessageSquare,
      active: pathname.startsWith("/admin/inquiries"),
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-100 h-screen sticky top-0 flex flex-col shrink-0 border-r border-zinc-800 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80">
        <Link href="/admin" className="flex items-center justify-between group">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="estate logo"
              width={100}
              height={30}
              className="h-7 w-auto object-contain select-none"
              priority
            />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin
            </span>
          </div>
        </Link>
        <p className="text-[11px] text-zinc-400 font-medium mt-1 pl-0.5">Control Center</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                item.active
                  ? "bg-white text-zinc-950 shadow-sm font-bold"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`size-4 transition-colors ${
                    item.active ? "text-zinc-950" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />
                <span>{item.title}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                    item.badgeColor || "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Public Marketplace
        </div>

        <Link
          href="/properties"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-3">
            <Compass className="size-4 text-zinc-400" />
            <span>Live Portfolio</span>
          </div>
          <ExternalLink className="size-3 text-zinc-400" />
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="size-4 text-zinc-400" />
            <span>Agent Desk View</span>
          </div>
          <ChevronRight className="size-3 text-zinc-400" />
        </Link>
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="size-8 rounded-full bg-linear-to-tr from-amber-500 to-amber-300 text-zinc-950 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {user.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user.name || "Administrator"}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
