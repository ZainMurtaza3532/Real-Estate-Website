"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  ExternalLink,
  MapPin,
  Eye,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Bed,
  Bath,
  Maximize2,
  Car,
  Clock,
  PlusCircle,
  LayoutGrid,
  List,
  AlertTriangle,
  Pencil,
  X,
  Loader2,
} from "lucide-react";
import {
  updateSellerListingStatus,
  deleteSellerProperty,
  updateSellerPropertyDetails,
} from "@/actions/seller";
import { ListingStatus } from "@prisma/client";

export interface SellerPropertyItem {
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
  garageSpaces: number;
  city: string;
  state: string;
  address: string;
  images: string[];
  viewsCount: number;
  rejectionReason: string | null;
  createdAt: Date | string;
  _count?: {
    inquiries: number;
    favorites: number;
  };
}

interface SellerPropertiesViewProps {
  initialProperties: SellerPropertyItem[];
}

export function SellerPropertiesView({ initialProperties }: SellerPropertiesViewProps) {
  const [properties, setProperties] = useState<SellerPropertyItem[]>(initialProperties);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteModalProperty, setDeleteModalProperty] = useState<SellerPropertyItem | null>(null);
  const [editModalProperty, setEditModalProperty] = useState<SellerPropertyItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    areaSqFt: 0,
    garageSpaces: 0,
    city: "",
    state: "",
    address: "",
  });
  const [isPending, startTransition] = useTransition();

  const handleOpenEdit = (property: SellerPropertyItem) => {
    setEditModalProperty(property);
    setEditFormData({
      title: property.title,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSqFt: property.areaSqFt,
      garageSpaces: property.garageSpaces || 0,
      city: property.city,
      state: property.state,
      address: property.address,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalProperty) return;

    startTransition(async () => {
      const res = await updateSellerPropertyDetails({
        propertyId: editModalProperty.id,
        title: editFormData.title,
        price: editFormData.price,
        bedrooms: editFormData.bedrooms,
        bathrooms: editFormData.bathrooms,
        areaSqFt: editFormData.areaSqFt,
        garageSpaces: editFormData.garageSpaces,
        city: editFormData.city,
        state: editFormData.state,
        address: editFormData.address,
      });

      if (res.success) {
        toast.success("Listing details updated successfully!");
        setProperties((prev) =>
          prev.map((p) =>
            p.id === editModalProperty.id
              ? {
                  ...p,
                  title: editFormData.title,
                  price: editFormData.price,
                  bedrooms: editFormData.bedrooms,
                  bathrooms: editFormData.bathrooms,
                  areaSqFt: editFormData.areaSqFt,
                  garageSpaces: editFormData.garageSpaces,
                  city: editFormData.city,
                  state: editFormData.state,
                  address: editFormData.address,
                  listingStatus:
                    p.listingStatus === "REJECTED" ? "PENDING_APPROVAL" : p.listingStatus,
                }
              : p
          )
        );
        setEditModalProperty(null);
      } else {
        toast.error("Failed to update listing", { description: res.error });
      }
    });
  };

  const filtered = properties.filter((prop) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "APPROVED") return prop.listingStatus === "APPROVED";
    if (statusFilter === "PENDING_APPROVAL") return prop.listingStatus === "PENDING_APPROVAL";
    if (statusFilter === "SOLD") return prop.listingStatus === "SOLD";
    if (statusFilter === "REJECTED") return prop.listingStatus === "REJECTED";
    if (statusFilter === "DRAFT") return prop.listingStatus === "DRAFT";
    return true;
  });

  // Action: Pause / Resume Listing
  const handleTogglePause = (property: SellerPropertyItem) => {
    const isPaused = property.listingStatus === "DRAFT";
    const targetStatus = isPaused ? "PENDING_APPROVAL" : "DRAFT";

    setProperties((prev) =>
      prev.map((p) => (p.id === property.id ? { ...p, listingStatus: targetStatus } : p))
    );

    startTransition(async () => {
      const res = await updateSellerListingStatus(property.id, targetStatus);
      if (res.success) {
        toast.success(
          isPaused
            ? `"${property.title}" submitted to review queue!`
            : `"${property.title}" paused. Hidden from public discovery.`
        );
      } else {
        toast.error("Failed to update status", { description: res.error });
        setProperties(initialProperties);
      }
    });
  };

  // Action: Mark as Sold
  const handleMarkAsSold = (property: SellerPropertyItem) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === property.id ? { ...p, listingStatus: "SOLD" } : p))
    );

    startTransition(async () => {
      const res = await updateSellerListingStatus(property.id, "SOLD");
      if (res.success) {
        toast.success(`Congratulations! "${property.title}" marked as SOLD.`);
      } else {
        toast.error("Failed to mark as sold", { description: res.error });
        setProperties(initialProperties);
      }
    });
  };

  // Action: Delete
  const handleDeleteConfirm = () => {
    if (!deleteModalProperty) return;
    const propId = deleteModalProperty.id;

    startTransition(async () => {
      const res = await deleteSellerProperty(propId);
      if (res.success) {
        toast.success("Listing removed from your portfolio.");
        setProperties((prev) => prev.filter((p) => p.id !== propId));
        setDeleteModalProperty(null);
      } else {
        toast.error("Failed to delete listing", { description: res.error });
      }
    });
  };

  // Status Badge Component
  const renderStatusBadge = (status: ListingStatus, rejectionReason?: string | null) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live / Approved
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="size-3 text-amber-600" />
            Under Review
          </span>
        );
      case "REJECTED":
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
              <AlertCircle className="size-3 text-red-600" />
              Rejected
            </span>
            {rejectionReason && (
              <p className="text-[11px] text-red-700 bg-red-50/80 p-2 rounded-xl border border-red-100 max-w-xs leading-tight">
                <strong>Feedback:</strong> {rejectionReason}
              </p>
            )}
          </div>
        );
      case "SOLD":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-300">
            <CheckCircle2 className="size-3 text-zinc-500" />
            Sold
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <PauseCircle className="size-3 text-zinc-500" />
            Paused / Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Status Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Properties" },
            { id: "APPROVED", label: "Live / Approved" },
            { id: "PENDING_APPROVAL", label: "Under Review" },
            { id: "SOLD", label: "Sold" },
            { id: "DRAFT", label: "Paused" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                statusFilter === tab.id
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Toggle (Grid vs Table) */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-zinc-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewMode === "grid"
                ? "bg-white text-zinc-950 shadow-2xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewMode === "table"
                ? "bg-white text-zinc-950 shadow-2xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            title="Compact Table View"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-zinc-200 p-8 max-w-lg mx-auto shadow-xs">
          <div className="size-16 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <Building2 className="size-8" />
          </div>
          <h3 className="font-heading text-xl font-bold text-zinc-950 mb-1">
            No Properties Found
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto mb-6">
            {statusFilter === "ALL"
              ? "You haven't listed any luxury residences yet. Publish your premier architectural property to start reaching qualified buyers."
              : `No properties matching status "${statusFilter}".`}
          </p>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
          >
            <PlusCircle className="size-4" />
            <span>List Your First Property</span>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prop) => {
            const coverImage = prop.images && prop.images.length > 0 ? prop.images[0] : "/assets/house.png";
            const formattedPrice = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: prop.currency || "USD",
              maximumFractionDigits: 0,
            }).format(prop.price);

            const isApproved = prop.listingStatus === "APPROVED";
            const isPaused = prop.listingStatus === "DRAFT";

            return (
              <div
                key={prop.id}
                className="rounded-3xl bg-white border border-zinc-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Photo & Top Overlay */}
                <div className="relative aspect-16/10 bg-zinc-100 overflow-hidden">
                  <Image src={coverImage} alt={prop.title} fill className="object-cover" />
                  <div className="absolute top-3 left-3">
                    {renderStatusBadge(prop.listingStatus, prop.rejectionReason)}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                    <Eye className="size-3 text-zinc-300" />
                    <span>{prop.viewsCount || 0} Views</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span className="uppercase font-bold tracking-wider text-[10px]">
                        {prop.propertyType} • {prop.listingType === "FOR_RENT" ? "Rent" : "Sale"}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-700 font-semibold">
                        <MessageSquare className="size-3 text-zinc-400" />
                        {prop._count?.inquiries || 0} Inquiries
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-zinc-950 truncate">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="size-3.5 text-zinc-400 shrink-0" />
                      <span>{prop.address}, {prop.city}</span>
                    </p>

                    <div className="font-heading text-xl font-extrabold text-zinc-950 mt-3">
                      {formattedPrice}
                    </div>

                    {/* Specs summary */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Bed className="size-3.5 text-zinc-400" /> {prop.bedrooms} Bed
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="size-3.5 text-zinc-400" /> {prop.bathrooms} Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="size-3.5 text-zinc-400" /> {prop.areaSqFt} sqft
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Pause / Resume */}
                      <button
                        onClick={() => handleTogglePause(prop)}
                        disabled={isPending || prop.listingStatus === "SOLD"}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                          isPaused
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }`}
                        title={isPaused ? "Resume & submit for review" : "Pause listing from discovery"}
                      >
                        {isPaused ? <PlayCircle className="size-4" /> : <PauseCircle className="size-4" />}
                      </button>

                      {/* Mark as Sold */}
                      {prop.listingStatus !== "SOLD" && (
                        <button
                          onClick={() => handleMarkAsSold(prop)}
                          disabled={isPending}
                          className="px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                          title="Mark as Sold"
                        >
                          Mark Sold
                        </button>
                      )}

                      {/* Edit Details */}
                      <button
                        onClick={() => handleOpenEdit(prop)}
                        disabled={isPending}
                        className="p-2 rounded-xl text-zinc-600 hover:text-black hover:bg-zinc-100 transition"
                        title="Edit property details"
                      >
                        <Pencil className="size-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteModalProperty(prop)}
                        disabled={isPending}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete listing"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {/* View Live */}
                    <Link
                      href={`/properties/${prop.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition"
                    >
                      <span>View Live</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Residence</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-center">Engagement</th>
                <th className="py-4 px-5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((prop) => {
                const cover = prop.images && prop.images.length > 0 ? prop.images[0] : "/assets/house.png";
                const isPaused = prop.listingStatus === "DRAFT";

                return (
                  <tr key={prop.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Residence details */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-100">
                          <Image src={cover} alt={prop.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <p className="font-semibold text-zinc-950 text-xs truncate">{prop.title}</p>
                          <p className="text-[11px] text-zinc-500 truncate">{prop.city}, {prop.state}</p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-5 whitespace-nowrap font-heading font-bold text-zinc-950 text-sm">
                      ${(prop.price).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {renderStatusBadge(prop.listingStatus, prop.rejectionReason)}
                    </td>

                    {/* Engagement */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 text-zinc-600 font-semibold text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="size-3.5 text-zinc-400" /> {prop.viewsCount || 0}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-3.5 text-zinc-400" /> {prop._count?.inquiries || 0} Leads
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePause(prop)}
                          disabled={isPending || prop.listingStatus === "SOLD"}
                          className="px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
                        >
                          {isPaused ? "Resume" : "Pause"}
                        </button>

                        {prop.listingStatus !== "SOLD" && (
                          <button
                            onClick={() => handleMarkAsSold(prop)}
                            disabled={isPending}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 transition"
                          >
                            Mark Sold
                          </button>
                        )}

                        <Link
                          href={`/properties/${prop.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-black transition"
                          title="View Live Listing"
                        >
                          <ExternalLink className="size-4" />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(prop)}
                          disabled={isPending}
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                          title="Edit Property Details"
                        >
                          <Pencil className="size-4" />
                        </button>

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

      {/* EDIT PROPERTY DETAILS MODAL */}
      {editModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditModalProperty(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
                  <Pencil className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-zinc-950">
                    Edit Property Details
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Update listing specifications and valuation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalProperty(null)}
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Area (SqFt)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editFormData.areaSqFt}
                    onChange={(e) => setEditFormData({ ...editFormData, areaSqFt: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.bedrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bedrooms: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.bathrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bathrooms: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Parking
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.garageSpaces}
                    onChange={(e) => setEditFormData({ ...editFormData, garageSpaces: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditModalProperty(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isPending && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
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
                Delete Property Listing?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-900">{deleteModalProperty.title}</strong>? This action cannot be undone.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
