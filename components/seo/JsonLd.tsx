import React from "react";

export interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Enterprise-grade JSON-LD Structured Data injector component.
 * Safely outputs SEO schema markup into the document head/body for Google & search engine crawlers.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Generates RealEstateAgent and Organization structured data for HavenStone Estates.
 */
export function getRealEstateAgentSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenstone.com";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "HavenStone Estates";

  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "Organization"],
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: "HavenStone Realty",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    image: `${siteUrl}/hero-image.png`,
    description:
      "Premier luxury real estate brokerage marketplace specializing in modern architectural estates, sky penthouses, and luxury villas.",
    telephone: "+1-800-555-0199",
    email: "concierge@havenstone.com",
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "9600 Wilshire Boulevard",
      addressLocality: "Beverly Hills",
      addressRegion: "CA",
      postalCode: "90212",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 34.0669,
      longitude: -118.4004,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Beverly Hills" },
      { "@type": "City", name: "Manhattan" },
      { "@type": "City", name: "Miami" },
      { "@type": "City", name: "Aspen" },
      { "@type": "Country", name: "United States" },
    ],
    sameAs: [
      "https://twitter.com/HavenStoneEstates",
      "https://instagram.com/HavenStoneEstates",
      "https://linkedin.com/company/havenstone-estates",
    ],
  };
}

export interface PropertySchemaInput {
  title: string;
  slug: string;
  description: string;
  price: number;
  currency?: string;
  propertyType: string;
  listingType?: string;
  listingStatus?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  yearBuilt?: number | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number | null;
  longitude?: number | null;
  images: string[];
  amenities?: string[];
  createdAt?: Date | string;
  seller?: {
    name?: string | null;
    agencyName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

/**
 * Generates SingleFamilyResidence / Apartment / RealEstateListing Schema markup.
 */
export function getPropertyJsonLd(property: PropertySchemaInput) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenstone.com";
  const propertyUrl = `${siteUrl}/properties/${property.slug}`;

  // Determine schema type based on property classification
  const isApartment =
    property.propertyType === "APARTMENT" || property.propertyType === "PENTHOUSE";
  const schemaType = isApartment ? "Apartment" : "SingleFamilyResidence";

  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : `${siteUrl}/assets/house.png`;

  const fullImages = (property.images && property.images.length > 0 ? property.images : [primaryImage]).map(
    (img) => (img.startsWith("http") ? img : `${siteUrl}${img.startsWith("/") ? "" : "/"}${img}`)
  );

  return {
    "@context": "https://schema.org",
    "@type": [schemaType, "RealEstateListing"],
    "@id": `${propertyUrl}/#residence`,
    name: property.title,
    description: property.description.slice(0, 300),
    url: propertyUrl,
    image: fullImages,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zipCode,
      addressCountry: "US",
    },
    ...(property.latitude && property.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          },
        }
      : {}),
    numberOfRooms: property.bedrooms,
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.areaSqFt,
      unitCode: "FTK", // Square foot unit code
    },
    ...(property.yearBuilt ? { yearBuilt: property.yearBuilt } : {}),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency || "USD",
      availability:
        property.listingStatus === "SOLD"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url: propertyUrl,
      validFrom: property.createdAt
        ? new Date(property.createdAt).toISOString()
        : undefined,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: property.price,
        priceCurrency: property.currency || "USD",
        unitText: property.listingType === "FOR_RENT" ? "MONTH" : undefined,
      },
      seller: {
        "@type": "RealEstateAgent",
        name: property.seller?.name || "HavenStone Private Brokerage",
        telephone: property.seller?.phone || "+1-800-555-0199",
      },
    },
    ...(property.amenities && property.amenities.length > 0
      ? {
          amenityFeature: property.amenities.map((amenity) => ({
            "@type": "LocationFeatureSpecification",
            name: amenity,
            value: true,
          })),
        }
      : {}),
  };
}
