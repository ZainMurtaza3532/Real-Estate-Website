import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ChatInbox } from "@/components/dashboard/chat-inbox";

export const metadata = {
  title: "Messages & Direct Communications | HavenStone Dashboard",
  description: "Secure real-time in-app communications between buyers, sellers, and luxury agents.",
};

export const dynamic = "force-dynamic";

export default async function DashboardMessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/messages");
  }

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) pt-28 md:pt-36 pb-20 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardNav />

        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-950 dark:text-white">
            Client & Agent In-App Messaging
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time confidential inquiries, showing requests, and advisory chats.
          </p>
        </div>

        <ChatInbox currentUserId={session.user.id} />
      </div>
    </div>
  );
}
