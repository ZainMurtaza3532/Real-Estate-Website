"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  resetUrl?: string;
}> {
  try {
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return {
        success: false,
        error: "Please enter a valid email address.",
        message: "",
      };
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      // Generic success message to prevent account enumeration
      return {
        success: true,
        message:
          "If an account exists with this email address, password reset instructions have been sent.",
      };
    }

    // Generate secure 32-byte hex token (64 characters)
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any previous tokens for this email to avoid replay
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    // Save token in verificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token,
        expires,
      },
    });

    const resetUrl = `/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`\n======================================================`);
    console.log(`🔑 PASSWORD RESET REQUESTED FOR: ${cleanEmail}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      message:
        "Password reset instructions have been sent. Please check your inbox to continue.",
      resetUrl,
    };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return {
      success: false,
      error: "An unexpected error occurred while processing your request. Please try again.",
      message: "",
    };
  }
}

export async function verifyResetToken(
  email: string,
  token: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !token) {
      return { valid: false, error: "Missing token or email parameter." };
    }

    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: cleanEmail,
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      return {
        valid: false,
        error: "The password reset link is invalid or has expired. Please request a new one.",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return { valid: false, error: "Unable to verify password reset token." };
  }
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !token) {
      return { success: false, error: "Invalid password reset request." };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "New password must be at least 6 characters long.",
      };
    }

    // Verify token validity and expiration
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: cleanEmail,
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "This password reset link is invalid or has already expired.",
      };
    }

    // Hash the new password with bcrypt (12 salt rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password in PostgreSQL
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: hashedPassword },
    });

    // Invalidate the token so it cannot be used again
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    return {
      success: true,
      message: "Your password has been successfully updated. You can now sign in.",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error: "An unexpected error occurred while resetting your password. Please try again.",
    };
  }
}
