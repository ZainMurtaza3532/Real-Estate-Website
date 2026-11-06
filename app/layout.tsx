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

const siteUrl = "https://rehome-city.vercel.app";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "HavenStone Estates";

export const metadata: Metadata = {
  metadataBase: new URL("https://rehome-city.vercel.app"),
  title: {
    default: "HavenStone Estates | Luxury Real Estate & Premium Homes",
    template: "%s | HavenStone Estates",
  },
  description:
    "Explore luxury properties, modern architectural villas, and premier penthouses with HavenStone Estates. Connect with verified agents today.",
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
    canonical: "https://rehome-city.vercel.app",
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
      "Explore luxury properties, modern architectural villas, and premier penthouses with HavenStone Estates. Connect with verified agents today.",
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
      "Explore luxury properties, modern architectural villas, and premier penthouses with HavenStone Estates. Connect with verified agents today.",
    images: ["/hero-image.png"],
    creator: "@HavenStoneEstates",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { CompareProvider } from "@/components/compare/compare-context";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-E7X2K9M1Y8";

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
      <head>
        <link rel="preload" as="image" href="/images/hero-bg.jpg" fetchPriority="high" />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:p-4 focus:bg-white focus:text-black focus:font-semibold focus:shadow-2xl focus:rounded-xl focus:z-50 focus:border focus:border-zinc-300"
        >
          Skip to Content
        </a>
        {/* Google Analytics / Tag Manager */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <SessionProvider>
          <CompareProvider>
            {children}
            <Toaster position="top-right" richColors />
            <Analytics />
          </CompareProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
