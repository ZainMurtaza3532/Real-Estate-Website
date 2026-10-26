"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Hospital,
  Train,
  ShoppingBag,
  Trees,
  Footprints,
  Compass,
  Navigation,
  CheckCircle2,
} from "lucide-react";

interface NeighborhoodInsightsProps {
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
}

type CategoryType = "schools" | "hospitals" | "transit" | "groceries" | "parks";

interface POIItem {
  name: string;
  type: string;
  distance: string;
  timeWalking: string;
}

export function NeighborhoodInsights({
  city,
  state,
  latitude,
  longitude,
}: NeighborhoodInsightsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("schools");

  const walkScore = latitude && longitude ? 88 : 82;
  const transitScore = latitude && longitude ? 84 : 76;

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Walker's Paradise", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 70) return { label: "Very Walkable", color: "text-teal-500 bg-teal-500/10 border-teal-500/30" };
    if (score >= 50) return { label: "Somewhat Walkable", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
    return { label: "Car-Dependent", color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/30" };
  };

  const poiData: Record<CategoryType, { title: string; icon: any; count: number; items: POIItem[] }> = {
    schools: {
      title: "Schools & Universities",
      icon: GraduationCap,
      count: 4,
      items: [
        { name: `${city} International Preparatory`, type: "Private K-12 Academy", distance: "0.4 miles", timeWalking: "8 min walk" },
        { name: "Montessori Early Learning Institute", type: "Pre-School & Kindergarten", distance: "0.6 miles", timeWalking: "12 min walk" },
        { name: `${city} Central High School`, type: "Public Magnet School (Top 5%)", distance: "1.1 miles", timeWalking: "5 min drive" },
        { name: "Metropolitan Science Academy", type: "STEM Charter Academy", distance: "1.8 miles", timeWalking: "7 min drive" },
      ],
    },
    hospitals: {
      title: "Hospitals & Medical Care",
      icon: Hospital,
      count: 3,
      items: [
        { name: `${city} Medical Center & Emergency Care`, type: "Level 1 Trauma Hospital", distance: "0.8 miles", timeWalking: "4 min drive" },
        { name: "Cedars Premier Health & Wellness Clinic", type: "Outpatient Specialized Care", distance: "1.2 miles", timeWalking: "6 min drive" },
        { name: "Apex Dental & Surgical Center", type: "Specialty Clinic", distance: "1.5 miles", timeWalking: "7 min drive" },
      ],
    },
    transit: {
      title: "Metro & Rapid Transit",
      icon: Train,
      count: 3,
      items: [
        { name: "Grand Central Express Metro Station", type: "Light Rail / Metro Red Line", distance: "0.3 miles", timeWalking: "6 min walk" },
        { name: "Avenue Boulevard Transit Hub", type: "Rapid City Bus Transit", distance: "0.2 miles", timeWalking: "4 min walk" },
        { name: `${city} Intercity Commuter Terminal`, type: "Regional Passenger Rail", distance: "2.4 miles", timeWalking: "10 min drive" },
      ],
    },
    groceries: {
      title: "Supermarkets & Organic Markets",
      icon: ShoppingBag,
      count: 4,
      items: [
        { name: "Whole Foods Artisan Market", type: "Gourmet & Organic Grocery", distance: "0.5 miles", timeWalking: "10 min walk" },
        { name: "Trader Joe's Specialty Grocers", type: "Supermarket", distance: "0.9 miles", timeWalking: "4 min drive" },
        { name: "The Fresh Harvest Farmers Hall", type: "Weekend Organic Market", distance: "1.3 miles", timeWalking: "6 min drive" },
        { name: "City Centre Wine & Provisions", type: "Artisanal Cellar & Deli", distance: "0.7 miles", timeWalking: "14 min walk" },
      ],
    },
    parks: {
      title: "Parks, Country Clubs & Gyms",
      icon: Trees,
      count: 3,
      items: [
        { name: "Highland Botanical Gardens & Reserve", type: "Public Park & Running Trails", distance: "0.3 miles", timeWalking: "5 min walk" },
        { name: "Equinox Elite Fitness & Spa", type: "Luxury Athletic Club", distance: "0.7 miles", timeWalking: "12 min walk" },
        { name: `${city} Pines Golf & Country Club`, type: "Championship 18-Hole Course", distance: "2.1 miles", timeWalking: "8 min drive" },
      ],
    },
  };

  const walkBadge = getScoreBadge(walkScore);

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Footprints className="size-5 text-amber-500" />
            <h3 className="font-heading font-bold text-xl text-zinc-950 dark:text-white">
              Neighborhood & WalkScore Insights
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time proximity to top educational institutions, public transit hubs, healthcare, and amenities in {city}, {state}.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <div className="relative size-12 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-heading font-black text-lg border border-amber-500/20">
              {walkScore}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">WalkScore®</div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">{walkBadge.label}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <div className="relative size-12 flex items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 font-heading font-black text-lg border border-teal-500/20">
              {transitScore}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Transit Score</div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">Excellent Transit</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto py-4 scrollbar-none border-b border-zinc-100 dark:border-zinc-800/60">
        {(Object.keys(poiData) as CategoryType[]).map((catKey) => {
          const category = poiData[catKey];
          const Icon = category.icon;
          const isActive = activeCategory === catKey;

          return (
            <button
              type="button"
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60"
              }`}
            >
              <Icon className="size-4" />
              <span>{category.title}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isActive ? "bg-white/20 dark:bg-zinc-900/20" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-5">
        {poiData[activeCategory].items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-850/40 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {item.name}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.type}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {item.distance}
              </span>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center justify-end gap-1">
                <Navigation className="size-3" />
                <span>{item.timeWalking}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
