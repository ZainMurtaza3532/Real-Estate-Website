"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintTriggerButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 shadow-sm transition cursor-pointer"
    >
      <Printer className="size-3.5" />
      <span>Print / Save as PDF</span>
    </button>
  );
}
