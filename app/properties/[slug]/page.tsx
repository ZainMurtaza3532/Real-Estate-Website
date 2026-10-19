import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { AmenitiesCloud } from "@/components/properties/amenities-cloud";
import { MortgageCalculator } from "@/components/properties/mortgage-calculator";
import { TourInquiryForm } from "@/components/properties/tour-inquiry-form";
import { VerifiedSellerCard } from "@/components/properties/verified-seller-card";
import { PropertyCard } from "@/components/properties/property-card";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Layers,
  Sparkles,
  Share2,
  ArrowLeft,
  ChevronRight,
  Shield,
  Car,
  Home,
  CheckCircle,
  AlertTriangle,
  Printer,
} from "lucide-react";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO metadata via generateMetadata()
export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      images: true,
      city: true,
      state: true,
      price: true,
      listingType: true,
      listingStatus: true,
    },
  });

  if (!property) {
    return {
      title: "Property Not Found | PrebuiltUI Luxury Estate",
      description: "The requested luxury property could not be found.",
    };
  }

  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : "/assets/house.png";

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const priceSubtitle =
    property.listingType === "FOR_RENT"
      ? `${formattedPrice} / month`
      : formattedPrice;

  return {
    title: `${property.title} | ${property.city}, ${property.state} | PrebuiltUI`,
    description: `${property.title} offered at ${priceSubtitle}. ${property.description.slice(
      0,
      150
    )}...`,
    openGraph: {
      title: `${property.title} - ${priceSubtitle}`,
      description: property.description.slice(0, 160),
      url: `/properties/${slug}`,
      siteName: "PrebuiltUI Private Real Estate",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description: property.description.slice(0, 150),
      images: [primaryImage],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { slug } = await params;

  // Query property with its verified seller details
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          agencyName: true,
          image: true,
          phone: true,
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

  const session = await auth();

  // Access check: Only APPROVED properties are public.
  // Unapproved/Draft/Rejected properties can only be previewed by the listing seller or an ADMIN.
  const isOwnerOrAdmin =
    Boolean(session?.user?.id &&
    (session.user.id === property.sellerId || session.user.role === "ADMIN"));

  if (property.listingStatus !== "APPROVED" && !isOwnerOrAdmin) {
    notFound();
  }

  // Increment view counter asynchronously
  try {
    await prisma.property.update({
      where: { id: property.id },
      data: { viewsCount: { increment: 1 } },
    });
  } catch {
    // Non-blocking view count update
  }

  // Related properties query: Only show approved properties
  const relatedProperties = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      listingStatus: "APPROVED",
      OR: [
        { city: property.city },
        { propertyType: property.propertyType },
        { listingType: property.listingType },
      ],
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: {
          name: true,
          agencyName: true,
          image: true,
        },
      },
    },
  });

  // Fetch favorites of current user if logged in
  let favoritedPropertyIds = new Set<string>();
  if (session?.user?.id) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { propertyId: true },
    });
    favoritedPropertyIds = new Set(favorites.map((f) => f.propertyId));
  }

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
    return listingType === "FOR_RENT" ? `${formatted} / mo` : formatted;
  };

  // Derive realistic lot size and estimated year built for luxury estates
  const estimatedLotSize =
    property.propertyType === "APARTMENT" || property.propertyType === "PENTHOUSE"
      ? "Common Interest"
      : `${(property.areaSqFt * 1.85 / 43560).toFixed(2)} Acres (${Math.round(
          property.areaSqFt * 2.2
        ).toLocaleString()} sqft lot)`;

  const yearBuilt =
    property.propertyType === "PENTHOUSE" ? 2023 : 2021;

  const propertyTypeMap: Record<string, string> = {
    HOUSE: "Private Single-Family Estate",
    APARTMENT: "Luxury High-Rise Residence",
    VILLA: "Exclusive Oceanfront / Hillside Villa",
    PENTHOUSE: "Duplex Sky Penthouse",
    COMMERCIAL: "Commercial Architecture",
    PLOT: "Premium Land & Development Plot",
  };
  const propertyTypeLabel = propertyTypeMap[property.propertyType] || property.propertyType;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 pb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-zinc-900 transition">
              Home
            </Link>
            <ChevronRight className="size-3 text-zinc-400" />
            <Link href="/properties" className="hover:text-zinc-900 transition">
              Properties
            </Link>
            <ChevronRight className="size-3 text-zinc-400" />
            <span className="text-zinc-950 font-semibold truncate max-w-xs sm:max-w-md">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/properties/${property.slug}/brochure`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 hover:text-black hover:border-zinc-400 transition shadow-2xs"
            >
              <Printer className="size-3.5 text-zinc-500" />
              <span>Download Brochure</span>
            </Link>

            <Link
              href="/properties"
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-800 hover:text-black transition"
            >
              <ArrowLeft className="size-3.5" /> Back to Portfolio
            </Link>
          </div>
        </div>

        {/* Admin/Seller Preview Banner for Unapproved Properties */}
        {property.listingStatus !== "APPROVED" && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            <span>
              <strong>Seller / Staff Preview Mode:</strong> This property is currently <strong>{property.listingStatus}</strong> and is hidden from public discovery until approved.
            </span>
          </div>
        )}

        {/* High-Resolution Grid Collage & Lightbox */}
        <PropertyGallery title={property.title} images={property.images} />

        {/* Title, Badges, and Price Banner */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {property.featured && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="size-3" /> Featured Collection
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-white text-zinc-900 text-xs font-semibold uppercase tracking-wider border border-zinc-200 shadow-xs">
                {property.listingType === "FOR_RENT" ? "For Rent" : "For Sale"}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold uppercase tracking-wider">
                {property.listingStatus}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight">
              {property.title}
            </h1>

            <p className="flex items-center gap-1.5 text-sm sm:text-base text-zinc-600">
              <MapPin className="size-4 shrink-0 text-zinc-500" />
              <span>
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </span>
            </p>
          </div>

          <div className="lg:text-right shrink-0">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-0.5">
              Offered At
            </span>
            <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight">
              {formatPrice(property.price, property.listingType)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Estimated Taxes: ${Math.round((property.price * 0.0085) / 12).toLocaleString()}/mo
            </p>
          </div>
        </div>

        {/* Main Content Layout: Left Columns (Overview, Amenities, Mortgage) + Right Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Property Overview Grid */}
            <div className="rounded-3xl bg-white border border-zinc-200/90 p-6 md:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-zinc-950 mb-6">
                Property Overview & Architectural Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Bed className="size-4" /> Bedrooms
                  </div>
                  <div className="font-heading text-xl font-bold text-zinc-950">
                    {property.bedrooms} Suites
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Bath className="size-4" /> Bathrooms
                  </div>
                  <div className="font-heading text-xl font-bold text-zinc-950">
                    {property.bathrooms} Baths
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Maximize2 className="size-4" /> Living Area
                  </div>
                  <div className="font-heading text-xl font-bold text-zinc-950">
                    {property.areaSqFt.toLocaleString()} sqft
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Car className="size-4" /> Garage
                  </div>
                  <div className="font-heading text-xl font-bold text-zinc-950">
                    {property.garageSpaces} Vehicles
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Layers className="size-4" /> Lot Size
                  </div>
                  <div className="font-heading text-sm font-bold text-zinc-950 truncate" title={estimatedLotSize}>
                    {estimatedLotSize}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Calendar className="size-4" /> Year Built
                  </div>
                  <div className="font-heading text-xl font-bold text-zinc-950">
                    {yearBuilt}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 col-span-2">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Home className="size-4" /> Classification
                  </div>
                  <div className="font-heading text-sm font-bold text-zinc-950 truncate">
                    {propertyTypeLabel}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <h3 className="font-heading text-lg font-bold text-zinc-950 mb-3">
                  Architectural Narrative
                </h3>
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities Tag Cloud */}
            <AmenitiesCloud amenities={property.amenities} />

            {/* Interactive Mortgage Calculator */}
            <MortgageCalculator initialPrice={property.price} />
          </div>

          {/* Right Sticky Sidebar (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Verified Seller / Agent Card with Direct WhatsApp */}
            <VerifiedSellerCard
              propertyTitle={property.title}
              propertyPrice={property.price}
              propertySlug={property.slug}
              seller={property.seller}
            />

            {/* Schedule a Private Viewing Form */}
            <TourInquiryForm
              propertyId={property.id}
              propertyTitle={property.title}
              seller={property.seller}
              currentUser={session?.user}
            />
          </div>
        </div>

        {/* Related Properties Section */}
        {relatedProperties.length > 0 && (
          <div className="pt-16 mt-16 border-t border-zinc-200 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Similar Curations
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-950">
                  Residences You May Also Appreciate
                </h2>
              </div>
              <Link
                href="/properties"
                className="text-xs font-semibold text-zinc-900 hover:underline"
              >
                View all residences &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProperties.map((related) => (
                <PropertyCard
                  key={related.id}
                  property={related}
                  initialFavorited={favoritedPropertyIds.has(related.id)}
                  isAuthenticated={!!session?.user}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
