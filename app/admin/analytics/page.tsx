import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Flame,
  Award,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Platform Analytics & Activity Log - HavenStone Estates Super Admin",
  description: "Executive platform analytics, monthly inventory growth, inquiries funnel, and property leaderboard.",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  // Query all properties, inquiries, and users for analytics computation
  const [properties, inquiries, usersCount, totalViewsAgg] = await Promise.all([
    prisma.property.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        city: true,
        listingType: true,
        listingStatus: true,
        propertyType: true,
        viewsCount: true,
        images: true,
        createdAt: true,
        seller: {
          select: {
            name: true,
            agencyName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({
      select: {
        id: true,
        buyerName: true,
        buyerEmail: true,
        status: true,
        createdAt: true,
        tourDate: true,
        property: {
          select: {
            title: true,
            slug: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.property.aggregate({
      _sum: { viewsCount: true },
      _avg: { viewsCount: true },
    }),
  ]);

  const totalViews = totalViewsAgg._sum.viewsCount || 0;
  const totalValuation = properties.reduce((acc, p) => acc + p.price, 0);

  // 1. Group Monthly Listings Growth (Past 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const monthlyListings: { month: string; year: number; count: number; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();

    const matching = properties.filter((p) => {
      const created = new Date(p.createdAt);
      return created.getMonth() === m && created.getFullYear() === y;
    });

    monthlyListings.push({
      month: `${monthNames[m]} ${String(y).slice(-2)}`,
      year: y,
      count: matching.length,
      value: matching.reduce((sum, p) => sum + p.price, 0),
    });
  }

  const maxMonthCount = Math.max(...monthlyListings.map((m) => m.count), 1);

  // 2. Inquiries Breakdown (NEW, CONTACTED, SCHEDULED, CLOSED)
  const inquiryStatusCounts = {
    NEW: inquiries.filter((i) => i.status === "NEW").length,
    CONTACTED: inquiries.filter((i) => i.status === "CONTACTED").length,
    SCHEDULED: inquiries.filter((i) => i.status === "SCHEDULED").length,
    CLOSED: inquiries.filter((i) => i.status === "CLOSED").length,
  };

  const totalInquiries = inquiries.length || 1;
  const statusPercentages = {
    NEW: Math.round((inquiryStatusCounts.NEW / totalInquiries) * 100),
    CONTACTED: Math.round((inquiryStatusCounts.CONTACTED / totalInquiries) * 100),
    SCHEDULED: Math.round((inquiryStatusCounts.SCHEDULED / totalInquiries) * 100),
    CLOSED: Math.round((inquiryStatusCounts.CLOSED / totalInquiries) * 100),
  };

  // 3. Most Viewed Properties Leaderboard (Top 6)
  const leaderboard = [...properties]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 6);
  const maxLeaderboardViews = Math.max(...leaderboard.map((p) => p.viewsCount), 1);

  // 4. Combined Activity Log Feed (Recent inquiries & recent property creations)
  const activityItems = [
    ...inquiries.slice(0, 8).map((inq) => ({
      id: `inq-${inq.id}`,
      type: "INQUIRY",
      title: `Tour Scheduled: ${inq.property?.title || "Luxury Residence"}`,
      subtitle: `By ${inq.buyerName} (${inq.buyerEmail}) • Status: ${inq.status}`,
      time: inq.createdAt,
      status: inq.status,
    })),
    ...properties.slice(0, 8).map((prop) => ({
      id: `prop-${prop.id}`,
      type: "PROPERTY",
      title: `Listing Cataloged: ${prop.title}`,
      subtitle: `${prop.city} • Offered at $${prop.price.toLocaleString()} • Status: ${prop.listingStatus}`,
      time: prop.createdAt,
      status: prop.listingStatus,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-semibold flex items-center gap-1.5">
              <TrendingUp className="size-3 text-amber-400" />
              Executive Intelligence
            </span>
            <span className="text-xs text-zinc-500 font-medium">Platform Analytics & Growth Telemetry</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Admin Analytics & Activity Log
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 shadow-xs flex items-center gap-2">
            <Calendar className="size-3.5 text-zinc-500" />
            <span>Past 6 Months Trajectory</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>Portfolio Valuation</span>
            <Building2 className="size-4 text-zinc-400" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-zinc-950">
            ${(totalValuation / 1_000_000).toFixed(1)}M
          </p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="size-3.5" />
            <span>Across {properties.length} Active Residences</span>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Inquiries & Leads</span>
            <MessageSquare className="size-4 text-zinc-400" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-zinc-950">
            {inquiries.length}
          </p>
          <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <span>{inquiryStatusCounts.SCHEDULED} Tours Confirmed</span>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>Platform Impressions</span>
            <Eye className="size-4 text-zinc-400" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-zinc-950">
            {totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 font-medium">
            Avg. {Math.round(totalViews / (properties.length || 1))} views per listing
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span>Registered Accounts</span>
            <Users className="size-4 text-zinc-400" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-zinc-950">
            {usersCount}
          </p>
          <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
            <span>Buyers, Sellers & Brokerages</span>
          </p>
        </div>
      </div>

      {/* Main Charts Row: Monthly Growth + Inquiries Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Monthly Listings Growth (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-zinc-200/90 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Acquisitions Telemetry
              </span>
              <h2 className="font-heading text-xl font-bold text-zinc-950">
                Monthly Listings Inflow
              </h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
              6-Month Rolling Window
            </span>
          </div>

          {/* Visual SVG Bar Chart */}
          <div className="h-64 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 border-b border-zinc-100">
            {monthlyListings.map((m, idx) => {
              const heightPercent = Math.max(Math.round((m.count / maxMonthCount) * 100), 12);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-zinc-950 text-white px-2 py-1 rounded-md shadow-md whitespace-nowrap mb-1">
                    {m.count} {m.count === 1 ? "residence" : "residences"}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] rounded-t-xl bg-linear-to-t from-zinc-900 via-zinc-800 to-amber-500/80 group-hover:to-amber-400 transition-all duration-300 shadow-xs relative"
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white">
                      {m.count > 0 ? m.count : ""}
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-xs font-semibold text-zinc-600 mt-1">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
            <span>Historical listing publishing cadence</span>
            <span className="font-semibold text-zinc-900">Total catalog: {properties.length} estates</span>
          </div>
        </div>

        {/* Inquiries Breakdown Funnel (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-zinc-200/90 p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Lead Pipeline
            </span>
            <h2 className="font-heading text-xl font-bold text-zinc-950">
              Inquiries Breakdown
            </h2>
          </div>

          <div className="space-y-4">
            {/* NEW / Pending */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-800 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  New Inquiries
                </span>
                <span className="text-zinc-950">{inquiryStatusCounts.NEW} ({statusPercentages.NEW}%)</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${statusPercentages.NEW}%` }}
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* CONTACTED */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-blue-800 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Advisor Contacted
                </span>
                <span className="text-zinc-950">{inquiryStatusCounts.CONTACTED} ({statusPercentages.CONTACTED}%)</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${statusPercentages.CONTACTED}%` }}
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* SCHEDULED */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-800 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-purple-500" />
                  Tour Scheduled
                </span>
                <span className="text-zinc-950">{inquiryStatusCounts.SCHEDULED} ({statusPercentages.SCHEDULED}%)</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${statusPercentages.SCHEDULED}%` }}
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* CLOSED */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-800 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Closed / Transaction
                </span>
                <span className="text-zinc-950">{inquiryStatusCounts.CLOSED} ({statusPercentages.CLOSED}%)</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${statusPercentages.CLOSED}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500 space-y-2">
            <div className="flex justify-between">
              <span>Conversion to Tour Rate:</span>
              <strong className="text-zinc-900 font-bold">
                {Math.round(((inquiryStatusCounts.SCHEDULED + inquiryStatusCounts.CLOSED) / totalInquiries) * 100)}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Most Viewed Properties Leaderboard + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Most Viewed Properties Leaderboard (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-zinc-200/90 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Flame className="size-4" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-950">
                  Most Viewed Residences Leaderboard
                </h2>
                <p className="text-xs text-zinc-500">Ranked by prospective buyer traffic and inquiries</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.map((property, idx) => {
              const medalColors = [
                "bg-amber-400 text-zinc-950 shadow-amber-500/20",
                "bg-zinc-300 text-zinc-900",
                "bg-amber-700/80 text-white",
              ];
              const medal = idx < 3 ? medalColors[idx] : "bg-zinc-100 text-zinc-600";

              return (
                <div
                  key={property.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50/80 hover:bg-zinc-100/80 border border-zinc-200/70 transition"
                >
                  {/* Rank */}
                  <span
                    className={`size-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${medal}`}
                  >
                    #{idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative size-12 rounded-xl overflow-hidden bg-zinc-200 shrink-0 border border-zinc-200">
                    <Image
                      src={property.images[0] || "/assets/house.png"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-950 truncate">
                      {property.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                      <MapPin className="size-3 text-zinc-400 shrink-0" />
                      <span>{property.city}</span>
                      <span>•</span>
                      <span>${property.price.toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Views count */}
                  <div className="text-right shrink-0">
                    <span className="font-heading text-sm font-extrabold text-zinc-950 flex items-center gap-1 justify-end">
                      <Eye className="size-3.5 text-zinc-400" />
                      {property.viewsCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-500">Impressions</span>
                  </div>

                  {/* Link */}
                  <Link
                    href={`/properties/${property.slug}`}
                    target="_blank"
                    className="size-8 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-black flex items-center justify-center transition shadow-2xs shrink-0"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log Feed (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-zinc-200/90 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Audit Trail
              </span>
              <h2 className="font-heading text-lg font-bold text-zinc-950">
                Platform Activity Feed
              </h2>
            </div>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" title="Live stream active" />
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {activityItems.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs"
              >
                <div
                  className={`size-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    act.type === "INQUIRY"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {act.type === "INQUIRY" ? (
                    <MessageSquare className="size-3.5" />
                  ) : (
                    <Building2 className="size-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 truncate">{act.title}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{act.subtitle}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {new Date(act.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
