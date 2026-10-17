import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  DollarSign,
  Building2,
  ShieldAlert,
  Users,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Super Admin Command Center - PrebuiltUI Estate",
  description: "Executive platform analytics, inventory metrics, moderation queue, and user governance.",
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Parallel DB queries
  const [
    valuationAgg,
    activeListingsCount,
    pendingReviewsCount,
    totalPropertiesCount,
    sellersCount,
    buyersCount,
    totalInquiriesCount,
    recentProperties,
    recentInquiries,
  ] = await Promise.all([
    prisma.property.aggregate({
      _sum: { price: true },
      _avg: { price: true },
    }),
    prisma.property.count({ where: { listingStatus: "APPROVED" } }),
    prisma.property.count({ where: { listingStatus: "PENDING_APPROVAL" } }),
    prisma.property.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.inquiry.count(),
    prisma.property.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            name: true,
            email: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.inquiry.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            title: true,
            slug: true,
            city: true,
            price: true,
          },
        },
      },
    }),
  ]);

  const totalPlatformValue = valuationAgg._sum.price || 0;
  const formattedPlatformValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(totalPlatformValue);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-semibold">
              Super Admin Gateway
            </span>
            <span className="text-xs text-zinc-500 font-medium">Real-time Platform Intelligence</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Executive Analytics Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Holistic metrics across luxury portfolio inventory, pending seller approvals, and client inquiries.
          </p>
        </div>

        {pendingReviewsCount > 0 && (
          <Link
            href="/admin/properties/pending"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-xs"
          >
            <ShieldAlert className="size-4 animate-pulse" />
            <span>Review {pendingReviewsCount} Pending Submissions &rarr;</span>
          </Link>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Platform Value */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total Platform Value
            </span>
            <div className="p-2.5 rounded-2xl bg-zinc-100 text-zinc-900">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <div className="font-heading text-3xl font-extrabold text-zinc-950">
            {formattedPlatformValue}
          </div>
          <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-emerald-600" />
            <span>Aggregate valuation across all listings</span>
          </p>
        </div>

        {/* Active Listings */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Active Listings
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Building2 className="size-4.5" />
            </div>
          </div>
          <div className="font-heading text-3xl font-extrabold text-zinc-950">
            {activeListingsCount}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Published and verified on the public catalogue
          </p>
        </div>

        {/* Pending Reviews */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Pending Reviews
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100">
              <ShieldAlert className="size-4.5" />
            </div>
          </div>
          <div className="font-heading text-3xl font-extrabold text-zinc-950">
            {pendingReviewsCount}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {pendingReviewsCount > 0 ? (
              <span className="text-amber-700 font-semibold">Requires immediate review</span>
            ) : (
              <span className="text-emerald-700 font-medium">All submissions clear</span>
            )}
          </p>
        </div>

        {/* Total Registered Sellers & Buyers */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Sellers & Buyers
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
              <Users className="size-4.5" />
            </div>
          </div>
          <div className="font-heading text-3xl font-extrabold text-zinc-950">
            {sellersCount + buyersCount}
          </div>
          <p className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
            <span className="font-semibold text-zinc-900">{sellersCount} Sellers</span>
            <span>•</span>
            <span className="font-semibold text-zinc-900">{buyersCount} Buyers</span>
          </p>
        </div>
      </div>

      {/* Recent Activity Sections (2-column grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Property Submissions */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-zinc-950">
                Recent Property Submissions
              </h3>
              <p className="text-xs text-zinc-500">Latest luxury residences curated into portfolio</p>
            </div>
            <Link
              href="/admin/properties"
              className="text-xs font-semibold text-zinc-700 hover:text-black hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentProperties.map((prop) => {
              const cover = prop.images && prop.images.length > 0 ? prop.images[0] : "/assets/house.png";
              return (
                <div key={prop.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                      <Image src={cover} alt={prop.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/properties/${prop.slug}`}
                        target="_blank"
                        className="font-semibold text-zinc-950 text-xs hover:underline truncate block"
                      >
                        {prop.title}
                      </Link>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{prop.city}</span>
                        <span>•</span>
                        <span className="font-medium text-zinc-800">
                          ${(prop.price / 1000000).toFixed(1)}M
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        prop.listingStatus === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : prop.listingStatus === "PENDING_APPROVAL"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-zinc-100 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      {prop.listingStatus === "PENDING_APPROVAL" ? "PENDING" : prop.listingStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Client Tour Inquiries */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-zinc-950">
                Recent VIP Inquiries
              </h3>
              <p className="text-xs text-zinc-500">Client showing requests & direct submissions</p>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs font-semibold text-zinc-700 hover:text-black hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentInquiries.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">No client inquiries received yet.</p>
            ) : (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-950 text-xs">
                      {inq.buyerName}{" "}
                      <span className="text-[11px] font-normal text-zinc-500">({inq.buyerEmail})</span>
                    </p>
                    <p className="text-[11px] text-zinc-600 truncate mt-0.5 font-medium">
                      Interested in: {inq.property.title} ({inq.property.city})
                    </p>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 italic">
                      &ldquo;{inq.message}&rdquo;
                    </p>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 shrink-0">
                    {inq.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
