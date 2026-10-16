"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import { submitContactForm } from "@/actions/inquiries";
import { Send, CheckCircle2, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

const houseImage = "/assets/house.png";

export function Contact() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await submitContactForm(formData);

      if (res.success) {
        toast.success("Inquiry Transmitted!", {
          description: res.message || "An advisor will reach out to you shortly.",
        });
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error("Submission Error", {
          description: res.error || "Please check your inputs and try again.",
        });
      }
    });
  };

  return (
    <section id="contact" className="py-24 w-full flex items-center justify-center scroll-mt-20">
      <div className="max-w-5xl w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Contact Form */}
        <div className="flex flex-col">
          <motion.div
            className="flex items-center gap-1.5"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <span className="size-1.5 bg-zinc-900 rounded-full"></span>
            <span className="text-xs font-semibold text-zinc-900 tracking-wider uppercase">
              VIP Contact
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-[40px]/11 text-zinc-900 mt-4 leading-tight font-medium max-w-[420px]"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            Connect with us <br />to secure the best deal
          </motion.h2>

          <p className="text-xs text-zinc-500 mt-2">
            Directly connect with our private acquisition advisors for off-market access.
          </p>

          {/* Submitted Success Confirmation */}
          {submitted ? (
            <div className="mt-10 p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-3">
              <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <h4 className="font-heading text-lg font-bold text-zinc-950">
                Message Received
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Thank you for contacting PrebuiltUI Private Brokerage. A dedicated advisor has been assigned to your request and will contact you promptly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-zinc-900 underline hover:text-black cursor-pointer pt-1 inline-block"
              >
                Send another message &rarr;
              </button>
            </div>
          ) : (
            /* Active Form */
            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Michael Anderson"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="michael@luxuryportfolio.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Phone */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 456-7890"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
                  />
                </div>

                {/* Subject */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acquisition of Beverly Hills Villa"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you are looking for in terms of location, architectural style, or timeline..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-7 py-3.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>GET STARTED</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Confidential inquiry</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Key Details Image Card */}
        <motion.div
          className="relative overflow-hidden group flex justify-center"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
          <div className="relative w-[382px] h-[455px] overflow-hidden rounded-3xl border border-zinc-200 shadow-lg">
            <Image
              src={houseImage}
              alt="PrebuiltUI Private Estate"
              width={382}
              height={455}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none brightness-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Details Content Overlay */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-3 z-10 text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                Private Advisory Hours
              </span>
              <div className="flex flex-col gap-1.5 text-xs text-zinc-200 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-zinc-400" />
                  <span>Mon – Fri: 9:00 AM – 7:00 PM EST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-zinc-400" />
                  <span>Saturday: 10:00 AM – 5:00 PM EST</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[11px] text-zinc-300">
                  <Phone className="size-3 text-zinc-400" />
                  <span>Dedicated Private Line: +1 (555) 019-2831</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
