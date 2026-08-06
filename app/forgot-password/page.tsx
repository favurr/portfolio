"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await requestPasswordReset(
        {
          email,
          redirectTo: "/reset-password",
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to request password reset.");
          },
          onSuccess: () => {
            setSuccess("Reset link sent! Please check your email inbox (ezeamak.emeka@favurr.site).");
            setEmail("");
          },
        }
      );
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-between bg-background text-foreground px-6 py-12">
      {/* Header Brand */}
      <div className="mx-auto w-full max-w-md pt-8">
        <Link
          href="/"
          className="font-serif text-lg tracking-wide text-foreground hover:text-foreground/80 transition-colors flex items-baseline gap-1"
        >
          <span className="italic">Favurr</span>
          <span className="text-muted-foreground/30 px-0.5">|</span>
          <span className="text-muted-foreground tracking-wide font-sans text-xs font-medium">
            Studio Auth
          </span>
        </Link>
      </div>

      {/* Forgot Password Card */}
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-muted/10 p-8 sm:p-10 backdrop-blur-md shadow-2xl my-auto">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Recovery
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            Forgot <span className="italic font-normal">password?</span>
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-2 leading-relaxed">
            Enter your admin email address to receive a secure password reset link via Resend.
          </p>
        </div>

        <form onSubmit={handleForgot} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 font-mono flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
              placeholder="ezeamak.emeka@favurr.site"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group/btn w-full font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-foreground text-background hover:bg-foreground/90 py-3.5 rounded-full transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Sending..." : "Request Reset Link"}</span>
            <span className="relative w-4 h-4 inline-block">
              <ArrowUpRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-75" />
              <ArrowRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5" />
            </span>
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border/30 pt-6">
          <Link
            href="/login"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Return to Login
          </Link>
        </div>
      </div>

      {/* Footer info */}
      <div className="mx-auto w-full max-w-md pb-6 text-center font-mono text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Favurr Digital &bull; All rights reserved
      </div>
    </main>
  );
}
