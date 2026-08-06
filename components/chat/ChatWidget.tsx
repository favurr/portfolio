"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("favurr-chat-session");
    if (stored) {
      setSessionId(stored);
      fetch(`/api/chat/${stored}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.messages) {
            setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userMsg }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("favurr-chat-session", data.sessionId);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.response || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-2xl border border-border/60 bg-background shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-foreground">Favurr AI</p>
              <p className="text-[11px] font-mono text-muted-foreground">Ask me anything about Emeka</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Hi! Ask me about Emeka's work, skills, or projects.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${m.role === "user" ? "bg-foreground text-background rounded-br-md" : "bg-muted/20 border border-border/30 text-foreground rounded-bl-md"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/20 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border/40">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border/60 bg-muted/5 text-foreground text-sm focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/50"
                disabled={loading}
              />
              <button type="submit" disabled={!input.trim() || loading} className="p-2.5 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-30 transition-opacity">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
