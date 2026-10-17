import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  SellerPropertiesView,
  SellerPropertyItem,
} from "@/components/seller/seller-properties-view";
import { PlusCircle, Building2 } from "lucide-react";

export const metadata = {
  title: "Property Inventory & Sales - Agent Dashboard",
  description: "Manage, review status badges, edit specifications, pause listings, or mark residences as sold.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPropertiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/properties");
  }

  let { role, id: userId } = session.user;
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
  const whereScope = isAdmin ? {} : { sellerId: userId };

  // Fetch properties managed by this agent/seller
  const properties = await prisma.property.findMany({
    where: whereScope,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          inquiries: true,
          favorites: true,
        },
      },
    },
  });

  const unreadLeadsCount = await prisma.inquiry.count({
    where: {
      ...whereScope,
      status: "NEW",
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="size-1.5 bg-emerald-600 rounded-full"></span>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Sales Inventory Desk
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Property Inventory & Listings
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {isAdmin
                ? `Overseeing all ${properties.length} platform listings with live moderation badges`
                : `Managing ${properties.length} active listings assigned to your brokerage portfolio`}
            </p>
          </div>

          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
          >
            <PlusCircle className="size-4" />
            <span>List New Property</span>
          </Link>
        </div>

        {/* Dashboard Navigation Tabs */}
        <DashboardNav
          propertiesCount={properties.length}
          unreadLeadsCount={unreadLeadsCount}
        />

        {/* Enhanced Property Inventory with Grid/Table Views, Edit Modal & Quick Actions */}
        <SellerPropertiesView
          initialProperties={properties as unknown as SellerPropertyItem[]}
        />
      </div>
    </div>
  );
}
