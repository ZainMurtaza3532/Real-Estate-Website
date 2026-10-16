"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { InquiryStatus } from "@prisma/client";

export async function updateInquiryStatus(
  inquiryId: string,
  status: "PENDING" | "CONTACTED" | "CLOSED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Agent or Admin privileges required." };
    }

    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: status as InquiryStatus },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update inquiry status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inquiry status",
    };
  }
}
