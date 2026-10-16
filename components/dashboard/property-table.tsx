"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Trash2,
  ExternalLink,
  Edit,
  Plus,
  AlertTriangle,
  Building2,
  Check,
  CheckCircle,
} from "lucide-react";
import { updatePropertyStatus, deleteProperty } from "@/actions/properties";

export interface PropertyListItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  propertyType: "HOUSE" | "APARTMENT" | "VILLA" | "PENTHOUSE";
  listingType: "FOR_SALE" | "FOR_RENT";
  status: "AVAILABLE" | "PENDING" | "SOLD";
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  city: string;
  state: string;
  images: string[];
  createdAt: Date | string;
  _count?: {
    inquiries: number;
    favorites: number;
  };
}

interface PropertyTableProps {
  initialProperties: PropertyListItem[];
}

export function PropertyTable({ initialProperties }: PropertyTableProps) {
  const [properties, setProperties] = useState<PropertyListItem[]>(initialProperties);
  const [isPending, startTransition] = useTransition();
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const handleStatusChange = (
    propertyId: string,
    status: "AVAILABLE" | "PENDING" | "SOLD"
  ) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status } : p))
    );

    startTransition(async () => {
      const res = await updatePropertyStatus(propertyId, status);
      if (res.success) {
        toast.success(`Property marked as ${status}`);
      } else {
        toast.error("Failed to update status", { description: res.error });
        setProperties(initialProperties);
      }
    });
  };

  const confirmDelete = async (propertyId: string) => {
    startTransition(async () => {
      const res = await deleteProperty(propertyId);
      if (res.success) {
        toast.success("Listing deleted successfully");
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        setDeleteModalId(null);
      } else {
        toast.error("Failed to delete property", { description: res.error });
      }
    });
  };

  const propertyToDelete = properties.find((p) => p.id === deleteModalId);

  if (properties.length === 0) {
    return (
      <div className="py-16 text-center rounded-3xl bg-white border border-zinc-200/90 p-8 shadow-xs max-w-xl mx-auto">
        <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <Building2 className="size-8" />
        </div>
        <h3 className="font-heading text-xl font-bold text-zinc-950 mb-2">
          No Properties In Your Portfolio
        </h3>
        <p className="text-xs text-zinc-500 mb-6 leading-relaxed max-w-md mx-auto">
          You haven&apos;t added any luxury properties yet. Publish your first architectural listing to begin capturing qualified buyer inquiries.
        </p>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
        >
          <Plus className="size-4" />
          Add First Property
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Property</th>
              <th className="py-3.5 px-4">Price / Intent</th>
              <th className="py-3.5 px-4">Specs</th>
              <th className="py-3.5 px-4">Interest</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {properties.map((prop) => {
              const imageSrc =
                prop.images && prop.images.length > 0
                  ? prop.images[0]
                  : "/assets/house.png";

              const formattedPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(prop.price);

              return (
                <tr key={prop.id} className="hover:bg-zinc-50/60 transition-colors">
                  {/* Thumbnail & Title */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative size-14 rounded-xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                        <Image
                          src={imageSrc}
                          alt={prop.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="max-w-xs">
                        <Link
                          href={`/properties/${prop.slug}`}
                          target="_blank"
                          className="font-semibold text-zinc-950 hover:underline flex items-center gap-1 leading-snug"
                        >
                          <span className="truncate">{prop.title}</span>
                          <ExternalLink className="size-3 text-zinc-400 shrink-0" />
                        </Link>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {prop.city}, {prop.state} • {prop.propertyType}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Price & Intent */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-heading font-bold text-sm text-zinc-950">
                      {formattedPrice}
                      {prop.listingType === "FOR_RENT" && (
                        <span className="text-[11px] font-normal text-zinc-500">
                          {" "}
                          / mo
                        </span>
                      )}
                    </div>
                    <span className="inline-block text-[10px] uppercase font-bold text-zinc-500">
                      {prop.listingType === "FOR_RENT" ? "For Rent" : "For Sale"}
                    </span>
                  </td>

                  {/* Specs */}
                  <td className="py-4 px-4 text-zinc-600 whitespace-nowrap">
                    <div className="font-medium">
                      {prop.bedrooms} Bed • {prop.bathrooms} Bath
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {prop.areaSqFt.toLocaleString()} sqft
                    </div>
                  </td>

                  {/* Interest counts */}
                  <td className="py-4 px-4 text-zinc-600 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-semibold">
                        {prop._count?.inquiries || 0} Inquiries
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-semibold">
                        {prop._count?.favorites || 0} Saved
                      </span>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select
                      value={prop.status}
                      disabled={isPending}
                      onChange={(e) =>
                        handleStatusChange(
                          prop.id,
                          e.target.value as "AVAILABLE" | "PENDING" | "SOLD"
                        )
                      }
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition ${
                        prop.status === "AVAILABLE"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                          : prop.status === "PENDING"
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : "bg-zinc-100 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="SOLD">SOLD</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/properties/${prop.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl text-zinc-600 hover:text-black hover:bg-zinc-100 transition"
                        title="View Public Page"
                      >
                        <ExternalLink className="size-4" />
                      </Link>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            prop.id,
                            prop.status === "SOLD" ? "AVAILABLE" : "SOLD"
                          )
                        }
                        className={`p-2 rounded-xl text-xs font-medium transition ${
                          prop.status === "SOLD"
                            ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            : "bg-black text-white hover:bg-zinc-800"
                        }`}
                        title={
                          prop.status === "SOLD"
                            ? "Mark Available"
                            : "Mark as Sold"
                        }
                      >
                        <Check className="size-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteModalId(prop.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Property"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="size-6" />
            </div>

            <div>
              <h4 className="font-heading text-lg font-bold text-zinc-950">
                Delete Listing?
              </h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-zinc-900">
                  {propertyToDelete.title}
                </strong>
                ? This action cannot be undone and will remove all associated
                inquiries and favorites.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => confirmDelete(deleteModalId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
