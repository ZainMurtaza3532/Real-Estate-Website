"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide global footer on printable brochure pages
  if (pathname?.includes("/brochure")) {
    return null;
  }

  return (
    <footer className="bg-black text-white pt-16 pb-8 mt-0 px-4 md:px-16 lg:px-24 xl:px-32 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16">

          {/* Left Brand Details */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <Link href="/" aria-label="HavenStone Estates Homepage" className="select-none inline-block">
              <Image
                src="/logo.svg"
                alt="HavenStone Estates"
                width={160}
                height={36}
                loading="lazy"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-zinc-300 text-sm/5.5 max-w-md">
              Helping buyers, seller and investors find the right property with confidence and expert guidance.
            </p>
            <div className="text-xs text-zinc-400 flex flex-col gap-1">
              <span>100 Ocean Drive, Suite 400, Miami, FL 33139</span>
              <span>Direct: +1 555 019 2831</span>
            </div>
          </div>

          {/* Right Link Columns */}
          <div className="lg:col-span-5 flex justify-between gap-8 flex-wrap">
            {/* Explore */}
            <div className="flex flex-col gap-5">
              <span className="text-white">Explore</span>
              <div className="flex flex-col gap-3 text-xs text-zinc-300">
                <motion.a href="/" className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Home
                </motion.a>
                <motion.a href="/properties" className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Properties
                </motion.a>
                <motion.a href="/properties" className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Neighborhoods
                </motion.a>
                <motion.a href="/#contact" className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Private Advisors
                </motion.a>
                <motion.a href="/#testimonials" className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Client Reviews
                </motion.a>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-5">
              <span className="text-white">Social</span>
              <div className="flex flex-col gap-3 text-xs text-zinc-300">
                <motion.a
                  href="https://instagram.com/havenstone"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HavenStone on Instagram"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Instagram
                </motion.a>
                <motion.a
                  href="https://linkedin.com/company/havenstone"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HavenStone on LinkedIn"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  LinkedIn
                </motion.a>
                <motion.a
                  href="https://x.com/havenstone"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HavenStone on X / Twitter"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Twitter / X
                </motion.a>
                <motion.a
                  href="https://facebook.com/havenstone"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HavenStone Facebook Page"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Facebook Page
                </motion.a>
                <motion.a
                  href="https://youtube.com/@havenstone"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HavenStone YouTube Channel"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  YouTube Channel
                </motion.a>
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-5">
              <span className="text-white">Company</span>
              <div className="flex flex-col gap-3 text-xs text-zinc-300">
                <motion.a
                  href="/about"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  About Us
                </motion.a>
                <motion.a
                  href="/#faq"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  FAQ
                </motion.a>
                <motion.a
                  href="/about#careers"
                  className="hover:text-white transition-colors duration-200"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                  Careers
                </motion.a>
              </div>
            </div>

          </div>
        </div>

        <div className="w-full h-px bg-zinc-800"></div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-5 text-xs text-zinc-300">
          <p>Copyright {new Date().getFullYear()} © HavenStone Realty. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link>
            <Link href="/privacy#cookies" className="hover:text-white transition-colors duration-200">Cookie Policy</Link>
          </div>
        </div>
        <p className="pt-4 text-[11px] text-zinc-400 text-center sm:text-left leading-relaxed">
          Disclaimer: All property descriptions, square footage, dimensions, and financial data are for informational purposes and deemed reliable but not guaranteed. Equal Housing Opportunity.
        </p>
      </div>
    </footer>
  );
}
