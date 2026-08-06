"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Brain, ToggleLeft, ToggleRight } from "lucide-react";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  enabled: boolean;
  order: number;
}

const CATEGORIES = ["general", "skills", "personality", "background", "services", "faq", "other"];

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/knowledge");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEntries(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setEntries([]);
    setLoading(false);
  }

  async function handleCreate() {
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: entries.length }),
    });
    setForm({ title: "", content: "", category: "general" });
    setShowNew(false);
    fetchEntries();
  }

  async function handleUpdate(id: string, data: Partial<KnowledgeEntry>) {
    await fetch(`/api/knowledge/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    fetchEntries();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this knowledge entry?")) return;
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    fetchEntries();
  }

  async function toggleEnabled(entry: KnowledgeEntry) {
    await handleUpdate(entry.id, { enabled: !entry.enabled });
  }

  // Group by category
  const grouped = (Array.isArray(entries) ? entries : []).reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {} as Record<string, KnowledgeEntry[]>);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Studio</p>
          <h1 className="font-serif text-3xl font-normal text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Train the AI chatbot by adding knowledge entries. The chatbot also learns from your projects, ventures, and portfolio data automatically.
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> Add Knowledge
        </button>
      </div>

      {/* Auto-sourced indicator */}
      <div className="rounded-xl border border-border/40 bg-muted/5 p-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Auto-Sourced Context</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The AI automatically ingests your <strong>projects</strong>, <strong>ventures</strong>, and <strong>portfolio settings</strong> as context.
          Use this page to teach it things that aren't already in the app — your personality, FAQs, services, pricing, preferences, etc.
        </p>
      </div>

      {showNew && (
        <div className="border border-border/60 rounded-xl p-6 mb-8 bg-muted/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">New Entry</span>
            <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <input placeholder="Title (e.g. 'My tech stack')" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" />
          <textarea placeholder="Content — Tell the AI what to know about this topic..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 resize-none" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <button onClick={handleCreate} disabled={!form.title || !form.content} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground font-mono text-sm animate-pulse">Loading knowledge base...</div>
      ) : (!Array.isArray(entries) || entries.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground font-mono text-sm">
          No knowledge entries yet. Start training your AI by adding entries above.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">{category}</h3>
              <div className="space-y-2">
                {items.map((entry) => (
                  <div key={entry.id} className={`p-5 rounded-xl border transition-colors ${entry.enabled ? "border-border/60 bg-background" : "border-border/30 bg-muted/5 opacity-50"}`}>
                    {editing === entry.id ? (
                      <EditEntry entry={entry} onSave={(data) => handleUpdate(entry.id, data)} onCancel={() => setEditing(null)} />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground">{entry.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{entry.content}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => toggleEnabled(entry)} className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors" title={entry.enabled ? "Disable" : "Enable"}>
                            {entry.enabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setEditing(entry.id)} className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground text-xs font-mono">Edit</button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditEntry({ entry, onSave, onCancel }: { entry: KnowledgeEntry; onSave: (data: Partial<KnowledgeEntry>) => void; onCancel: () => void }) {
  const [f, setF] = useState({ title: entry.title, content: entry.content, category: entry.category });
  return (
    <div className="space-y-3">
      <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" />
      <textarea value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 resize-none" />
      <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40">
        {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
      </select>
      <div className="flex gap-2">
        <button onClick={() => onSave(f)} className="px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs uppercase hover:opacity-90">Save</button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
}
