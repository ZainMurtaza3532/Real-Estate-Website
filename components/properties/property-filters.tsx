"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Building,
  Home,
  Check,
  ArrowUpDown,
  DollarSign,
} from "lucide-react";

const PROPERTY_TYPES = [
  { label: "All Types", value: "" },
  { label: "House", value: "HOUSE" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Villa", value: "VILLA" },
  { label: "Penthouse", value: "PENTHOUSE" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Land Plot", value: "PLOT" },
];

const LISTING_TYPES = [
  { label: "All Listings", value: "" },
  { label: "Buy", value: "FOR_SALE" },
  { label: "Rent", value: "FOR_RENT" },
];

const BED_OPTIONS = ["Any", "1+", "2+", "3+", "4+", "5+"];
const BATH_OPTIONS = ["Any", "1+", "2+", "3+", "4+"];

const SORT_OPTIONS = [
  { label: "Newest Listings", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state initialized from URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const currentType = searchParams.get("type") || "";
  const currentListing = searchParams.get("listing") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentBeds = searchParams.get("beds") || "";
  const currentBaths = searchParams.get("baths") || "";
  const currentSort = searchParams.get("sort") || "newest";

  // Count active filters
  const activeFilterCount = [
    searchParams.get("search"),
    searchParams.get("type"),
    searchParams.get("listing"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.get("beds"),
    searchParams.get("baths"),
    searchParams.get("sort") && searchParams.get("sort") !== "newest",
  ].filter(Boolean).length;

  // Helper to push updated search parameters
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== "" && value !== "Any") {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery("search", search);
  };

  const resetAllFilters = () => {
    setSearch("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header with Clear button */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-zinc-900" />
          <h2 className="font-heading text-base font-semibold text-zinc-950">
            Filter Properties
          </h2>
          {activeFilterCount > 0 && (
            <span className="size-5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-zinc-500 hover:text-black flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
          Location or Keyword
        </label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => updateQuery("search", search)}
            placeholder="City, neighborhood, or title..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateQuery("search", "");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Listing Type (Buy / Rent) */}
      <div>
        <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
          Listing Intent
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200">
          {LISTING_TYPES.map((type) => {
            const isActive = currentListing === type.value;
            return (
              <button
                key={type.label}
                type="button"
                onClick={() => updateQuery("listing", type.value)}
                className={`py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                  isActive
                    ? "bg-white text-zinc-950 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
          Property Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((type) => {
            const isActive = currentType === type.value;
            return (
              <button
                key={type.label}
                type="button"
                onClick={() => updateQuery("type", type.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  isActive
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
          Price Range ($ USD)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Min Price"
              value={currentMinPrice}
              onChange={(e) => updateQuery("minPrice", e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Price"
              value={currentMaxPrice}
              onChange={(e) => updateQuery("maxPrice", e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
          Bedrooms
        </label>
        <div className="flex items-center gap-1.5">
          {BED_OPTIONS.map((bed) => {
            const val = bed === "Any" ? "" : bed.replace("+", "");
            const isActive = currentBeds === val;
            return (
              <button
                key={bed}
                type="button"
                onClick={() => updateQuery("beds", val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  isActive
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {bed}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
          Bathrooms
        </label>
        <div className="flex items-center gap-1.5">
          {BATH_OPTIONS.map((bath) => {
            const val = bath === "Any" ? "" : bath.replace("+", "");
            const isActive = currentBaths === val;
            return (
              <button
                key={bath}
                type="button"
                onClick={() => updateQuery("baths", val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  isActive
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {bath}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
          Sort Results
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateQuery("sort", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Filter Trigger Button */}
      <div className="lg:hidden mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-zinc-200 text-zinc-900 font-semibold text-sm shadow-xs hover:bg-zinc-50"
        >
          <SlidersHorizontal className="size-4" />
          <span>Filters & Sort</span>
          {activeFilterCount > 0 && (
            <span className="size-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium flex items-center gap-1"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-6">
                <h3 className="font-heading text-lg font-semibold text-zinc-950">
                  Filters
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-900"
                >
                  <X className="size-5" />
                </button>
              </div>

              {filterContent}
            </div>

            <div className="pt-6 border-t border-zinc-200 mt-8">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition"
              >
                Apply Filters & View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-xs">
          {filterContent}
        </div>
      </aside>
    </>
  );
}
