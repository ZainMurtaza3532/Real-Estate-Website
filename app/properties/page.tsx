import React, { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, PropertyType, ListingType } from "@prisma/client";
import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFilters } from "@/components/properties/property-filters";
import { PropertyEmptyState } from "@/components/properties/property-empty-state";
import { PropertiesViewContainer } from "@/components/properties/properties-view-container";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Luxury Residences & Estates | PrebuiltUI Portfolio",
  description:
    "Explore our collection of premier estates, sky penthouses, and architectural trophies across Beverly Hills, Manhattan, Miami, and Aspen.",
};

interface PropertiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const listing = typeof params.listing === "string" ? params.listing : undefined;
  const minPrice = typeof params.minPrice === "string" ? params.minPrice : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? params.maxPrice : undefined;
  const beds = typeof params.beds === "string" ? params.beds : undefined;
  const baths = typeof params.baths === "string" ? params.baths : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";

  // Build Prisma Query: Strictly only APPROVED listings are shown publicly
  const where: Prisma.PropertyWhereInput = {
    listingStatus: "APPROVED",
  };

  if (search && search.trim() !== "") {
    const q = search.trim();
    where.AND = [
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
          { state: { contains: q, mode: "insensitive" } },
          { zipCode: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
  }

  if (type && ["HOUSE", "APARTMENT", "VILLA", "PENTHOUSE", "COMMERCIAL", "PLOT"].includes(type)) {
    where.propertyType = type as PropertyType;
  }

  if (listing && ["FOR_SALE", "FOR_RENT"].includes(listing)) {
    where.listingType = listing as ListingType;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice && !isNaN(Number(minPrice))) {
      where.price.gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.price.lte = Number(maxPrice);
    }
  }

  if (beds && !isNaN(Number(beds))) {
    where.bedrooms = { gte: Number(beds) };
  }

  if (baths && !isNaN(Number(baths))) {
    where.bathrooms = { gte: Number(baths) };
  }

  // Sorting
  let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" };
  }

  // Fetch properties and user session in parallel
  const [session, properties] = await Promise.all([
    auth(),
    prisma.property.findMany({
      where,
      orderBy,
      include: {
        seller: {
          select: {
            name: true,
            agencyName: true,
            image: true,
          },
        },
      },
    }),
  ]);

  // Fetch user favorites if authenticated
  let favoritedPropertyIds = new Set<string>();
  if (session?.user?.id) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { propertyId: true },
    });
    favoritedPropertyIds = new Set(favorites.map((f) => f.propertyId));
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-950 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-zinc-400" />
          <span className="text-zinc-950 font-semibold">Properties</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950">
              Luxury Residences
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Discover private architectural sanctuaries, oceanfront compounds, and skyline penthouses curated for discerning collectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 shadow-xs">
              <span className="text-zinc-950 font-bold">{properties.length}</span>{" "}
              {properties.length === 1 ? "Residence Available" : "Residences Available"}
            </div>
          </div>
        </div>

        {/* View Container: Supports Grid View, Split Map View, and Full Interactive Map */}
        <PropertiesViewContainer
          properties={properties}
          favoritedPropertyIds={Array.from(favoritedPropertyIds)}
          isAuthenticated={!!session?.user}
          filterSidebar={
            <Suspense fallback={<div className="w-72 h-96 bg-zinc-100 rounded-2xl animate-pulse" />}>
              <PropertyFilters />
            </Suspense>
          }
        />
      </div>
    </div>
  );
}
