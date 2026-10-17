"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  Home,
  Building,
  Building2,
  Hotel,
  Briefcase,
  Layers,
  Crown,
  Bed,
  Bath,
  Maximize2,
  Car,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Waves,
  Sun,
  Wind,
  Trees,
  Tv,
  Dumbbell,
  Wine,
  Navigation,
  Zap,
  ArrowUpDown,
  Cpu,
} from "lucide-react";
import { PinDropMap } from "./pin-drop-map";
import { MediaUploader } from "./media-uploader";
import { submitSellerProperty, SellPropertyInput } from "@/app/actions/property";

interface SellWizardProps {
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    phone?: string | null;
    whatsappNumber?: string | null;
  };
  redirectAfterSubmit?: string;
}

const PROPERTY_TYPES = [
  { value: "VILLA", label: "Luxury Villa", icon: Hotel, desc: "Private estates, oceanfront compounds" },
  { value: "HOUSE", label: "Single House", icon: Home, desc: "Modern architectural residences" },
  { value: "PENTHOUSE", label: "Sky Penthouse", icon: Crown, desc: "Top-floor panoramic suites" },
  { value: "APARTMENT", label: "Apartment", icon: Building, desc: "High-rise luxury condominiums" },
  { value: "COMMERCIAL", label: "Commercial", icon: Briefcase, desc: "Offices, towers & retail spaces" },
  { value: "PLOT", label: "Land / Plot", icon: Layers, desc: "Development land & private acreage" },
];

const AMENITY_OPTIONS = [
  { id: "Swimming Pool", label: "Infinity / Private Pool", icon: Waves },
  { id: "Solar Energy", label: "Solar Energy System", icon: Sun },
  { id: "Central AC", label: "Central Climate Control", icon: Wind },
  { id: "Private Lawn", label: "Lawn & Landscaped Garden", icon: Trees },
  { id: "24/7 Security", label: "24/7 Gated Security", icon: ShieldCheck },
  { id: "Smart Home", label: "Smart Home Automation", icon: Cpu },
  { id: "Home Theater", label: "Private Cinema / Screening", icon: Tv },
  { id: "Private Gym", label: "Fitness & Wellness Spa", icon: Dumbbell },
  { id: "Wine Cellar", label: "Sommelier Wine Vault", icon: Wine },
  { id: "Helipad", label: "Private Helipad Access", icon: Navigation },
  { id: "EV Charger", label: "Electric Vehicle Charger", icon: Zap },
  { id: "Private Elevator", label: "Keyed Private Elevator", icon: ArrowUpDown },
];

const FIELD_TO_STEP: Record<string, number> = {
  title: 1,
  propertyType: 1,
  listingType: 1,
  price: 1,
  currency: 1,
  description: 1,
  areaSqFt: 2,
  bedrooms: 2,
  bathrooms: 2,
  garageSpaces: 2,
  yearBuilt: 2,
  amenities: 2,
  address: 3,
  city: 3,
  state: 3,
  zipCode: 3,
  latitude: 3,
  longitude: 3,
  images: 4,
  videoTourUrl: 4,
  phone: 5,
  whatsappDirect: 5,
  whatsappNumber: 5,
};

export function SellWizard({ currentUser, redirectAfterSubmit = "/properties" }: SellWizardProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isBuyerRole = currentUser.role === "BUYER";

  // Form State
  const [formData, setFormData] = useState<SellPropertyInput>({
    title: "",
    propertyType: "VILLA",
    listingType: "FOR_SALE",
    price: 1500000,
    currency: "USD",
    description: "",
    bedrooms: 4,
    bathrooms: 5,
    areaSqFt: 5500,
    garageSpaces: 2,
    yearBuilt: 2023,
    amenities: ["Swimming Pool", "24/7 Security", "Smart Home"],
    address: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: 34.0736,
    longitude: -118.4004,
    images: [],
    videoTourUrl: "",
    phone: currentUser.phone || "",
    whatsappDirect: true,
    whatsappNumber: currentUser.whatsappNumber || currentUser.phone || "",
  });

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const updateField = (field: keyof SellPropertyInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenityId);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenityId)
          : [...prev.amenities, amenityId],
      };
    });
  };

  // Step Validation
  const validateStep = (step: number, highlight = true): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title || formData.title.trim().length < 5) {
        stepErrors.title = "Please provide a title with at least 5 characters.";
      }
      if (!formData.price || Number(formData.price) <= 0) {
        stepErrors.price = "Please enter a valid positive asking price.";
      }
      if (!formData.description || formData.description.trim().length < 20) {
        stepErrors.description = "Please write a property narrative with at least 20 characters.";
      }
    } else if (step === 2) {
      if (!formData.areaSqFt || Number(formData.areaSqFt) <= 0) {
        stepErrors.areaSqFt = "Please provide the property area in square feet.";
      }
    } else if (step === 3) {
      if (!formData.address || formData.address.trim().length < 3) {
        stepErrors.address = "Please specify a valid street address (min 3 chars).";
      }
      if (!formData.city || formData.city.trim().length < 2) {
        stepErrors.city = "Please specify a city.";
      }
      if (!formData.state || formData.state.trim().length < 2) {
        stepErrors.state = "Please specify a state or province.";
      }
      if (!formData.zipCode || formData.zipCode.trim().length < 2) {
        stepErrors.zipCode = "Please enter a postal or zip code.";
      }
    } else if (step === 4) {
      if (!formData.images || formData.images.length === 0) {
        stepErrors.images = "Please upload at least 1 photo for your property listing.";
      }
    } else if (step === 5) {
      if (!formData.phone || formData.phone.trim().length < 7) {
        stepErrors.phone = "Please provide a valid direct phone number (min 7 digits).";
      }
      if (formData.whatsappDirect && formData.whatsappNumber && formData.whatsappNumber.trim().length < 7) {
        stepErrors.whatsappNumber = "Please enter a valid WhatsApp number with country code.";
      }
    }

    if (highlight && Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      const firstErrorMsg = Object.values(stepErrors)[0];
      if (firstErrorMsg) {
        toast.error(firstErrorMsg);
      }
    }

    return Object.keys(stepErrors).length === 0;
  };

  // Comprehensive multi-step validator
  const validateAllSteps = (): boolean => {
    for (let s = 1; s <= 5; s++) {
      const isValid = validateStep(s, true);
      if (!isValid) {
        setCurrentStep(s);
        window.scrollTo({ top: 120, behavior: "smooth" });
        return false;
      }
    }
    return true;
  };

  const handleNext = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep < 5) {
      if (validateStep(currentStep, true)) {
        setCurrentStep((prev) => Math.min(prev + 1, 5));
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    }
  };

  const handlePrev = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleSubmit = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isPending) return;

    // STRICT STEP 5 GUARD: Form can ONLY be submitted when user is actively on Step 5
    if (currentStep < 5) {
      handleNext();
      return;
    }

    // Validate Step 5 contact details
    if (!validateStep(5, true)) {
      return;
    }

    // Validate ALL steps before attempting submission to prevent premature failure or jumping
    const isValid = validateAllSteps();
    if (!isValid) return;

    startTransition(async () => {
      try {
        const res = await submitSellerProperty(formData);

        if (res.success) {
          // Trigger session update so edge middleware and server components recognize role changes
          try {
            await updateSession();
          } catch {
            // Non-critical session sync
          }

          setSubmittedSuccess(true);
          setCreatedSlug(res.slug || null);
          toast.success("Listing Published Successfully!", {
            description: res.message || "Your property is now live and published in the portfolio.",
          });
        } else {
          if (res.fieldErrors) {
            const mappedErrors: Record<string, string> = {};
            let firstField: string | null = null;
            for (const [k, v] of Object.entries(res.fieldErrors)) {
              if (v && v.length > 0) {
                mappedErrors[k] = v[0];
                if (!firstField) firstField = k;
              }
            }
            setErrors((prev) => ({ ...prev, ...mappedErrors }));
            if (firstField && FIELD_TO_STEP[firstField]) {
              setCurrentStep(FIELD_TO_STEP[firstField]);
              window.scrollTo({ top: 120, behavior: "smooth" });
            }
          }
          toast.error("Submission Failed", {
            description: res.error || "Please review the highlighted fields and try again.",
          });
        }
      } catch (err: unknown) {
        console.error("Submission error:", err);
        toast.error("Submission Error", {
          description: err instanceof Error ? err.message : "An unexpected error occurred during submission.",
        });
      }
    });
  };

  // SUCCESS STATE
  if (submittedSuccess) {
    return (
      <div className="rounded-3xl bg-white border border-zinc-200/90 p-8 sm:p-12 shadow-sm max-w-2xl mx-auto text-center space-y-6">
        <div className="size-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
          <CheckCircle2 className="size-10 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider">
            Listing Live & Approved
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Property Published Successfully
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Your property has been published and is now live on the public property portfolio and in your agent inventory.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 max-w-md mx-auto space-y-1">
          <p className="font-semibold text-zinc-900">{formData.title}</p>
          <p>
            {formData.city}, {formData.state} • {formData.currency} {formData.price.toLocaleString()}
          </p>
          <p className="text-emerald-700 font-bold">Status: LIVE / APPROVED</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {createdSlug && (
            <Link
              href={`/properties/${createdSlug}`}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>View Live Listing</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
          <Link
            href="/dashboard/properties"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-xs"
          >
            Manage Your Inventory
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition"
          >
            Agent Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Buyer Auto-Upgrade Notification Banner */}
      {isBuyerRole && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="size-5 text-zinc-200" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Listing as a New Seller</p>
              <p className="text-xs text-zinc-400">
                Your current account is set to Buyer. Submitting this listing will automatically upgrade your profile to <strong>Verified Seller</strong> with direct inquiry access.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold whitespace-nowrap">
            Auto-Upgrade Active
          </span>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          {[
            { num: 1, title: "Basic Details" },
            { num: 2, title: "Specs & Amenities" },
            { num: 3, title: "Location" },
            { num: 4, title: "Media Upload" },
            { num: 5, title: "Contact & Publish" },
          ].map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div
                key={step.num}
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                className={`flex items-center gap-2 select-none cursor-pointer ${
                  isCurrent
                    ? "text-black font-bold"
                    : isCompleted
                    ? "text-zinc-700 hover:text-black font-medium"
                    : "text-zinc-400 opacity-60"
                }`}
              >
                <div
                  className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-black text-white shadow-xs"
                      : isCompleted
                      ? "bg-zinc-100 text-zinc-900 border border-zinc-300"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="size-4" /> : step.num}
                </div>
                <span className="hidden md:inline text-xs">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-3xl bg-white border border-zinc-200/90 p-6 sm:p-10 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
              if (currentStep < 5) {
                handleNext();
              }
            }
          }}
        >
          <AnimatePresence mode="wait">
            {/* ================= STEP 1: BASIC DETAILS ================= */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="border-b border-zinc-100 pb-5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Step 1 of 5
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-zinc-950">
                    Property Identity & Classification
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Enter the fundamental parameters and pricing for your listing.
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. The Glass Horizon Architectural Villa"
                    className={`w-full px-4 py-3 rounded-2xl bg-zinc-50 border text-sm font-medium text-zinc-900 focus:bg-white focus:outline-none transition ${
                      errors.title
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                        : "border-zinc-200 focus:ring-2 focus:ring-black focus:border-transparent"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{errors.title}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-400">
                    Use a descriptive, luxury title to capture discerning buyers and search engines.
                  </p>
                </div>

                {/* Category Grid Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                    Property Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = formData.propertyType === type.value;
                      return (
                        <div
                          key={type.value}
                          onClick={() => updateField("propertyType", type.value)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                            isSelected
                              ? "bg-black text-white border-black shadow-sm"
                              : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                          }`}
                        >
                          <IconComponent
                            className={`size-6 mb-2 ${isSelected ? "text-white" : "text-zinc-600"}`}
                          />
                          <div>
                            <span className="font-heading text-sm font-bold block">{type.label}</span>
                            <span
                              className={`text-[10px] block mt-0.5 ${
                                isSelected ? "text-zinc-300" : "text-zinc-400"
                              }`}
                            >
                              {type.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Listing Type & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Listing Type Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                      Transaction Mode
                    </label>
                    <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => updateField("listingType", "FOR_SALE")}
                        className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                          formData.listingType === "FOR_SALE"
                            ? "bg-white text-black shadow-xs"
                            : "text-zinc-600 hover:text-black"
                        }`}
                      >
                        For Sale
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("listingType", "FOR_RENT")}
                        className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                          formData.listingType === "FOR_RENT"
                            ? "bg-white text-black shadow-xs"
                            : "text-zinc-600 hover:text-black"
                        }`}
                      >
                        For Rent
                      </button>
                    </div>
                  </div>

                  {/* Currency Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateField("currency", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="USD">USD ($ - United States Dollar)</option>
                      <option value="PKR">PKR (Rs - Pakistani Rupee)</option>
                    </select>
                  </div>

                  {/* Price Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                      Target Asking Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                        {formData.currency === "USD" ? "$" : "Rs"}
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="any"
                        value={formData.price || ""}
                        onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                        placeholder="1,500,000"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 border text-sm font-mono font-bold text-zinc-900 focus:bg-white focus:outline-none transition ${
                          errors.price
                            ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                            : "border-zinc-200 focus:ring-2 focus:ring-black"
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{errors.price}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Narrative Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                      Architectural Narrative & Description *
                    </label>
                    <span className="text-[11px] text-zinc-400">
                      {formData.description.length} / 20 min chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Highlight the architectural lineage, finishes, natural lighting, and lifestyle possibilities..."
                    className={`w-full p-4 rounded-2xl bg-zinc-50 border text-sm text-zinc-900 focus:bg-white focus:outline-none transition leading-relaxed ${
                      errors.description
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                        : "border-zinc-200 focus:ring-2 focus:ring-black"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: SPECS & AMENITIES ================= */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="border-b border-zinc-100 pb-5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Step 2 of 5
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-zinc-950">
                    Architectural Specifications & Amenities
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Define the scale, dimensions, and luxury amenities included with the residence.
                  </p>
                </div>

                {/* Numeric Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase">
                      <Bed className="size-3.5" /> Bedrooms
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => updateField("bedrooms", parseInt(e.target.value) || 0)}
                      className="w-full text-xl font-bold font-heading text-zinc-950 bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase">
                      <Bath className="size-3.5" /> Bathrooms
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={(e) => updateField("bathrooms", parseInt(e.target.value) || 0)}
                      className="w-full text-xl font-bold font-heading text-zinc-950 bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className={`p-4 rounded-2xl bg-zinc-50 border space-y-1 transition ${
                    errors.areaSqFt ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20" : "border-zinc-200"
                  }`}>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase">
                      <Maximize2 className="size-3.5" /> Area (SqFt) *
                    </div>
                    <input
                      type="number"
                      min="10"
                      required
                      value={formData.areaSqFt}
                      onChange={(e) => updateField("areaSqFt", parseFloat(e.target.value) || 0)}
                      className="w-full text-xl font-bold font-heading text-zinc-950 bg-transparent focus:outline-none"
                    />
                    {errors.areaSqFt && (
                      <p className="text-[10px] text-red-600 font-medium">
                        {errors.areaSqFt}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase">
                      <Car className="size-3.5" /> Garage Spaces
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.garageSpaces}
                      onChange={(e) => updateField("garageSpaces", parseInt(e.target.value) || 0)}
                      className="w-full text-xl font-bold font-heading text-zinc-950 bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase">
                      <Calendar className="size-3.5" /> Built Year
                    </div>
                    <input
                      type="number"
                      min="1800"
                      max={new Date().getFullYear() + 2}
                      value={formData.yearBuilt || ""}
                      onChange={(e) => updateField("yearBuilt", parseInt(e.target.value) || null)}
                      placeholder="e.g. 2023"
                      className="w-full text-xl font-bold font-heading text-zinc-950 bg-transparent focus:outline-none placeholder:text-zinc-300"
                    />
                  </div>
                </div>

                {/* Amenities Checkbox Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                    Luxury Amenities & Fixtures ({formData.amenities.length} Selected)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITY_OPTIONS.map((item) => {
                      const IconComponent = item.icon;
                      const isChecked = formData.amenities.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAmenity(item.id)}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                            isChecked
                              ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                              : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          <div
                            className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isChecked ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            <IconComponent className="size-4" />
                          </div>
                          <span className="text-xs font-semibold flex-1">{item.label}</span>
                          <div
                            className={`size-4 rounded-full border flex items-center justify-center ${
                              isChecked
                                ? "bg-white text-black border-white"
                                : "border-zinc-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="size-3.5 fill-black stroke-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: LOCATION ================= */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="border-b border-zinc-100 pb-5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Step 3 of 5
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-zinc-950">
                    Location & Geographic Coordinates
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pinpoint the address and coordinates for map displays and buyer distance queries.
                  </p>
                </div>

                {/* Street Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="e.g. 14820 Skyline Crest Way"
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 border text-sm font-medium text-zinc-900 focus:bg-white focus:outline-none transition ${
                        errors.address
                          ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                          : "border-zinc-200 focus:ring-2 focus:ring-black"
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="e.g. Beverly Hills"
                      className={`w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border text-sm font-medium text-zinc-900 focus:bg-white focus:outline-none transition ${
                        errors.city
                          ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                          : "border-zinc-200 focus:ring-2 focus:ring-black"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{errors.city}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      placeholder="e.g. CA"
                      className={`w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border text-sm font-medium text-zinc-900 focus:bg-white focus:outline-none transition ${
                        errors.state
                          ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                          : "border-zinc-200 focus:ring-2 focus:ring-black"
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{errors.state}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                      Postal / Zip Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => updateField("zipCode", e.target.value)}
                      placeholder="e.g. 90210"
                      className={`w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border text-sm font-medium text-zinc-900 focus:bg-white focus:outline-none transition ${
                        errors.zipCode
                          ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                          : "border-zinc-200 focus:ring-2 focus:ring-black"
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{errors.zipCode}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Pin-Drop Map */}
                <PinDropMap
                  city={formData.city}
                  latitude={formData.latitude ?? null}
                  longitude={formData.longitude ?? null}
                  onChange={(lat, lng) => {
                    updateField("latitude", lat);
                    updateField("longitude", lng);
                  }}
                />
              </motion.div>
            )}

            {/* ================= STEP 4: PHOTO & MEDIA UPLOAD ================= */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="border-b border-zinc-100 pb-5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Step 4 of 5
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-zinc-950">
                    High-Resolution Photography & Virtual Tour
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Drag and drop up to 10 photos. Reorder thumbnails to establish your primary cover shot.
                  </p>
                </div>

                {errors.images && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0 text-red-600" />
                    <span>{errors.images}</span>
                  </div>
                )}

                <MediaUploader
                  images={formData.images}
                  videoTourUrl={formData.videoTourUrl}
                  onChangeImages={(imgs) => {
                    updateField("images", imgs);
                    clearError("images");
                  }}
                  onChangeVideoTourUrl={(url) => updateField("videoTourUrl", url)}
                />
              </motion.div>
            )}

            {/* ================= STEP 5: SELLER CONTACT & PUBLISH ================= */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="border-b border-zinc-100 pb-5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Step 5 of 5
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-zinc-950">
                    Seller Contact Routing & Final Verification
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Provide buyer communication preferences and confirm submission details.
                  </p>
                </div>

                {/* Direct Inquiries Phone & WhatsApp */}
                <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/90 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="size-3.5 text-zinc-600" />
                      <span>Primary Contact Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full px-4 py-2.5 rounded-2xl bg-white border text-sm font-medium text-zinc-900 focus:outline-none transition ${
                        errors.phone
                          ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                          : "border-zinc-200 focus:ring-2 focus:ring-black"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-400">
                      Buyers and our concierge desk will contact you via this number for scheduling tours.
                    </p>
                  </div>

                  {/* WhatsApp Direct Toggle */}
                  <div className="pt-4 border-t border-zinc-200/80 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <MessageSquare className="size-3.5 text-emerald-600" />
                        <span>Direct WhatsApp Buyer Chat</span>
                      </span>
                      <p className="text-[11px] text-zinc-500">
                        Enable instant 1-click WhatsApp messaging on your property showcase page.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.whatsappDirect}
                        onChange={(e) => updateField("whatsappDirect", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                    </label>
                  </div>

                  {formData.whatsappDirect && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                        WhatsApp Number (with country code)
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsappNumber || ""}
                        onChange={(e) => updateField("whatsappNumber", e.target.value)}
                        placeholder="+15550000000"
                        className={`w-full px-4 py-2.5 rounded-2xl bg-white border text-sm font-medium text-zinc-900 focus:outline-none transition ${
                          errors.whatsappNumber
                            ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20"
                            : "border-zinc-200 focus:ring-2 focus:ring-black"
                        }`}
                      />
                      {errors.whatsappNumber && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="size-3.5 shrink-0" />
                          <span>{errors.whatsappNumber}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Listing Summary Preview Box */}
                <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm font-bold text-zinc-950 uppercase tracking-wider">
                      Listing Summary Preview
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                      Status: PENDING_APPROVAL
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-400 block">Title</span>
                      <span className="font-semibold text-zinc-900 truncate block">
                        {formData.title || "Untitled Property"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Asking Price</span>
                      <span className="font-semibold text-zinc-900 block font-mono">
                        {formData.currency} {formData.price.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Location</span>
                      <span className="font-semibold text-zinc-900 block truncate">
                        {formData.city || "N/A"}, {formData.state || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Gallery Media</span>
                      <span className="font-semibold text-zinc-900 block">
                        {formData.images.length} Photos Uploaded
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-zinc-700 shrink-0" />
                    <span>
                      Our curation committee reviews all private listings for title authenticity before publishing to the global public feed.
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-zinc-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold hover:bg-zinc-200 transition cursor-pointer select-none"
              >
                <ArrowLeft className="size-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                key={`step-next-btn-${currentStep}`}
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer select-none shadow-xs"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                key="step-submit-btn"
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition cursor-pointer select-none shadow-md disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                <span>{isPending ? "Publishing Listing..." : "Publish & Submit Listing"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
