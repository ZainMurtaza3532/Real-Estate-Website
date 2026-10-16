"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { InquiryStatus } from "@prisma/client";

const InquirySchema = z.object({
  propertyId: z.string().min(1, "Property reference is required"),
  name: z.string().min(2, "Please provide your full name (at least 2 characters)"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().min(5, "Message must be at least 5 characters"),
  tourDate: z.string().optional().or(z.literal("")),
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

    const { propertyId, name, email, phone, message, tourDate } = parsed.data;

    // Check if property exists
    const propertyExists = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true },
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

    // Create inquiry record
    await prisma.inquiry.create({
      data: {
        propertyId,
        userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        tourDate: parsedDate,
        status: InquiryStatus.PENDING,
      },
    });

    return {
      success: true,
      message: `Your private tour request for ${propertyExists.title} has been received. Our luxury advisor will contact you promptly.`,
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
