import type { Metadata } from "next";
import { Geist, Geist_Mono, Urbanist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenstone.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "HavenStone Estates";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HavenStone Estates | Luxury Real Estate & Premium Homes",
    template: "%s | HavenStone Estates",
  },
  description:
    "Discover exceptional luxury residences, modern architectural villas, and premier sky penthouses. HavenStone connects discerning buyers and investors with verified elite properties and bespoke brokerage advisory.",
  applicationName: siteName,
  authors: [{ name: "HavenStone Realty Inc.", url: siteUrl }],
  creator: "HavenStone Realty",
  publisher: "HavenStone Realty",
  keywords: [
    "luxury homes for sale",
    "real estate marketplace",
    "modern villas",
    "buy apartment",
    "verified property agents",
    "luxury estates",
    "sky penthouses",
    "architectural homes",
    "high-end real estate",
    "Beverly Hills luxury homes",
    "Manhattan penthouses",
    "HavenStone Estates",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "HavenStone Estates | Luxury Real Estate & Premium Homes",
    description:
      "Explore curated architectural trophies, private villas, and sky penthouses with verified advisors.",
    url: siteUrl,
    siteName: siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/hero-image.png",
        width: 1200,
        height: 630,
        alt: "HavenStone Estates - Luxury Architectural Homes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HavenStone Estates | Luxury Real Estate & Premium Homes",
    description:
      "Explore curated architectural trophies, private villas, and sky penthouses with verified advisors.",
    images: ["/hero-image.png"],
    creator: "@HavenStoneEstates",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { CompareProvider } from "@/components/compare/compare-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${urbanist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <CompareProvider>
            {children}
            <Toaster position="top-right" richColors />
          </CompareProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
