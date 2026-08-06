import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        return;
      }

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Favurr Security <onboarding@resend.dev>",
          to: ["emekafavi2019@gmail.com"],
          subject: "Reset Your Studio Password",
          html: `
            <div style="font-family: sans-serif; padding: 24px; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #111;">
              <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Password Reset Request</h2>
              <p>Hello ${user.name || "Admin"},</p>
              <p>A request was made to reset the password for your Studio account (<strong>${user.email}</strong>).</p>
              <p style="margin: 24px 0;">
                <a href="${url}" style="background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; display: inline-block;">
                  Reset Password &rarr;
                </a>
              </p>
              <p style="color: #666; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });
    },
  },
});