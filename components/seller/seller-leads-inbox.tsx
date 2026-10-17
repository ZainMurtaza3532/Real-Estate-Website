"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  User,
  Building2,
  Filter,
} from "lucide-react";
import { updateSellerLeadStatus } from "@/actions/seller";
import { InquiryStatus } from "@prisma/client";

export interface SellerLeadItem {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  message: string;
  tourDate: Date | string | null;
  tourTime: string | null;
  status: InquiryStatus;
  createdAt: Date | string;
  property: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    city: string;
    images: string[];
  };
}

interface SellerLeadsInboxProps {
  initialLeads: SellerLeadItem[];
  sellerName?: string | null;
}

export function SellerLeadsInbox({ initialLeads, sellerName }: SellerLeadsInboxProps) {
  const [leads, setLeads] = useState<SellerLeadItem[]>(initialLeads);
  const [filter, setFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered = leads.filter((lead) => {
    if (filter === "ALL") return true;
    return lead.status === filter;
  });

  const handleStatusChange = (leadId: string, newStatus: InquiryStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    startTransition(async () => {
      const res = await updateSellerLeadStatus(leadId, newStatus);
      if (res.success) {
        toast.success(`Lead marked as ${newStatus}`);
      } else {
        toast.error("Failed to update status", { description: res.error });
        setLeads(initialLeads);
      }
    });
  };

  const generateWhatsAppLink = (lead: SellerLeadItem) => {
    if (!lead.buyerPhone) return "#";
    const cleanNumber = lead.buyerPhone.replace(/[^0-9]/g, "");
    const advisor = sellerName || "your luxury real estate advisor";
    const text = encodeURIComponent(
      `Hello ${lead.buyerName}, this is ${advisor} regarding your private tour request for "${lead.property.title}". I would be delighted to coordinate your showing. When is the most convenient time for you?`
    );
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "NEW":
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "CONTACTED":
        return "bg-blue-50 text-blue-900 border-blue-200";
      case "SCHEDULED":
        return "bg-purple-50 text-purple-900 border-purple-200";
      case "CLOSED":
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-zinc-200/90 shadow-2xs">
        {[
          { id: "ALL", label: "All Inquiries" },
          { id: "NEW", label: "New Leads" },
          { id: "CONTACTED", label: "Contacted" },
          { id: "SCHEDULED", label: "Tour Scheduled" },
          { id: "CLOSED", label: "Closed / Archived" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
              filter === tab.id
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-zinc-200 p-8 max-w-lg mx-auto shadow-xs">
          <div className="size-16 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="size-8" />
          </div>
          <h3 className="font-heading text-xl font-bold text-zinc-950 mb-1">
            No Buyer Inquiries Yet
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
            {filter === "ALL"
              ? "When buyers book showings or send contact messages on your property listings, they will appear here with one-click Call and WhatsApp connections."
              : `No inquiries with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((lead) => {
            const tourDate = lead.tourDate
              ? new Date(lead.tourDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "No specific date requested";

            const receivedAgo = new Date(lead.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const coverImage =
              lead.property.images && lead.property.images.length > 0
                ? lead.property.images[0]
                : "/assets/house.png";

            const waLink = generateWhatsAppLink(lead);

            return (
              <div
                key={lead.id}
                className="rounded-3xl bg-white border border-zinc-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left: Buyer Details and Message */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>

                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                      <Clock className="size-3 text-zinc-400" />
                      Received {receivedAgo}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-zinc-950 flex items-center gap-2">
                      <span>{lead.buyerName}</span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 mt-1">
                      <a
                        href={`mailto:${lead.buyerEmail}`}
                        className="hover:underline flex items-center gap-1 text-zinc-600 hover:text-black"
                      >
                        <Mail className="size-3.5 text-zinc-400" />
                        <span>{lead.buyerEmail}</span>
                      </a>

                      {lead.buyerPhone && (
                        <span className="flex items-center gap-1 text-zinc-600">
                          <Phone className="size-3.5 text-zinc-400" />
                          <span>{lead.buyerPhone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tour date requested */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-semibold">
                    <Calendar className="size-3.5 text-zinc-500" />
                    <span>Requested Tour: {tourDate} {lead.tourTime ? `(${lead.tourTime})` : ""}</span>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-zinc-700 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-150 leading-relaxed italic">
                    &ldquo;{lead.message}&rdquo;
                  </p>
                </div>

                {/* Right: Property Reference & One-Click Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                  {/* Property snapshot */}
                  <div className="flex items-center gap-3 bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/80 max-w-xs">
                    <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                      <Image src={coverImage} alt={lead.property.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/properties/${lead.property.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-zinc-950 hover:underline truncate block"
                      >
                        {lead.property.title}
                      </Link>
                      <p className="text-[11px] text-zinc-500">
                        {lead.property.city} • ${(lead.property.price / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>

                  {/* One-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start lg:justify-end">
                    {/* Call Buyer */}
                    {lead.buyerPhone ? (
                      <a
                        href={`tel:${lead.buyerPhone}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
                      >
                        <Phone className="size-3.5" />
                        <span>Call Buyer</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-semibold cursor-not-allowed"
                      >
                        <Phone className="size-3.5" />
                        <span>No Phone</span>
                      </button>
                    )}

                    {/* Chat on WhatsApp */}
                    {lead.buyerPhone ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition shadow-xs"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    ) : null}

                    {/* Mark as Contacted */}
                    {lead.status === "NEW" ? (
                      <button
                        onClick={() => handleStatusChange(lead.id, "CONTACTED")}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 text-zinc-800 text-xs font-semibold hover:bg-zinc-100 transition"
                      >
                        <CheckCircle2 className="size-3.5 text-zinc-500" />
                        <span>Mark Contacted</span>
                      </button>
                    ) : (
                      <select
                        value={lead.status}
                        disabled={isPending}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value as InquiryStatus)
                        }
                        className="text-xs font-semibold px-2.5 py-2 rounded-xl border border-zinc-200 bg-white cursor-pointer focus:outline-none"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
