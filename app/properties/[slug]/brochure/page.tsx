import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrintTriggerButton } from "@/components/properties/print-trigger-button";
import {
  Printer,
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Car,
  Home,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Check,
  Sparkles,
} from "lucide-react";

interface BrochurePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BrochurePageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    select: { title: true, city: true },
  });

  if (!property) return { title: "Brochure Not Found" };

  return {
    title: `Official Property Dossier - ${property.title} | PrebuiltUI Luxury Real Estate`,
    description: `Download or print the executive property brochure for ${property.title}.`,
  };
}

export default async function PropertyBrochurePage({ params }: BrochurePageProps) {
  const { slug } = await params;

  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      seller: {
        select: {
          name: true,
          email: true,
          phone: true,
          agencyName: true,
          image: true,
          whatsappNumber: true,
          isVerified: true,
          createdAt: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const primaryImage = property.images[0] || "/assets/house.png";
  const galleryImages = property.images.slice(1, 5);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const pricePerSqFt =
    property.areaSqFt > 0 ? Math.round(property.price / property.areaSqFt) : 0;

  const sellerName = property.seller?.name || "PrebuiltUI Private Brokerage";
  const agencyName = property.seller?.agencyName || "Luxury Estate Advisors";
  const sellerPhone = property.seller?.phone || property.seller?.whatsappNumber || "+1 (310) 555-0199";
  const sellerEmail = property.seller?.email || "concierge@prebuiltui.com";

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 py-8 px-4 sm:px-6 md:px-8 print:p-0 print:bg-white">
      {/* Top Action Bar (Pinned, Clean, Hidden during print) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 py-3 px-4 sm:px-8 -mx-4 sm:-mx-6 md:-mx-8 mb-8 print:hidden shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            href={`/properties/${property.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-900 transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Property</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-600 truncate max-w-md">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">Official Dossier Preview • {property.title}</span>
          </div>

          <PrintTriggerButton />
        </div>
      </div>

      {/* Printable Brochure Container (Styled like a luxury Sotheby's / Christie's Dossier) */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl print:rounded-none shadow-xl print:shadow-none border border-zinc-200/90 print:border-none p-8 sm:p-12 print:p-6 space-y-10">
        {/* Brand Header */}
        <header className="flex items-center justify-between pb-6 border-b-2 border-zinc-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-2xl tracking-tighter text-zinc-950 uppercase">
                estate
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-zinc-500 border-l border-zinc-300 pl-2">
                Private Client Group
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium tracking-wide mt-0.5">
              Confidential Property Dossier • Ref: {property.id.slice(0, 10).toUpperCase()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 print:bg-transparent px-3 py-1 rounded-full border border-amber-200 print:border-none">
              Exclusive Luxury Portfolio
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">
              Printed on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </header>

        {/* Title, Address, and Price Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-zinc-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <span>{property.propertyType}</span>
              <span>•</span>
              <span>{property.listingType === "FOR_RENT" ? "For Lease" : "For Sale"}</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              {property.title}
            </h1>
            <p className="text-sm text-zinc-600 flex items-center gap-1.5">
              <MapPin className="size-4 text-zinc-400 shrink-0" />
              <span>
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </span>
            </p>
          </div>

          <div className="md:text-right shrink-0">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Offering Price
            </span>
            <p className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-950">
              {formattedPrice}
              {property.listingType === "FOR_RENT" && (
                <span className="text-base font-normal text-zinc-500"> / mo</span>
              )}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              ${pricePerSqFt.toLocaleString()} / Sq. Ft.
            </p>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200"
                >
                  <Image
                    src={img}
                    alt={`${property.title} photo ${idx + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Matrix */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-zinc-950 uppercase tracking-wide border-b border-zinc-200 pb-2">
            Architectural Specifications
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Bedrooms</p>
              <p className="font-heading text-lg font-bold text-zinc-950 mt-0.5">
                {property.bedrooms} Suites
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Bathrooms</p>
              <p className="font-heading text-lg font-bold text-zinc-950 mt-0.5">
                {property.bathrooms} Baths
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Living Area</p>
              <p className="font-heading text-lg font-bold text-zinc-950 mt-0.5">
                {property.areaSqFt.toLocaleString()} sqft
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Garage Capacity</p>
              <p className="font-heading text-lg font-bold text-zinc-950 mt-0.5">
                {property.garageSpaces} Vehicles
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Year Built</p>
              <p className="font-heading text-lg font-bold text-zinc-950 mt-0.5">
                {property.yearBuilt || 2022}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Property Class</p>
              <p className="font-heading text-sm font-bold text-zinc-950 mt-1 truncate">
                {property.propertyType}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 col-span-2">
              <p className="text-zinc-500 uppercase font-semibold text-[10px]">Coordinates</p>
              <p className="font-mono text-xs font-bold text-zinc-950 mt-1">
                {property.latitude ? `${property.latitude.toFixed(4)}° N, ` : "34.0736° N, "}
                {property.longitude ? `${property.longitude.toFixed(4)}° W` : "-118.4004° W"}
              </p>
            </div>
          </div>
        </div>

        {/* Architectural Narrative */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-zinc-950 uppercase tracking-wide border-b border-zinc-200 pb-2">
            Architectural Narrative & Narrative Description
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line text-justify">
            {property.description}
          </p>
        </div>

        {/* Amenities Checklist */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-950 uppercase tracking-wide border-b border-zinc-200 pb-2">
              Curated Amenities & Highlights
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-zinc-800">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                  <Check className="size-3.5 text-emerald-600 stroke-[3] shrink-0" />
                  <span className="font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listing Agent Dossier & Contact */}
        <div className="rounded-2xl bg-zinc-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Private Brokerage Representation
            </span>
            <h3 className="font-heading text-xl font-bold">{sellerName}</h3>
            <p className="text-xs text-zinc-400">{agencyName}</p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-amber-400" />
                <span>{sellerPhone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-amber-400" />
                <span>{sellerEmail}</span>
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-zinc-800 sm:pl-6 space-y-1">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Online Listing URL</p>
            <p className="font-mono text-xs text-amber-300 font-bold">
              estate.com/properties/{property.slug}
            </p>
            <p className="text-[10px] text-zinc-500 pt-1">
              Private viewings arranged strictly by appointment.
            </p>
          </div>
        </div>

        {/* Legal Footer */}
        <footer className="pt-6 border-t border-zinc-200 text-center text-[10px] text-zinc-400 space-y-1">
          <p>
            © {new Date().getFullYear()} PrebuiltUI Luxury Real Estate Inc. All rights reserved. Equal Housing Opportunity.
          </p>
          <p>
            Information deemed reliable but not guaranteed. All measurements and square footage are approximate.
          </p>
        </footer>
      </div>
    </div>
  );
}
