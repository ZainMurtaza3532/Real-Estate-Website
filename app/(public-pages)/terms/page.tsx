import { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldAlert, CheckCircle, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Brokerage & Website Usage Agreement",
  description:
    "Terms of service, brokerage representation disclaimers, and platform usage conditions for HavenStone Estates.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-zinc-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider">
            <Scale className="size-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium text-zinc-950 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-500">
            Effective Date: November 2026 • HavenStone Realty Inc.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-zinc-700 text-sm md:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the HavenStone Estates platform (&ldquo;Site&rdquo;), booking private property tours, or utilizing our brokerage services, you agree to comply with and be bound by these Terms of Service and all applicable federal, state, and international real estate laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">2. Brokerage Representation & Agency Disclosure</h2>
            <p>
              HavenStone Realty Inc. is a licensed real estate corporation in the State of Florida (Lic. #CQ1068492) and California (Lic. #02194821). Browsing public listings on this Site does not constitute a broker-client agency relationship. A formal fiduciary relationship is formed solely upon the execution of a written Exclusive Buyer Representation Agreement or Exclusive Right of Sale Listing Agreement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">3. Property Information & Accuracy Disclaimers</h2>
            <p>
              All property data, square footage estimates, lot boundaries, historical tax details, and architectural specifications displayed on HavenStone Estates are gathered from reliable sources including county property appraisers, direct owner representations, and MLS/IDX feeds. While deemed reliable, all data is subject to prior sale, price change, errors, or withdrawal without notice. Buyers must independently verify all dimensions and zoning covenants through independent inspection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">4. Equal Housing Opportunity</h2>
            <p>
              HavenStone Estates is fully dedicated to the principles of the Fair Housing Act and Equal Opportunity Housing. All properties advertised are available on an equal opportunity basis regardless of race, color, religion, sex, handicap, familial status, or national origin.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">5. Intellectual Property & Digital Media Rights</h2>
            <p>
              All architectural photography, 360-degree virtual tour captures, floor plans, copy, and branding marks displayed on this platform are the exclusive intellectual property of HavenStone Realty Inc. and its collaborating architectural photographers. Unauthorized scraping, re-syndication, or commercial reproduction is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">6. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the State of Florida, without regard to conflict of law principles. Any dispute arising from these terms or site usage shall be resolved in the state or federal courts located in Miami-Dade County, Florida.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-950">7. Corporate Inquiries</h2>
            <div className="p-4 rounded-xl bg-zinc-100 text-xs md:text-sm space-y-1 text-zinc-800">
              <p><strong>HavenStone Realty Inc. — Legal Advisory Office</strong></p>
              <p>100 Ocean Drive, Suite 400, Miami, FL 33139</p>
              <p>Phone: +1 (555) 019-2831 • Email: legal@havenstone.com</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

