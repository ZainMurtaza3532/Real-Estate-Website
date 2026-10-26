"use client";

import React, { useState } from "react";
import Link from "next/link";
import { deleteSavedSearch } from "@/actions/saved-searches";
import { toast } from "sonner";
import {
  Bell,
  Trash2,
  ExternalLink,
  MapPin,
  Building,
  DollarSign,
  Bed,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

interface SavedSearchesListProps {
  initialSearches: any[];
}

export function SavedSearchesList({ initialSearches }: SavedSearchesListProps) {
  const [searches, setSearches] = useState(initialSearches);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const res = await deleteSavedSearch(id);
      if (res.success) {
        toast.success("Saved search alert deleted.");
        setSearches((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error("Failed to delete saved search.");
      }
    } catch {
      toast.error("Error deleting search.");
    } finally {
      setIsDeleting(null);
    }
  };

  const buildQueryUrl = (criteria: any) => {
    const params = new URLSearchParams();
    if (criteria.city) params.set("search", criteria.city);
    if (criteria.propertyType) params.set("type", criteria.propertyType);
    if (criteria.listingType) params.set("listing", criteria.listingType);
    if (criteria.minPrice) params.set("minPrice", criteria.minPrice.toString());
    if (criteria.maxPrice) params.set("maxPrice", criteria.maxPrice.toString());
    if (criteria.bedrooms) params.set("beds", criteria.bedrooms.toString());
    return `/properties?${params.toString()}`;
  };

  if (searches.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center space-y-4 shadow-xs">
        <div className="size-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Bell className="size-7" />
        </div>
        <h3 className="font-heading font-bold text-xl text-zinc-950 dark:text-white">
          No Saved Searches Yet
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Explore luxury homes on the property catalogue and click &ldquo;Save This Search&rdquo; to receive automatic email notifications whenever matching estates become available.
        </p>
        <div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-sm"
          >
            <Search className="size-3.5" />
            <span>Explore Properties</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {searches.map((search) => {
        const c = (search.queryCriteria as any) || {};
        const queryUrl = buildQueryUrl(c);

        return (
          <div
            key={search.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {search.frequency} ALERT
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {new Date(search.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3 className="font-heading font-bold text-base text-zinc-950 dark:text-white line-clamp-1">
                {search.name || "Custom Search Filter"}
              </h3>

              <div className="flex flex-wrap gap-1.5 text-xs">
                {c.city && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                    <MapPin className="size-3 text-zinc-400" /> {c.city}
                  </span>
                )}
                {c.propertyType && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                    <Building className="size-3 text-zinc-400" /> {c.propertyType}
                  </span>
                )}
                {c.bedrooms && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                    <Bed className="size-3 text-zinc-400" /> {c.bedrooms}+ Beds
                  </span>
                )}
                {c.maxPrice && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                    <DollarSign className="size-3 text-zinc-400" /> &le; ${c.maxPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <Link
                href={queryUrl}
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition"
              >
                <span>Search Now</span>
                <ExternalLink className="size-3" />
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(search.id)}
                disabled={isDeleting === search.id}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                aria-label="Delete saved search"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
