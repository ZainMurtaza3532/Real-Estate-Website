import React from "react";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Users, ShieldCheck, Mail, Phone, Building2, Calendar } from "lucide-react";

export const metadata = {
  title: "Users & Sellers Management - Super Admin",
  description: "Curate verified seller accounts, review registered buyers, and manage platform roles.",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          properties: true,
          inquiries: true,
          favorites: true,
        },
      },
    },
  });

  const sellers = users.filter((u) => u.role === "SELLER");
  const buyers = users.filter((u) => u.role === "BUYER");
  const admins = users.filter((u) => u.role === "ADMIN");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-semibold">
              Platform Registry
            </span>
            <span className="text-xs text-zinc-500 font-medium">{users.length} Total Registered Accounts</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Users & Sellers Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Oversee active brokers, verified private sellers, high-net-worth buyers, and system admins.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-semibold">
            {admins.length} Admins
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
            {sellers.length} Sellers
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
            {buyers.length} Buyers
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">User</th>
              <th className="py-4 px-5">Role</th>
              <th className="py-4 px-5">Contact Details</th>
              <th className="py-4 px-5">Agency / Brokerage</th>
              <th className="py-4 px-5">Activity</th>
              <th className="py-4 px-5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u) => {
              const joined = new Date(u.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr key={u.id} className="hover:bg-zinc-50/70 transition-colors">
                  {/* Avatar & Name */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name ? u.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-950 text-xs flex items-center gap-1">
                          <span>{u.name || "Member"}</span>
                          {u.isVerified && <ShieldCheck className="size-3.5 text-emerald-600" />}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === "ADMIN"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : u.role === "SELLER"
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-5 text-zinc-600 whitespace-nowrap">
                    <p className="text-[11px]">{u.phone || "No phone listed"}</p>
                    {u.whatsappNumber && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        WA: {u.whatsappNumber}
                      </p>
                    )}
                  </td>

                  {/* Agency */}
                  <td className="py-4 px-5 text-zinc-600">
                    <p className="text-xs font-medium text-zinc-900">
                      {u.agencyName || "Independent"}
                    </p>
                  </td>

                  {/* Activity Counts */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                      <span className="font-semibold text-zinc-900">{u._count.properties}</span> Listings
                      <span>•</span>
                      <span className="font-semibold text-zinc-900">{u._count.inquiries}</span> Leads
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-5 text-zinc-500 whitespace-nowrap text-[11px]">
                    {joined}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
