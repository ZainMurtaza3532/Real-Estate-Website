"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Submits an agent review. Verifies that buyer has interacted or is logged in.
 */
export async function submitAgentReview({
  agentId,
  rating,
  comment,
}: {
  agentId: string;
  rating: number;
  comment: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHENTICATED" };

    const reviewerId = session.user.id;
    if (reviewerId === agentId) {
      return { success: false, error: "You cannot write a review for yourself." };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5 stars." };
    }

    const review = await prisma.agentReview.create({
      data: {
        agentId,
        reviewerId,
        rating,
        comment: comment.trim(),
        isApproved: true,
      },
    });

    revalidatePath(`/agents/${agentId}`);
    return { success: true, review };
  } catch (err: unknown) {
    console.error("Failed to submit review:", err);
    return { success: false, error: "Failed to submit review." };
  }
}

/**
 * Returns reviews for a given agent with aggregated average rating and breakdown.
 */
export async function getAgentPublicProfile(agentId: string) {
  try {
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        image: true,
        agencyName: true,
        role: true,
        isVerified: true,
        bio: true,
        licenseNumber: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        createdAt: true,
        properties: {
          where: { listingStatus: "APPROVED" },
          take: 6,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            images: true,
            city: true,
            state: true,
            bedrooms: true,
            bathrooms: true,
            areaSqFt: true,
            propertyType: true,
            listingType: true,
          },
        },
        reviewsReceived: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          include: {
            reviewer: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!agent) return null;

    const totalReviews = agent.reviewsReceived.length;
    const avgRating =
      totalReviews > 0
        ? agent.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;

    return {
      ...agent,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
    };
  } catch (err) {
    console.error("Error fetching agent profile:", err);
    return null;
  }
}
