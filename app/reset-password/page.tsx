"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { resetPassword } from "@/app/actions/password-reset";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // If token or email is missing in URL parameters
  if (!token || !email) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="size-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-zinc-900">
            Invalid Password Reset Link
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            This reset link is incomplete or missing necessary security parameters. Please request a new recovery link.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <RotateCcw className="size-4" />
          <span>Request New Reset Link</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(email, token, password);

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update password. Token may have expired.");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-zinc-900">
            Password Updated!
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
            Your account password for <strong>{email}</strong> has been successfully updated. You can now access your account with your new credentials.
          </p>
        </div>
        <Link
          href="/login"
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <span>Sign In to Account</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2 text-left">
        <Link href="/" className="inline-block mb-1">
          <Image
            src="/logo.svg"
            alt="estate"
            width={100}
            height={32}
            style={{ width: "auto", height: "auto" }}
            className="h-8 w-auto invert"
          />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-medium border border-zinc-200">
            Secure Credential Update
          </span>
          <span className="text-xs text-zinc-400">Encrypted</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-medium tracking-tight text-zinc-900 pt-1">
          Set New Password
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed font-sans">
          Create a strong password for <strong>{email}</strong>.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2.5">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
            New Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold tracking-wider uppercase text-zinc-600">
            Confirm New Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 size-4 text-zinc-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
        >
          <span>{loading ? "Updating password..." : "Confirm New Password"}</span>
          <ArrowRight className="size-4" />
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
            alt="estate"
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
            &ldquo;Safeguarding client assets starts with impenetrable account credentials. Your new password will be encrypted using salt-rounds cryptography.&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs text-zinc-400 font-sans pt-2 border-t border-white/10">
            <span>Client & Broker Network</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck className="size-3.5" /> SHA-256 / Bcrypt Cost 12
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <Suspense fallback={<div className="text-sm text-zinc-400">Verifying secure token...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
