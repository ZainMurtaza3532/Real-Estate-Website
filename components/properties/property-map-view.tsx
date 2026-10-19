"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ExternalLink,
  Bed,
  Bath,
  Maximize2,
  Layers,
  Crosshair,
  Sparkles,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

export interface MapPropertyItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  listingType: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
}

interface PropertyMapViewProps {
  properties: MapPropertyItem[];
  onBoundsChange?: (filteredIds: string[]) => void;
  selectedPropertyId?: string | null;
  onSelectProperty?: (id: string | null) => void;
}

// Fallback coordinates by city if property latitude/longitude is not populated
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "beverly hills": { lat: 34.0736, lng: -118.4004 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "manhattan": { lat: 40.7831, lng: -73.9712 },
  "new york": { lat: 40.7128, lng: -74.006 },
  "miami": { lat: 25.7617, lng: -80.1918 },
  "miami beach": { lat: 25.7907, lng: -80.13 },
  "austin": { lat: 30.2672, lng: -97.7431 },
  "aspen": { lat: 39.1911, lng: -106.8175 },
  "seattle": { lat: 47.6062, lng: -122.3321 },
  "malibu": { lat: 34.0381, lng: -118.6923 },
};

export default function PropertyMapView({
  properties,
  onBoundsChange,
  selectedPropertyId,
  onSelectProperty,
}: PropertyMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [activeProperty, setActiveProperty] = useState<MapPropertyItem | null>(null);

  // Compute resolved coordinates for every property
  const resolvedProperties = useMemo(() => {
    return properties.map((prop, idx) => {
      let lat = prop.latitude;
      let lng = prop.longitude;

      if (!lat || !lng) {
        const cityKey = (prop.city || "").toLowerCase().trim();
        const fallback = CITY_COORDINATES[cityKey] || { lat: 34.0736, lng: -118.4004 };
        // Add subtle deterministic jitter so identical coordinates don't stack completely
        const jitter = (idx % 5) * 0.004;
        lat = fallback.lat + jitter;
        lng = fallback.lng + jitter;
      }

      return {
        ...prop,
        computedLat: lat,
        computedLng: lng,
      };
    });
  }, [properties]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    let L: any;

    async function initMap() {
      L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: Beverly Hills or average of properties
      const defaultCenter: [number, number] =
        resolvedProperties.length > 0
          ? [resolvedProperties[0].computedLat, resolvedProperties[0].computedLng]
          : [34.0736, -118.4004];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Luxury minimal CartoDB Voyager tiles (clean, architectural look)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      // Add modern zoom control top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      const markersGroup = L.featureGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle bounding-box change
      map.on("moveend", () => {
        if (!isMounted) return;
        const bounds = map.getBounds();
        if (onBoundsChange) {
          const visibleIds = resolvedProperties
            .filter((p) => bounds.contains([p.computedLat, p.computedLng]))
            .map((p) => p.id);
          onBoundsChange(visibleIds);
        }
      });

      renderMarkers(L, map, markersGroup);

      // Fit bounds if we have multiple points
      if (resolvedProperties.length > 1) {
        const bounds = L.latLngBounds(
          resolvedProperties.map((p) => [p.computedLat, p.computedLng])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [resolvedProperties]);

  const renderMarkers = (L: any, map: any, markersGroup: any) => {
    markersGroup.clearLayers();

    resolvedProperties.forEach((property) => {
      const isSelected = selectedPropertyId === property.id;
      const formattedPrice =
        property.price >= 1_000_000
          ? `$${(property.price / 1_000_000).toFixed(1)}M`
          : `$${(property.price / 1_000).toFixed(0)}k`;

      // Custom HTML pill icon
      const iconHtml = `
        <div class="luxury-map-pin ${
          isSelected ? "active" : ""
        }" style="display:inline-flex; align-items:center; justify-content:center; padding:5px 10px; border-radius:9999px; background:${
        isSelected ? "#09090b" : "#ffffff"
      }; color:${isSelected ? "#ffffff" : "#09090b"}; border:1.5px solid ${
        isSelected ? "#f59e0b" : "#e4e4e7"
      }; font-size:11px; font-weight:700; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); cursor:pointer; transition:transform 0.15s ease, background-color 0.15s ease; white-space:nowrap; transform:translate(-50%, -50%);">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${
            property.listingType === "FOR_RENT" ? "#3b82f6" : "#10b981"
          }; margin-right:6px;"></span>
          ${formattedPrice}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-pin",
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });

      const marker = L.marker([property.computedLat, property.computedLng], {
        icon: customIcon,
      });

      marker.on("click", () => {
        setActiveProperty(property);
        if (onSelectProperty) onSelectProperty(property.id);
        map.panTo([property.computedLat, property.computedLng], { animate: true });
      });

      marker.on("mouseover", () => {
        setActiveProperty(property);
      });

      markersGroup.addLayer(marker);
    });
  };

  const handleResetCenter = () => {
    if (!mapInstanceRef.current || resolvedProperties.length === 0) return;
    import("leaflet").then((mod) => {
      const L = mod.default;
      const bounds = L.latLngBounds(
        resolvedProperties.map((p) => [p.computedLat, p.computedLng])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    });
  };

  return (
    <div className="relative w-full h-[600px] lg:h-[calc(100vh-180px)] rounded-3xl overflow-hidden border border-zinc-200/90 shadow-md bg-zinc-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="size-full z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        {/* Search as I move toggle */}
        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 text-zinc-900 text-xs font-semibold backdrop-blur-md border border-zinc-200 shadow-md cursor-pointer select-none">
          <input
            type="checkbox"
            checked={searchAsMove}
            onChange={(e) => setSearchAsMove(e.target.checked)}
            className="rounded border-zinc-300 text-black focus:ring-black size-3.5"
          />
          <span>Search as I move the map</span>
        </label>

        {/* Center reset button */}
        <button
          type="button"
          onClick={handleResetCenter}
          title="Reset map view"
          className="size-9 rounded-xl bg-white/95 hover:bg-white text-zinc-800 flex items-center justify-center backdrop-blur-md border border-zinc-200 shadow-md cursor-pointer transition"
        >
          <Crosshair className="size-4" />
        </button>

        {/* Status count badge */}
        <div className="px-3 py-2 rounded-xl bg-zinc-950/90 text-white text-xs font-medium backdrop-blur-md shadow-md hidden sm:flex items-center gap-1.5">
          <MapPin className="size-3.5 text-amber-400" />
          <span>{resolvedProperties.length} Pins Placed</span>
        </div>
      </div>

      {/* Floating Property Preview Popup Card on Map */}
      {activeProperty && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-96 bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex gap-3 items-center">
            {/* Image Thumbnail */}
            <div className="relative size-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
              <Image
                src={activeProperty.images[0] || "/assets/house.png"}
                alt={activeProperty.title}
                fill
                className="object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white uppercase">
                {activeProperty.propertyType}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-heading text-base font-extrabold text-zinc-950">
                  ${activeProperty.price.toLocaleString()}
                  {activeProperty.listingType === "FOR_RENT" && (
                    <span className="text-[10px] font-normal text-zinc-500"> /mo</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveProperty(null)}
                  className="text-zinc-400 hover:text-zinc-700 text-xs px-1"
                >
                  ✕
                </button>
              </div>

              <h4 className="text-xs font-semibold text-zinc-900 truncate">
                {activeProperty.title}
              </h4>

              <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                <MapPin className="size-3 shrink-0 text-zinc-400" />
                <span>
                  {activeProperty.city}, {activeProperty.state}
                </span>
              </p>

              {/* Specs */}
              <div className="flex items-center gap-2 pt-0.5 text-[10px] text-zinc-600 font-medium">
                <span>{activeProperty.bedrooms} Beds</span>
                <span>•</span>
                <span>{activeProperty.bathrooms} Baths</span>
                <span>•</span>
                <span>{activeProperty.areaSqFt.toLocaleString()} sqft</span>
              </div>
            </div>
          </div>

          <Link
            href={`/properties/${activeProperty.slug}`}
            className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-xs"
          >
            <span>View Full Residence</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
