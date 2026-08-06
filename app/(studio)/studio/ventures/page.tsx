"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, X } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  order: number;
  visible: boolean;
}

export default function VenturesPage() {
  const [ventures, setVentures] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", description: "", startDate: "", endDate: "" });

  useEffect(() => { fetchVentures(); }, []);

  async function fetchVentures() {
    try {
      const res = await fetch("/api/ventures");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setVentures(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setVentures([]);
    setLoading(false);
  }

  async function handleCreate() {
    await fetch("/api/ventures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: ventures.length }),
    });
    setForm({ title: "", company: "", description: "", startDate: "", endDate: "" });
    setShowNew(false);
    fetchVentures();
  }

  async function handleUpdate(id: string, data: Partial<Experience>) {
    await fetch(`/api/ventures/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    fetchVentures();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this venture?")) return;
    await fetch(`/api/ventures/${id}`, { method: "DELETE" });
    fetchVentures();
  }

  async function toggleVisibility(v: Experience) {
    await handleUpdate(v.id, { visible: !v.visible });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Studio</p>
          <h1 className="font-serif text-3xl font-normal text-foreground">Featured Ventures</h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> Add Venture
        </button>
      </div>

      {showNew && (
        <div className="border border-border/60 rounded-xl p-6 mb-8 bg-muted/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">New Venture</span>
            <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Role / Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="col-span-2 px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 transition-colors" />
            <input placeholder="Company / Organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="col-span-2 px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 transition-colors" />
            <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2 px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 transition-colors" />
            <input placeholder="Start (e.g. 2024)" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 transition-colors" />
            <input placeholder="End (leave blank for Present)" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="px-4 py-2.5 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 transition-colors" />
          </div>
          <button onClick={handleCreate} disabled={!form.title || !form.company || !form.startDate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground font-mono text-sm animate-pulse">Loading ventures...</div>
      ) : (!Array.isArray(ventures) || ventures.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground font-mono text-sm">
          No ventures yet. Add your first experience above.
        </div>
      ) : (
        <div className="space-y-2">
          {ventures.map((v) => (
            <div key={v.id} className={`flex items-start justify-between gap-4 p-5 rounded-xl border transition-colors ${v.visible ? "border-border/60 bg-background" : "border-border/30 bg-muted/5 opacity-60"}`}>
              {editing === v.id ? (
                <EditForm venture={v} onSave={(data) => handleUpdate(v.id, data)} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                    <p className="text-sm text-muted-foreground font-mono mt-0.5">{v.company}{v.description ? ` · ${v.description}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground mr-3">{v.startDate} — {v.endDate || "Present"}</span>
                    <button onClick={() => toggleVisibility(v)} className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors" title={v.visible ? "Hide" : "Show"}>
                      {v.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => { setEditing(v.id); setForm({ title: v.title, company: v.company, description: v.description || "", startDate: v.startDate, endDate: v.endDate || "" }); }} className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors text-xs font-mono">Edit</button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditForm({ venture, onSave, onCancel }: { venture: Experience; onSave: (data: Partial<Experience>) => void; onCancel: () => void }) {
  const [f, setF] = useState({ title: venture.title, company: venture.company, description: venture.description || "", startDate: venture.startDate, endDate: venture.endDate || "" });
  return (
    <div className="flex-1 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="col-span-2 px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" placeholder="Title" />
        <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} className="px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" placeholder="Company" />
        <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" placeholder="Description" />
        <input value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} className="px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" placeholder="Start" />
        <input value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} className="px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" placeholder="End" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ ...f, endDate: f.endDate || null })} className="px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs uppercase hover:opacity-90">Save</button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
}
