"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ListingStatus } from "@prisma/client";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Super Admin credentials required.");
  }
  return session.user;
}

/**
 * Approve a property listing from the moderation queue
 */
export async function approveProperty(propertyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        listingStatus: ListingStatus.APPROVED,
        rejectionReason: null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/properties");
    revalidatePath("/admin/properties/pending");
    revalidatePath("/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to approve property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve listing",
    };
  }
}

/**
 * Reject a property listing with feedback for the seller
 */
export async function rejectProperty(
  propertyId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();

    const cleanReason = (reason || "").trim();
    if (!cleanReason) {
      return { success: false, error: "Please provide a rejection reason for the seller." };
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        listingStatus: ListingStatus.REJECTED,
        rejectionReason: cleanReason,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/properties");
    revalidatePath("/admin/properties/pending");
    revalidatePath("/properties");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to reject property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject listing",
    };
  }
}

/**
 * Toggle the 'featured' status of any property
 */
export async function toggleFeaturedProperty(
  propertyId: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();

    await prisma.property.update({
      where: { id: propertyId },
      data: { featured },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/properties");
    revalidatePath("/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to toggle featured status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update featured flag",
    };
  }
}

/**
 * Update property listing status directly (e.g. mark as SOLD, APPROVED, DRAFT)
 */
export async function updateAdminPropertyStatus(
  propertyId: string,
  status: ListingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();

    await prisma.property.update({
      where: { id: propertyId },
      data: { listingStatus: status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/properties");
    revalidatePath("/admin/properties/pending");
    revalidatePath("/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update listing status",
    };
  }
}

/**
 * Permanently delete any listing from platform
 */
export async function deleteAdminProperty(propertyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();

    await prisma.property.delete({
      where: { id: propertyId },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/properties");
    revalidatePath("/admin/properties/pending");
    revalidatePath("/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property",
    };
  }
}
