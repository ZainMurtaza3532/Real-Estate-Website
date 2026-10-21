"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Car,
  Sparkles,
  Scale,
} from "lucide-react";
import { toggleFavorite } from "@/actions/favorites";
import { useCompare } from "@/components/compare/compare-context";

export interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    propertyType: "HOUSE" | "APARTMENT" | "VILLA" | "PENTHOUSE" | "COMMERCIAL" | "PLOT" | string;
    listingType: "FOR_SALE" | "FOR_RENT" | string;
    status?: "AVAILABLE" | "PENDING" | "SOLD" | string;
    listingStatus?: string;
    bedrooms: number;
    bathrooms: number;
    areaSqFt: number;
    garage?: number;
    garageSpaces?: number;
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
    } | null;
    agent?: {
      name: string | null;
      agencyName: string | null;
      image: string | null;
    } | null;
  };
  initialFavorited?: boolean;
  isAuthenticated?: boolean;
}

export function PropertyCard({
  property,
  initialFavorited = false,
  isAuthenticated = false,
}: PropertyCardProps) {
  const router = useRouter();
  const { toggleCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(property.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const [showAuthNotice, setShowAuthNotice] = useState(false);

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["/assets/house.png"];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthNotice(true);
      setTimeout(() => setShowAuthNotice(false), 3000);
      return;
    }

    // Optimistic toggle
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    startTransition(async () => {
      const res = await toggleFavorite(property.id);
      if (!res.success) {
        // Rollback on failure
        setIsFavorited(!nextState);
        if (res.error === "UNAUTHENTICATED") {
          router.push(`/login?callbackUrl=/properties`);
        }
      }
    });
  };

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

    return listingType === "FOR_RENT" ? `${formatted} / mo` : formatted;
  };

  const propertyTypeLabel = {
    HOUSE: "Private Estate",
    APARTMENT: "Luxury Apartment",
    VILLA: "Exclusive Villa",
    PENTHOUSE: "Sky Penthouse",
  }[property.propertyType] || property.propertyType;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-xl hover:border-zinc-300 transition-all duration-300 overflow-hidden">
      {/* Auth notification tooltip */}
      {showAuthNotice && (
        <div className="absolute top-14 right-4 z-30 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs shadow-lg animate-in fade-in slide-in-from-top-1">
          <p className="font-medium">Please sign in to save</p>
          <button
            onClick={() => router.push(`/login?callbackUrl=/properties`)}
            className="text-zinc-300 underline hover:text-white mt-0.5 text-[11px]"
          >
            Go to Login &rarr;
          </button>
        </div>
      )}

      {/* Media Carousel */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        <Link href={`/properties/${property.slug}`} className="block relative h-full w-full">
          <Image
            src={images[currentImageIndex]}
            alt={`${property.title} - ${propertyTypeLabel} in ${property.city}, ${property.state}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={property.featured}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </Link>

        {/* Carousel controls - only if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md backdrop-blur-xs cursor-pointer z-10"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md backdrop-blur-xs cursor-pointer z-10"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentImageIndex
                      ? "w-4 h-1.5 bg-white shadow-xs"
                      : "w-1.5 h-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10 pointer-events-none">
          {property.featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/90 text-white text-[11px] font-semibold tracking-wide uppercase backdrop-blur-md border border-white/10 shadow-xs">
              <Sparkles className="size-3" /> Featured
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-white/95 text-zinc-900 text-[11px] font-semibold tracking-wide uppercase shadow-xs">
            {property.listingType === "FOR_RENT" ? "For Rent" : "For Sale"}
          </span>
          {property.status !== "AVAILABLE" && (
            <span className="px-2.5 py-1 rounded-full bg-zinc-900/90 text-zinc-200 text-[11px] font-semibold tracking-wide uppercase shadow-xs">
              {property.status}
            </span>
          )}
        </div>

        {/* Compare & Favorite Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare({
                id: property.id,
                title: property.title,
                slug: property.slug,
                price: property.price,
                image: images[0],
                city: property.city,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                areaSqFt: property.areaSqFt,
              });
            }}
            title={inCompare ? "Remove from comparison" : "Add to comparison"}
            aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
            className={`size-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-md cursor-pointer ${
              inCompare
                ? "bg-amber-400 text-zinc-950 scale-105 shadow-amber-500/20"
                : "bg-white/80 hover:bg-white text-zinc-700 hover:text-zinc-950 hover:scale-105"
            }`}
          >
            <Scale className={`size-4 ${inCompare ? "stroke-[2.5]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isPending}
            aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
            className={`size-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-md cursor-pointer ${
              isFavorited
                ? "bg-white text-red-600 scale-105"
                : "bg-white/80 hover:bg-white text-zinc-700 hover:text-zinc-950 hover:scale-105"
            }`}
          >
            <Heart
              className={`size-4.5 transition-transform ${
                isFavorited ? "fill-red-600 stroke-red-600 scale-110" : ""
              }`}
            />
          </button>
        </div>

        {/* Bottom Property Type Pill */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className="text-[11px] font-medium text-white/90 drop-shadow-sm">
            {propertyTypeLabel}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="flex flex-col flex-1 p-5">
        {/* Price & Status */}
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <p className="font-heading text-2xl font-bold tracking-tight text-zinc-950">
            {formatPrice(property.price, property.listingType)}
          </p>
        </div>

        {/* Title */}
        <Link href={`/properties/${property.slug}`}>
          <h3 className="font-heading text-lg font-semibold text-zinc-900 line-clamp-1 group-hover:text-black hover:underline transition-colors mb-1.5">
            {property.title}
          </h3>
        </Link>

        {/* Address */}
        <p className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 line-clamp-1">
          <MapPin className="size-3.5 shrink-0 text-zinc-400" />
          <span>
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </span>
        </p>

        {/* Specs Chips */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-700 font-medium mt-auto">
          <div className="flex items-center gap-1.5">
            <Bed className="size-3.5 text-zinc-400" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="size-3.5 text-zinc-400" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="size-3.5 text-zinc-400" />
            <span>{property.areaSqFt.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Additional info footer */}
        <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            {(property.garageSpaces ?? property.garage ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Car className="size-3" /> {property.garageSpaces ?? property.garage} Garage
              </span>
            )}
          </div>
          <Link
            href={`/properties/${property.slug}`}
            className="text-[11px] font-semibold text-zinc-900 hover:underline"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
