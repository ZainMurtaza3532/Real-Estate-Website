"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar,
  Phone,
  Mail,
  User,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { updateInquiryStatus } from "@/actions/dashboard-inquiries";

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  tourDate: Date | string | null;
  status: "PENDING" | "CONTACTED" | "CLOSED";
  createdAt: Date | string;
  property: {
    title: string;
    slug: string;
    price: number;
    city: string;
  };
}

interface InquiriesTableProps {
  initialInquiries: InquiryItem[];
}

export function InquiriesTable({ initialInquiries }: InquiriesTableProps) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (
    inquiryId: string,
    newStatus: "PENDING" | "CONTACTED" | "CLOSED"
  ) => {
    // Optimistic update
    setInquiries((prev) =>
      prev.map((item) =>
        item.id === inquiryId ? { ...item, status: newStatus } : item
      )
    );

    startTransition(async () => {
      const res = await updateInquiryStatus(inquiryId, newStatus);
      if (res.success) {
        toast.success(`Inquiry status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status", { description: res.error });
        // Rollback
        setInquiries(initialInquiries);
      }
    });
  };

  const getStatusBadge = (status: "PENDING" | "CONTACTED" | "CLOSED") => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "CONTACTED":
        return "bg-blue-50 text-blue-900 border-blue-200";
      case "CLOSED":
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl bg-white border border-zinc-200 p-6">
        <AlertCircle className="size-8 text-zinc-400 mx-auto mb-2" />
        <h4 className="font-heading text-base font-semibold text-zinc-900">
          No Inquiries Yet
        </h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Client tour requests and inquiries on your properties will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3.5 px-4">Client</th>
            <th className="py-3.5 px-4">Property</th>
            <th className="py-3.5 px-4">Tour Date / Request</th>
            <th className="py-3.5 px-4">Received</th>
            <th className="py-3.5 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {inquiries.map((inq) => {
            const dateStr = inq.tourDate
              ? new Date(inq.tourDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "No specific date";

            const receivedStr = new Date(inq.createdAt).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            );

            return (
              <tr key={inq.id} className="hover:bg-zinc-50/60 transition-colors">
                {/* Client info */}
                <td className="py-4 px-4 align-top">
                  <div className="font-semibold text-zinc-950">{inq.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                    <Mail className="size-3 text-zinc-400" />
                    <a
                      href={`mailto:${inq.email}`}
                      className="hover:underline text-zinc-600"
                    >
                      {inq.email}
                    </a>
                  </div>
                  {inq.phone && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                      <Phone className="size-3 text-zinc-400" />
                      <a
                        href={`tel:${inq.phone}`}
                        className="hover:underline text-zinc-600"
                      >
                        {inq.phone}
                      </a>
                    </div>
                  )}
                </td>

                {/* Property reference */}
                <td className="py-4 px-4 align-top max-w-xs">
                  <Link
                    href={`/properties/${inq.property.slug}`}
                    target="_blank"
                    className="font-semibold text-zinc-900 hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{inq.property.title}</span>
                    <ExternalLink className="size-3 shrink-0 text-zinc-400" />
                  </Link>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {inq.property.city} • $
                    {inq.property.price.toLocaleString()}
                  </p>
                </td>

                {/* Tour date & Message snippet */}
                <td className="py-4 px-4 align-top max-w-sm">
                  {inq.tourDate && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[10px] font-semibold mb-1">
                      <Calendar className="size-3 text-zinc-500" /> {dateStr}
                    </div>
                  )}
                  <p className="text-zinc-600 text-xs line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>
                </td>

                {/* Received date */}
                <td className="py-4 px-4 align-top text-zinc-500 whitespace-nowrap">
                  {receivedStr}
                </td>

                {/* Status Dropdown */}
                <td className="py-4 px-4 align-top">
                  <select
                    value={inq.status}
                    disabled={isPending}
                    onChange={(e) =>
                      handleStatusChange(
                        inq.id,
                        e.target.value as "PENDING" | "CONTACTED" | "CLOSED"
                      )
                    }
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition ${getStatusBadge(
                      inq.status
                    )}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
