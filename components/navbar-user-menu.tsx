"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  User,
  Heart,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export function NavbarUserMenu() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  const { name, email, image, role } = session.user;
  const isAgentOrAdmin = role === "SELLER" || role === "AGENT" || role === "ADMIN";

  // Initials fallback
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/90 border border-zinc-200 hover:border-zinc-400 transition-all cursor-pointer select-none shadow-xs"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        {image ? (
          <Image
            src={image}
            alt={name || "User Avatar"}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover border border-zinc-200"
          />
        ) : (
          <div className="size-8 rounded-full bg-zinc-900 text-white font-medium text-xs flex items-center justify-center">
            {initials}
          </div>
        )}

        <div className="hidden xl:flex flex-col text-left leading-tight">
          <span className="text-xs font-semibold text-zinc-900 max-w-[100px] truncate">
            {name || "Member"}
          </span>
          <span className="text-[10px] text-zinc-500 font-medium">
            {role}
          </span>
        </div>

        <ChevronDown
          className={`size-3.5 text-zinc-500 transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl z-50 overflow-hidden text-zinc-900"
          >
            {/* User Details header */}
            <div className="px-3 py-2.5 pb-3 border-b border-zinc-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 truncate max-w-[140px]">
                  {name || "Valued Client"}
                </span>
                <Badge
                  variant={isAgentOrAdmin ? "default" : "secondary"}
                  size="sm"
                >
                  {role}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{email}</p>
            </div>

            {/* Links */}
            <div className="py-1.5 space-y-0.5 text-xs font-medium">
              {/* Admin Portal Link */}
              {role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-950 bg-amber-500/10 hover:bg-amber-500/20 transition-colors font-bold border border-amber-500/20"
                >
                  <ShieldCheck className="size-4 text-amber-600" />
                  <span>Super Admin Gateway</span>
                </Link>
              )}

              {/* Dashboard Link for Agent and Admin only */}
              {isAgentOrAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-900 hover:bg-zinc-100 transition-colors font-semibold"
                >
                  <LayoutDashboard className="size-4 text-zinc-700" />
                  <span>Agent Dashboard</span>
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <User className="size-4 text-zinc-500" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/favorites"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <Heart className="size-4 text-zinc-500" />
                <span>Saved Listings</span>
              </Link>
            </div>

            {/* Logout button */}
            <div className="pt-1.5 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
