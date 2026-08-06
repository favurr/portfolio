"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Trash2, User } from "lucide-react";

interface ChatSession {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
  _count: { messages: number };
}

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [thread, setThread] = useState<any>(null);

  useEffect(() => { fetchSessions(); }, []);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSessions(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSessions([]);
    setLoading(false);
  }

  async function selectSession(id: string) {
    setSelected(id);
    const res = await fetch(`/api/chats/${id}`);
    setThread(await res.json());
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this chat session?")) return;
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    if (selected === id) { setSelected(null); setThread(null); }
    fetchSessions();
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Studio</p>
        <h1 className="font-serif text-3xl font-normal text-foreground">Chat Sessions</h1>
      </div>

      {loading ? (
        <div className="text-muted-foreground font-mono text-sm animate-pulse">Loading chats...</div>
      ) : (!Array.isArray(sessions) || sessions.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground font-mono text-sm">
          No chat sessions yet. They will appear here when visitors use the chatbot.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 min-h-125">
          {/* Session List */}
          <div className="col-span-1 space-y-2 border-r border-border/30 pr-6">
            {sessions.map((s) => (
              <div key={s.id} onClick={() => selectSession(s.id)} className={`p-4 rounded-xl border cursor-pointer transition-colors ${selected === s.id ? "border-foreground/30 bg-muted/15" : "border-border/40 hover:border-border/60"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">{s.name || "Anonymous"}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm text-foreground truncate">{s.messages[0]?.content || "Empty session"}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">{new Date(s.updatedAt).toLocaleDateString()}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{s._count.messages} messages</span>
                </div>
              </div>
            ))}
          </div>

          {/* Thread View */}
          <div className="col-span-2">
            {thread ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-border/30">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {thread.name || "Anonymous"} {thread.email && `· ${thread.email}`}
                  </span>
                </div>
                <div className="space-y-3 max-h-150 overflow-y-auto">
                  {thread.messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-foreground text-background rounded-br-md" : "bg-muted/20 border border-border/40 text-foreground rounded-bl-md"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
                Select a conversation to view
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
