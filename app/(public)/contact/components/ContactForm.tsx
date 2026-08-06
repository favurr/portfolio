"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus({ type: "success", msg: "Message sent! I will reply within 24 hours." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {status && (
        <div
          className={`p-4 rounded-lg font-mono text-xs flex items-center gap-3 border ${
            status.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{status.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Name <span className="text-foreground">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            className="w-full rounded-md border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Email <span className="text-foreground">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ceo.emeka@favurr.site"
            className="w-full rounded-md border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Subject
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Design engineering, product build, consultation..."
          className="w-full rounded-md border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Message <span className="text-foreground">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell me about your project, timeline, or idea..."
          className="w-full rounded-md border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group/btn font-mono text-xs uppercase tracking-widest border border-border hover:border-foreground bg-foreground text-background hover:bg-foreground/90 px-8 py-3.5 rounded-full transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
      >
        <span>{loading ? "Sending..." : "Send Message"}</span>
        <span className="relative w-4 h-4 inline-block">
          <ArrowUpRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-75" />
          <ArrowRight className="w-4 h-4 absolute inset-0 transition-all duration-300 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5" />
        </span>
      </button>
    </form>
  );
}
