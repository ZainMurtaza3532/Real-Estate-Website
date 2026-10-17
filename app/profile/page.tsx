import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Heart,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Client Profile - PrebuiltUI Estate",
  description: "View and manage your private real estate membership profile.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  const { name, email, role, phone, agencyName } = session.user;
  const resolvedParams = await searchParams;
  const isUnauthorizedAgent = resolvedParams?.notice === "unauthorized_agent_access";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-950 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-zinc-400" />
          <span className="text-zinc-950 font-semibold">Profile</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="size-1.5 bg-zinc-900"></span>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Account Overview
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
              Client Profile
            </h1>
          </div>
        </div>

        {/* Warning banner if redirected from /dashboard */}
        {isUnauthorizedAgent && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Agent & Admin Access Required</p>
              <p className="text-amber-700 mt-0.5">
                The <code>/dashboard</code> route is reserved for verified licensed agents and administrators. Your current account has <strong>{role}</strong> status.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-3xl bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
            <div className="flex items-center gap-4">
              <div className="size-14 sm:size-16 rounded-2xl bg-zinc-900 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                {name ? name[0].toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-zinc-950">
                    {name || "Private Member"}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-semibold">
                    {role}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{email}</p>
              </div>
            </div>

            <Link
              href="/favorites"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-xs"
            >
              <Heart className="size-4" />
              <span>View Saved Listings</span>
            </Link>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Full Name
              </span>
              <p className="text-sm font-semibold text-zinc-900">{name || "Not provided"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email Address
              </span>
              <p className="text-sm font-semibold text-zinc-900">{email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Contact Phone
              </span>
              <p className="text-sm font-semibold text-zinc-900">{phone || "Not on file"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Account Tier
              </span>
              <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-zinc-800" />
                Verified {role} Access
              </p>
            </div>

            {agencyName && (
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Brokerage / Agency Affiliation
                </span>
                <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                  <Building2 className="size-4 text-zinc-800" />
                  {agencyName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
