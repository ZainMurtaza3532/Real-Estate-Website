import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getUserSavedSearches } from "@/actions/saved-searches";
import { SavedSearchesList } from "@/components/dashboard/saved-searches-list";

export const metadata = {
  title: "Saved Searches & Property Alerts | HavenStone Dashboard",
  description: "Manage your customized search filters and automated email notification subscriptions.",
};

export const dynamic = "force-dynamic";

export default async function SavedSearchesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/saved-searches");
  }

  const res = await getUserSavedSearches();
  const searches = res.success && res.data ? res.data : [];

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) pt-28 md:pt-36 pb-20 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardNav />

        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-950 dark:text-white">
            Smart Saved Searches & Instant Alerts
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Automated alerts dispatched to your email whenever new approved estates match your preferences.
          </p>
        </div>

        <SavedSearchesList initialSearches={searches} />
      </div>
    </div>
  );
}
