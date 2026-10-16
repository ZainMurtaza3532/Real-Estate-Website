import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { PropertyTable } from "@/components/dashboard/property-table";
import { Plus, Building2 } from "lucide-react";

export const metadata = {
  title: "Property Inventory - PrebuiltUI Dashboard",
  description: "Manage and curate your luxury property listings.",
};

export default async function DashboardPropertiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/properties");
  }

  const { role, id: userId } = session.user;
  if (role !== "AGENT" && role !== "ADMIN") {
    redirect("/profile?notice=unauthorized_agent_access");
  }

  const isAdmin = role === "ADMIN";
  const whereScope = isAdmin ? {} : { agentId: userId };

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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Portfolio Assets
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Property Management
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {isAdmin
                ? `Overseeing all ${properties.length} platform listings`
                : `Managing ${properties.length} active listings assigned to your broker desk`}
            </p>
          </div>

          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add New Property</span>
          </Link>
        </div>

        {/* Dashboard Navigation Tabs */}
        <DashboardNav />

        {/* Property Inventory Table */}
        <div className="space-y-4">
          <PropertyTable initialProperties={properties} />
        </div>
      </div>
    </div>
  );
}
