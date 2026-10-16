"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { PropertyType, ListingType, PropertyStatus } from "@prisma/client";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}

const PropertyFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  propertyType: z.enum(["HOUSE", "APARTMENT", "VILLA", "PENTHOUSE"]),
  listingType: z.enum(["FOR_SALE", "FOR_RENT"]),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms cannot be negative"),
  bathrooms: z.coerce.number().int().min(1, "At least 1 bathroom required"),
  areaSqFt: z.coerce.number().positive("Area (sqft) must be positive"),
  garage: z.coerce.number().int().min(0).default(0),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(2, "Zip code is required"),
  images: z.array(z.string().url("Must be a valid image URL")).min(1, "At least one property image is required"),
  amenities: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

export type PropertyFormData = z.infer<typeof PropertyFormSchema>;

export async function createProperty(data: PropertyFormData): Promise<{
  success: boolean;
  slug?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}> {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Agent or Admin role required." };
    }

    const parsed = PropertyFormSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Invalid property data";
      return { success: false, error: firstError, fieldErrors };
    }

    const validData = parsed.data;
    const slug = generateSlug(validData.title);

    const property = await prisma.property.create({
      data: {
        title: validData.title.trim(),
        slug,
        description: validData.description.trim(),
        price: validData.price,
        propertyType: validData.propertyType as PropertyType,
        listingType: validData.listingType as ListingType,
        status: PropertyStatus.AVAILABLE,
        bedrooms: validData.bedrooms,
        bathrooms: validData.bathrooms,
        areaSqFt: validData.areaSqFt,
        garage: validData.garage,
        address: validData.address.trim(),
        city: validData.city.trim(),
        state: validData.state.trim(),
        zipCode: validData.zipCode.trim(),
        images: validData.images,
        amenities: validData.amenities,
        featured: validData.featured,
        agentId: session.user.id,
      },
    });

    revalidatePath("/properties");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/properties");

    return { success: true, slug: property.slug };
  } catch (error: unknown) {
    console.error("Failed to create property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create property listing",
    };
  }
}

export async function updatePropertyStatus(
  propertyId: string,
  status: "AVAILABLE" | "PENDING" | "SOLD"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized." };
    }

    // Verify ownership if agent (admins can edit any property)
    if (session.user.role === "AGENT") {
      const existing = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { agentId: true },
      });
      if (!existing || existing.agentId !== session.user.id) {
        return { success: false, error: "You can only update your own listings." };
      }
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { status: status as PropertyStatus },
    });

    revalidatePath("/properties");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/properties");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update property status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update property status",
    };
  }
}

export async function deleteProperty(propertyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized." };
    }

    if (session.user.role === "AGENT") {
      const existing = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { agentId: true },
      });
      if (!existing || existing.agentId !== session.user.id) {
        return { success: false, error: "You can only delete your own listings." };
      }
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    revalidatePath("/properties");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/properties");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property",
    };
  }
}
