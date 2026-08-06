"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn.email(
        {
          email,
          password,
          callbackURL: "/studio",
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to log in.");
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

      {/* Login Card */}
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-muted/10 p-8 sm:p-10 backdrop-blur-md shadow-2xl my-auto">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Studio Entry
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            Identify <span className="italic font-normal">yourself</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group/btn w-full font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-foreground text-background hover:bg-foreground/90 py-3.5 rounded-full transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Verifying..." : "Access Studio"}</span>
            <span className="relative w-4 h-4 inline-block">
              <ArrowUpRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-75" />
              <ArrowRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5" />
            </span>
          </button>
        </form>
      </div>

      {/* Footer info */}
      <div className="mx-auto w-full max-w-md pb-6 text-center font-mono text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Favurr Digital &bull; All rights reserved
      </div>
    </main>
  );
}
