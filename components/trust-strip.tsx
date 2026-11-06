import React from "react";
import { ShieldCheck, Award, Home } from "lucide-react";

export function TrustStrip() {
  return (
    <section
      aria-label="Brokerage Credentials and Trust Badges"
      className="w-full border-y border-zinc-200/80 bg-zinc-50/70 py-4 px-4 md:px-16 lg:px-24"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-4 md:gap-8 text-xs font-medium text-zinc-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>Licensed Real Estate Brokerage #RE-90210</span>
        </div>
        <div className="hidden sm:block h-3.5 w-px bg-zinc-300" />
        <div className="flex items-center gap-2">
          <Award className="size-4 text-zinc-900 shrink-0" />
          <span>Member of National Association of Realtors (NAR)</span>
        </div>
        <div className="hidden sm:block h-3.5 w-px bg-zinc-300" />
        <div className="flex items-center gap-2">
          <Home className="size-4 text-zinc-900 shrink-0" />
          <span>Equal Housing Opportunity Partner</span>
        </div>
      </div>
    </section>
  );
}

