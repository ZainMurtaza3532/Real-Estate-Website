"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const [imgSrc, setImgSrc] = useState("/images/hero-bg.jpg");

  return (
    <motion.section
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center px-4 w-full overflow-hidden isolate"
      initial={{ opacity: 0.4 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Background Wrapper */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={imgSrc}
          alt="HavenStone Luxury Architecture Villa"
          fill
          priority={true}
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
          onError={() =>
            setImgSrc(
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            )
          }
        />
        {/* Subtle cinematic gradient: clear in center, slight darkening at top for navbar & center for text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-transparent to-black/40" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 text-white flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div
          className="bg-white/20 backdrop-blur text-sm text-white pl-2 pr-4 py-1 rounded-full flex items-center gap-2 border border-white/20"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          <HomeIcon size={16} />
          <p>Helping Families Find Their Dream Homes</p>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-[64px] text-zinc-50 font-medium max-w-3xl text-center mt-5 leading-tight"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          Find Your Dream Luxury Home with HavenStone Estates
        </motion.h1>

        <motion.p
          className="text-white max-w-120 text-center mt-3 text-sm md:text-base leading-relaxed"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          Discover exceptional properties, expert advice and a seamless buying or selling experience tailored to your goals.
        </motion.p>

        <motion.div
          className="flex items-center gap-4 mt-8"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          <Link href="/properties">
            <button className="bg-zinc-50 hover:bg-zinc-200 px-6 py-2.5 rounded-md text-zinc-800 text-sm font-medium cursor-pointer transition">
              View Listings
            </button>
          </Link>
          <Link href="#contact">
            <button className="border border-slate-200 text-zinc-50 px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition group">
              <div className="relative overflow-hidden">
                <span className="block transition-transform duration-200 group-hover:-translate-y-full">
                  Book a Call
                </span>
                <span className="absolute top-0 left-0 block transition-transform duration-200 group-hover:translate-y-0 translate-y-full">
                  Book a Call
                </span>
              </div>
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
