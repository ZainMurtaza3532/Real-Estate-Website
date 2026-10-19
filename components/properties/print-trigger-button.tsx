"use client";

import React, { useState } from "react";
import { Download, Printer, Check } from "lucide-react";

export function PrintTriggerButton() {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    setDownloading(true);
    if (typeof window !== "undefined") {
      window.print();
    }
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
      >
        {downloading ? (
          <>
            <Check className="size-4 text-emerald-400" />
            <span>Preparing PDF...</span>
          </>
        ) : (
          <>
            <Download className="size-4 text-amber-400" />
            <span>Download / Save as PDF</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handlePrint}
        title="Direct Print"
        className="size-9 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-black flex items-center justify-center transition shadow-2xs cursor-pointer"
      >
        <Printer className="size-4 text-zinc-600" />
      </button>
    </div>
  );
}
