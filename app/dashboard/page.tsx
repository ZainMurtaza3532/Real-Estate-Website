import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  Building2,
  DollarSign,
  Users,
  Eye,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Agent Command Center & Sales Overview - PrebuiltUI",
  description: "Executive sales analytics, exclusive listing inventory, and buyer tour inquiries.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  let { role, name, email, agencyName, id: userId } = session.user;

  // Role Protection: Verify against database in case user was recently promoted or role is stale in JWT
  if (role !== "SELLER" && role !== "AGENT" && role !== "ADMIN") {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (dbUser?.role) {
      role = dbUser.role;
    }
  }

  if (role !== "SELLER" && role !== "AGENT" && role !== "ADMIN") {
    redirect("/profile?notice=unauthorized_agent_access");
  }

  const isAdmin = role === "ADMIN";

  // Build query scopes: Admin sees platform-wide, Agents/Sellers see their managed assets
  const propertyScope = isAdmin ? {} : { sellerId: userId };
  const inquiryScope = isAdmin ? {} : { sellerId: userId };

  // Calculate 7-day window for weekly velocity
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Parallel database metrics
  const [
    totalListings,
    approvedListings,
    pendingListings,
    soldListings,
    draftListings,
    viewsAndValuationAgg,
    totalInquiries,
    inquiriesThisWeek,
    unreadLeadsCount,
    recentProperties,
    recentInquiries,
  ] = await Promise.all([
    prisma.property.count({ where: propertyScope }),
    prisma.property.count({ where: { ...propertyScope, listingStatus: "APPROVED" } }),
    prisma.property.count({ where: { ...propertyScope, listingStatus: "PENDING_APPROVAL" } }),
    prisma.property.count({ where: { ...propertyScope, listingStatus: "SOLD" } }),
    prisma.property.count({ where: { ...propertyScope, listingStatus: "DRAFT" } }),
    prisma.property.aggregate({
      where: propertyScope,
      _sum: { viewsCount: true, price: true },
    }),
    prisma.inquiry.count({ where: inquiryScope }),
    prisma.inquiry.count({
      where: {
        ...inquiryScope,
        createdAt: { gte: oneWeekAgo },
      },
    }),
    prisma.inquiry.count({
      where: { ...inquiryScope, status: "NEW" },
    }),
    prisma.property.findMany({
      where: propertyScope,
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({
      where: inquiryScope,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            title: true,
            slug: true,
            city: true,
            price: true,
            images: true,
          },
        },
      },
    }),
  ]);

  const totalViews = viewsAndValuationAgg._sum.viewsCount || 0;
  const totalValuation = viewsAndValuationAgg._sum.price || 0;

  const formattedValuation = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(totalValuation);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Identity (Decluttered and focused) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-semibold tracking-wide">
                {isAdmin ? "Super Admin Executive" : "Licensed Agent Desk"}
              </span>
              {agencyName && (
                <span className="text-xs text-zinc-500 font-medium">
                  • {agencyName}
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight pt-1">
              Agent Command Center
            </h1>
            <p className="text-xs text-zinc-500">
              Welcome back, <strong className="text-zinc-900 font-semibold">{name || "Advisor"}</strong> ({email})
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <DashboardNav
          propertiesCount={totalListings}
          unreadLeadsCount={unreadLeadsCount}
        />

        {/* Sales Performance Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Portfolio Valuation */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Managed Portfolio Value
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950">
              {formattedValuation}
            </div>
            <p className="text-xs text-zinc-500">
              Combined asset listing valuation
            </p>
          </div>

          {/* Metric 2: Live Inventory */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Active Listings
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Building2 className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950 flex items-baseline gap-2">
              <span>{approvedListings}</span>
              <span className="text-xs font-medium text-zinc-500">/ {totalListings} total</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {pendingListings > 0 && (
                <span className="text-amber-700 font-semibold">{pendingListings} under review</span>
              )}
              {soldListings > 0 && (
                <span className="text-zinc-700">• {soldListings} sold</span>
              )}
            </div>
          </div>

          {/* Metric 3: Lead Inflow */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Showing Leads & Tours
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Users className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950 flex items-baseline gap-2">
              <span>{totalInquiries}</span>
              {unreadLeadsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                  {unreadLeadsCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-600" />
              <strong className="text-zinc-900 font-semibold">{inquiriesThisWeek}</strong> received this week
            </p>
          </div>

          {/* Metric 4: Total Portfolio Views */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Buyer Impressions
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Eye className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500">
              Verified property detail page visits
            </p>
          </div>
        </div>

        {/* Two-Column Activity Desk: Left = Showing Requests, Right = Inventory Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Inquiries & Direct Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-zinc-950">
                  Recent Showing Leads
                </h2>
                <p className="text-xs text-zinc-500">
                  Direct appointment requests from verified luxury buyers
                </p>
              </div>
              <Link
                href="/dashboard/inquiries"
                className="text-xs font-semibold text-zinc-800 hover:text-black flex items-center gap-1"
              >
                <span>View All Leads</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-zinc-200 text-center space-y-2 shadow-xs">
                <Users className="size-8 text-zinc-400 mx-auto" />
                <h3 className="font-heading text-base font-bold text-zinc-900">
                  No Inquiries Yet
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  When buyers request private viewings on your listings, they will appear here with direct contact actions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((lead) => {
                  const cleanPhone = lead.buyerPhone ? lead.buyerPhone.replace(/[^0-9]/g, "") : null;
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hi ${lead.buyerName}, I received your private viewing request for "${lead.property.title}". When is the most convenient time for our showing?`
                      )}`
                    : null;

                  const tourDateFormatted = lead.tourDate
                    ? new Date(lead.tourDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : null;

                  return (
                    <div
                      key={lead.id}
                      className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs hover:shadow-xs transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading text-sm font-bold text-zinc-950">
                              {lead.buyerName}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                lead.status === "NEW"
                                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                                  : "bg-blue-50 text-blue-900 border border-blue-200"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Interested in{" "}
                            <strong className="text-zinc-900 font-semibold">
                              {lead.property.title}
                            </strong>
                          </p>
                        </div>

                        {/* Showing Appointment Badge */}
                        {tourDateFormatted && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-semibold shrink-0">
                            <Calendar className="size-3 text-zinc-500" />
                            <span>Tour: {tourDateFormatted} {lead.tourTime || ""}</span>
                          </div>
                        )}
                      </div>

                      {/* Message preview */}
                      <p className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 italic line-clamp-2">
                        &ldquo;{lead.message}&rdquo;
                      </p>

                      {/* Quick Communication Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-zinc-500">
                          {lead.buyerPhone || lead.buyerEmail}
                        </span>

                        <div className="flex items-center gap-2">
                          {lead.buyerPhone && (
                            <a
                              href={`tel:${lead.buyerPhone}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-950 text-white font-semibold hover:bg-zinc-800 transition"
                            >
                              <Phone className="size-3" />
                              <span>Call</span>
                            </a>
                          )}

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20ba59] transition"
                            >
                              <MessageCircle className="size-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Recent Inventory Snapshot */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-zinc-950">
                  Inventory Snapshot
                </h2>
                <p className="text-xs text-zinc-500">
                  Your managed residences & live badges
                </p>
              </div>
              <Link
                href="/dashboard/properties"
                className="text-xs font-semibold text-zinc-800 hover:text-black flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {recentProperties.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-zinc-200 text-center space-y-3 shadow-xs">
                <Building2 className="size-8 text-zinc-400 mx-auto" />
                <h3 className="font-heading text-base font-bold text-zinc-900">
                  No Properties Listed Yet
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Add photos, specifications, and pricing to start marketing verified luxury homes.
                </p>
                <Link
                  href="/dashboard/properties/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition"
                >
                  <PlusCircle className="size-3.5" />
                  <span>List First Residence</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProperties.map((prop) => {
                  const cover = prop.images && prop.images.length > 0 ? prop.images[0] : "/assets/house.png";

                  const badgeClass =
                    prop.listingStatus === "APPROVED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : prop.listingStatus === "PENDING_APPROVAL"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : prop.listingStatus === "SOLD"
                      ? "bg-zinc-100 text-zinc-700 border-zinc-300"
                      : "bg-red-50 text-red-800 border-red-200";

                  return (
                    <div
                      key={prop.id}
                      className="p-3.5 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs hover:shadow-xs transition flex items-center gap-3.5"
                    >
                      <div className="relative size-14 rounded-2xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                        <Image src={cover} alt={prop.title} fill className="object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                            {prop.listingStatus === "PENDING_APPROVAL" ? "UNDER REVIEW" : prop.listingStatus}
                          </span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                            <Eye className="size-3 text-zinc-400" /> {prop.viewsCount || 0}
                          </span>
                        </div>
                        <h3 className="font-semibold text-xs text-zinc-950 truncate mt-0.5">
                          {prop.title}
                        </h3>
                        <p className="text-[11px] font-bold text-zinc-900 mt-0.5">
                          ${(prop.price).toLocaleString()}
                        </p>
                      </div>

                      <Link
                        href={`/properties/${prop.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl text-zinc-400 hover:text-black hover:bg-zinc-100 transition shrink-0"
                        title="View Public Page"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                  );
                })}

                <div className="pt-2 text-center">
                  <Link
                    href="/dashboard/properties"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-black transition"
                  >
                    <span>Open Full Property Inventory</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
