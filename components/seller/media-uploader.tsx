"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  UploadCloud,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Sparkles,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

interface MediaUploaderProps {
  images: string[];
  videoTourUrl?: string | null;
  onChangeImages: (images: string[]) => void;
  onChangeVideoTourUrl: (url: string) => void;
}

export function MediaUploader({
  images,
  videoTourUrl,
  onChangeImages,
  onChangeVideoTourUrl,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      toast.error("Upload Limit Exceeded", {
        description: "You can upload a maximum of 10 photos for each luxury listing.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        return data.url as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChangeImages([...images, ...uploadedUrls]);
      toast.success(
        `Added ${uploadedUrls.length} ${uploadedUrls.length === 1 ? "photo" : "photos"}!`
      );
    } catch (err: unknown) {
      console.error("Upload error:", err);
      toast.error("Photo Upload Failed", {
        description:
          err instanceof Error ? err.message : "Could not upload image to media cloud.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    const updated = images.filter((_, idx) => idx !== indexToDelete);
    onChangeImages(updated);
    toast.info("Photo removed");
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChangeImages(updated);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const updated = [...images];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChangeImages(updated);
  };

  const handleAddDirectUrl = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    if (images.length >= 10) {
      toast.error("Maximum 10 photos reached.");
      return;
    }

    onChangeImages([...images, urlInput.trim()]);
    setUrlInput("");
    setShowUrlBox(false);
    toast.success("Image URL added!");
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
          isDragOver
            ? "border-black bg-zinc-100/80 scale-[0.99]"
            : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
          className="hidden"
        />

        <div className="size-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-xs mb-3 text-zinc-900">
          {isUploading ? (
            <Loader2 className="size-6 animate-spin text-zinc-900" />
          ) : (
            <UploadCloud className="size-6" />
          )}
        </div>

        <h3 className="font-heading text-base font-bold text-zinc-950 mb-1 text-center">
          {isUploading ? "Uploading High-Resolution Media..." : "Drag & Drop Photos Here"}
        </h3>
        <p className="text-xs text-zinc-500 text-center max-w-sm mb-4 leading-relaxed">
          Upload up to 10 photos of your property. Supported formats: JPG, PNG, WEBP.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isUploading}
            className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs pointer-events-none"
          >
            Select from Device
          </button>
          <span className="text-xs text-zinc-400">or</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowUrlBox(!showUrlBox);
            }}
            className="px-3.5 py-2 rounded-full bg-white border border-zinc-200 text-zinc-800 text-xs font-medium hover:bg-zinc-50 transition"
          >
            Add Image URL
          </button>
        </div>

        {/* Counter badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold shadow-xs">
            {images.length} / 10 Photos
          </span>
        </div>
      </div>

      {/* Direct URL Input Bar */}
      {showUrlBox && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-200 shadow-sm">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddDirectUrl(e);
              }
            }}
            placeholder="Paste public image link (e.g. https://images.unsplash.com/...)"
            className="flex-1 px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            type="button"
            onClick={handleAddDirectUrl}
            className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            Add
          </button>
        </div>
      )}

      {/* Thumbnails Grid with Reordering & Delete */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700">Uploaded Gallery</span>
            <span>Tip: The first image will be used as the primary Cover Photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {images.map((src, index) => (
              <div
                key={index}
                className="relative group aspect-4/3 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-xs"
              >
                <Image
                  src={src}
                  alt={`Property media ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover"
                />

                {/* Primary Cover Badge */}
                {index === 0 ? (
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/90 text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    Cover
                  </span>
                ) : (
                  <span className="absolute top-2 left-2 z-10 size-5 rounded-full bg-white/90 text-zinc-800 text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {index + 1}
                  </span>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-2 right-2 z-10 size-6 rounded-full bg-white/90 hover:bg-red-50 text-zinc-700 hover:text-red-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                  title="Delete image"
                >
                  <X className="size-3.5" />
                </button>

                {/* Reorder Left/Right Buttons */}
                <div className="absolute inset-x-2 bottom-2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveLeft(index)}
                    className="size-6 rounded-full bg-white/90 hover:bg-white text-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shadow-xs cursor-pointer transition"
                    title="Move Left"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => handleMoveRight(index)}
                    className="size-6 rounded-full bg-white/90 hover:bg-white text-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shadow-xs cursor-pointer transition"
                    title="Move Right"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Tour URL Field */}
      <div className="pt-4 border-t border-zinc-100">
        <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <Video className="size-4 text-zinc-600" />
          <span>Virtual Video Tour (Optional)</span>
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Embed a YouTube, Vimeo, or Matterport 3D walkthrough URL to elevate listing engagement.
        </p>
        <input
          type="url"
          value={videoTourUrl || ""}
          onChange={(e) => onChangeVideoTourUrl(e.target.value)}
          placeholder="e.g. https://www.youtube.com/watch?v=..."
          className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
        />
      </div>
    </div>
  );
}
