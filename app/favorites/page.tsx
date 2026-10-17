import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/properties/property-card";
import { Compass, Heart, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Saved Residences - PrebuiltUI Estate",
  description: "View your saved luxury properties and architectural sanctuaries.",
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/favorites");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      property: {
        include: {
          seller: {
            select: {
              name: true,
              agencyName: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-28 md:pt-36 pb-24 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-medium">
                Private Wishlist
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {favorites.length} Saved {favorites.length === 1 ? "Residence" : "Residences"}
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
              Saved Listings
            </h1>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-xs"
          >
            <Compass className="size-4" />
            <span>Browse All Estates</span>
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs max-w-lg mx-auto">
            <div className="size-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
              <Heart className="size-6 stroke-[1.5]" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-zinc-950 mb-2">
              No Saved Listings Yet
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
              Click the heart icon on any residence in our portfolio to save it to your private collection for quick access.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-all"
            >
              Explore Portfolio &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {favorites.map((fav) => (
              <PropertyCard
                key={fav.property.id}
                property={fav.property}
                initialFavorited={true}
                isAuthenticated={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
