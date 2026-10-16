"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Send,
  CheckCircle2,
  Video,
  Eye,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { submitPropertyInquiry } from "@/actions/inquiries";

interface TourInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  agent?: {
    name: string | null;
    agencyName: string | null;
    image: string | null;
    phone?: string | null;
  } | null;
  currentUser?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function TourInquiryForm({
  propertyId,
  propertyTitle,
  agent,
  currentUser,
}: TourInquiryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [tourType, setTourType] = useState<"IN_PERSON" | "VIDEO">("IN_PERSON");
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    tourDate: "",
    message: `Hello, I would like to arrange a private ${tourType === "IN_PERSON" ? "in-person" : "virtual video"} tour of ${propertyTitle}. Please contact me with available viewing appointments.`,
  });

  const handleTourTypeChange = (type: "IN_PERSON" | "VIDEO") => {
    setTourType(type);
    setFormData((prev) => ({
      ...prev,
      message: `Hello, I would like to arrange a private ${type === "IN_PERSON" ? "in-person" : "virtual video"} tour of ${propertyTitle}. Please contact me with available viewing appointments.`,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await submitPropertyInquiry({
        propertyId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        tourDate: formData.tourDate,
        message: formData.message,
      });

      if (result.success) {
        toast.success("Private Tour Requested!", {
          description: result.message || "An advisor will reach out to confirm your slot.",
          duration: 6000,
        });
        setSubmitted(true);
      } else {
        toast.error("Booking Error", {
          description: result.error || "Please check your information and try again.",
        });
      }
    });
  };

  return (
    <div className="sticky top-28 rounded-3xl bg-white border border-zinc-200/90 shadow-lg p-6 md:p-7">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-zinc-100">
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
            VIP Showing
          </span>
          <h3 className="font-heading text-xl font-bold text-zinc-950">
            Schedule a Private Tour
          </h3>
        </div>
        <span className="p-2 rounded-xl bg-zinc-100 text-zinc-800">
          <Calendar className="size-5" />
        </span>
      </div>

      {/* Assigned Agent Card */}
      <div className="flex items-center gap-3.5 my-5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
        <div className="relative size-12 rounded-full overflow-hidden shrink-0 border border-zinc-200 bg-zinc-200">
          {agent?.image ? (
            <Image
              src={agent.image}
              alt={agent.name || "Real Estate Advisor"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center font-bold text-zinc-600 text-sm">
              {agent?.name?.[0] || "A"}
            </div>
          )}
        </div>
        <div className="leading-tight truncate">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide block">
            Listing Advisor
          </span>
          <p className="font-semibold text-sm text-zinc-950 truncate">
            {agent?.name || "PrebuiltUI Private Brokerage"}
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {agent?.agencyName || "Licensed Real Estate Specialist"}
          </p>
        </div>
      </div>

      {/* Success State */}
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-7" />
          </div>
          <h4 className="font-heading text-lg font-bold text-zinc-950">
            Tour Request Confirmed
          </h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Thank you, {formData.name}. Our luxury advisory team has received your inquiry for {propertyTitle} and will contact you via email or phone within 2 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs font-semibold text-zinc-900 underline hover:text-black mt-2 inline-block cursor-pointer"
          >
            Schedule another time
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tour Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 border border-zinc-200/80">
            <button
              type="button"
              onClick={() => handleTourTypeChange("IN_PERSON")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                tourType === "IN_PERSON"
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Eye className="size-3.5" />
              In-Person
            </button>
            <button
              type="button"
              onClick={() => handleTourTypeChange("VIDEO")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                tourType === "VIDEO"
                  ? "bg-white text-zinc-950 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Video className="size-3.5" />
              Video Tour
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Your Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Eleanor Sterling"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="client@luxuryportfolio.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 (555) 000-0000"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Preferred Viewing Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.tourDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tourDate: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Special Requests / Inquiries
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-black text-white text-xs font-bold tracking-wide uppercase hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Securing Private Showing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="size-3.5" />
                Request Private Showing
              </span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Strict privacy & NDA confidentiality guaranteed</span>
          </div>
        </form>
      )}
    </div>
  );
}
