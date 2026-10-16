"use client";

import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, Percent, Calendar, ShieldCheck } from "lucide-react";

interface MortgageCalculatorProps {
  initialPrice: number;
}

export function MortgageCalculator({ initialPrice }: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState<number>(initialPrice || 1000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  const downPaymentAmount = useMemo(() => {
    return (homePrice * downPaymentPercent) / 100;
  }, [homePrice, downPaymentPercent]);

  const loanAmount = useMemo(() => {
    return Math.max(0, homePrice - downPaymentAmount);
  }, [homePrice, downPaymentAmount]);

  const { monthlyPrincipalAndInterest, monthlyTaxes, monthlyInsurance, totalMonthly } =
    useMemo(() => {
      const p = loanAmount;
      const r = interestRate / 100 / 12;
      const n = loanTermYears * 12;

      let pi = 0;
      if (r > 0 && n > 0 && p > 0) {
        pi = (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      } else if (n > 0) {
        pi = p / n;
      }

      // Est. Property Tax: ~0.85% annual rate
      const taxes = (homePrice * 0.0085) / 12;
      // Est. Homeowner Insurance: based on property tier
      const insurance = Math.max(150, (homePrice * 0.0018) / 12);

      const total = pi + taxes + insurance;

      return {
        monthlyPrincipalAndInterest: Math.round(pi),
        monthlyTaxes: Math.round(taxes),
        monthlyInsurance: Math.round(insurance),
        totalMonthly: Math.round(total),
      };
    }, [loanAmount, interestRate, loanTermYears, homePrice]);

  const piPercent = totalMonthly > 0 ? (monthlyPrincipalAndInterest / totalMonthly) * 100 : 0;
  const taxesPercent = totalMonthly > 0 ? (monthlyTaxes / totalMonthly) * 100 : 0;
  const insurancePercent = totalMonthly > 0 ? (monthlyInsurance / totalMonthly) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-3xl bg-white border border-zinc-200/90 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Calculator className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-zinc-950">
              Mortgage & Financing Estimator
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Estimate your monthly investment with customizable financing terms
            </p>
          </div>
        </div>

        {/* Calculated Big Number */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-right">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Estimated Payment
          </span>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-950">
            {formatCurrency(totalMonthly)}
            <span className="text-sm font-normal text-zinc-500"> / mo</span>
          </div>
        </div>
      </div>

      {/* Visual Breakdown Bar */}
      <div className="py-6">
        <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden flex gap-1">
          <div
            style={{ width: `${piPercent}%` }}
            className="h-full bg-zinc-900 rounded-l-full transition-all duration-300"
            title={`Principal & Interest: ${formatCurrency(monthlyPrincipalAndInterest)}`}
          />
          <div
            style={{ width: `${taxesPercent}%` }}
            className="h-full bg-zinc-500 transition-all duration-300"
            title={`Taxes: ${formatCurrency(monthlyTaxes)}`}
          />
          <div
            style={{ width: `${insurancePercent}%` }}
            className="h-full bg-zinc-300 rounded-r-full transition-all duration-300"
            title={`Insurance: ${formatCurrency(monthlyInsurance)}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-medium">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-zinc-900" />
              <span className="text-zinc-600">Principal & Interest</span>
            </div>
            <span className="font-semibold text-zinc-950">
              {formatCurrency(monthlyPrincipalAndInterest)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-zinc-500" />
              <span className="text-zinc-600">Est. Property Taxes</span>
            </div>
            <span className="font-semibold text-zinc-950">
              {formatCurrency(monthlyTaxes)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-zinc-300" />
              <span className="text-zinc-600">Homeowners Insurance</span>
            </div>
            <span className="font-semibold text-zinc-950">
              {formatCurrency(monthlyInsurance)}
            </span>
          </div>
        </div>
      </div>

      {/* Sliders and Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Home Price */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Purchase Price
            </label>
            <span className="font-heading font-bold text-sm text-zinc-950">
              {formatCurrency(homePrice)}
            </span>
          </div>
          <input
            type="range"
            min={100000}
            max={Math.max(50000000, initialPrice * 2)}
            step={50000}
            value={homePrice}
            onChange={(e) => setHomePrice(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </div>

        {/* Down Payment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Down Payment ({downPaymentPercent}%)
            </label>
            <span className="font-heading font-bold text-sm text-zinc-950">
              {formatCurrency(downPaymentAmount)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Interest Rate
            </label>
            <span className="font-heading font-bold text-sm text-zinc-950">
              {interestRate.toFixed(2)}%
            </span>
          </div>
          <input
            type="range"
            min={2.0}
            max={12.0}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </div>

        {/* Loan Term Selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Loan Term
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 20, 30].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setLoanTermYears(term)}
                className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  loanTermYears === term
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {term} Years
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
