"use client";

import React, { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Star,
  Trash2,
  ExternalLink,
  MapPin,
  Building2,
  CheckCircle,
  Clock,
  Check,
  AlertTriangle,
  X,
  Filter,
} from "lucide-react";
import {
  toggleFeaturedProperty,
  updateAdminPropertyStatus,
  deleteAdminProperty,
} from "@/actions/admin";
import { ListingStatus } from "@prisma/client";

export interface AdminPropertyItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  propertyType: string;
  listingType: string;
  listingStatus: ListingStatus;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  city: string;
  state: string;
  featured: boolean;
  images: string[];
  createdAt: Date | string;
  seller: {
    id: string;
    name: string | null;
    email: string | null;
    agencyName: string | null;
    isVerified: boolean;
  };
  _count?: {
    inquiries: number;
    favorites: number;
  };
}

interface AllPropertiesManagerProps {
  initialProperties: AdminPropertyItem[];
}

export function AllPropertiesManager({ initialProperties }: AllPropertiesManagerProps) {
  const [properties, setProperties] = useState<AdminPropertyItem[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteModalProperty, setDeleteModalProperty] = useState<AdminPropertyItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Search and filter
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prop.title.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        (prop.seller?.name && prop.seller.name.toLowerCase().includes(q)) ||
        (prop.seller?.email && prop.seller.email.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" || prop.listingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [properties, searchQuery, statusFilter]);

  // Toggle Featured
  const handleToggleFeatured = (propertyId: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, featured: nextFeatured } : p))
    );

    startTransition(async () => {
      const res = await toggleFeaturedProperty(propertyId, nextFeatured);
      if (res.success) {
        toast.success(
          nextFeatured
            ? "Property added to Featured Showcase!"
            : "Property removed from Featured Showcase"
        );
      } else {
        toast.error("Failed to update featured flag", { description: res.error });
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, featured: currentFeatured } : p))
        );
      }
    });
  };

  // Status Change (e.g. Mark as Sold, Approved)
  const handleStatusChange = (propertyId: string, newStatus: ListingStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, listingStatus: newStatus } : p))
    );

    startTransition(async () => {
      const res = await updateAdminPropertyStatus(propertyId, newStatus);
      if (res.success) {
        toast.success(`Listing status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status", { description: res.error });
        setProperties(initialProperties);
      }
    });
  };

  // Delete
  const handleDeleteConfirm = () => {
    if (!deleteModalProperty) return;
    const propId = deleteModalProperty.id;

    startTransition(async () => {
      const res = await deleteAdminProperty(propId);
      if (res.success) {
        toast.success("Listing permanently deleted.");
        setProperties((prev) => prev.filter((p) => p.id !== propId));
        setDeleteModalProperty(null);
      } else {
        toast.error("Failed to delete listing", { description: res.error });
      }
    });
  };

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "SOLD":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "REJECTED":
        return "bg-red-50 text-red-800 border-red-200";
      case "DRAFT":
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, seller name, email, or city..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-900 transition"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "APPROVED", "PENDING_APPROVAL", "SOLD", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                statusFilter === st
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200"
              }`}
            >
              {st === "PENDING_APPROVAL" ? "PENDING" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredProperties.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-zinc-200 p-8">
          <Building2 className="size-8 text-zinc-400 mx-auto mb-2" />
          <h4 className="font-heading text-base font-semibold text-zinc-950">No Listings Found</h4>
          <p className="text-xs text-zinc-500 mt-1">
            No properties match your current search query or status filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Property</th>
                <th className="py-4 px-5">Seller</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5 text-center">Featured</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProperties.map((prop) => {
                const cover = prop.images && prop.images.length > 0 ? prop.images[0] : "/assets/house.png";
                const formattedPrice = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: prop.currency || "USD",
                  maximumFractionDigits: 0,
                }).format(prop.price);

                return (
                  <tr key={prop.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative size-14 rounded-xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                          <Image src={cover} alt={prop.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <Link
                            href={`/properties/${prop.slug}`}
                            target="_blank"
                            className="font-semibold text-zinc-950 text-xs hover:underline flex items-center gap-1 group"
                          >
                            <span className="truncate">{prop.title}</span>
                            <ExternalLink className="size-3 text-zinc-400 group-hover:text-zinc-800 shrink-0" />
                          </Link>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{prop.city}, {prop.state}</span>
                          </p>
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold text-zinc-400">
                            {prop.propertyType} • {prop.listingType === "FOR_RENT" ? "Rent" : "Sale"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-semibold text-zinc-950 text-xs">
                        {prop.seller?.name || "Independent"}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate max-w-[150px]">
                        {prop.seller?.email}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-heading text-sm font-bold text-zinc-950">
                        {formattedPrice}
                      </div>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                          prop.featured
                            ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                            : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                        }`}
                        title={prop.featured ? "Featured on Home Hero" : "Click to feature on homepage"}
                      >
                        <Star className={`size-3.5 ${prop.featured ? "fill-white" : ""}`} />
                        <span>{prop.featured ? "Featured" : "Regular"}</span>
                      </button>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <select
                        value={prop.listingStatus}
                        disabled={isPending}
                        onChange={(e) =>
                          handleStatusChange(prop.id, e.target.value as ListingStatus)
                        }
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition ${getStatusBadge(
                          prop.listingStatus
                        )}`}
                      >
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                        <option value="SOLD">SOLD</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {prop.listingStatus !== "SOLD" && (
                          <button
                            onClick={() => handleStatusChange(prop.id, "SOLD")}
                            disabled={isPending}
                            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-[11px] font-semibold transition"
                          >
                            Mark Sold
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteModalProperty(prop)}
                          disabled={isPending}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
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
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteModalProperty(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4">
            <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-zinc-950">
                Permanently Delete Property?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-900">{deleteModalProperty.title}</strong>? This action cannot be undone and will remove all associated media, inquiries, and wishlist saves.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalProperty(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
