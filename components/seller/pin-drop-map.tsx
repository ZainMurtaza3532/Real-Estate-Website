"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Compass, CheckCircle2 } from "lucide-react";

interface PinDropMapProps {
  latitude: number | null;
  longitude: number | null;
  city: string;
  onChange: (lat: number, lng: number) => void;
}

const POPULAR_LOCATIONS = [
  { name: "Beverly Hills, CA", lat: 34.0736, lng: -118.4004 },
  { name: "Manhattan, NY", lat: 40.7831, lng: -73.9712 },
  { name: "Miami Beach, FL", lat: 25.7907, lng: -80.1300 },
  { name: "Austin, TX", lat: 30.2672, lng: -97.7431 },
  { name: "Aspen, CO", lat: 39.1911, lng: -106.8175 },
  { name: "Seattle, WA", lat: 47.6062, lng: -122.3321 },
  { name: "Lahore, PK", lat: 31.5204, lng: 74.3587 },
  { name: "Islamabad, PK", lat: 33.6844, lng: 73.0479 },
  { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
];

export function PinDropMap({ latitude, longitude, city, onChange }: PinDropMapProps) {
  const currentLat = latitude ?? 34.0736;
  const currentLng = longitude ?? -118.4004;

  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(Number(pos.coords.latitude.toFixed(6)), Number(pos.coords.longitude.toFixed(6)));
        setIsDetecting(false);
      },
      (err) => {
        console.warn("Geolocation denied or unavailable:", err.message);
        setIsDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  // OpenStreetMap embed URL
  const bboxPadding = 0.015;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - bboxPadding}%2C${currentLat - bboxPadding}%2C${currentLng + bboxPadding}%2C${currentLat + bboxPadding}&layer=mapnik&marker=${currentLat}%2C${currentLng}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
            Interactive Coordinates & Pin-Drop
          </label>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select a region preset, detect via GPS, or fine-tune coordinates for prospective buyers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-medium transition cursor-pointer select-none shrink-0"
        >
          <Navigation className={`size-3.5 ${isDetecting ? "animate-spin text-zinc-900" : ""}`} />
          <span>{isDetecting ? "Detecting GPS..." : "Use My Live GPS"}</span>
        </button>
      </div>

      {/* Quick City Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
        <span className="text-[11px] font-semibold text-zinc-400 shrink-0 uppercase tracking-wider">
          Presets:
        </span>
        {POPULAR_LOCATIONS.map((loc) => {
          const isSelected =
            Math.abs(currentLat - loc.lat) < 0.05 && Math.abs(currentLng - loc.lng) < 0.05;
          return (
            <button
              key={loc.name}
              type="button"
              onClick={() => onChange(loc.lat, loc.lng)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 border ${
                isSelected
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
              }`}
            >
              {loc.name}
            </button>
          );
        })}
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-inner group">
        <iframe
          title="Interactive OpenStreetMap Location"
          width="100%"
          height="100%"
          loading="lazy"
          className="w-full h-full border-0 pointer-events-auto"
          src={mapSrc}
        />

        {/* Floating Pin Indicator Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-200 shadow-md text-xs flex items-center gap-2">
          <MapPin className="size-4 text-red-500 fill-red-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Coordinates</span>
            <span className="font-mono text-zinc-900 font-bold">
              {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° W
            </span>
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200 text-xs font-medium text-zinc-800 flex items-center gap-1.5 shadow-xs">
          <Compass className="size-3.5 text-zinc-500" />
          <span>Interactive Mapnik Tile</span>
        </div>
      </div>

      {/* Manual Coordinates Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={latitude ?? ""}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0, currentLng)}
            placeholder="e.g. 34.0736"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={longitude ?? ""}
            onChange={(e) => onChange(currentLat, parseFloat(e.target.value) || 0)}
            placeholder="e.g. -118.4004"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
          />
        </div>
      </div>
    </div>
  );
}
