"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Trash2, User, Send, Loader2, Sparkles, AlertCircle, Wifi, ArrowLeft } from "lucide-react";
import Ably from "ably";
import { cn } from "@/lib/utils";
import {
  MessageGroup,
  Message as ShadcnMessage,
  MessageContent as ShadcnMessageContent,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@/components/ui/message-scroller";

interface ChatSession {
  id: string;
  name: string | null;
  email: string | null;
  isAiActive: boolean;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; role: string; senderType: string; content: string; createdAt: string }[];
  _count: { messages: number };
}

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Realtime takeover states
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [visitorOnline, setVisitorOnline] = useState(false);
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();

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

    // Initialize Ably client for Admin console using Token Auth
    const realtime = new Ably.Realtime({
      authUrl: "/api/chat/token",
      authMethod: "POST",
      authParams: { sessionId: "admin" },
      authHeaders: { "Content-Type": "application/json" },
      authCallback: async (tokenParams, callback) => {
        try {
          const tokenRequest = await fetchTokenWithRetry("admin");
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

    const lobbyChannel = realtime.channels.get("conversations:lobby");
    lobbyChannel.subscribe("new-session", (msg) => {
      setSessions((prev) => {
        if (prev.some((s) => s.id === msg.data.id)) return prev;
        return [msg.data, ...prev];
      });
    });

    lobbyChannel.subscribe("message-update", (msg) => {
      const { sessionId, message } = msg.data;
      
      // Update the sidebar sessions preview in real-time
      setSessions((prev) => {
        const target = prev.find((s) => s.id === sessionId);
        if (!target) return prev; 
        
        const updated = {
          ...target,
          updatedAt: message.createdAt,
          messages: [message], // Update last message preview
          _count: {
            messages: target._count.messages + 1
          }
        };
        
        const filtered = prev.filter((s) => s.id !== sessionId);
        return [updated, ...filtered];
      });

      // Update the currently selected thread view if matched
      setThread((prevThread) => {
        if (!prevThread || prevThread.id !== sessionId) return prevThread;
        if (prevThread.messages.some((m) => m.id === message.id)) return prevThread;
        return {
          ...prevThread,
          messages: [...prevThread.messages, message]
        };
      });
    });

    return () => {
      try { lobbyChannel.unsubscribe(); } catch {}
      try { realtime.close(); } catch {}
      setRealtimeConnected(false);
    };
  }, []);

  // Sync session channel when selected chat changes
  useEffect(() => {
    if (!ablyClient || !selected) {
      setVisitorOnline(false);
      setVisitorTyping(false);
      return;
    }

    const channel = ablyClient.channels.get(`conversations:${selected}`);

    // Listen for visitor typing alerts
    channel.subscribe("typing", (msg) => {
      if (msg.data.clientId !== "admin") {
        setVisitorTyping(msg.data.isTyping);
      }
    });

    // Subscribe to presence list to know if the visitor is online
    channel.presence.subscribe("enter", () => checkPresence());
    channel.presence.subscribe("leave", () => checkPresence());
    channel.presence.subscribe("present", () => checkPresence());

    async function checkPresence() {
      try {
        const members = await channel.presence.get();
        if (members) {
          const isUserPresent = members.some((m) => m.clientId === selected);
          setVisitorOnline(isUserPresent);
        }
      } catch (err) {
        console.error(err);
      }
    }

    channel.presence.enter();
    checkPresence();

    return () => {
      try { channel.unsubscribe(); } catch {}
      try { channel.presence.leave(); } catch {}
    };
  }, [ablyClient, selected]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages, visitorTyping]);

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
    const data = await res.json();
    setThread(data);
  }

  async function toggleAi(checked: boolean) {
    if (!thread) return;

    setThread((prev: any) => ({ ...prev, isAiActive: checked }));
    setSessions((prev) =>
      prev.map((s) => (s.id === thread.id ? { ...s, isAiActive: checked } : s))
    );

    try {
      await fetch(`/api/chats/${thread.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAiActive: checked }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!ablyClient || !selected) return;

    const channel = ablyClient.channels.get(`conversations:${selected}`);
    channel.publish("typing", { clientId: "admin", isTyping: true });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      channel.publish("typing", { clientId: "admin", isTyping: false });
    }, 2000);

    setTypingTimeout(timeout);
  };

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !thread || isSending) return;

    const replyMsg = input.trim();
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(`/api/chats/${thread.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMsg }),
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setThread((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, savedMsg],
          };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this chat session?")) return;
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    if (selected === id) {
      setSelected(null);
      setThread(null);
    }
    fetchSessions();
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5 shrink-0">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">Workspace Hub</p>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-normal text-foreground">Live Takeover Console</h1>
            {realtimeConnected && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wifi className="w-2.5 h-2.5" /> Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground font-mono text-xs animate-pulse">Loading live conversations...</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 p-16 text-center text-muted-foreground font-mono text-xs space-y-2">
          <AlertCircle className="w-6 h-6 text-muted-foreground/30 mx-auto" />
          <p>No chat sessions yet. Active conversations will appear here.</p>
        </div>
      ) : (
        /* Flex Viewport-Fitting Layout */
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-[500px] h-[calc(100vh-230px)] md:h-[calc(100vh-260px)] relative overflow-hidden">
          
          {/* 1. Conversations Sidebar List */}
          <div
            className={cn(
              "w-full md:w-80 border border-border/40 rounded-2xl bg-card p-4 flex flex-col gap-4 overflow-y-auto h-full shrink-0 transition-all duration-300",
              selected ? "hidden md:flex" : "flex"
            )}
          >
            <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/10 pb-2">
              Active Dialogues ({sessions.length})
            </h2>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              {sessions.map((s) => {
                const isSelected = selected === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col gap-2",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary-foreground"
                        : "border-border/40 hover:border-border/60 hover:bg-muted/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-mono font-medium text-foreground">
                          {s.name || "Anonymous"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Delete Dialogue"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {s.email && <span className="text-[10px] font-mono text-muted-foreground truncate">{s.email}</span>}

                    <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground pt-1 border-t border-border/10">
                      <span>{s.messages.length} messages</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px]",
                        s.isAiActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-warning/10 text-warning border border-warning/20"
                      )}>
                        {s.isAiActive ? "AI Mode" : "Manual"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Interactive Chat Console */}
          <div
            className={cn(
              "flex-1 border border-border/40 rounded-2xl flex flex-col bg-card overflow-hidden h-full relative transition-all duration-300",
              selected ? "flex" : "hidden md:flex"
            )}
          >
            {thread ? (
              <>
                {/* Console Bar Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/10 shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Back Button (Mobile Only) */}
                    <button
                      onClick={() => {
                        setSelected(null);
                        setThread(null);
                      }}
                      className="md:hidden p-1.5 rounded-lg border border-border/60 hover:bg-muted/30 text-muted-foreground hover:text-foreground mr-1 cursor-pointer transition-colors"
                      title="Back to List"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <span className={cn("w-2.5 h-2.5 rounded-full", visitorOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{thread.name || "Anonymous Guest"}</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {visitorOnline ? "Visitor active" : "Offline / Inactive"}
                      </p>
                    </div>
                  </div>

                  {/* AI Takeover switch control */}
                  <div className="flex items-center gap-3 border-l border-border/35 pl-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">AI Agent</span>
                    <button
                      type="button"
                      onClick={() => toggleAi(!thread.isAiActive)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        thread.isAiActive ? "bg-emerald-500" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                          thread.isAiActive ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Message Scroller Viewport */}
                <MessageScrollerProvider>
                  <MessageScroller className="flex-1 min-h-0">
                    <MessageScrollerViewport ref={scrollRef} className="px-6 py-6" data-lenis-prevent>
                      <MessageScrollerContent className="gap-4">
                        <MessageGroup className="gap-3.5 w-full">
                          {thread.messages.map((m: any) => {
                            const isVisitor = m.role === "user" || m.senderType === "visitor";
                            const isSystemAI = m.senderType === "assistant";
                            const isManualAdmin = m.senderType === "admin";

                             return (
                              <MessageScrollerItem key={m.id || m.createdAt}>
                                <ShadcnMessage align={isVisitor ? "start" : "end"}>
                                  <div className="max-w-[75%] space-y-1">
                                    <ShadcnMessageContent>
                                      <Bubble
                                        variant={isVisitor ? "muted" : isManualAdmin ? "default" : "secondary"}
                                        align={isVisitor ? "start" : "end"}
                                      >
                                        <BubbleContent>
                                          <div className="whitespace-pre-wrap">
                                            {m.content.replace("[CLAIM_FORM]", "").trim()}
                                          </div>
                                          {m.content.includes("[CLAIM_FORM]") && (
                                            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-foreground/10 text-foreground border border-border/40 font-mono text-[9px] uppercase tracking-wider">
                                              <Sparkles className="w-3 h-3 text-primary shrink-0" />
                                              <span>Details Capture Form Rendered</span>
                                            </div>
                                          )}
                                        </BubbleContent>
                                      </Bubble>
                                    </ShadcnMessageContent>
                                    <div className="flex items-center gap-2 px-1 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                                      <span>
                                        {isVisitor
                                          ? "Visitor"
                                          : isManualAdmin
                                          ? "Admin (You)"
                                          : `Gemini AI (${m.latency ? `${m.latency}ms` : "Live"})`}
                                      </span>
                                    </div>
                                  </div>
                                </ShadcnMessage>
                              </MessageScrollerItem>
                            );
                          })}

                          {/* Visitor typing alerts */}
                          {visitorTyping && (
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
                      </MessageScrollerContent>
                    </MessageScrollerViewport>
                  </MessageScroller>
                </MessageScrollerProvider>

                {/* Input action toolbar */}
                <div className="px-6 py-4 border-t border-border/40 bg-muted/5 shrink-0">
                  <form onSubmit={handleSendReply} className="flex items-center gap-3">
                    <input
                      value={input}
                      onChange={handleInputChange}
                      placeholder={thread.isAiActive ? "Turn off AI mode to takeover..." : "Type reply message..."}
                      disabled={thread.isAiActive || isSending}
                      className="flex-1 px-4 py-3 rounded-xl border border-border/60 bg-background text-foreground text-xs focus:outline-none focus:border-border transition-colors disabled:opacity-50 placeholder:text-muted-foreground/50 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={thread.isAiActive || !input.trim() || isSending}
                      className="p-3 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer shrink-0"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-card">
                <MessageCircle className="w-12 h-12 text-muted-foreground/20" />
                <div>
                  <h3 className="font-serif text-base text-foreground">Select a Dialogue</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[28ch] leading-relaxed font-sans">
                    Choose an active thread from the sidebar to review logs or take control.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
