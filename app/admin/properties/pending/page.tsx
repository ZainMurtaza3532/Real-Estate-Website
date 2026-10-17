import React from "react";
import { prisma } from "@/lib/prisma";
import { ModerationQueueTable, PendingPropertyItem } from "@/components/admin/moderation-queue-table";
import { ShieldAlert, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Property Moderation Queue - Super Admin",
  description: "Review, approve, and verify new luxury property submissions.",
};

export const dynamic = "force-dynamic";

export default async function PendingPropertiesPage() {
  const pendingProperties = await prisma.property.findMany({
    where: { listingStatus: "PENDING_APPROVAL" },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsappNumber: true,
          agencyName: true,
          image: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold border border-amber-500/20">
              <ShieldAlert className="size-3.5" />
              Listing Verification Desk
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {pendingProperties.length} {pendingProperties.length === 1 ? "Listing" : "Listings"} Awaiting Approval
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Moderation Queue
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Verify property legitimacy, photos, pricing, and seller contact details before publishing to the live portfolio.
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <ModerationQueueTable initialProperties={pendingProperties as unknown as PendingPropertyItem[]} />
    </div>
  );
}
