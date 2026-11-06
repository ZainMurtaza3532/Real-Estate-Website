import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Client Discretion & Data Protection",
  description:
    "HavenStone Estates privacy policy regarding client confidentiality, transaction data security, cookies, and regulatory compliance.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-zinc-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider">
            <Lock className="size-3.5" />
            <span>Confidentiality & Compliance</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium text-zinc-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-500">
            Last Updated: November 2026 • HavenStone Realty Inc.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-zinc-700 text-sm md:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">1. Commitment to Discretion</h2>
            <p>
              At HavenStone Estates (&ldquo;HavenStone,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we recognize that the acquisition and disposition of high-value real estate requires uncompromising discretion. This Privacy Policy details how we collect, safeguard, and utilize information gathered through our platform (rehome-city.vercel.app), private advisory desks, and off-market transactions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600">
              <li><strong>Contact & Identity Details:</strong> Full name, telephone number, verified email address, and entity ownership structures (e.g., trusts, LLCs) provided when submitting private tour requests or inquiries.</li>
              <li><strong>Transaction Preferences:</strong> Price ranges, architectural specifications, target geographic locations, and saved property searches.</li>
              <li><strong>Proof of Funds & Verification Data:</strong> Encrypted financial documentation submitted solely for private seller qualification and off-market property access under executed Non-Disclosure Agreements (NDAs).</li>
              <li><strong>Technical Metadata:</strong> IP address, browser type, referral URLs, and interactions with property listings captured to improve site performance and security.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">3. How Information Is Used</h2>
            <p>
              Your information is exclusively utilized to facilitate property tours, broker advisory communications, title coordination, and personalized search updates. We strictly do not sell, rent, or trade client information to third-party marketing firms or data brokers.
            </p>
          </section>

          {/* Dedicated Cookies Policy Anchor Section */}
          <section id="cookies" className="scroll-mt-32 space-y-3 p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-950 flex items-center gap-2">
              <Eye className="size-5 text-zinc-800" />
              4. Cookie Policy & Tracking Technologies
            </h2>
            <p>
              We employ essential, performance, and analytical cookies to ensure smooth navigation, preserve user authentication sessions, and measure page load speeds:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 text-xs md:text-sm">
              <li><strong>Essential Cookies:</strong> Required for secure session verification (NextAuth / Auth.js) and CSRF protection.</li>
              <li><strong>Functional Cookies:</strong> Store your saved properties, comparison list, and view preferences.</li>
              <li><strong>Analytical Cookies:</strong> Aggregated, anonymized performance metrics (Vercel Web Analytics & Google Analytics) to optimize Core Web Vitals and image delivery.</li>
            </ul>
            <p className="text-xs text-zinc-500 pt-1">
              You can modify your browser settings to decline non-essential cookies at any time without impacting basic property browsing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">5. Security & Data Retention</h2>
            <p>
              All client transmissions are secured using TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS). Financial and verification documents submitted for off-market viewings are stored in encrypted vaults and purged post-closing in accordance with state licensing guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">6. Contact Our Privacy Officer</h2>
            <p>
              If you have inquiries regarding our confidentiality protocols, data access requests, or wish to revoke transaction consent, contact our legal counsel:
            </p>
            <div className="p-4 rounded-xl bg-zinc-100 text-xs md:text-sm space-y-1 text-zinc-800">
              <p><strong>HavenStone Realty Inc. — Legal & Privacy Compliance</strong></p>
              <p>100 Ocean Drive, Suite 400, Miami, FL 33139</p>
              <p>Direct: +1 (555) 019-2831 • Email: privacy@havenstone.com</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

