"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SavedSearchFrequency } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface SearchCriteriaPayload {
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

/**
 * Saves a user search filter criteria
 */
export async function saveSearchCriteria({
  name,
  criteria,
  frequency = SavedSearchFrequency.INSTANT,
}: {
  name: string;
  criteria: SearchCriteriaPayload;
  frequency?: SavedSearchFrequency;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHENTICATED" };

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        queryCriteria: criteria as any,
        frequency,
      },
    });

    revalidatePath("/properties");
    revalidatePath("/dashboard/saved-searches");
    return { success: true, savedSearch };
  } catch (err: unknown) {
    console.error("Failed to save search:", err);
    return { success: false, error: "Could not save search criteria." };
  }
}

/**
 * Fetches saved searches for current authenticated user
 */
export async function getUserSavedSearches() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHENTICATED", data: [] };

    const saved = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: saved };
  } catch (err: unknown) {
    return { success: false, error: "Failed to fetch saved searches", data: [] };
  }
}

/**
 * Deletes a saved search
 */
export async function deleteSavedSearch(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHENTICATED" };

    await prisma.savedSearch.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard/saved-searches");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: "Failed to delete saved search" };
  }
}

/**
 * Background Alert Matcher: Triggered when an Admin approves a property.
 * Matches active SavedSearches and dispatches notification emails via Resend.
 */
export async function dispatchPropertyAlerts(newPropertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: newPropertyId },
    });

    if (!property || property.listingStatus !== "APPROVED") return;

    // Fetch instant notification subscriptions
    const activeSearches = await prisma.savedSearch.findMany({
      where: { frequency: SavedSearchFrequency.INSTANT },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    const matchingUsers: { email: string; name: string }[] = [];

    for (const search of activeSearches) {
      const q = search.queryCriteria as SearchCriteriaPayload;
      if (!search.user.email) continue;

      let matches = true;

      if (q.city && property.city.toLowerCase() !== q.city.toLowerCase()) matches = false;
      if (q.propertyType && property.propertyType !== q.propertyType) matches = false;
      if (q.listingType && property.listingType !== q.listingType) matches = false;
      if (q.minPrice && property.price < q.minPrice) matches = false;
      if (q.maxPrice && property.price > q.maxPrice) matches = false;
      if (q.bedrooms && property.bedrooms < q.bedrooms) matches = false;

      if (matches) {
        matchingUsers.push({ email: search.user.email, name: search.user.name || "Valued Client" });
      }
    }

    if (matchingUsers.length === 0) return;

    const resendApiKey = process.env.RESEND_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenstone.com";

    if (resendApiKey) {
      await Promise.allSettled(
        matchingUsers.map((recipient) =>
          fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "HavenStone Alerts <alerts@havenstone.com>",
              to: recipient.email,
              subject: `New Exclusive Listing Match: ${property.title}`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background-color: #fafafa; border-radius: 16px;">
                  <h2 style="color: #09090b; font-size: 20px; font-weight: 700; margin-bottom: 6px;">New Property Alert Match</h2>
                  <p style="color: #52525b; font-size: 14px; margin-top: 0;">Hello ${recipient.name}, a newly approved residence aligns with your saved search criteria.</p>
                  
                  <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #09090b;">${property.title}</h3>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #71717a;">${property.city}, ${property.state}</p>
                    <p style="font-size: 22px; font-weight: 700; color: #059669; margin: 0;">
                      $${property.price.toLocaleString()} ${property.listingType === "FOR_RENT" ? "/ mo" : ""}
                    </p>
                  </div>

                  <a href="${siteUrl}/properties/${property.slug}" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    View Complete Property Showcase →
                  </a>
                </div>
              `,
            }),
          })
        )
      );
    }
  } catch (err) {
    console.error("Alert dispatch failed:", err);
  }
}
