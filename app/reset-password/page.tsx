"use client";

import { useState, useEffect, Suspense } from "react";
import { resetPassword } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(
        {
          newPassword,
          token,
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to reset password.");
          },
          onSuccess: () => {
            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          },
        }
      );
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-muted/10 p-8 sm:p-10 backdrop-blur-md shadow-2xl my-auto">
      <div className="mb-8">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          New Credentials
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
          Reset <span className="italic font-normal">password</span>
        </h1>
        <p className="font-sans text-sm text-muted-foreground mt-2 leading-relaxed">
          Create a new secure password for your Studio account.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-6">
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
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-border/60 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-border/60 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group/btn w-full font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-foreground text-background hover:bg-foreground/90 py-3.5 rounded-full transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{loading ? "Updating..." : "Update Password"}</span>
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
  );
}

export default function ResetPasswordPage() {
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

      <Suspense fallback={<div className="text-center font-mono text-xs text-muted-foreground">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>

      {/* Footer info */}
      <div className="mx-auto w-full max-w-md pb-6 text-center font-mono text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Favurr Digital &bull; All rights reserved
      </div>
    </main>
  );
}
