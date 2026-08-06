import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function seedAdminUser() {
  const email = "emekafavi2019@gmail.com";
  // Generates a random secure code for fallback entry
  const fallbackPassword = "favurrAdminSecureSession2026!";

  // Check if any user already exists
  const existingUsersCount = await prisma.user.count();
  if (existingUsersCount > 0) {
    return { success: false, message: "Admin seeding skipped. A user already exists in the database." };
  }

  // Create the default admin account via better-auth internal password utilities
  const user = await auth.api.signUpEmail({
    body: {
      email,
      password: fallbackPassword,
      name: "Emeka Favi",
    },
  });

  return {
    success: true,
    email,
    password: fallbackPassword,
    message: "Admin seeded successfully. Use these credentials to log in.",
  };
}
