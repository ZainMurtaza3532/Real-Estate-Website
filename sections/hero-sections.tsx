"use client";

import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <motion.section className="flex flex-col items-center min-h-screen justify-center bg-black bg-[url('/hero-image.png')] bg-cover bg-center bg-no-repeat px-4 w-full"
      initial={{ opacity: 0.4 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="bg-white/20 backdrop-blur text-sm text-white pl-2 pr-4 py-1 rounded-full flex items-center gap-2 border border-white/20"
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
      >
        <HomeIcon size={16} />
        <p>Helping Families Find Their Dream Homes</p>
      </motion.div>
      <motion.h1 className="text-5xl md:text-[64px] text-zinc-50 font-medium max-w-3xl text-center mt-5 leading-tight"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
      >
        Helping You Find the Perfect Place to Call Home
      </motion.h1>
      <motion.p className="text-white max-w-120 text-center mt-3"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
      >
        Discover exceptional properties, expert advice and a seamless buying or selling experience tailored to your goals.
      </motion.p>
      <motion.div className="flex items-center gap-4 mt-8"
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
    </motion.section>
  )
}