import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SellerLeadsInbox, SellerLeadItem } from "@/components/seller/seller-leads-inbox";
import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";

export const metadata = {
  title: "Leads & Showing Requests - Agent Dashboard",
  description: "Connect with prospective luxury buyers, schedule showings, and message directly via WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function DashboardInquiriesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/inquiries");
  }

  let { role, id: userId, name } = session.user;
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
  const inquiryScope = isAdmin ? {} : { sellerId: userId };
  const propertyScope = isAdmin ? {} : { sellerId: userId };

  // Fetch leads and showing requests
  const [leads, propertiesCount] = await Promise.all([
    prisma.inquiry.findMany({
      where: inquiryScope,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            city: true,
            images: true,
          },
        },
      },
    }),
    prisma.property.count({
      where: propertyScope,
    }),
  ]);

  const unreadLeadsCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="size-1.5 bg-emerald-600 rounded-full"></span>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Client Showing Inquiries
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Leads & Showing Requests
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Manage incoming tour appointments, call buyers directly, or message via WhatsApp.
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <DashboardNav
          propertiesCount={propertiesCount}
          unreadLeadsCount={unreadLeadsCount}
        />

        {/* Leads Inbox Component with one-click Call & WhatsApp deep-links */}
        <SellerLeadsInbox
          initialLeads={leads as unknown as SellerLeadItem[]}
          sellerName={name}
        />
      </div>
    </div>
  );
}
