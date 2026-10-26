"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { LayoutGrid, Columns2, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "./property-card";
import { PropertyEmptyState } from "./property-empty-state";
import { MapPropertyItem } from "./property-map-view";

// Dynamically import PropertyMapView with SSR disabled for Leaflet window safety
const PropertyMapView = dynamic(() => import("./property-map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-3xl bg-zinc-100 border border-zinc-200 animate-pulse flex flex-col items-center justify-center text-zinc-400 gap-2">
      <MapIcon className="size-8 stroke-[1.5] animate-bounce text-zinc-400" />
      <span className="text-xs font-semibold">Initializing Interactive Map...</span>
    </div>
  ),
});

interface PropertiesViewContainerProps {
  properties: any[];
  favoritedPropertyIds: string[];
  isAuthenticated: boolean;
  filterSidebar: React.ReactNode;
}

export function PropertiesViewContainer({
  properties,
  favoritedPropertyIds,
  isAuthenticated,
  filterSidebar,
}: PropertiesViewContainerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "split" | "map">("grid");
  const [visibleMapIds, setVisibleMapIds] = useState<string[] | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const favoritedSet = useMemo(
    () => new Set(favoritedPropertyIds),
    [favoritedPropertyIds]
  );

  // Filter properties based on map bounds if active
  const displayedProperties = useMemo(() => {
    if (viewMode === "grid" || !visibleMapIds) {
      return properties;
    }
    // In split or map mode, show properties currently inside the visible bounding box
    const filtered = properties.filter((p) => visibleMapIds.includes(p.id));
    // If bounding box has 0 matches (e.g. user panned far away), fall back to original so user doesn't see blank page
    return filtered.length > 0 ? filtered : properties;
  }, [properties, visibleMapIds, viewMode]);

  const mapItems: MapPropertyItem[] = useMemo(() => {
    return properties.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      listingType: p.listingType,
      propertyType: p.propertyType,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      areaSqFt: p.areaSqFt,
      city: p.city,
      state: p.state,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      images: p.images || [],
    }));
  }, [properties]);

  return (
    <div className="space-y-6">
      {/* Top View Mode Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
        <p className="text-xs text-zinc-500 font-medium">
          Showing <strong className="text-zinc-950 font-bold">{displayedProperties.length}</strong>{" "}
          of {properties.length} luxury residences
        </p>

        {/* View Switcher Controls */}
        <div className="flex items-center p-1 rounded-xl bg-white border border-zinc-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewMode === "grid"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>Grid View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewMode === "split"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
          >
            <Columns2 className="size-3.5" />
            <span>Split Map</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewMode === "map"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
          >
            <MapIcon className="size-3.5" />
            <span>Full Map</span>
          </button>
        </div>
      </div>

      {/* VIEW MODES */}

      {/* 1. Standard Grid View */}
      {viewMode === "grid" && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {filterSidebar}
          <div className="flex-1 w-full min-w-0">
            {displayedProperties.length === 0 ? (
              <PropertyEmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {displayedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    initialFavorited={favoritedSet.has(property.id)}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Split View (Grid on Left, Sticky Interactive Map on Right) */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Cards Area */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Residences in Visible Region ({displayedProperties.length})
              </span>
            </div>

            {displayedProperties.length === 0 ? (
              <PropertyEmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {displayedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    initialFavorited={favoritedSet.has(property.id)}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sticky Map */}
          <div className="lg:col-span-6 xl:col-span-5 lg:sticky lg:top-28">
            <PropertyMapView
              properties={mapItems}
              onBoundsChange={(ids) => setVisibleMapIds(ids)}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={(id) => setSelectedPropertyId(id)}
            />
          </div>
        </div>
      )}

      {/* 3. Full Map View */}
      {viewMode === "map" && (
        <div className="space-y-6">
          <PropertyMapView
            properties={mapItems}
            onBoundsChange={(ids) => setVisibleMapIds(ids)}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={(id) => setSelectedPropertyId(id)}
          />

          {/* Horizontal scroll of pins below map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-zinc-950">
                Explore All Geocoded Estates
              </h3>
              <span className="text-xs text-zinc-500">
                Scroll horizontally to preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  initialFavorited={favoritedSet.has(property.id)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
