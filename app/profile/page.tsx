import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Heart,
  AlertTriangle,
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Warning banner if redirected from /dashboard */}
        {isUnauthorizedAgent && (
          <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0 text-zinc-600" />
            <div>
              <p className="font-semibold">Agent & Admin Access Required</p>
              <p className="text-zinc-500">
                The <code>/dashboard</code> route is reserved for verified licensed agents and administrators. Your current account has <strong>{role}</strong> status.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <Card className="p-8 space-y-6 bg-white border border-zinc-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-zinc-900 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                {name ? name[0].toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-medium">{name || "Private Member"}</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-medium border border-zinc-200">
                    {role}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{email}</p>
              </div>
            </div>

            <Link href="/favorites">
              <Button variant="default" size="sm" leftIcon={<Heart className="size-4" />}>
                View Saved Listings
              </Button>
            </Link>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Full Name
              </span>
              <p className="text-sm font-medium text-zinc-900">{name || "Not provided"}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email Address
              </span>
              <p className="text-sm font-medium text-zinc-900">{email}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Contact Phone
              </span>
              <p className="text-sm font-medium text-zinc-900">{phone || "Not on file"}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Account Tier
              </span>
              <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-zinc-800" />
                Verified {role} Access
              </p>
            </div>

            {agencyName && (
              <div className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Brokerage / Agency Affiliation
                </span>
                <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                  <Building2 className="size-4 text-zinc-800" />
                  {agencyName}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
