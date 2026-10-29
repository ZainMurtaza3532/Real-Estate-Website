"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { saveSearchCriteria } from "@/actions/saved-searches";
import { toast } from "sonner";
import { Bell, BellRing, X, Check, Loader2, Sparkles } from "lucide-react";
import { SavedSearchFrequency } from "@prisma/client";

export function SaveSearchModal() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<SavedSearchFrequency>(
    SavedSearchFrequency.INSTANT
  );

  const city = searchParams.get("search") || "";
  const propertyType = searchParams.get("type") || "";
  const listingType = searchParams.get("listing") || "";
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const bedsParam = searchParams.get("beds");
  const bedrooms = bedsParam ? parseInt(bedsParam, 10) : undefined;

  const handleOpen = () => {
    if (!session?.user?.id) {
      toast.info("Please sign in to save searches and receive automated email alerts.");
      router.push(`/login?callbackUrl=/properties?${searchParams.toString()}`);
      return;
    }

    const parts: string[] = [];
    if (bedrooms) parts.push(`${bedrooms}+ Beds`);
    if (propertyType) parts.push(propertyType.toLowerCase());
    if (city) parts.push(`in ${city}`);
    if (maxPrice) parts.push(`under $${maxPrice.toLocaleString()}`);

    setName(parts.length > 0 ? parts.join(" ") : "Custom Luxury Search Alert");
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await saveSearchCriteria({
        name: name.trim(),
        frequency,
        criteria: {
          city: city || undefined,
          propertyType: propertyType || undefined,
          listingType: listingType || undefined,
          minPrice,
          maxPrice,
          bedrooms,
        },
      });

      if (res.success) {
        toast.success("Saved search activated! You will receive email alerts on matching properties.");
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to save search filter.");
      }
    } catch {
      toast.error("An error occurred while saving search.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
      >
        <Bell className="size-3.5" />
        <span>Save This Search</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <BellRing className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-zinc-950 dark:text-white">
                    Save Search & Alerts
                  </h3>
                  <p className="text-xs text-zinc-500">Instant Resend email alerts when new matches appear.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Saved Search Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Austin 3-Bed Villas Under $800k"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Email Dispatch Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: SavedSearchFrequency.INSTANT, label: "Instant", sub: "As listed" },
                    { value: SavedSearchFrequency.DAILY, label: "Daily", sub: "Every 24h" },
                    { value: SavedSearchFrequency.WEEKLY, label: "Weekly", sub: "Sundays" },
                  ].map((freq) => (
                    <button
                      type="button"
                      key={freq.value}
                      onClick={() => setFrequency(freq.value)}
                      className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                        frequency === freq.value
                          ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <div className="text-xs">{freq.label}</div>
                      <div className="text-[10px] text-zinc-400">{freq.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  <span>{isSubmitting ? "Activating..." : "Save & Subscribe"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
