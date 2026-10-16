"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, PlusCircle, Compass } from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();

  const links = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Property Inventory",
      href: "/dashboard/properties",
      icon: Building2,
      active: pathname === "/dashboard/properties",
    },
    {
      label: "Add New Property",
      href: "/dashboard/properties/new",
      icon: PlusCircle,
      active: pathname === "/dashboard/properties/new",
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-zinc-200 pb-4 overflow-x-auto">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
              link.active
                ? "bg-black text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:text-zinc-950 hover:bg-zinc-50"
            }`}
          >
            <Icon className="size-3.5" />
            <span>{link.label}</span>
          </Link>
        );
      })}

      <div className="ml-auto hidden sm:flex items-center gap-2">
        <Link
          href="/properties"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 transition"
        >
          <Compass className="size-3.5" />
          <span>View Public Site</span>
        </Link>
      </div>
    </div>
  );
}
