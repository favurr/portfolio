import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword } = createAuthClient(
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
);