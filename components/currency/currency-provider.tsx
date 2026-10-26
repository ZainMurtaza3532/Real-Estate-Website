"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedCurrency = "USD" | "EUR" | "GBP" | "AED" | "PKR" | "CAD";
export type SupportedAreaUnit = "sqft" | "sqm" | "marla" | "kanal";

const EXCHANGE_RATES: Record<SupportedCurrency, { rate: number; symbol: string; prefix: boolean }> = {
  USD: { rate: 1.0, symbol: "$", prefix: true },
  EUR: { rate: 0.92, symbol: "€", prefix: false },
  GBP: { rate: 0.79, symbol: "£", prefix: true },
  AED: { rate: 3.67, symbol: "AED ", prefix: true },
  PKR: { rate: 278.5, symbol: "Rs. ", prefix: true },
  CAD: { rate: 1.36, symbol: "CA$", prefix: true },
};

const AREA_CONVERSIONS: Record<SupportedAreaUnit, { factor: number; label: string }> = {
  sqft: { factor: 1.0, label: "sq ft" },
  sqm: { factor: 0.092903, label: "sq m" },
  marla: { factor: 0.00444444, label: "Marla" },
  kanal: { factor: 0.000222222, label: "Kanal" },
};

interface CurrencyContextType {
  currency: SupportedCurrency;
  unit: SupportedAreaUnit;
  setCurrency: (curr: SupportedCurrency) => void;
  setUnit: (u: SupportedAreaUnit) => void;
  formatPrice: (amountInUSD: number) => string;
  formatArea: (areaInSqFt: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");
  const [unit, setUnitState] = useState<SupportedAreaUnit>("sqft");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCurr = localStorage.getItem("havenstone_currency") as SupportedCurrency;
    const savedUnit = localStorage.getItem("havenstone_unit") as SupportedAreaUnit;
    if (savedCurr && EXCHANGE_RATES[savedCurr]) setCurrencyState(savedCurr);
    if (savedUnit && AREA_CONVERSIONS[savedUnit]) setUnitState(savedUnit);
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem("havenstone_currency", c);
    }
  };

  const setUnit = (u: SupportedAreaUnit) => {
    setUnitState(u);
    if (typeof window !== "undefined") {
      localStorage.setItem("havenstone_unit", u);
    }
  };

  const formatPrice = (amountInUSD: number): string => {
    if (!amountInUSD && amountInUSD !== 0) return "$0";
    const curr = mounted ? currency : "USD";
    const { rate, symbol, prefix } = EXCHANGE_RATES[curr];
    const converted = amountInUSD * rate;
    const formattedNum = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: converted > 1000 ? 0 : 2,
    }).format(converted);

    return prefix ? `${symbol}${formattedNum}` : `${formattedNum} ${symbol}`;
  };

  const formatArea = (areaInSqFt: number): string => {
    if (!areaInSqFt && areaInSqFt !== 0) return "0 sq ft";
    const u = mounted ? unit : "sqft";
    const { factor, label } = AREA_CONVERSIONS[u];
    const converted = areaInSqFt * factor;
    const formattedNum = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: u === "sqft" || u === "sqm" ? 0 : 2,
    }).format(converted);

    return `${formattedNum} ${label}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, unit, setCurrency, setUnit, formatPrice, formatArea }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
