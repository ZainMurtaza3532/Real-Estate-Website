import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Award, Users, FileCheck, ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Luxury Brokerage Leadership & Mission",
  description:
    "Learn about HavenStone Estates, our mission, executive leadership, and licensed brokerage advisory serving ultra-high-net-worth real estate buyers and investors.",
  alternates: {
    canonical: "/about",
  },
};

const leadershipTeam = [
  {
    name: "Julian Vance",
    role: "Founder & Chief Executive Broker",
    bio: "Over 20 years guiding high-net-worth families, institutional funds, and private clients through trophy architectural acquisitions across South Florida, Beverly Hills, and Manhattan.",
    license: "FL Real Estate Broker #BK3291048",
  },
  {
    name: "Elena Rostova",
    role: "Head of Global Private Client Advisory",
    bio: "Specializes in confidential off-market transactions, international asset migration, and luxury penthouse acquisitions for European and Asian family offices.",
    license: "FL Associate Broker #SL3489102",
  },
  {
    name: "Marcus Sterling",
    role: "Director of Architectural Acquisitions",
    bio: "Former luxury developer and architectural historian connecting discerning buyers with legacy modernist villas and coastal waterfront estates.",
    license: "FL Licensed Advisor #SL3520194",
  },
  {
    name: "Sarah Jenkins",
    role: "Principal Escrow & Closing Counsel",
    bio: "Oversees legal title examination, cross-border banking structures, and confidential escrow management to guarantee flawless closing execution.",
    license: "Florida Bar #0912481",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="size-4" />
            <span>Licensed Real Estate Brokerage</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-zinc-950 tracking-tight leading-tight">
            Curating the World&apos;s Most Exceptional Living Spaces
          </h1>
          <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
            Founded on the pillars of absolute discretion, unmatched market intelligence, and architectural reverence, HavenStone Estates connects discerning buyers with premier properties and bespoke transaction advisory.
          </p>
        </div>

        {/* Brokerage Credentials & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-zinc-200">
          <div className="space-y-2">
            <span className="text-3xl md:text-4xl font-semibold text-zinc-950">$500M+</span>
            <p className="text-sm font-medium text-zinc-800">Closed Sales Volume</p>
            <p className="text-xs text-zinc-500">Across trophy residences, private islands, and luxury sky penthouses.</p>
          </div>
          <div className="space-y-2">
            <span className="text-3xl md:text-4xl font-semibold text-zinc-950">100%</span>
            <p className="text-sm font-medium text-zinc-800">Verified Listings</p>
            <p className="text-xs text-zinc-500">Every single estate undergoes our comprehensive 7-point legal verification protocol.</p>
          </div>
          <div className="space-y-2">
            <span className="text-3xl md:text-4xl font-semibold text-zinc-950">Lic. #CQ1068492</span>
            <p className="text-sm font-medium text-zinc-800">State of Florida Licensed Brokerage</p>
            <p className="text-xs text-zinc-500">Division of Real Estate (DBPR) & National Association of Realtors (NAR) verified.</p>
          </div>
        </div>

        {/* Mission & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-medium text-zinc-950">Our Mission</h2>
            <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
              We believe luxury real estate is not merely a transaction—it is the stewardship of architectural artistry, family heritage, and capital preservation. Our advisory team delivers institutional rigor paired with white-glove hospitality.
            </p>
            <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
              Whether acquiring an off-market waterfront villa in Miami or divesting an architectural icon in Beverly Hills, HavenStone operates with strict Non-Disclosure Protocols (NDAs) to shield our clients&apos; privacy.
            </p>
          </div>
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-950 flex items-center gap-2">
              <Award className="size-5 text-zinc-900" />
              Corporate Identity & Licensing
            </h3>
            <ul className="text-xs md:text-sm text-zinc-600 space-y-2.5">
              <li><strong>Legal Entity:</strong> HavenStone Realty Inc.</li>
              <li><strong>Headquarters:</strong> 100 Ocean Drive, Suite 400, Miami, FL 33139</li>
              <li><strong>Florida DBPR Brokerage License:</strong> #CQ1068492</li>
              <li><strong>California DRE Corporate Brokerage:</strong> #02194821</li>
              <li><strong>Private Desk:</strong> +1 (555) 019-2831</li>
              <li><strong>General Inquiries:</strong> concierge@havenstone.com</li>
            </ul>
          </div>
        </div>

        {/* Executive Leadership Team */}
        <div className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-zinc-950">Executive Advisory Board</h2>
            <p className="text-sm text-zinc-600">Seasoned brokerage leaders and legal transaction specialists.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadershipTeam.map((leader, i) => (
              <div key={i} className="p-6 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-950">{leader.name}</h3>
                    <p className="text-xs font-medium text-zinc-600">{leader.role}</p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                    {leader.license}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Careers Section Anchor */}
        <div id="careers" className="scroll-mt-32 p-8 md:p-12 rounded-2xl bg-zinc-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-medium">Join Our Advisory Desk</h2>
            <p className="text-sm text-zinc-400">
              We are continually scouting top-producing licensed brokers, architectural researchers, and luxury marketing specialists in Miami, New York, and Los Angeles.
            </p>
          </div>
          <a
            href="mailto:careers@havenstone.com?subject=Advisory%20Position%20Inquiry"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition shrink-0"
          >
            <Mail className="size-4" />
            <span>careers@havenstone.com</span>
          </a>
        </div>
      </div>
    </main>
  );
}

