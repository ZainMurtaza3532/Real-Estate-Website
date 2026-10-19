"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { InquiryStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  notifySellerOfNewInquiry,
  notifyBuyerOfTourConfirmation,
} from "@/lib/notifications";

const InquirySchema = z.object({
  propertyId: z.string().min(1, "Property reference is required"),
  name: z.string().min(2, "Please provide your full name (at least 2 characters)"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().min(5, "Message must be at least 5 characters"),
  tourDate: z.string().optional().or(z.literal("")),
  tourTime: z.string().optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof InquirySchema>;

export async function submitPropertyInquiry(data: InquiryInput): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}> {
  try {
    const parsed = InquirySchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || "Invalid form submission";
      return {
        success: false,
        error: firstErrorMessage,
        fieldErrors,
      };
    }

    const { propertyId, name, email, phone, message, tourDate, tourTime } = parsed.data;

    // Check if property exists and retrieve seller details for alert dispatch
    const propertyExists = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        slug: true,
        city: true,
        sellerId: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsappNumber: true,
          },
        },
      },
    });

    if (!propertyExists) {
      return {
        success: false,
        error: "Property not found.",
      };
    }

    // Identify user if logged in
    let userId: string | null = null;
    try {
      const session = await auth();
      userId = session?.user?.id || null;
    } catch {
      userId = null;
    }

    // Parse tour date if provided
    let parsedDate: Date | null = null;
    if (tourDate && tourDate.trim() !== "") {
      const d = new Date(tourDate);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    // Create inquiry record in database
    const newInquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        sellerId: propertyExists.sellerId,
        buyerId: userId,
        buyerName: name.trim(),
        buyerEmail: email.trim().toLowerCase(),
        buyerPhone: phone?.trim() || null,
        message: message.trim(),
        tourDate: parsedDate,
        tourTime: tourTime?.trim() || null,
        status: InquiryStatus.NEW,
      },
    });

    // Dispatch Email & SMS notification to the listing seller and confirmation to the buyer
    try {
      const notificationPayload = {
        seller: propertyExists.seller,
        property: {
          id: propertyExists.id,
          title: propertyExists.title,
          slug: propertyExists.slug,
          city: propertyExists.city,
        },
        lead: {
          id: newInquiry.id,
          buyerName: name.trim(),
          buyerEmail: email.trim().toLowerCase(),
          buyerPhone: phone?.trim() || null,
          tourDate: parsedDate,
          tourTime: tourTime?.trim() || null,
          message: message.trim(),
        },
      };

      await Promise.allSettled([
        notifySellerOfNewInquiry(notificationPayload),
        notifyBuyerOfTourConfirmation(notificationPayload),
      ]);
    } catch (notifyErr) {
      console.error("Non-fatal: failed to send lead notifications:", notifyErr);
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/seller");
      revalidatePath("/dashboard/seller/leads");
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      message: `Your private tour request for ${propertyExists.title} has been confirmed. The property advisor has been notified via email & SMS.`,
    };
  } catch (error: unknown) {
    console.error("Failed to submit property inquiry:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while scheduling your tour.",
    };
  }
}

const ContactFormSchema = z.object({
  name: z.string().min(2, "Please enter your name (at least 2 characters)"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().optional().or(z.literal("")),
  message: z.string().min(5, "Please enter a message (at least 5 characters)"),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;

export async function submitContactForm(data: ContactFormInput): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}> {
  try {
    const parsed = ContactFormSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || "Invalid contact form submission";
      return {
        success: false,
        error: firstErrorMessage,
        fieldErrors,
      };
    }

    const { name, email, phone, subject, message } = parsed.data;

    // Associate general contact with primary/featured property so it links in DB
    const property =
      (await prisma.property.findFirst({
        where: { featured: true },
        select: { id: true, title: true, sellerId: true },
      })) ||
      (await prisma.property.findFirst({
        select: { id: true, title: true, sellerId: true },
      }));

    if (!property) {
      return {
        success: false,
        error: "Unable to route inquiry: No active property found in catalog.",
      };
    }

    let userId: string | null = null;
    try {
      const session = await auth();
      userId = session?.user?.id || null;
    } catch {
      userId = null;
    }

    const fullMessage = subject && subject.trim() !== ""
      ? `[Topic: ${subject.trim()}] ${message.trim()}`
      : message.trim();

    await prisma.inquiry.create({
      data: {
        propertyId: property.id,
        sellerId: property.sellerId,
        buyerId: userId,
        buyerName: name.trim(),
        buyerEmail: email.trim().toLowerCase(),
        buyerPhone: phone?.trim() || null,
        message: fullMessage,
        status: InquiryStatus.NEW,
      },
    });

    try {
      revalidatePath("/dashboard");
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      message: "Thank you for reaching out! Our advisory team will connect with you within 24 hours.",
    };
  } catch (error: unknown) {
    console.error("Failed to submit contact inquiry:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while submitting your message.",
    };
  }
}
