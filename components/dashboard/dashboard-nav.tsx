"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  PlusCircle,
  Compass,
} from "lucide-react";

interface DashboardNavProps {
  propertiesCount?: number;
  unreadLeadsCount?: number;
}

export function DashboardNav({
  propertiesCount = 0,
  unreadLeadsCount = 0,
}: DashboardNavProps) {
  const pathname = usePathname();

  const links = [
    {
      label: "Agent Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      badge: null,
    },
    {
      label: "Inventory & Sales",
      href: "/dashboard/properties",
      icon: Building2,
      active: pathname === "/dashboard/properties",
      badge: propertiesCount > 0 ? propertiesCount : null,
      badgeColor: "bg-zinc-100 text-zinc-800",
    },
    {
      label: "Leads & Inquiries",
      href: "/dashboard/inquiries",
      icon: MessageSquare,
      active: pathname === "/dashboard/inquiries",
      badge: unreadLeadsCount > 0 ? unreadLeadsCount : null,
      badgeColor: "bg-emerald-600 text-white",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                link.active
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:text-zinc-950 hover:bg-zinc-50"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{link.label}</span>

              {link.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    link.badgeColor || (link.active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-800")
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition shadow-xs"
        >
          <PlusCircle className="size-3.5" />
          <span>List New Property</span>
        </Link>

        <Link
          href="/properties"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 transition"
        >
          <Compass className="size-3.5 text-zinc-500" />
          <span>Live Site</span>
        </Link>
      </div>
    </div>
  );
}
