"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { createProperty } from "@/actions/properties";
import {
  Building2,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Car,
  Sparkles,
  Check,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const AMENITY_OPTIONS = [
  "Infinity Pool",
  "Wine Cellar",
  "Home Theater",
  "Spa & Sauna",
  "Smart Home Automation",
  "Private Helipad Access",
  "EV Charging Station",
  "24/7 Security & Concierge",
  "Panoramic Ocean / Skyline Views",
  "Private Elevator",
  "Tennis Court",
  "Outdoor BBQ Kitchen",
  "Ski-in / Ski-out Access",
  "Courtyard Garden",
  "Private Dock / Mooring",
  "Sub-Zero / Gaggenau Appliances",
];

export function PropertyForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "HOUSE" as "HOUSE" | "APARTMENT" | "VILLA" | "PENTHOUSE",
    listingType: "FOR_SALE" as "FOR_SALE" | "FOR_RENT",
    bedrooms: "4",
    bathrooms: "4",
    areaSqFt: "4500",
    garage: "2",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    featured: false,
    amenities: ["Smart Home Automation", "24/7 Security & Concierge"] as string[],
    images: [] as string[],
  });

  const handleAmenityToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== item)
          : [...prev.amenities, item],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error("Images Required", {
        description: "Please upload or add at least one high-resolution property image.",
      });
      return;
    }

    startTransition(async () => {
      const res = await createProperty({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqFt: Number(formData.areaSqFt),
        garage: Number(formData.garage),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        featured: formData.featured,
        amenities: formData.amenities,
        images: formData.images,
      });

      if (res.success) {
        toast.success("Listing Created!", {
          description: `"${formData.title}" has been published to your portfolio.`,
        });
        router.push("/dashboard/properties");
      } else {
        toast.error("Submission Error", {
          description: res.error || "Please review your inputs and try again.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Basic Information */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-zinc-950">
            Primary Identification
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Title, listing intent, and asset classification
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Property Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. The Bel-Air Promontory Estate"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Asking Price ($ USD) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  step={100}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="14500000"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Listing Type *
              </label>
              <select
                value={formData.listingType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    listingType: e.target.value as "FOR_SALE" | "FOR_RENT",
                  }))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
              >
                <option value="FOR_SALE">FOR SALE</option>
                <option value="FOR_RENT">FOR RENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Asset Classification *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    propertyType: e.target.value as
                      | "HOUSE"
                      | "APARTMENT"
                      | "VILLA"
                      | "PENTHOUSE",
                  }))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
              >
                <option value="HOUSE">House / Estate</option>
                <option value="APARTMENT">Luxury Apartment</option>
                <option value="VILLA">Private Villa</option>
                <option value="PENTHOUSE">Sky Penthouse</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Architectural Narrative & Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe the interior finishings, vistas, landscape architecture, and pedigree..."
              className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featured: e.target.checked }))
              }
              className="size-4 rounded accent-black cursor-pointer"
            />
            <label
              htmlFor="featured"
              className="text-xs font-medium text-zinc-800 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5 text-zinc-900" />
              Mark as Featured Luxury Residence (highlighted on homepage & portfolio)
            </label>
          </div>
        </div>
      </div>

      {/* 2. Location & Address */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-zinc-950">
            Location Details
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Geographic address for client maps and regional filtering
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="e.g. 10420 Bellagio Way"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              placeholder="Beverly Hills"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                placeholder="CA"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Zip Code *
              </label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
                }
                placeholder="90210"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Specs & Dimensions */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-zinc-950">
            Property Specifications
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Dimensions and structural accommodations
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Bedrooms *
            </label>
            <input
              type="number"
              required
              min={0}
              value={formData.bedrooms}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bedrooms: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Bathrooms *
            </label>
            <input
              type="number"
              required
              min={1}
              value={formData.bathrooms}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Living Area (sqft) *
            </label>
            <input
              type="number"
              required
              min={100}
              value={formData.areaSqFt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, areaSqFt: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Garage Capacity
            </label>
            <input
              type="number"
              min={0}
              value={formData.garage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, garage: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* 4. Multi-Image Upload (Cloudinary) */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-zinc-950">
            Property Photography Gallery *
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Upload architectural photography delivered via Cloudinary CDN
          </p>
        </div>

        <ImageUpload
          images={formData.images}
          onChange={(newImages) =>
            setFormData((prev) => ({ ...prev, images: newImages }))
          }
        />
      </div>

      {/* 5. Amenities Checkboxes */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-zinc-950">
            Signature Amenities
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select all relevant features included with this residence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITY_OPTIONS.map((item) => {
            const isChecked = formData.amenities.includes(item);
            return (
              <label
                key={item}
                onClick={() => handleAmenityToggle(item)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-medium cursor-pointer transition select-none ${
                  isChecked
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <div
                  className={`size-4 rounded flex items-center justify-center shrink-0 border ${
                    isChecked
                      ? "bg-white text-black border-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="size-3 stroke-[3]" />}
                </div>
                <span className="truncate">{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Submit / Action Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-200">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition"
        >
          <ArrowLeft className="size-3.5" />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-xs font-bold tracking-wide uppercase hover:bg-zinc-800 transition shadow-md cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing Listing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="size-3.5" />
              Publish Property Listing
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
