"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  X,
  Eye,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Car,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { approveProperty, rejectProperty } from "@/actions/admin";

export interface PendingPropertyItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  propertyType: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  garageSpaces: number;
  yearBuilt: number | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  images: string[];
  videoTourUrl: string | null;
  amenities: string[];
  createdAt: Date | string;
  seller: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    whatsappNumber: string | null;
    agencyName: string | null;
    image: string | null;
    isVerified: boolean;
  };
}

interface ModerationQueueTableProps {
  initialProperties: PendingPropertyItem[];
}

export function ModerationQueueTable({ initialProperties }: ModerationQueueTableProps) {
  const [properties, setProperties] = useState<PendingPropertyItem[]>(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState<PendingPropertyItem | null>(null);
  const [rejectModalProperty, setRejectModalProperty] = useState<PendingPropertyItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (property: PendingPropertyItem) => {
    startTransition(async () => {
      const res = await approveProperty(property.id);
      if (res.success) {
        toast.success(`"${property.title}" approved and published to portfolio!`);
        setProperties((prev) => prev.filter((p) => p.id !== property.id));
        if (selectedProperty?.id === property.id) {
          setSelectedProperty(null);
        }
      } else {
        toast.error("Failed to approve property", { description: res.error });
      }
    });
  };

  const handleRejectConfirm = () => {
    if (!rejectModalProperty) return;
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejecting this listing.");
      return;
    }

    const propId = rejectModalProperty.id;
    startTransition(async () => {
      const res = await rejectProperty(propId, rejectionReason);
      if (res.success) {
        toast.info(`Listing rejected. Feedback sent to seller.`);
        setProperties((prev) => prev.filter((p) => p.id !== propId));
        setRejectModalProperty(null);
        setRejectionReason("");
        if (selectedProperty?.id === propId) {
          setSelectedProperty(null);
        }
      } else {
        toast.error("Failed to reject property", { description: res.error });
      }
    });
  };

  const REJECTION_PRESETS = [
    "High-resolution photos required. Current images do not meet luxury presentation standards.",
    "Title / description contains formatting errors or non-standard characters.",
    "Property address could not be verified in official land registry archives.",
    "Price valuation requires verification documentation from licensed appraiser.",
  ];

  return (
    <div className="space-y-6">
      {properties.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-zinc-200/90 p-8 shadow-xs max-w-xl mx-auto">
          <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <ShieldCheck className="size-8" />
          </div>
          <h3 className="font-heading text-xl font-bold text-zinc-950 mb-1">
            Queue is Clear!
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            All submitted luxury residences have been reviewed and published. Newly submitted seller listings will appear here automatically.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/properties"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition"
            >
              <Building2 className="size-4" />
              <span>Browse All Live Properties</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Listing Details</th>
                <th className="py-4 px-5">Seller Contact</th>
                <th className="py-4 px-5">Price & Intent</th>
                <th className="py-4 px-5">Specs</th>
                <th className="py-4 px-5">Submitted</th>
                <th className="py-4 px-5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {properties.map((prop) => {
                const coverImage = prop.images && prop.images.length > 0 ? prop.images[0] : "/assets/house.png";
                const formattedPrice = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: prop.currency || "USD",
                  maximumFractionDigits: 0,
                }).format(prop.price);

                const submittedDate = new Date(prop.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={prop.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative size-14 rounded-xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                          <Image
                            src={coverImage}
                            alt={prop.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-zinc-950 text-xs truncate">
                            {prop.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{prop.city}, {prop.state}</span>
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                            {prop.propertyType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Seller details */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-zinc-950 text-xs flex items-center gap-1">
                        <span>{prop.seller?.name || "Anonymous Seller"}</span>
                        {prop.seller?.isVerified && (
                          <ShieldCheck className="size-3 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">{prop.seller?.email}</p>
                      {prop.seller?.phone && (
                        <p className="text-[11px] text-zinc-600 flex items-center gap-1 mt-0.5 font-medium">
                          <Phone className="size-3 text-zinc-400" />
                          <span>{prop.seller.phone}</span>
                        </p>
                      )}
                    </td>

                    {/* Price & Type */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-heading text-sm font-bold text-zinc-950">
                        {formattedPrice}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        {prop.listingType === "FOR_RENT" ? "For Rent" : "For Sale"}
                      </span>
                    </td>

                    {/* Specs */}
                    <td className="py-4 px-5 text-zinc-600 whitespace-nowrap">
                      <div className="font-medium text-xs">
                        {prop.bedrooms} Bed • {prop.bathrooms} Bath
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {prop.areaSqFt?.toLocaleString()} sqft
                      </div>
                    </td>

                    {/* Submitted Date */}
                    <td className="py-4 px-5 text-zinc-500 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="size-3 text-zinc-400" />
                        <span>{submittedDate}</span>
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold uppercase tracking-wider">
                        Awaiting Review
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedProperty(prop);
                            setActivePhotoIndex(0);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                        >
                          <Eye className="size-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleApprove(prop)}
                          disabled={isPending}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                        >
                          <Check className="size-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectModalProperty(prop);
                            setRejectionReason("");
                          }}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <X className="size-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* QUICK PREVIEW DRAWER / SLIDE-OVER */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedProperty(null)}
          />

          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Moderation Preview
                </span>
                <h3 className="font-heading text-lg font-bold text-zinc-950 mt-1 truncate">
                  {selectedProperty.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Showcase */}
              <div className="space-y-3">
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    <Image
                      src={selectedProperty.images[activePhotoIndex]}
                      alt="Property Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      No Images Available
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProperty.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative size-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                          activePhotoIndex === idx ? "border-black scale-95" : "border-transparent opacity-70"
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Primary Specs */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Asking Price</p>
                  <p className="font-heading text-2xl font-extrabold text-zinc-950">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: selectedProperty.currency || "USD",
                      maximumFractionDigits: 0,
                    }).format(selectedProperty.price)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-semibold uppercase">
                    {selectedProperty.listingType === "FOR_RENT" ? "For Rent" : "For Sale"}
                  </span>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">{selectedProperty.propertyType}</p>
                </div>
              </div>

              {/* Spec Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <Bed className="size-4 text-zinc-500 mx-auto mb-1" />
                  <span className="font-bold text-zinc-900 text-sm">{selectedProperty.bedrooms}</span>
                  <p className="text-[10px] text-zinc-500">Beds</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <Bath className="size-4 text-zinc-500 mx-auto mb-1" />
                  <span className="font-bold text-zinc-900 text-sm">{selectedProperty.bathrooms}</span>
                  <p className="text-[10px] text-zinc-500">Baths</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <Maximize2 className="size-4 text-zinc-500 mx-auto mb-1" />
                  <span className="font-bold text-zinc-900 text-sm">{selectedProperty.areaSqFt}</span>
                  <p className="text-[10px] text-zinc-500">SqFt</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <Car className="size-4 text-zinc-500 mx-auto mb-1" />
                  <span className="font-bold text-zinc-900 text-sm">{selectedProperty.garageSpaces}</span>
                  <p className="text-[10px] text-zinc-500">Garage</p>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Location</h4>
                <p className="text-sm text-zinc-800 font-medium flex items-start gap-1.5">
                  <MapPin className="size-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                  </span>
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Narrative</h4>
                <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  {selectedProperty.description}
                </p>
              </div>

              {/* Amenities */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Amenities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProperty.amenities.map((am, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-medium"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Information Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Seller Profile
                  </span>
                  {selectedProperty.seller?.isVerified ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="size-3" /> Verified Member
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0">
                    {selectedProperty.seller?.name ? selectedProperty.seller.name[0] : "S"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedProperty.seller?.name || "Private Seller"}</p>
                    <p className="text-xs text-zinc-400">{selectedProperty.seller?.agencyName || "Independent Seller"}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3 text-zinc-400" />
                    {selectedProperty.seller?.email}
                  </span>
                  {selectedProperty.seller?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3 text-zinc-400" />
                      {selectedProperty.seller.phone}
                    </span>
                  )}
                  {selectedProperty.seller?.whatsappNumber && (
                    <a
                      href={`https://wa.me/${selectedProperty.seller.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      className="flex items-center gap-1 text-[#25D366] hover:underline font-semibold"
                    >
                      <MessageCircle className="size-3" />
                      <span>WhatsApp Direct</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModalProperty(selectedProperty);
                  setRejectionReason("");
                }}
                disabled={isPending}
                className="px-5 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
              >
                Reject Listing
              </button>

              <button
                onClick={() => handleApprove(selectedProperty)}
                disabled={isPending}
                className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Check className="size-4" />
                <span>Approve & Publish Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setRejectModalProperty(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 px-2 py-0.5 rounded-md bg-red-50 border border-red-200">
                  Reject Listing
                </span>
                <h3 className="font-heading text-xl font-bold text-zinc-950 mt-1">
                  Reason for Rejection
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-sm">
                  {rejectModalProperty.title}
                </p>
              </div>
              <button
                onClick={() => setRejectModalProperty(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Provide actionable feedback for the seller explaining why this property cannot be approved at this time. The seller can edit and resubmit their listing.
            </p>

            {/* Quick preset buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                Quick Preset Feedback
              </span>
              <div className="space-y-1">
                {REJECTION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="w-full text-left p-2 rounded-xl border border-zinc-200 text-[11px] text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Custom Feedback Message:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Explain what needs to be corrected before approval..."
                className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalProperty(null)}
                className="px-4 py-2 rounded-full text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={isPending || !rejectionReason.trim()}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                Send Rejection Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
