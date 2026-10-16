import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { PropertyForm } from "@/components/dashboard/property-form";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "Create Luxury Listing - PrebuiltUI Dashboard",
  description: "Publish a new luxury property listing to your brokerage portfolio.",
};

export default async function NewPropertyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/properties/new");
  }

  const { role } = session.user;
  if (role !== "AGENT" && role !== "ADMIN") {
    redirect("/profile?notice=unauthorized_agent_access");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/dashboard/properties"
                className="text-xs text-zinc-500 hover:text-zinc-900 transition flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="size-3" /> Back to Properties
              </Link>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Create New Property Listing
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Publish a verified architectural residence to the global PrebuiltUI portfolio.
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <DashboardNav />

        {/* Property Form */}
        <PropertyForm />
      </div>
    </div>
  );
}
