"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Scale,
  Check,
  Minus,
  Trash2,
  ExternalLink,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Car,
  Home,
  Sparkles,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { useCompare, CompareItem } from "./compare-context";

export interface FullCompareProperty {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  propertyType: string;
  listingType: string;
  listingStatus: string;
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
  amenities: string[];
  featured: boolean;
  seller?: {
    name: string | null;
    agencyName: string | null;
    image: string | null;
    phone: string | null;
    whatsappNumber: string | null;
  } | null;
}

interface CompareMatrixProps {
  initialProperties: FullCompareProperty[];
}

export function CompareMatrix({ initialProperties }: CompareMatrixProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedProperties, removeFromCompare, clearCompare } = useCompare();
  const [properties, setProperties] = useState<FullCompareProperty[]>(initialProperties);
  const [copied, setCopied] = useState(false);

  // If initialProperties was empty but compare drawer has items, sync URL
  useEffect(() => {
    if (initialProperties.length === 0 && selectedProperties.length > 0) {
      const ids = selectedProperties.map((p) => p.id).join(",");
      router.replace(`/compare?ids=${ids}`);
    } else {
      setProperties(initialProperties);
    }
  }, [initialProperties, selectedProperties, router]);

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    const remaining = properties.filter((p) => p.id !== id);
    setProperties(remaining);
    if (remaining.length > 0) {
      router.replace(`/compare?ids=${remaining.map((p) => p.id).join(",")}`);
    } else {
      router.replace("/compare");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs max-w-xl mx-auto">
        <div className="size-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-5">
          <Scale className="size-8 stroke-[1.5]" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-zinc-950 mb-2">
          No Properties Selected for Comparison
        </h2>
        <p className="text-zinc-600 text-sm max-w-md mb-8 leading-relaxed">
          Select up to 4 premier estates from our portfolio by clicking the scale icon on any property card to analyze their specifications side-by-side.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm"
        >
          <ArrowLeft className="size-4" />
          <span>Explore Properties</span>
        </Link>
      </div>
    );
  }

  // Aggregate all unique amenities across selected properties
  const allAmenities = Array.from(
    new Set(properties.flatMap((p) => p.amenities || []))
  ).sort();

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-1">
            Side-by-Side Analysis
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Property Comparison Matrix
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Comparing <strong className="text-zinc-900 font-bold">{properties.length}</strong> luxury residences side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Share2 className="size-3.5 text-zinc-500" />
            <span>{copied ? "Link Copied!" : "Share Comparison"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearCompare();
              setProperties([]);
              router.replace("/compare");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span>Clear Matrix</span>
          </button>
        </div>
      </div>

      {/* Comparison Table Grid */}
      <div className="overflow-x-auto rounded-3xl bg-white border border-zinc-200/90 shadow-md">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="p-6 w-48 sm:w-56 bg-zinc-50/70 text-xs font-bold text-zinc-500 uppercase tracking-wider align-top">
                Residence
              </th>
              {properties.map((property) => (
                <th
                  key={property.id}
                  className="p-6 align-top min-w-[240px] max-w-[280px] border-l border-zinc-100"
                >
                  <div className="space-y-3">
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                      <Image
                        src={property.images[0] || "/assets/house.png"}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemove(property.id)}
                        title="Remove from comparison"
                        className="absolute top-2 right-2 size-7 rounded-full bg-zinc-950/80 hover:bg-red-600 text-white flex items-center justify-center transition shadow-md cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                        {property.propertyType}
                      </span>
                      <h3 className="font-heading text-base font-bold text-zinc-950 mt-1 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 shrink-0 text-zinc-400" />
                        <span>{property.city}, {property.state}</span>
                      </p>
                    </div>

                    <div className="pt-1">
                      <p className="font-heading text-xl font-extrabold text-zinc-950">
                        ${property.price.toLocaleString()}
                        {property.listingType === "FOR_RENT" && (
                          <span className="text-xs font-normal text-zinc-500"> /mo</span>
                        )}
                      </p>
                    </div>

                    <Link
                      href={`/properties/${property.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition"
                    >
                      <span>View Residence</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 text-xs">
            {/* Price per SqFt */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Price / SqFt
              </td>
              {properties.map((p) => {
                const perSqFt = p.areaSqFt > 0 ? Math.round(p.price / p.areaSqFt) : 0;
                return (
                  <td key={p.id} className="p-4 sm:p-5 font-mono font-bold text-zinc-900 border-l border-zinc-100">
                    ${perSqFt.toLocaleString()} / sqft
                  </td>
                );
              })}
            </tr>

            {/* Living Area */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Living Area
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 font-medium text-zinc-900 border-l border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="size-3.5 text-zinc-400" />
                    <span>{p.areaSqFt.toLocaleString()} sqft</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Bedrooms */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Bedrooms
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 font-medium text-zinc-900 border-l border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Bed className="size-3.5 text-zinc-400" />
                    <span>{p.bedrooms} Suites</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Bathrooms
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 font-medium text-zinc-900 border-l border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Bath className="size-3.5 text-zinc-400" />
                    <span>{p.bathrooms} Baths</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Garage Spaces */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Garage Spaces
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 font-medium text-zinc-900 border-l border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Car className="size-3.5 text-zinc-400" />
                    <span>{p.garageSpaces} Vehicles</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Year Built */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Year Built
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 font-medium text-zinc-900 border-l border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-zinc-400" />
                    <span>{p.yearBuilt || 2022}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Classification */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Classification
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 font-medium text-zinc-900 border-l border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Home className="size-3.5 text-zinc-400" />
                    <span>{p.propertyType} ({p.listingType === "FOR_SALE" ? "For Sale" : "For Rent"})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Location & Zip */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Location Details
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 text-zinc-700 border-l border-zinc-100">
                  <p className="font-semibold text-zinc-900">{p.address}</p>
                  <p className="text-[11px] text-zinc-500">{p.city}, {p.state} {p.zipCode}</p>
                </td>
              ))}
            </tr>

            {/* Advisor / Brokerage */}
            <tr className="hover:bg-zinc-50/50 transition">
              <td className="p-4 sm:p-5 font-semibold text-zinc-800 bg-zinc-50/50">
                Listing Advisor
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 sm:p-5 text-zinc-700 border-l border-zinc-100">
                  <p className="font-semibold text-zinc-900">{p.seller?.name || "PrebuiltUI Advisor"}</p>
                  <p className="text-[11px] text-zinc-500">{p.seller?.agencyName || "Luxury Estate Group"}</p>
                </td>
              ))}
            </tr>

            {/* Section Header for Amenities */}
            <tr className="bg-zinc-100/70">
              <td
                colSpan={properties.length + 1}
                className="p-3 px-5 text-[11px] font-bold text-zinc-700 uppercase tracking-wider"
              >
                Amenities & Luxury Features ({allAmenities.length})
              </td>
            </tr>

            {/* Dynamic Amenities Rows */}
            {allAmenities.map((amenity) => (
              <tr key={amenity} className="hover:bg-zinc-50/50 transition">
                <td className="p-3 sm:p-4 font-medium text-zinc-700 bg-zinc-50/50">
                  {amenity}
                </td>
                {properties.map((p) => {
                  const hasAmenity = p.amenities?.some(
                    (a) => a.toLowerCase().trim() === amenity.toLowerCase().trim()
                  );
                  return (
                    <td
                      key={p.id}
                      className="p-3 sm:p-4 text-center border-l border-zinc-100"
                    >
                      {hasAmenity ? (
                        <div className="inline-flex items-center justify-center size-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <Check className="size-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center size-6 rounded-full bg-zinc-100 text-zinc-400">
                          <Minus className="size-3" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
