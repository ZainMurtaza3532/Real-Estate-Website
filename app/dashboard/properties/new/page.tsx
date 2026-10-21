import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SellWizard } from "@/components/seller/sell-wizard";
import { ArrowLeft, PlusCircle } from "lucide-react";

export const metadata = {
  title: "Create Luxury Listing - Agent Dashboard",
  description: "Publish a verified architectural residence to the global HavenStone Estates portfolio.",
};

export default async function NewPropertyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/properties/new");
  }

  // Allow any authenticated user to create a listing (upgrades them to SELLER upon submission)

  // Fetch agent details from DB to prefill phone & agency
  let dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      whatsappNumber: true,
      agencyName: true,
      isVerified: true,
    },
  });

  if (!dbUser && session.user.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        whatsappNumber: true,
        agencyName: true,
        isVerified: true,
      },
    });
  }

  if (!dbUser) {
    redirect("/login?callbackUrl=/dashboard/properties/new");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-black transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Property Inventory</span>
          </Link>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="size-1.5 bg-emerald-600 rounded-full"></span>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Listing Creation Wizard
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Create New Property Listing
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Add photos, specifications, and pricing for review by the compliance and curation committee.
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <DashboardNav />

        {/* Multi-Step Wizard with photo drag-and-drop, pin map, and specs */}
        <SellWizard
          currentUser={dbUser}
          redirectAfterSubmit="/dashboard/properties"
        />
      </div>
    </div>
  );
}
