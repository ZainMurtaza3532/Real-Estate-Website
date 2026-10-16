"use client";

import React from "react";
import Link from "next/link";
import { SearchX, RotateCcw } from "lucide-react";

export function PropertyEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs max-w-xl mx-auto my-8">
      <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-5">
        <SearchX className="size-8 stroke-[1.5]" />
      </div>

      <h3 className="font-heading text-2xl font-semibold text-zinc-950 mb-2">
        No Matching Residences
      </h3>

      <p className="text-sm text-zinc-500 max-w-md mb-8 leading-relaxed">
        We could not find any properties matching your current filters. Try expanding your price range, selecting different property types, or clearing your search.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/properties"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-all shadow-xs"
        >
          <RotateCcw className="size-4" />
          Reset All Filters
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
