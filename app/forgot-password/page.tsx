"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { requestPasswordReset } from "@/app/actions/password-reset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setDevResetUrl(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await requestPasswordReset(email);

      if (!res.success) {
        setErrorMessage(res.error || "Failed to process password reset request.");
      } else {
        setSuccessMessage(res.message);
        if (res.resetUrl) {
          setDevResetUrl(res.resetUrl);
        }
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column: Architectural Visual */}
      <div className="hidden lg:flex lg:col-span-6 relative bg-zinc-950 p-12 flex-col justify-between overflow-hidden">
        <Image
          src="/assets/house.png"
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
            Account Security
          </span>
        </div>

        {/* Bottom card */}
        <div className="relative z-10 space-y-3 max-w-lg bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-white/15 text-white">
          <p className="font-heading text-lg font-medium leading-relaxed">
            &ldquo;Security and privacy are the foundation of every luxury real estate transaction. Protect your credentials with end-to-end encrypted recovery.&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs text-zinc-400 font-sans pt-2 border-t border-white/10">
            <span>Client & Broker Network</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck className="size-3.5" /> 256-bit Encrypted Token
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Sign In</span>
          </Link>

          {/* Header */}
          <div className="space-y-2 text-left">
            <Link href="/" className="inline-block mb-1">
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
                Password Recovery
              </span>
              <span className="text-xs text-zinc-400">Secure</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-medium tracking-tight text-zinc-900 pt-1">
              Forgot Password?
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed font-sans">
              Enter your registered email address below and we will dispatch a secure link to reset your account password.
            </p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success state */}
          {successMessage ? (
            <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-sm text-emerald-900">
                    Recovery Link Dispatched
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {successMessage}
                  </p>
                </div>
              </div>

              {/* Development instant-test button */}
              {devResetUrl && (
                <div className="pt-2 border-t border-emerald-200/80 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
                    Direct Verification Link:
                  </span>
                  <Link
                    href={devResetUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Proceed to Reset Password</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage("");
                    setDevResetUrl(null);
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-medium underline cursor-pointer"
                >
                  Try another email
                </button>
                <Link
                  href="/login"
                  className="text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  Return to Login →
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
                  Registered Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{loading ? "Verifying..." : "Send Reset Link"}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          )}

          {/* Footer link */}
          <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
            Remember your credentials?{" "}
            <Link
              href="/login"
              className="font-semibold text-zinc-900 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
