"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { PropertyType, ListingType, ListingStatus, Role } from "@prisma/client";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
}

const SellPropertySchema = z.object({
  // Step 1: Basic Details
  title: z.string().min(5, "Title must be at least 5 characters"),
  propertyType: z.enum(["HOUSE", "APARTMENT", "VILLA", "COMMERCIAL", "PLOT", "PENTHOUSE"]),
  listingType: z.enum(["FOR_SALE", "FOR_RENT"]),
  price: z.coerce.number().positive("Price must be a positive number"),
  currency: z.enum(["USD", "PKR"]).default("USD"),
  description: z.string().min(20, "Description must be at least 20 characters"),

  // Step 2: Specs & Amenities
  bedrooms: z.coerce.number().int().min(0, "Bedrooms cannot be negative").default(0),
  bathrooms: z.coerce.number().int().min(0, "Bathrooms cannot be negative").default(0),
  areaSqFt: z.coerce.number().positive("Area (sqft) must be a positive number"),
  garageSpaces: z.coerce.number().int().min(0).default(0),
  yearBuilt: z.coerce.number().int().min(1800).max(new Date().getFullYear() + 2).optional().nullable(),
  amenities: z.array(z.string()).default([]),

  // Step 3: Location
  address: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State or Province is required"),
  zipCode: z.string().min(2, "Postal / Zip code is required"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),

  // Step 4: Photo & Media Upload
  images: z
    .array(z.string().min(1))
    .min(1, "At least one property image is required")
    .max(10, "You can upload up to 10 photos"),
  virtualTourUrl: z.string().optional().nullable(),
  videoTourUrl: z.string().optional().nullable(),

  // Step 5: Seller Contact Info
  phone: z.string().min(7, "Please provide a valid contact phone number"),
  whatsappDirect: z.boolean().default(true),
  whatsappNumber: z.string().optional().nullable(),
});

export type SellPropertyInput = z.infer<typeof SellPropertySchema>;

export async function submitSellerProperty(data: SellPropertyInput): Promise<{
  success: boolean;
  slug?: string;
  propertyId?: string;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required. Please sign in to submit your property.",
      };
    }

    const parsed = SellPropertySchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Invalid property details";
      return {
        success: false,
        error: firstError,
        fieldErrors,
      };
    }

    const validData = parsed.data;
    const userId = session.user.id;

    // Access control & Role Upgrade:
    // If the user currently has BUYER role, auto-upgrade them to SELLER and save phone/whatsapp
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, phone: true, whatsappNumber: true },
    });

    const updateUserData: Record<string, any> = {};
    if (currentUser?.role === Role.BUYER) {
      updateUserData.role = Role.SELLER;
    }
    if (validData.phone && (!currentUser?.phone || currentUser.phone !== validData.phone)) {
      updateUserData.phone = validData.phone.trim();
    }
    if (
      validData.whatsappNumber &&
      (!currentUser?.whatsappNumber || currentUser.whatsappNumber !== validData.whatsappNumber)
    ) {
      updateUserData.whatsappNumber = validData.whatsappNumber.trim();
    } else if (validData.whatsappDirect && validData.phone && !currentUser?.whatsappNumber) {
      updateUserData.whatsappNumber = validData.phone.trim();
    }

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateUserData,
      });
    }

    const slug = generateSlug(validData.title);

    // Save property to DB with status = PENDING_APPROVAL
    const property = await prisma.property.create({
      data: {
        title: validData.title.trim(),
        slug,
        description: validData.description.trim(),
        price: validData.price,
        currency: validData.currency || "USD",
        propertyType: validData.propertyType as PropertyType,
        listingType: validData.listingType as ListingType,
        listingStatus: ListingStatus.PENDING_APPROVAL,
        bedrooms: validData.bedrooms,
        bathrooms: validData.bathrooms,
        areaSqFt: validData.areaSqFt,
        garageSpaces: validData.garageSpaces,
        yearBuilt: validData.yearBuilt || null,
        address: validData.address.trim(),
        city: validData.city.trim(),
        state: validData.state.trim(),
        zipCode: validData.zipCode.trim(),
        latitude: validData.latitude || null,
        longitude: validData.longitude || null,
        images: validData.images,
        virtualTourUrl: validData.virtualTourUrl?.trim() || null,
        videoTourUrl: validData.videoTourUrl?.trim() || null,
        amenities: validData.amenities,
        featured: false,
        viewsCount: 0,
        sellerId: userId,
      },
    });

    // Revalidate public & dashboard caches
    try {
      revalidatePath("/properties");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/properties");
      revalidatePath("/");
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      slug: property.slug,
      propertyId: property.id,
      message:
        "Your property listing has been successfully submitted and is under executive review. Once approved, it will be published to the luxury portfolio.",
    };
  } catch (error: unknown) {
    console.error("Failed to submit property listing:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while saving your property listing.",
    };
  }
}

export async function upgradeAccountToSeller(phone: string, whatsappNumber?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Please sign in to upgrade your profile." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: Role.SELLER,
        phone: phone.trim(),
        whatsappNumber: whatsappNumber?.trim() || phone.trim(),
        isVerified: true,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Congratulations! Your account has been upgraded to Verified Seller status.",
    };
  } catch (error: unknown) {
    console.error("Failed to upgrade role to seller:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upgrade account role.",
    };
  }
}
