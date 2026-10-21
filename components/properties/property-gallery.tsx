"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
} from "lucide-react";

interface PropertyGalleryProps {
  title: string;
  images: string[];
}

export function PropertyGallery({ title, images }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages =
    images && images.length > 0 ? images : ["/assets/house.png"];

  // Open modal at specific image
  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, displayImages.length]);

  return (
    <>
      {/* High-Resolution Grid Collage */}
      <div className="relative rounded-3xl overflow-hidden shadow-xs border border-zinc-200/80 bg-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[380px] sm:h-[460px] md:h-[540px]">
          {/* Main Hero Image (Col 1-2, Row 1-2) */}
          <div
            onClick={() => openLightbox(0)}
            className="relative md:col-span-2 md:row-span-2 cursor-pointer group overflow-hidden"
          >
            <Image
              src={displayImages[0]}
              alt={`${title} - Primary Architectural Façade & Exterior Showcase`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            <div className="absolute top-4 left-4">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                <Sparkles className="size-3" /> Architectural Showcase
              </span>
            </div>
          </div>

          {/* Sub Image 1 */}
          <div
            onClick={() => openLightbox(1 % displayImages.length)}
            className="hidden md:block relative md:col-span-1 md:row-span-1 cursor-pointer group overflow-hidden"
          >
            <Image
              src={displayImages[1 % displayImages.length]}
              alt={`${title} - Interior Architecture & Living Space View`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Sub Image 2 */}
          <div
            onClick={() => openLightbox(2 % displayImages.length)}
            className="hidden md:block relative md:col-span-1 md:row-span-1 cursor-pointer group overflow-hidden"
          >
            <Image
              src={displayImages[2 % displayImages.length]}
              alt={`${title} - Gourmet Kitchen & Dining Space`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Sub Image 3 */}
          <div
            onClick={() => openLightbox(3 % displayImages.length)}
            className="hidden md:block relative md:col-span-1 md:row-span-1 cursor-pointer group overflow-hidden"
          >
            <Image
              src={displayImages[3 % displayImages.length]}
              alt={`${title} - Master Bedroom Suite & Luxury Finishes`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Sub Image 4 (with View All Photos button) */}
          <div
            onClick={() => openLightbox(4 % displayImages.length)}
            className="hidden md:block relative md:col-span-1 md:row-span-1 cursor-pointer group overflow-hidden"
          >
            <Image
              src={displayImages[4 % displayImages.length]}
              alt={`${title} - Grounds, Terrace & Panoramic Vista`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-zinc-950 text-xs font-semibold shadow-lg group-hover:scale-105 transition-transform">
                <Images className="size-4" />
                View all {displayImages.length} photos
              </span>
            </div>
          </div>
        </div>

        {/* Mobile View All button badge */}
        <button
          onClick={() => openLightbox(0)}
          className="md:hidden absolute bottom-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-zinc-900 text-xs font-semibold shadow-md"
        >
          <Images className="size-3.5" />
          <span>{displayImages.length} Photos</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between text-white z-10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="font-heading font-medium text-sm text-zinc-300">
                {title}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white font-mono">
                {selectedIndex + 1} / {displayImages.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close photo viewer"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Central Active Image Display */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2 md:left-6 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all cursor-pointer z-10"
            >
              <ChevronLeft className="size-6" />
            </button>

            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={displayImages[selectedIndex]}
                alt={`${title} - View ${selectedIndex + 1}`}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
                priority
              />
            </div>

            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2 md:right-6 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all cursor-pointer z-10"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="max-w-5xl mx-auto w-full overflow-x-auto pb-2 flex items-center justify-center gap-2">
            {displayImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`relative size-16 md:size-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedIndex === i
                    ? "border-white scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
