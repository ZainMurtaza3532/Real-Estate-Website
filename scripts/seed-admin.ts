import { config } from "dotenv";
import { resolve } from "path";

// Load local environment files (.env.local takes precedence over .env)
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { seedAdminUser } from "../lib/admin-seed";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔐 Initializing Secure Admin User from Environment...");
  const result = await seedAdminUser();

  if (result.success && result.user) {
    console.log("✅ Admin user upserted successfully:");
    console.log(`   - ID: ${result.user.id}`);
    console.log(`   - Email: ${result.user.email}`);
    console.log(`   - Role: ${result.user.role}`);
    console.log(`   - Verified: ${result.user.isVerified}`);
  } else if (result.skipped) {
    console.warn("⚠️  Skipped admin creation:", result.error);
  } else {
    console.error("❌ Failed to upsert admin user:", result.error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Unexpected error during admin seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
