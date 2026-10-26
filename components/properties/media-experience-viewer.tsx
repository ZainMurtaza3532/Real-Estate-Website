"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Compass,
  Video,
  Images,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface MediaExperienceViewerProps {
  title: string;
  images: string[];
  virtualTourUrl?: string | null;
  videoTourUrl?: string | null;
}

type ActiveTab = "photos" | "virtual_tour" | "video";

export function MediaExperienceViewer({
  title,
  images,
  virtualTourUrl,
  videoTourUrl,
}: MediaExperienceViewerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("photos");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const displayImages = images && images.length > 0 ? images : ["/assets/house.png"];

  // Normalize YouTube/Vimeo embed URLs
  const getEmbeddableVideoUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch")) {
        const v = new URL(url).searchParams.get("v");
        return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0`;
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      }
      if (url.includes("vimeo.com/")) {
        const id = url.split("vimeo.com/")[1]?.split("?")[0];
        return `https://player.vimeo.com/video/${id}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const formattedVideoUrl = getEmbeddableVideoUrl(videoTourUrl);

  return (
    <div className="w-full space-y-3">
      {/* Luxury Segmented Media Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/95 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "photos"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <Images className="size-3.5" />
            <span>Photos ({displayImages.length})</span>
          </button>

          {virtualTourUrl && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("virtual_tour");
                setIsIframeLoading(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "virtual_tour"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                  : "text-amber-400 hover:text-amber-300 hover:bg-zinc-800/60"
              }`}
            >
              <Compass className="size-3.5" />
              <span>360° Virtual Tour</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/30 font-mono">
                3D
              </span>
            </button>
          )}

          {videoTourUrl && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("video");
                setIsIframeLoading(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "video"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Video className="size-3.5 text-rose-500" />
              <span>Video Walkthrough</span>
            </button>
          )}
        </div>

        {/* External Link for 360 Tour */}
        {activeTab === "virtual_tour" && virtualTourUrl && (
          <a
            href={virtualTourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <span>Open in Full Viewport</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      {/* Main High-Res Viewer */}
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[560px] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl">
        {/* PHOTO GALLERY MODE */}
        {activeTab === "photos" && (
          <div className="relative w-full h-full">
            <Image
              src={displayImages[activeImageIndex]}
              alt={`${title} - View ${activeImageIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute top-4 left-4">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                <Sparkles className="size-3 text-amber-400" /> Architectural Showcase
              </span>
            </div>

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === 0 ? displayImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all cursor-pointer border border-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % displayImages.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all cursor-pointer border border-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Bottom Photo Carousel Strip */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono border border-white/10">
                {activeImageIndex + 1} / {displayImages.length} Photos
              </span>

              <div className="flex gap-1.5 overflow-x-auto max-w-[65%] py-1">
                {displayImages.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative size-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === i
                        ? "border-amber-400 scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 360° VIRTUAL TOUR (Matterport, Kuula, etc.) */}
        {activeTab === "virtual_tour" && virtualTourUrl && (
          <div className="relative w-full h-full">
            {isIframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-3 z-10">
                <Compass className="size-10 animate-spin text-amber-500" />
                <p className="text-sm font-medium">Calibrating 360° Spatial Walkthrough...</p>
              </div>
            )}
            <iframe
              src={virtualTourUrl}
              title={`${title} 360° Virtual Tour`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
              allowFullScreen
              onLoad={() => setIsIframeLoading(false)}
            />
          </div>
        )}

        {/* VIDEO WALKTHROUGH */}
        {activeTab === "video" && formattedVideoUrl && (
          <div className="relative w-full h-full">
            {isIframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-3 z-10">
                <div className="size-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                <p className="text-sm font-medium">Buffering High-Definition Walkthrough...</p>
              </div>
            )}
            <iframe
              src={formattedVideoUrl}
              title={`${title} Video Walkthrough`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={() => setIsIframeLoading(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
