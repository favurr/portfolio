"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2, Check, User, Mail, Sparkles, Wifi } from "lucide-react";
import Ably from "ably";
import {
  MessageGroup,
  Message as ShadcnMessage,
  MessageContent as ShadcnMessageContent,
  MessageHeader as ShadcnMessageHeader,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@/components/ui/message-scroller";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface Message {
  id?: string;
  role: "user" | "assistant" | "admin" | "system";
  senderType: "visitor" | "assistant" | "admin" | "system";
  content: string;
  createdAt?: string;
}

// Inline Claim Form Component
function InlineClaimForm({ sessionId, onSubmitted }: { sessionId: string | null; onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !sessionId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, email }),
      });
      if (res.ok) {
        setDone(true);
        onSubmitted();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 py-1.5 text-emerald-400 font-mono text-[11px] uppercase tracking-wider">
        <Check className="w-3.5 h-3.5 shrink-0" />
        <span>Details saved! Thank you.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 rounded-xl border border-border/40 bg-background/30 space-y-2.5">
      <div className="relative">
        <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full bg-background border border-border/60 rounded-lg pl-8 pr-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-border transition-colors placeholder:text-muted-foreground/30 font-sans"
        />
      </div>
      <div className="relative">
        <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full bg-background border border-border/60 rounded-lg pl-8 pr-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-border transition-colors placeholder:text-muted-foreground/30 font-sans"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full font-mono text-[9px] uppercase tracking-wider py-1.5 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? "Saving..." : "Submit Details"}
      </button>
    </form>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "searching" | "generating">("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [infoSubmitted, setInfoSubmitted] = useState(false);

  // Realtime states
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamMessageRef = useRef<string>("");

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("favurr-chat-session");
    if (stored) {
      setSessionId(stored);
      fetch(`/api/chat/${stored}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.messages) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                senderType: m.senderType || (m.role === "user" ? "visitor" : "assistant"),
                content: m.content,
                createdAt: m.createdAt,
              }))
            );
          }
          if (data?.name || data?.email) {
            setInfoSubmitted(true);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // Initialize Ably client and subscribe to channels
  useEffect(() => {
    if (!sessionId) return;

    // Retry token fetch to handle Next.js dev server on-demand route compilation delays
    const fetchTokenWithRetry = async (id: string, retries = 6, delay = 2000): Promise<any> => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch("/api/chat/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: id }),
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.warn(`Ably token fetch attempt ${i + 1} failed. Retrying...`, e);
        }
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      throw new Error("Failed to fetch Ably token after retries");
    };

    const realtime = new Ably.Realtime({
      authUrl: "/api/chat/token",
      authMethod: "POST",
      authParams: { sessionId },
      authHeaders: { "Content-Type": "application/json" },
      authCallback: async (tokenParams, callback) => {
        try {
          const tokenRequest = await fetchTokenWithRetry(sessionId);
          callback(null, tokenRequest);
        } catch (err: any) {
          callback(err, null);
        }
      },
    });

    setAblyClient(realtime);

    realtime.connection.on("connected", () => {
      setRealtimeConnected(true);
    });

    realtime.connection.on("disconnected", () => {
      setRealtimeConnected(false);
    });

    const channel = realtime.channels.get(`conversations:${sessionId}`);

    // Subscribe to incoming realtime messages and AI streaming tokens
    channel.subscribe("token", (msg) => {
      setLoading(false);
      setAiStatus("generating");
      const token = msg.data.text;
      streamMessageRef.current += token;

      // Handle split streaming dynamically on the client
      const parts = streamMessageRef.current.split("[SPLIT]");

      setMessages((prev) => {
        const baseMessages = prev.filter((m) => m.id || m.role !== "assistant");
        const streamedMsgs = parts.map((part) => ({
          role: "assistant" as const,
          senderType: "assistant" as const,
          content: part,
        })).filter(p => p.content.length > 0 || parts.length === 1);

        return [...baseMessages, ...streamedMsgs];
      });
    });

    // Listen for AI completion event
    channel.subscribe("done", (msg) => {
      streamMessageRef.current = "";
      setAiStatus("idle");
      
      // Fetch latest messages from database to guarantee perfect synchronization
      fetch(`/api/chat/${sessionId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.messages) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                senderType: m.senderType || (m.role === "user" ? "visitor" : "assistant"),
                content: m.content,
                createdAt: m.createdAt,
              }))
            );
          }
        });
      setLoading(false);
    });

    // Listen for manual takeover message events from Admin
    channel.subscribe("message", (msg) => {
      if (msg.data.senderType === "admin") {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.data.id,
            role: "admin",
            senderType: "admin",
            content: msg.data.content,
            createdAt: msg.data.createdAt,
          },
        ]);
      }
    });

    // Listen for takeover events from Admin console
    channel.subscribe("takeover", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          senderType: "system",
          content: msg.data.text,
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    // Listen for typing events from the Admin
    channel.subscribe("typing", (msg) => {
      if (msg.data.clientId !== sessionId) {
        setIsTyping(msg.data.isTyping);
      }
    });

    // Subscribe to presence events to see if admin is online
    channel.presence.subscribe("enter", () => checkPresence());
    channel.presence.subscribe("leave", () => checkPresence());
    channel.presence.subscribe("present", () => checkPresence());

    async function checkPresence() {
      try {
        const members = await channel.presence.get();
        if (members) {
          const isAdminPresent = members.some((m) => m.clientId === "admin");
          setAdminOnline(isAdminPresent);
        }
      } catch (err) {
        console.error(err);
      }
    }

    channel.presence.enter();

    return () => {
      try { channel.unsubscribe(); } catch {}
      try { channel.presence.leave(); } catch {}
      try { realtime.close(); } catch {}
      setRealtimeConnected(false);
    };
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, loading, open]);

  // Trigger typing notification to the Admin
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!ablyClient || !sessionId) return;

    const channel = ablyClient.channels.get(`conversations:${sessionId}`);
    channel.publish("typing", { clientId: sessionId, isTyping: true });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      channel.publish("typing", { clientId: sessionId, isTyping: false });
    }, 2000);

    setTypingTimeout(timeout);
  };

  async function initializeNewSession() {
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "" }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("favurr-chat-session", data.sessionId);
        return data.sessionId;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async function sendMessage() {
    if (!input.trim() || isNetworkLoading) return;
    const userMsg = input.trim();
    setInput("");

    let activeSessionId = sessionId;

    // Create session on first message if missing
    if (!activeSessionId) {
      setLoading(true);
      setIsNetworkLoading(true);
      activeSessionId = await initializeNewSession();
      setIsNetworkLoading(false);
      if (!activeSessionId) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", senderType: "assistant", content: "Could not create session. Please retry." },
        ]);
        setLoading(false);
        return;
      }
    }

    // Add user message locally
    setMessages((prev) => [...prev, { role: "user", senderType: "visitor", content: userMsg }]);
    setLoading(true);
    setAiStatus("searching");
    setIsNetworkLoading(true);

    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      setAiStatus("idle");
    }, 15000);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, message: userMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.isAiActive === false) {
          clearTimeout(safetyTimeout);
          setLoading(false);
          setAiStatus("idle");
        }
      }
    } catch {
      clearTimeout(safetyTimeout);
      setAiStatus("idle");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", senderType: "assistant", content: "Connection timed out. Please try again." },
      ]);
      setLoading(false);
    } finally {
      setIsNetworkLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-95 transition-all duration-300 scale-100 hover:scale-105 active:scale-95 cursor-pointer border border-border"
        aria-label="Toggle Chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window Panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex flex-col bg-background border border-border/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isExpanded
              ? "w-[calc(100vw-3rem)] h-[calc(100vh-10rem)] md:w-[600px] md:h-[700px]"
              : "w-[calc(100vw-3rem)] h-[500px] md:w-[400px]"
          }`}
        >
          {/* Header Panel */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${adminOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              <div>
                <p className="text-xs font-semibold text-foreground">Favurr Studio Agent</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                  {adminOnline ? "Emeka is Online" : "Automated Assistant"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:block p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                title={isExpanded ? "Collapse Window" : "Expand Window"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <MessageScrollerProvider>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport ref={scrollRef} className="px-4 py-4" data-lenis-prevent>
                <MessageScrollerContent className="gap-4">
                  {messages.length === 0 && (
                    <MessageScrollerItem className="text-center py-12 space-y-3">
                      <MessageCircle className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Chat with Favurr AI</p>
                        <p className="text-xs text-muted-foreground max-w-[28ch] mx-auto mt-1 leading-relaxed">
                          Ask about Emeka's project stack, photography skills, availability, or experience details.
                        </p>
                      </div>
                    </MessageScrollerItem>
                  )}

                  <MessageGroup className="gap-3.5 w-full">
                    {messages.map((m, i) => {
                      const isVisitor = m.senderType === "visitor" || m.role === "user";
                      const hasClaimForm = m.content.includes("[CLAIM_FORM]") && !infoSubmitted;
                      const textContent = m.content.replace("[CLAIM_FORM]", "").trim();

                      if (m.role === "system") {
                        return (
                          <MessageScrollerItem key={i}>
                            <Marker role="status" className="w-full justify-center text-center">
                              <MarkerContent className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                                {m.content}
                              </MarkerContent>
                            </Marker>
                          </MessageScrollerItem>
                        );
                      }

                      return (
                        <MessageScrollerItem key={i}>
                          <ShadcnMessage align={isVisitor ? "end" : "start"}>
                            <ShadcnMessageContent>
                              <Bubble variant={isVisitor ? "default" : "muted"} align={isVisitor ? "end" : "start"}>
                                <BubbleContent>
                                  <div className="whitespace-pre-wrap">{textContent}</div>
                                  {hasClaimForm && (
                                    <InlineClaimForm
                                      sessionId={sessionId}
                                      onSubmitted={() => setInfoSubmitted(true)}
                                    />
                                  )}
                                  {m.content.includes("[CLAIM_FORM]") && infoSubmitted && (
                                    <div className="flex items-center gap-1.5 mt-2 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Details saved</span>
                                    </div>
                                  )}
                                </BubbleContent>
                              </Bubble>
                            </ShadcnMessageContent>
                          </ShadcnMessage>
                        </MessageScrollerItem>
                      );
                    })}

                    {/* Live Typing Status */}
                    {isTyping && (
                      <MessageScrollerItem>
                        <ShadcnMessage align="start">
                          <ShadcnMessageContent>
                            <Bubble variant="muted" align="start">
                              <BubbleContent className="flex items-center gap-1.5 py-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                              </BubbleContent>
                            </Bubble>
                          </ShadcnMessageContent>
                        </ShadcnMessage>
                      </MessageScrollerItem>
                    )}
                  </MessageGroup>

                  {/* LLM Streaming Loading status using Marker */}
                  {aiStatus === "searching" && (
                    <MessageScrollerItem>
                      <Marker variant="separator" role="status" className="w-full">
                        <MarkerContent className="shimmer">Scanning project catalog & experience logs...</MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  )}

                  {aiStatus === "generating" && (
                    <MessageScrollerItem>
                      <Marker role="status" className="flex items-center gap-1.5 px-2">
                        <MarkerIcon>
                          <Spinner className="text-primary" />
                        </MarkerIcon>
                        <MarkerContent className="shimmer">Thinking...</MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
            </MessageScroller>
          </MessageScrollerProvider>

          {/* Message Input Form */}
          <div className="px-4 py-3 border-t border-border/40 bg-muted/5 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a question..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-border transition-colors placeholder:text-muted-foreground/50 font-sans"
                disabled={isNetworkLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isNetworkLoading}
                className="p-2.5 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
