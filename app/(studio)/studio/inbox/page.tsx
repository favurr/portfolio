"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function InboxPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchInbox(); }, []);

  async function fetchInbox() {
    try {
      const res = await fetch("/api/inbox");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSubmissions(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSubmissions([]);
    setLoading(false);
  }

  async function toggleRead(s: Submission) {
    await fetch(`/api/inbox/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !s.read }),
    });
    fetchInbox();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission?")) return;
    await fetch(`/api/inbox/${id}`, { method: "DELETE" });
    fetchInbox();
  }

  const unreadCount = Array.isArray(submissions) ? submissions.filter((s) => !s.read).length : 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Studio</p>
        <h1 className="font-serif text-3xl font-normal text-foreground">
          Inbox {unreadCount > 0 && <span className="text-base font-mono text-muted-foreground ml-2">({unreadCount} unread)</span>}
        </h1>
      </div>

      {loading ? (
        <div className="text-muted-foreground font-mono text-sm animate-pulse">Loading messages...</div>
      ) : (!Array.isArray(submissions) || submissions.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground font-mono text-sm">
          No contact submissions yet. They will appear here when someone uses the contact form.
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className={`rounded-xl border transition-colors ${!s.read ? "border-foreground/20 bg-muted/10" : "border-border/40 bg-background"}`}>
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => { setExpanded(expanded === s.id ? null : s.id); if (!s.read) toggleRead(s); }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {!s.read ? <Mail className="w-4 h-4 text-foreground shrink-0" /> : <MailOpen className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${!s.read ? "font-semibold text-foreground" : "text-foreground"}`}>{s.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{s.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{s.subject || s.message.slice(0, 80)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className="text-[11px] font-mono text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
                  {expanded === s.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expanded === s.id && (
                <div className="px-4 pb-4 border-t border-border/30 pt-4">
                  {s.subject && <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Subject: {s.subject}</p>}
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{s.message}</p>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/20">
                    <a href={`mailto:${s.email}`} className="px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs uppercase hover:opacity-90">Reply</a>
                    <button onClick={() => toggleRead(s)} className="px-3 py-1.5 rounded-lg border border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground">
                      Mark as {s.read ? "unread" : "read"}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 rounded-lg border border-border font-mono text-xs uppercase text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
