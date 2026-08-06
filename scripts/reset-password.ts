import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function resetPassword() {
  const newPassword = "FavurrPassword2026!";

  // Find user by email
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("No user found in database.");
    return;
  }

  // Update password in Account table using Better Auth internal hash mechanism
  // Better Auth hashes passwords automatically via auth.api.changePassword or update password
  // Direct account password update:
  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (!account) {
    console.log("No credential account found for user:", user.email);
    return;
  }

  // We can reset password by calling better-auth internal password updater
  // Or creating a new user / updating password via better-auth API:
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(newPassword);

  await prisma.account.update({
    where: { id: account.id },
    data: { password: hashedPassword },
  });

  console.log(`\n========================================`);
  console.log(`PASSWORD RESET SUCCESSFUL!`);
  console.log(`Email: ${user.email}`);
  console.log(`New Password: ${newPassword}`);
  console.log(`========================================\n`);
}

resetPassword()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  });
