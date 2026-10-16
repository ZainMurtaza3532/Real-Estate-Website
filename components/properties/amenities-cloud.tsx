import React from "react";
import {
  Waves,
  Sparkles,
  Wine,
  Film,
  Flame,
  Plane,
  Zap,
  ShieldCheck,
  Eye,
  Mountain,
  Trees,
  Car,
  Wind,
  CheckCircle,
  Home,
  Check,
} from "lucide-react";

interface AmenitiesCloudProps {
  amenities: string[];
}

export function AmenitiesCloud({ amenities }: AmenitiesCloudProps) {
  if (!amenities || amenities.length === 0) return null;

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("pool") || lower.includes("ocean") || lower.includes("water") || lower.includes("dock"))
      return <Waves className="size-4 text-zinc-900" />;
    if (lower.includes("wine")) return <Wine className="size-4 text-zinc-900" />;
    if (lower.includes("theater") || lower.includes("cinema")) return <Film className="size-4 text-zinc-900" />;
    if (lower.includes("spa") || lower.includes("sauna") || lower.includes("fireplace"))
      return <Flame className="size-4 text-zinc-900" />;
    if (lower.includes("helipad") || lower.includes("aviation")) return <Plane className="size-4 text-zinc-900" />;
    if (lower.includes("electric") || lower.includes("solar") || lower.includes("smart") || lower.includes("charger"))
      return <Zap className="size-4 text-zinc-900" />;
    if (lower.includes("security") || lower.includes("doorman") || lower.includes("concierge") || lower.includes("gated"))
      return <ShieldCheck className="size-4 text-zinc-900" />;
    if (lower.includes("view") || lower.includes("panorama") || lower.includes("skyline"))
      return <Eye className="size-4 text-zinc-900" />;
    if (lower.includes("ski") || lower.includes("mountain")) return <Mountain className="size-4 text-zinc-900" />;
    if (lower.includes("garden") || lower.includes("park") || lower.includes("tennis") || lower.includes("court"))
      return <Trees className="size-4 text-zinc-900" />;
    if (lower.includes("garage") || lower.includes("parking") || lower.includes("valet"))
      return <Car className="size-4 text-zinc-900" />;
    if (lower.includes("ac") || lower.includes("air") || lower.includes("climate") || lower.includes("geothermal"))
      return <Wind className="size-4 text-zinc-900" />;
    return <CheckCircle className="size-4 text-zinc-900" />;
  };

  return (
    <div className="rounded-3xl bg-white border border-zinc-200/90 p-6 md:p-8 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="size-4 text-zinc-900" />
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Curated Features
        </span>
      </div>
      <h3 className="font-heading text-xl font-bold text-zinc-950 mb-6">
        Signature Amenities & Bespoke Finishes
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {amenities.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100/90 text-xs font-medium text-zinc-800 hover:border-zinc-300 hover:bg-zinc-100/60 transition-all"
          >
            <div className="size-8 rounded-xl bg-white border border-zinc-200/60 flex items-center justify-center shrink-0 shadow-xs">
              {getAmenityIcon(item)}
            </div>
            <span className="font-semibold text-zinc-900">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
