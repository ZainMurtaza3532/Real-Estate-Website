"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(propertyId: string): Promise<{
  success: boolean;
  isFavorited?: boolean;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "UNAUTHENTICATED" };
    }

    const userId = session.user.id;

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existing) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      });
      revalidatePath("/properties");
      revalidatePath("/favorites");
      return { success: true, isFavorited: false };
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId,
          propertyId,
        },
      });
      revalidatePath("/properties");
      revalidatePath("/favorites");
      return { success: true, isFavorited: true };
    }
  } catch (err: unknown) {
    console.error("Failed to toggle favorite:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle favorite",
    };
  }
}
