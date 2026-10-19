import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export interface SanitizedAdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ensures the super admin user defined in environment variables exists in the database.
 * Securely hashes ADMIN_PASSWORD with bcrypt (12 rounds) and upserts with role='ADMIN'.
 * Plaintext passwords and hashes are strictly excluded from the return payload.
 */
export async function seedAdminUser(): Promise<{
  success: boolean;
  user?: SanitizedAdminUser;
  skipped?: boolean;
  error?: string;
}> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME?.trim() || "Super Administrator";

  if (!adminEmail || !adminPassword) {
    return {
      success: false,
      skipped: true,
      error: "ADMIN_EMAIL or ADMIN_PASSWORD not configured in environment.",
    };
  }

  if (adminPassword.length < 8) {
    return {
      success: false,
      error: "ADMIN_PASSWORD must be at least 8 characters long for security compliance.",
    };
  }

  try {
    // Hash password with 12 salt rounds (industry standard for authentication security)
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // 1. Upsert the single designated admin user into PostgreSQL
    const admin = await prisma.user.upsert({
      where: {
        email: adminEmail,
      },
      update: {
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
      create: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 2. Strict Single-Admin Enforcement: Demote any other accounts that had role = 'ADMIN'
    await prisma.user.updateMany({
      where: {
        role: "ADMIN",
        NOT: {
          email: adminEmail,
        },
      },
      data: {
        role: "BUYER",
      },
    });

    return {
      success: true,
      user: admin,
    };
  } catch (error) {
    console.error("❌ Failed to upsert admin user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database error during admin upsert.",
    };
  }
}
