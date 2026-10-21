"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [role, setRole] = useState<"BUYER" | "AGENT">("BUYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone: phone || null,
          agencyName: role === "AGENT" ? agencyName || null : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: role === "AGENT" ? "/dashboard" : "/profile",
      });

      if (signInRes?.ok) {
        router.push(role === "AGENT" ? "/dashboard" : "/profile");
        router.refresh();
      } else {
        router.push("/login?message=Account created! Please sign in.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      // 1. Set short-lived document cookie for selected_role
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      document.cookie = `selected_role=${role}; path=/; max-age=300; SameSite=Lax${isHttps ? "; Secure" : ""}`;

      // 2. Direct user to appropriate destination post-login:
      // If user selected AGENT -> /dashboard
      // If user selected BUYER -> /properties (or specific callbackUrl if passed in query)
      const callbackTarget =
        callbackUrl && callbackUrl !== "/"
          ? callbackUrl
          : role === "AGENT"
          ? "/dashboard"
          : "/properties";

      await signIn("google", { callbackUrl: callbackTarget });
    } catch (err) {
      console.error("Google sign up error:", err);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2 text-left">
        <Link href="/" className="inline-block mb-3">
          <Image
            src="/logo.svg"
            alt="HavenStone Estates"
            width={100}
            height={32}
            style={{ width: "auto", height: "auto" }}
            className="h-8 w-auto invert"
          />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-medium border border-zinc-200">
            Membership Portal
          </span>
          <span className="text-xs text-zinc-400">Immediate Access</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-medium tracking-tight text-zinc-900 pt-1">
          Create an Account
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-sans">
          Join our curated network of property buyers, sellers, and certified agents.
        </p>
      </div>

      {/* Role Selector Tabs - Clean Monochrome */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
          <button
            type="button"
            onClick={() => setRole("BUYER")}
            className={`py-2.5 px-3 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              role === "BUYER"
                ? "bg-black text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span className="font-semibold text-xs">BUYER</span>
            <span className={`text-[10px] ${role === "BUYER" ? "text-zinc-300" : "text-zinc-400"}`}>
              Private Client
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("AGENT")}
            className={`py-2.5 px-3 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              role === "AGENT"
                ? "bg-black text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span className="font-semibold text-xs">AGENT</span>
            <span className={`text-[10px] ${role === "AGENT" ? "text-zinc-300" : "text-zinc-400"}`}>
              Licensed Broker
            </span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2.5">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success notification */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Account created! Redirecting to your portal...</span>
        </div>
      )}

      {/* Google OAuth One-Click */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="w-full h-11 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
      >
        <svg className="size-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>Sign up with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-zinc-200" />
        <span className="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-zinc-400">
          or sign up with email
        </span>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
            Full Name
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="Michael Anderson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="email"
              required
              placeholder="michael@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="Min. 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Conditional Agent fields */}
        {role === "AGENT" && (
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-700">
              Brokerage / Agency Affiliation
            </label>
            <div className="relative flex items-center">
              <Building2 className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                required={role === "AGENT"}
                placeholder="e.g. Sotheby's, Compass, Christie's"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>
        )}

        {/* Clean Black Button matching site */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
        >
          <span>{loading ? "Creating account..." : `Create ${role === "AGENT" ? "Agent" : "Buyer"} Account`}</span>
          <ArrowRight className="size-4" />
        </button>
      </form>

      {/* Footer link */}
      <div className="text-center text-xs text-zinc-500 pt-1">
        Already have an account?{" "}
        <Link
          href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-zinc-900 underline underline-offset-4 hover:text-black transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column: Architectural Visual */}
      <div className="hidden lg:flex lg:col-span-6 relative bg-zinc-950 p-12 flex-col justify-between overflow-hidden">
        <Image
          src="/assets/galleryImage2.png"
          alt="Luxury Architecture"
          fill
          priority
          className="object-cover opacity-50 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />

        {/* Top brand */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="HavenStone Estates"
            width={100}
            height={36}
            className="brightness-200 h-8 w-auto"
          />
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
            Private Portal
          </span>
        </div>

        {/* Bottom card */}
        <div className="relative z-10 space-y-3 max-w-lg bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-white/15 text-white">
          <p className="font-heading text-lg font-medium leading-relaxed">
            &ldquo;Helping families, investors, and advisors acquire exceptional residences with utmost discretion and confidence.&rdquo;
          </p>
          <div className="space-y-1.5 text-xs text-zinc-300 font-sans pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-zinc-300" />
              <span><strong>Buyer:</strong> Save favorites, book private tours, view verified deeds.</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="size-3.5 text-zinc-300" />
              <span><strong>Agent:</strong> Manage listings, track buyer interest, publish inventory.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container with White Background */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <Suspense fallback={<div className="text-sm text-zinc-400">Loading registration...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
