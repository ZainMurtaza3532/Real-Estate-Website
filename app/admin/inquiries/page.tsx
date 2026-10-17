import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, Calendar, Phone, Mail, ExternalLink, MapPin } from "lucide-react";

export const metadata = {
  title: "Leads & Inquiries - Super Admin",
  description: "Monitor and audit all buyer tour requests, private offers, and luxury inquiries.",
};

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: {
          title: true,
          slug: true,
          city: true,
          price: true,
        },
      },
      seller: {
        select: {
          name: true,
          email: true,
          phone: true,
          agencyName: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-semibold">
              Global Pipeline
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {inquiries.length} Total Client Tour & Showing Requests
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Leads & Inquiries Log
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Audit high-value client communication routed to verified sellers and broker desks.
          </p>
        </div>
      </div>

      {/* Inquiries Table */}
      {inquiries.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-zinc-200 p-8">
          <MessageSquare className="size-8 text-zinc-400 mx-auto mb-2" />
          <h4 className="font-heading text-base font-semibold text-zinc-950">No Inquiries Found</h4>
          <p className="text-xs text-zinc-500 mt-1">
            Client showing requests will automatically be logged here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Prospective Buyer</th>
                <th className="py-4 px-5">Target Residence</th>
                <th className="py-4 px-5">Assigned Seller</th>
                <th className="py-4 px-5">Tour Request Date</th>
                <th className="py-4 px-5">Message Snippet</th>
                <th className="py-4 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {inquiries.map((inq) => {
                const tourDate = inq.tourDate
                  ? new Date(inq.tourDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "General Inquiry";

                return (
                  <tr key={inq.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Buyer */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-semibold text-zinc-950 text-xs">{inq.buyerName}</p>
                      <p className="text-[11px] text-zinc-500">{inq.buyerEmail}</p>
                      {inq.buyerPhone && (
                        <p className="text-[10px] text-zinc-600 mt-0.5">{inq.buyerPhone}</p>
                      )}
                    </td>

                    {/* Property */}
                    <td className="py-4 px-5">
                      <Link
                        href={`/properties/${inq.property.slug}`}
                        target="_blank"
                        className="font-semibold text-zinc-950 text-xs hover:underline flex items-center gap-1 group"
                      >
                        <span className="truncate max-w-[200px]">{inq.property.title}</span>
                        <ExternalLink className="size-3 text-zinc-400 group-hover:text-zinc-800 shrink-0" />
                      </Link>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {inq.property.city} • ${(inq.property.price / 1000000).toFixed(1)}M
                      </p>
                    </td>

                    {/* Seller */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-semibold text-zinc-950 text-xs">{inq.seller?.name}</p>
                      <p className="text-[11px] text-zinc-500">{inq.seller?.agencyName || "Independent"}</p>
                    </td>

                    {/* Tour Date */}
                    <td className="py-4 px-5 whitespace-nowrap text-zinc-600">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar className="size-3.5 text-zinc-400" />
                        <span>{tourDate}</span>
                      </div>
                    </td>

                    {/* Message */}
                    <td className="py-4 px-5 max-w-xs">
                      <p className="text-zinc-600 text-xs line-clamp-2 leading-relaxed italic">
                        &ldquo;{inq.message}&rdquo;
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {inq.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
