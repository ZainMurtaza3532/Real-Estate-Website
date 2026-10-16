"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadCloud, X, Plus, Image as ImageIcon, Link as LinkIcon, Sparkles } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

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
      onChange([...images, ...uploadedUrls]);
      toast.success(`Successfully uploaded ${uploadedUrls.length} ${uploadedUrls.length === 1 ? "photo" : "photos"}`);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      toast.error("Upload Failed", {
        description: err instanceof Error ? err.message : "Could not upload image to Cloudinary",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
      toast.error("Invalid URL", { description: "Please provide a valid https:// image link" });
      return;
    }

    onChange([...images, urlInput.trim()]);
    setUrlInput("");
    toast.success("Image URL added to gallery");
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed border-zinc-200 rounded-3xl p-8 text-center cursor-pointer hover:border-black hover:bg-zinc-50/60 transition-all flex flex-col items-center justify-center ${
          uploading ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="size-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-3 shadow-xs">
          {uploading ? (
            <span className="size-6 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
          ) : (
            <UploadCloud className="size-6" />
          )}
        </div>

        <h4 className="font-heading text-sm font-bold text-zinc-950 mb-1">
          {uploading ? "Uploading to Cloudinary..." : "Click or Drag High-Res Photography"}
        </h4>
        <p className="text-xs text-zinc-500 max-w-sm">
          Supports JPG, PNG, WEBP. Images will be optimized and delivered globally via Cloudinary CDN.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold">
            Cloudinary Storage
          </span>
          <span className="text-zinc-300">•</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowUrlBox(!showUrlBox);
            }}
            className="text-xs font-semibold text-zinc-900 underline hover:text-black"
          >
            {showUrlBox ? "Hide URL input" : "Or add image URL"}
          </button>
        </div>
      </div>

      {/* Direct URL input accordion */}
      {showUrlBox && (
        <form onSubmit={handleAddUrl} className="flex gap-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="relative flex-1">
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-... or Cloudinary URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition"
          >
            Add Photo
          </button>
        </form>
      )}

      {/* Uploaded Gallery Thumbnails */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Uploaded Photos ({images.length})</span>
            <span className="text-[11px] text-zinc-400">First image is the primary cover photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((url, index) => (
              <div
                key={index}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-xs"
              >
                <Image
                  src={url}
                  alt={`Property Image ${index + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />

                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold tracking-wide uppercase backdrop-blur-xs">
                    Cover
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 size-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-sm"
                  title="Remove Image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
