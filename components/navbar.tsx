"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { NavbarUserMenu } from "@/components/navbar-user-menu";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Heart,
  LogOut,
  LogIn,
} from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  const isLightMode = scrolled || !isHome;
  const isPill = scrolled || !isHome;

  const isAgentOrAdmin =
    session?.user?.role === "SELLER" ||
    session?.user?.role === "AGENT" ||
    session?.user?.role === "ADMIN";

  // Hide global consumer navbar on printable brochure pages
  if (pathname?.includes("/brochure")) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Main Navigation"
        className={`fixed z-40 flex items-center justify-between left-1/2 -translate-x-1/2 transition-all duration-500 py-3.5 px-6 ${isPill
            ? "lg:w-5xl w-[calc(100vw-24px)] bg-white/95 backdrop-blur-xl rounded-full mt-4 border border-zinc-200/80 shadow-md"
            : "md:px-16 lg:px-24 xl:px-32 w-full pt-6"
          }`}
      >
        <Link href="/" className="flex items-center gap-3 select-none group">
          <Image
            width={100}
            height={40}
            src="/logo.svg"
            alt="HavenStone Estates"
            style={{ width: "auto", height: "auto" }}
            className={`transition-all duration-500 h-8 w-auto ${isLightMode ? "invert opacity-90" : "brightness-200"
              }`}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors duration-300 ${pathname === "/"
                ? isLightMode
                  ? "text-zinc-950 font-bold"
                  : "text-white font-bold"
                : isLightMode
                  ? "text-zinc-600 hover:text-zinc-950"
                  : "text-white/80 hover:text-white"
              }`}
          >
            Home
          </Link>
          <Link
            href="/properties"
            className={`transition-colors duration-300 ${pathname.startsWith("/properties")
                ? isLightMode
                  ? "text-zinc-950 font-bold"
                  : "text-white font-bold"
                : isLightMode
                  ? "text-zinc-600 hover:text-zinc-950"
                  : "text-white/80 hover:text-white"
              }`}
          >
            Properties
          </Link>
          <Link
            href="/#services"
            className={`transition-colors duration-300 ${isLightMode
                ? "text-zinc-600 hover:text-zinc-950"
                : "text-white/80 hover:text-white"
              }`}
          >
            Services
          </Link>
          <Link
            href="/#testimonials"
            className={`transition-colors duration-300 ${isLightMode
                ? "text-zinc-600 hover:text-zinc-950"
                : "text-white/80 hover:text-white"
              }`}
          >
            Testimonials
          </Link>
          <Link
            href="/#contact"
            className={`transition-colors duration-300 ${isLightMode
                ? "text-zinc-600 hover:text-zinc-950"
                : "text-white/80 hover:text-white"
              }`}
          >
            Contact
          </Link>
        </div>

        {/* Auth / User Menu button */}
        <div className="hidden md:flex items-center gap-3">
          {status === "authenticated" && session?.user ? (
            <NavbarUserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`px-4 py-2 text-sm font-medium transition-colors ${isLightMode
                    ? "text-zinc-700 hover:text-zinc-950"
                    : "text-white hover:text-white/80"
                  }`}
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-xs ${isLightMode
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-white text-zinc-900 hover:bg-zinc-100"
                  }`}
              >
                Join Portal
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className={`md:hidden p-2 rounded-xl transition cursor-pointer ${isLightMode ? "text-zinc-800 hover:bg-zinc-100" : "text-white hover:bg-white/10"
            }`}
        >
          <Menu className="size-6" />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`${mobileOpen ? "w-full opacity-100 pointer-events-auto" : "w-0 opacity-0 pointer-events-none"
          } md:hidden fixed inset-0 z-50 transition-all duration-300 overflow-hidden bg-zinc-950/95 backdrop-blur-2xl flex flex-col justify-center items-center gap-6 px-8 text-lg font-medium`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white bg-white/10"
        >
          <X className="size-6" />
        </button>

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="text-white hover:text-zinc-300 text-xl font-heading"
        >
          Home
        </Link>
        <Link
          href="/properties"
          onClick={() => setMobileOpen(false)}
          className="text-white hover:text-zinc-300 text-xl font-heading"
        >
          Properties
        </Link>
        <Link
          href="/#services"
          onClick={() => setMobileOpen(false)}
          className="text-white hover:text-zinc-300 text-xl font-heading"
        >
          Services
        </Link>
        <Link
          href="/#testimonials"
          onClick={() => setMobileOpen(false)}
          className="text-white hover:text-zinc-300 text-xl font-heading"
        >
          Testimonials
        </Link>
        <Link
          href="/#contact"
          onClick={() => setMobileOpen(false)}
          className="text-white hover:text-zinc-300 text-xl font-heading"
        >
          Contact
        </Link>

        {/* Mobile user / auth actions */}
        <div className="w-full max-w-xs pt-4 flex flex-col gap-3 border-t border-white/10 mt-2">
          {status === "authenticated" && session?.user ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 text-white">
                <div className="size-9 rounded-full bg-white text-zinc-900 font-semibold text-xs flex items-center justify-center">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col leading-tight truncate">
                  <span className="text-sm font-semibold truncate">{session.user.name}</span>
                  <span className="text-[10px] text-zinc-400 font-medium">{session.user.role}</span>
                </div>
              </div>

              {isAgentOrAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Agent Dashboard</span>
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl text-white text-sm"
              >
                <User className="size-4 text-zinc-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl text-white text-sm"
              >
                <Heart className="size-4 text-zinc-400" />
                <span>Saved Listings</span>
              </Link>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl text-red-400 text-sm font-semibold cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full border border-white/20 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <LogIn className="size-4" /> Sign In
                </button>
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <button className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-sm font-semibold">
                  Join Portal
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
