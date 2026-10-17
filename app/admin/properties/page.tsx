import React from "react";
import { prisma } from "@/lib/prisma";
import { AllPropertiesManager, AdminPropertyItem } from "@/components/admin/all-properties-manager";
import Link from "next/link";
import { Building2, Plus, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "All Properties Portfolio - Super Admin",
  description: "Comprehensive catalogue management, featured selections, and status curation.",
};

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          agencyName: true,
          isVerified: true,
        },
      },
      _count: {
        select: {
          inquiries: true,
          favorites: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = properties.filter((p) => p.listingStatus === "PENDING_APPROVAL").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-semibold">
              Global Inventory
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {properties.length} Total Platform Listings
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            All Properties Manager
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Search, curate featured homepage residences, update statuses, or permanently retire listings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingCount > 0 && (
            <Link
              href="/admin/properties/pending"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition"
            >
              <ShieldAlert className="size-3.5 text-amber-600" />
              <span>{pendingCount} Pending Review</span>
            </Link>
          )}

          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>List New Residence</span>
          </Link>
        </div>
      </div>

      {/* Manager Table */}
      <AllPropertiesManager initialProperties={properties as unknown as AdminPropertyItem[]} />
    </div>
  );
}
