import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export const metadata = {
  title: "Super Admin Control Center - PrebuiltUI",
  description: "Executive moderation, listing approvals, user curation, and platform governance.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Strict server-side verification: Only users with role === 'ADMIN'
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  let role = session.user.role;
  if (role !== "ADMIN") {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (dbUser?.role) {
      role = dbUser.role;
    }
  }

  if (role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // Count pending reviews for badge in sidebar
  const pendingCount = await prisma.property.count({
    where: { listingStatus: "PENDING_APPROVAL" },
  });

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar pendingCount={pendingCount} user={session.user} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar user={session.user} pendingCount={pendingCount} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
