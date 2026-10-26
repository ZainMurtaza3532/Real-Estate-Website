import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getAgentPublicProfile } from "@/actions/agent-reviews";
import { AgentReviewForm } from "@/components/agents/agent-review-form";
import { PropertyCard } from "@/components/properties/property-card";
import {
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  Mail,
  Star,
  Award,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  MessagesSquare,
} from "lucide-react";

interface AgentProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AgentProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentPublicProfile(id);

  if (!agent) {
    return { title: "Agent Not Found | HavenStone Estates" };
  }

  return {
    title: `${agent.name || "Agent"} - Verified Luxury Advisor | HavenStone`,
    description: agent.bio || `Explore exclusive listings and verified client reviews for ${agent.name}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function AgentProfilePage({ params }: AgentProfilePageProps) {
  const { id } = await params;
  const agent = await getAgentPublicProfile(id);

  if (!agent) {
    notFound();
  }

  const memberSince = new Date(agent.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition"
          >
            <ArrowLeft className="size-3.5" /> Back to Properties
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative size-24 sm:size-28 rounded-3xl overflow-hidden shrink-0 border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 shadow-md">
                {agent.image ? (
                  <Image
                    src={agent.image}
                    alt={agent.name || "Agent"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center bg-zinc-950 text-white font-heading font-black text-3xl">
                    {agent.name?.charAt(0) || "A"}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="size-3.5" />
                    <span>Verified Brokerage Partner</span>
                  </span>
                  {agent.licenseNumber && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      License #{agent.licenseNumber}
                    </span>
                  )}
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-950 dark:text-white">
                  {agent.name}
                </h1>

                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Building2 className="size-4 text-zinc-400 shrink-0" />
                  <span>{agent.agencyName || "HavenStone Private Advisory"}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                  <span className="text-xs text-zinc-400">Since {memberSince}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800">
              <div className="text-center px-3 border-r border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-heading font-black text-2xl">
                  <span>{agent.avgRating > 0 ? agent.avgRating : "5.0"}</span>
                  <Star className="size-5 fill-amber-500" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                  {agent.totalReviews} Reviews
                </div>
              </div>

              <div className="text-center px-3">
                <div className="font-heading font-black text-2xl text-zinc-950 dark:text-white">
                  {agent.properties.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                  Active Listings
                </div>
              </div>
            </div>
          </div>

          {agent.bio && (
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="font-heading font-bold text-sm text-zinc-900 dark:text-zinc-200 mb-2">
                Executive Biography & Advisory Philosophy
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
                {agent.bio}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-zinc-950 dark:text-white">
                Active Architectural Portfolio ({agent.properties.length})
              </h2>
            </div>

            {agent.properties.length === 0 ? (
              <div className="p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center text-zinc-400 text-xs">
                No active listings published currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {agent.properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={{
                      ...prop,
                      seller: {
                        name: agent.name,
                        agencyName: agent.agencyName,
                        image: agent.image,
                      },
                    }}
                    isFavorited={false}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <AgentReviewForm agentId={agent.id} agentName={agent.name || "Agent"} />

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-heading font-bold text-base text-zinc-950 dark:text-white">
                  Verified Client Testimonials
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {agent.reviewsReceived.length} verified
                </span>
              </div>

              {agent.reviewsReceived.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  Be the first verified client to review {agent.name}.
                </p>
              ) : (
                <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {agent.reviewsReceived.map((rev) => (
                    <div key={rev.id} className="pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs">
                            {rev.reviewer?.name?.charAt(0) || "B"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white">
                              {rev.reviewer?.name || "Verified Client"}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {new Date(rev.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
