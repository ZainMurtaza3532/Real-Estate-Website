"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency, SupportedCurrency, SupportedAreaUnit } from "./currency-provider";
import { Globe, Check, ChevronDown } from "lucide-react";

export function CurrencySwitcher() {
  const { currency, unit, setCurrency, setUnit } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currencies: { code: SupportedCurrency; name: string }[] = [
    { code: "USD", name: "USD ($) - US Dollar" },
    { code: "EUR", name: "EUR (€) - Euro" },
    { code: "GBP", name: "GBP (£) - British Pound" },
    { code: "AED", name: "AED - UAE Dirham" },
    { code: "PKR", name: "PKR (Rs.) - Pakistani Rupee" },
    { code: "CAD", name: "CAD ($) - Canadian Dollar" },
  ];

  const units: { code: SupportedAreaUnit; label: string }[] = [
    { code: "sqft", label: "Square Feet (sq ft)" },
    { code: "sqm", label: "Square Meters (sq m)" },
    { code: "marla", label: "Marla (225 sq ft)" },
    { code: "kanal", label: "Kanal (20 Marla)" },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        <Globe className="size-3.5 text-zinc-400" />
        <span>USD / sqft</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100/90 hover:bg-zinc-200/90 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-xs"
        aria-label="Currency and measurement unit switcher"
      >
        <Globe className="size-3.5 text-amber-500" />
        <span className="font-mono">{currency}</span>
        <span className="text-zinc-400">/</span>
        <span>{unit}</span>
        <ChevronDown className={`size-3 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Currency
          </div>
          <div className="space-y-0.5">
            {currencies.map((c) => (
              <button
                type="button"
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currency === c.code
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{c.name}</span>
                {currency === c.code && <Check className="size-3.5 text-amber-500" />}
              </button>
            ))}
          </div>

          <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />

          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Area Measurement
          </div>
          <div className="space-y-0.5">
            {units.map((u) => (
              <button
                type="button"
                key={u.code}
                onClick={() => {
                  setUnit(u.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  unit === u.code
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{u.label}</span>
                {unit === u.code && <Check className="size-3.5 text-amber-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
