"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ListingStatus, InquiryStatus } from "@prisma/client";

async function verifySellerSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please sign in.");
  }
  return session.user;
}

/**
 * Update property status from the seller portal (e.g. Pause listing to DRAFT, Mark as SOLD)
 */
export async function updateSellerListingStatus(
  propertyId: string,
  newStatus: "DRAFT" | "SOLD" | "PENDING_APPROVAL" | "APPROVED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await verifySellerSession();

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, sellerId: true, title: true },
    });

    if (!property) {
      return { success: false, error: "Property listing not found." };
    }

    if (property.sellerId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "You can only manage your own property listings." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { listingStatus: newStatus as ListingStatus },
    });

    revalidatePath("/dashboard/seller");
    revalidatePath("/dashboard/seller/properties");
    revalidatePath("/dashboard/properties");
    revalidatePath("/properties");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update listing status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

/**
 * Update lead / inquiry status (e.g. Mark as Contacted)
 */
export async function updateSellerLeadStatus(
  inquiryId: string,
  newStatus: "CONTACTED" | "SCHEDULED" | "CLOSED" | "NEW"
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await verifySellerSession();

    // Verify ownership
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true, sellerId: true },
    });

    if (!inquiry) {
      return { success: false, error: "Inquiry not found." };
    }

    if (inquiry.sellerId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "You can only manage inquiries for your own properties." };
    }

    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: newStatus as InquiryStatus },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inquiries");
    revalidatePath("/dashboard/seller");
    revalidatePath("/dashboard/seller/leads");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update lead status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lead status",
    };
  }
}

/**
 * Delete a property belonging to the logged-in seller
 */
export async function deleteSellerProperty(propertyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await verifySellerSession();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, sellerId: true },
    });

    if (!property) {
      return { success: false, error: "Property listing not found." };
    }

    if (property.sellerId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "You can only delete your own listings." };
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    revalidatePath("/dashboard/seller");
    revalidatePath("/dashboard/seller/properties");
    revalidatePath("/dashboard/properties");
    revalidatePath("/properties");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property listing",
    };
  }
}

export interface UpdateSellerPropertyInput {
  propertyId: string;
  title: string;
  price: number;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  garageSpaces?: number;
  city: string;
  state: string;
  address: string;
  propertyType?: string;
  listingType?: string;
}

/**
 * Edit property details from the seller portal
 */
export async function updateSellerPropertyDetails(
  input: UpdateSellerPropertyInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await verifySellerSession();

    const existing = await prisma.property.findUnique({
      where: { id: input.propertyId },
      select: { id: true, sellerId: true, listingStatus: true },
    });

    if (!existing) {
      return { success: false, error: "Property listing not found." };
    }

    if (existing.sellerId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "You can only edit your own listings." };
    }

    // If listing was rejected, editing it puts it back under review
    const newStatus =
      existing.listingStatus === "REJECTED"
        ? "PENDING_APPROVAL"
        : existing.listingStatus;

    await prisma.property.update({
      where: { id: input.propertyId },
      data: {
        title: input.title.trim(),
        price: Number(input.price),
        ...(input.description ? { description: input.description.trim() } : {}),
        bedrooms: Number(input.bedrooms),
        bathrooms: Number(input.bathrooms),
        areaSqFt: Number(input.areaSqFt),
        garageSpaces: Number(input.garageSpaces ?? 0),
        city: input.city.trim(),
        state: input.state.trim(),
        address: input.address.trim(),
        ...(input.propertyType ? { propertyType: input.propertyType as any } : {}),
        ...(input.listingType ? { listingType: input.listingType as any } : {}),
        listingStatus: newStatus,
        ...(existing.listingStatus === "REJECTED" ? { rejectionReason: null } : {}),
      },
    });

    revalidatePath("/dashboard/seller");
    revalidatePath("/dashboard/seller/properties");
    revalidatePath("/dashboard/properties");
    revalidatePath("/properties");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update property details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update property details",
    };
  }
}

