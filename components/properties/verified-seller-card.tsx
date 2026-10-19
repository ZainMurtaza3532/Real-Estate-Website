"use client";

import React from "react";
import Image from "next/image";
import {
  Phone,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";

export interface VerifiedSellerCardProps {
  propertyTitle: string;
  propertyPrice?: number;
  propertySlug?: string;
  seller?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    whatsappNumber?: string | null;
    agencyName?: string | null;
    isVerified?: boolean;
    createdAt?: Date | string | null;
  } | null;
}

export function VerifiedSellerCard({
  propertyTitle,
  propertyPrice,
  propertySlug,
  seller,
}: VerifiedSellerCardProps) {
  const sellerName = seller?.name || "PrebuiltUI Private Brokerage";
  const agency = seller?.agencyName || "Luxury Estate Advisor";
  const contactPhone = seller?.phone || seller?.whatsappNumber || null;
  const waNumber = seller?.whatsappNumber || seller?.phone || null;

  // Clean phone numbers for tel: and wa.me protocols
  const cleanTel = contactPhone ? contactPhone.replace(/\s+/g, "") : null;
  const cleanWa = waNumber ? waNumber.replace(/[^0-9]/g, "") : null;

  // Member since date
  const memberSince = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Jan 2024";

  // Pre-filled WhatsApp message including Property Name, Price, and Page URL
  const formattedPrice = propertyPrice ? `$${propertyPrice.toLocaleString()}` : "";
  const pageUrl =
    typeof window !== "undefined" && window.location?.href
      ? window.location.href
      : `http://localhost:3000/properties/${propertySlug || ""}`;

  const waMessage = `Hi, I am interested in your luxury residence: "${propertyTitle}"${
    formattedPrice ? ` (Price: ${formattedPrice})` : ""
  }.\nProperty Link: ${pageUrl}`;

  const waUrl = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="rounded-3xl bg-white border border-zinc-200/90 shadow-md p-6 space-y-5">
      {/* Seller Identity & Verified Badge */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative size-14 rounded-2xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100 shadow-2xs">
          {seller?.image ? (
            <Image
              src={seller.image}
              alt={sellerName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-zinc-900 text-white font-heading font-bold text-lg">
              {sellerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name, Title, and Verification Badge */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>Verified Seller</span>
            </span>
          </div>

          <h3 className="font-heading text-base font-bold text-zinc-950 truncate">
            {sellerName}
          </h3>

          <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
            <Building2 className="size-3 text-zinc-400 shrink-0" />
            <span>{agency}</span>
          </p>
        </div>
      </div>

      {/* Member Since info */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-1 pb-2 border-b border-zinc-100">
        <Calendar className="size-3.5 text-zinc-400" />
        <span>
          Member since <strong className="text-zinc-700 font-semibold">{memberSince}</strong>
        </span>
      </div>

      {/* Direct Contact Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {/* Call Now */}
        {cleanTel ? (
          <a
            href={`tel:${cleanTel}`}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs cursor-pointer"
          >
            <Phone className="size-3.5" />
            <span>Call Now</span>
          </a>
        ) : (
          <button
            disabled
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-semibold cursor-not-allowed"
          >
            <Phone className="size-3.5" />
            <span>Call Now (Direct)</span>
          </button>
        )}

        {/* Chat on WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition shadow-xs cursor-pointer"
        >
          <MessageCircle className="size-4" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
