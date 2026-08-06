"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Save, X, FileText, Globe } from "lucide-react";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/components/tiptap-editor").then((m) => ({ default: m.TiptapEditor })), { ssr: false });

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BlogCMSPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/blog");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setPosts([]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Studio</p>
          <h1 className="font-serif text-3xl font-normal text-foreground">Blog</h1>
        </div>
        {!showNew && !editing && (
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" /> New Post
          </button>
        )}
      </div>

      {(showNew || editing) ? (
        <PostEditor
          post={editing}
          onSave={() => { setShowNew(false); setEditing(null); fetchPosts(); }}
          onCancel={() => { setShowNew(false); setEditing(null); }}
        />
      ) : loading ? (
        <div className="text-muted-foreground font-mono text-sm animate-pulse">Loading posts...</div>
      ) : (!Array.isArray(posts) || posts.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground font-mono text-sm">
          No blog posts yet. Write your first article.
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-5 rounded-xl border border-border/60 bg-background hover:border-border transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${p.status === "published" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                      {p.status}
                    </span>
                    {p.tags.length > 0 && <span className="text-[11px] font-mono text-muted-foreground">{p.tags.join(", ")}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
                <button onClick={() => setEditing(p)} className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground text-xs font-mono">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostEditor({ post, onSave, onCancel }: { post: BlogPost | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    coverImage: post?.coverImage || "",
    tags: post?.tags.join(", ") || "",
    status: post?.status || "draft",
  });
  const [saving, setSaving] = useState(false);

  const handleTitleChange = useCallback((title: string) => {
    setForm((prev) => ({ ...prev, title, slug: post ? prev.slug : slugify(title) }));
  }, [post]);

  async function handleSave() {
    setSaving(true);
    const data = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      publishedAt: form.status === "published" ? (post?.publishedAt || new Date().toISOString()) : null,
    };

    if (post) {
      await fetch(`/api/blog/${post.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setSaving(false);
    onSave();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{post ? "Edit Post" : "New Post"}</span>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSave} disabled={!form.title || !form.slug || saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40">
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" className="w-full px-4 py-3 rounded-lg border border-border/60 bg-background text-foreground text-lg font-semibold focus:outline-none focus:border-foreground/40 transition-colors" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">/blog/</span>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm font-mono focus:outline-none focus:border-foreground/40 transition-colors" />
          </div>
          <div className="rounded-xl border border-border/60 bg-background min-h-75">
            <TiptapEditor content={form.content} onChange={(html) => setForm((prev) => ({ ...prev, content: html }))} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 p-4 space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Settings</span>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Cover Image URL</label>
              <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="design, engineering" className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} placeholder="Brief summary..." className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-foreground/40 resize-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
