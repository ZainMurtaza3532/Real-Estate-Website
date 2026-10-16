import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { InquiriesTable } from "@/components/dashboard/inquiries-table";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  Heart,
  Calendar,
} from "lucide-react";

export const metadata = {
  title: "Executive Dashboard - PrebuiltUI Real Estate",
  description: "Manage exclusive real estate inventory, leads, and transaction analytics.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { role, name, email, agencyName, id: userId } = session.user;

  if (role !== "AGENT" && role !== "ADMIN") {
    redirect("/profile?notice=unauthorized_agent_access");
  }

  const isAdmin = role === "ADMIN";

  // Build query scopes: Admin sees platform-wide, Agent sees their own portfolio
  const propertyScope = isAdmin ? {} : { agentId: userId };
  const inquiryScope = isAdmin
    ? {}
    : {
        property: {
          agentId: userId,
        },
      };

  // Parallel database analytics queries
  const [
    totalListings,
    availableListings,
    totalInquiries,
    pendingInquiries,
    totalFavorites,
    propertiesAgg,
    recentInquiries,
  ] = await Promise.all([
    prisma.property.count({ where: propertyScope }),
    prisma.property.count({ where: { ...propertyScope, status: "AVAILABLE" } }),
    prisma.inquiry.count({ where: inquiryScope }),
    prisma.inquiry.count({ where: { ...inquiryScope, status: "PENDING" } }),
    prisma.favorite.count({
      where: isAdmin
        ? {}
        : {
            property: { agentId: userId },
          },
    }),
    prisma.property.aggregate({
      where: propertyScope,
      _sum: {
        price: true,
      },
      _avg: {
        price: true,
      },
    }),
    prisma.inquiry.findMany({
      where: inquiryScope,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        property: {
          select: {
            title: true,
            slug: true,
            price: true,
            city: true,
          },
        },
      },
    }),
  ]);

  const totalValuation = propertiesAgg._sum.price || 0;
  const formattedValuation = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(totalValuation);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-semibold tracking-wide">
                {isAdmin ? "Executive Suite" : "Broker Desk"}
              </span>
              {agencyName && (
                <span className="text-xs text-zinc-500 font-medium">
                  {agencyName}
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight pt-1">
              Welcome back, {name || "Advisor"}
            </h1>
            <p className="text-xs text-zinc-500">
              Logged in as <span className="font-medium text-zinc-800">{email}</span> ({role})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
            >
              <Plus className="size-4" />
              <span>Create New Listing</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <DashboardNav />

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Listings */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Total Listings
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
                <Building2 className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950">
              {totalListings}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900">{availableListings}</span>{" "}
              available for acquisition
            </p>
          </div>

          {/* Active Inquiries */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Client Inquiries
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
                <Users className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950">
              {totalInquiries}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="font-semibold text-amber-600">{pendingInquiries}</span>{" "}
              pending tour requests
            </p>
          </div>

          {/* Portfolio Valuation */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Portfolio Valuation
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950">
              {formattedValuation}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Combined asset listing inventory
            </p>
          </div>

          {/* Buyer Engagement / Saved */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Buyer Bookmarks
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
                <Heart className="size-4" />
              </div>
            </div>
            <div className="font-heading text-3xl font-extrabold text-zinc-950">
              {totalFavorites}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Private wishlist saves by verified clients
            </p>
          </div>
        </div>

        {/* Recent Inquiries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-zinc-950">
                Recent VIP Inquiries & Showing Requests
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Client submissions and tour appointment requests across your portfolio
              </p>
            </div>
          </div>

          <InquiriesTable initialInquiries={recentInquiries} />
        </div>
      </div>
    </div>
  );
}
