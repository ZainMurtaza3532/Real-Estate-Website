"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ExternalLink } from "lucide-react";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FaqItem[] = [
  {
    question: "How do I schedule a private villa tour?",
    answer:
      "You can book a private, confidential walkthrough directly through any property listing page by clicking 'Book a Tour' or reaching out to our concierge. We arrange in-person viewings, private chauffeur services upon request, and ultra-high-definition 360-degree virtual tours for international buyers.",
  },
  {
    question: "What financing and mortgage options are available?",
    answer: (
      <span>
        HavenStone collaborates with premier private wealth banks and boutique lenders specializing in jumbo loans, cross-border financing, and tailored asset-backed lending with competitive fixed and adjustable rates. For macroeconomic benchmarks, review the latest{" "}
        <a
          href="https://www.federalreserve.gov/releases/h15/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium text-zinc-950 hover:text-zinc-700 inline-flex items-center gap-1"
        >
          Federal Reserve Mortgage Rates & Selected Interest Data
          <ExternalLink className="size-3 inline" />
        </a>
        .
      </span>
    ),
  },
  {
    question: "Are HavenStone property listings verified for authenticity?",
    answer: (
      <span>
        Yes. Every estate featured on HavenStone Estates undergoes a rigorous 7-point due diligence check, verifying legal title, deed history, zoning compliance, and architectural documentation before public or private showcase. All represented agents strictly abide by the{" "}
        <a
          href="https://www.nar.realtor/about-nar/governing-documents/code-of-ethics"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium text-zinc-950 hover:text-zinc-700 inline-flex items-center gap-1"
        >
          National Association of Realtors (NAR) Code of Ethics
          <ExternalLink className="size-3 inline" />
        </a>
        .
      </span>
    ),
  },
  {
    question: "How does HavenStone protect privacy for high-profile clients?",
    answer:
      "Client discretion is paramount. We routinely facilitate confidential acquisitions through blind trusts, family offices, and specialized LLCs. Off-market pocket listings require executed non-disclosure agreements (NDAs) to protect buyer and seller privacy.",
  },
  {
    question: "What is the typical timeline for closing a luxury transaction?",
    answer:
      "All-cash purchases often finalize within 10 to 14 business days. Purchases requiring specialized financing or bespoke legal structures typically close within 30 to 45 days. Our dedicated closing advisors oversee escrow, title insurance, and inspections seamlessly.",
  },
  {
    question: "Where can I review authoritative luxury housing market trends?",
    answer: (
      <span>
        In addition to our bespoke quarterly market reports, we cross-reference independent residential velocity and pricing data published by the{" "}
        <a
          href="https://www.nar.realtor/research-and-statistics"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium text-zinc-950 hover:text-zinc-700 inline-flex items-center gap-1"
        >
          NAR Research & Real Estate Statistics
          <ExternalLink className="size-3 inline" />
        </a>
        {" "}and the{" "}
        <a
          href="https://fred.stlouisfed.org/categories/97"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium text-zinc-950 hover:text-zinc-700 inline-flex items-center gap-1"
        >
          St. Louis Fed Economic Housing Data (FRED)
          <ExternalLink className="size-3 inline" />
        </a>
        .
      </span>
    ),
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <motion.div
            className="flex items-center gap-1.5"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 70 }}
          >
            <span className="size-1.5 bg-zinc-900 rounded-full"></span>
            <span className="text-xs font-semibold text-zinc-900 tracking-wider uppercase">
              Got Questions?
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl text-zinc-900 font-medium mt-4 tracking-tight"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 240, damping: 70 }}
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            className="text-zinc-600 text-sm md:text-base mt-3 max-w-xl"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 70 }}
          >
            Everything you need to know about purchasing, listing, private advisory, and financing with HavenStone Estates.
          </motion.p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-zinc-100/50 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <HelpCircle className="size-4 text-zinc-500 shrink-0" />
                    <h3 className="text-sm md:text-base font-semibold text-zinc-900">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`size-4 text-zinc-600 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-black" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-6 pt-1 md:px-6 md:pb-6 text-xs md:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

