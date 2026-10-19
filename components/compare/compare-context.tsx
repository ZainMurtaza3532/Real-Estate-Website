"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Scale, ArrowRight, Trash2 } from "lucide-react";

export interface CompareItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  image?: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
}

interface CompareContextType {
  selectedProperties: CompareItem[];
  toggleCompare: (item: CompareItem) => void;
  isInCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  maxReached: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "estate_compare_items";
const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedProperties, setSelectedProperties] = useState<CompareItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedProperties(parsed.slice(0, MAX_COMPARE));
        }
      }
    } catch {
      // LocalStorage access failure handled gracefully
    }
    setMounted(true);
  }, []);

  const saveToStorage = useCallback((items: CompareItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Silently ignore storage errors
    }
  }, []);

  const toggleCompare = useCallback(
    (item: CompareItem) => {
      setSelectedProperties((prev) => {
        const exists = prev.some((p) => p.id === item.id);
        let next: CompareItem[];
        if (exists) {
          next = prev.filter((p) => p.id !== item.id);
        } else {
          if (prev.length >= MAX_COMPARE) {
            alert(`You can compare up to ${MAX_COMPARE} properties at a time.`);
            return prev;
          }
          next = [...prev, item];
        }
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  const removeFromCompare = useCallback(
    (id: string) => {
      setSelectedProperties((prev) => {
        const next = prev.filter((p) => p.id !== id);
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  const clearCompare = useCallback(() => {
    setSelectedProperties([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const isInCompare = useCallback(
    (id: string) => selectedProperties.some((p) => p.id === id),
    [selectedProperties]
  );

  return (
    <CompareContext.Provider
      value={{
        selectedProperties,
        toggleCompare,
        isInCompare,
        removeFromCompare,
        clearCompare,
        maxReached: selectedProperties.length >= MAX_COMPARE,
      }}
    >
      {children}
      {mounted && <CompareFloatingDrawer />}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return ctx;
}

function CompareFloatingDrawer() {
  const { selectedProperties, removeFromCompare, clearCompare } = useCompare();

  if (selectedProperties.length === 0) return null;

  const compareUrl = `/compare?ids=${selectedProperties.map((p) => p.id).join(",")}`;

  return (
    <aside
      aria-label="Property comparison drawer"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl bg-zinc-950/95 text-white backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-3 sm:p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Header indicator */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <Scale className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Compare Residences
              </p>
              <p className="text-[11px] text-zinc-400">
                {selectedProperties.length} of {MAX_COMPARE} selected
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearCompare}
            className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 sm:hidden transition"
          >
            <Trash2 className="size-3" /> Clear
          </button>
        </div>

        {/* Selected Items Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 scrollbar-none">
          {selectedProperties.map((item) => (
            <div
              key={item.id}
              className="relative group flex items-center gap-2 pr-2 py-1 pl-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0"
            >
              <div className="relative size-9 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                <Image
                  src={item.image || "/assets/house.png"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 max-w-[100px] text-left">
                <p className="text-[11px] font-semibold text-zinc-200 truncate">{item.title}</p>
                <p className="text-[10px] text-zinc-400 truncate">
                  ${item.price.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFromCompare(item.id)}
                title="Remove from comparison"
                className="size-5 rounded-full bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-400 transition ml-1"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          {/* Placeholders for unfilled slots */}
          {Array.from({ length: MAX_COMPARE - selectedProperties.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="hidden md:flex items-center justify-center size-11 rounded-xl border border-dashed border-zinc-800 text-[10px] text-zinc-600 font-medium"
            >
              + Slot
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={clearCompare}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            Clear all
          </button>

          <Link
            href={compareUrl}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold transition shadow-md w-full sm:w-auto cursor-pointer"
          >
            <span>Compare Now ({selectedProperties.length})</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
