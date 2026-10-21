import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CompareMatrix, FullCompareProperty } from "@/components/compare/compare-matrix";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Property Comparison Matrix | HavenStone Estates",
  description:
    "Compare up to 4 premier estates side-by-side: pricing, architectural square footage, bedroom suites, and luxury amenities.",
};

interface ComparePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const idsParam = typeof params.ids === "string" ? params.ids : undefined;

  let properties: FullCompareProperty[] = [];

  if (idsParam && idsParam.trim() !== "") {
    const idsList = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 4);

    if (idsList.length > 0) {
      const dbProperties = await prisma.property.findMany({
        where: {
          id: { in: idsList },
        },
        include: {
          seller: {
            select: {
              name: true,
              agencyName: true,
              image: true,
              phone: true,
              whatsappNumber: true,
            },
          },
        },
      });

      // Preserve order of idsList
      const map = new Map(dbProperties.map((p) => [p.id, p]));
      properties = idsList
        .map((id) => map.get(id))
        .filter((p): p is typeof dbProperties[number] => Boolean(p)) as FullCompareProperty[];
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-950 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-zinc-400" />
          <Link href="/properties" className="hover:text-zinc-950 transition-colors">
            Properties
          </Link>
          <ChevronRight className="size-3 text-zinc-400" />
          <span className="text-zinc-950 font-semibold">Compare Matrix</span>
        </nav>

        {/* Matrix Component wrapped in Suspense for useSearchParams */}
        <Suspense
          fallback={
            <div className="h-96 w-full bg-white rounded-3xl border border-zinc-200 animate-pulse flex items-center justify-center text-zinc-400 text-sm">
              Loading comparison matrix...
            </div>
          }
        >
          <CompareMatrix initialProperties={properties} />
        </Suspense>
      </div>
    </div>
  );
}
