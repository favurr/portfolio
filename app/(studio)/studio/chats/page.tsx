"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Trash2, User, Send, Loader2, Sparkles, AlertCircle, Wifi, ArrowLeft, Clock, Check, CheckCheck } from "lucide-react";
import { useRealtime } from "@/lib/realtime-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
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
  messages: { id: string; role: string; senderType: string; content: string; createdAt: string; status?: string }[];
  _count: { messages: number };
}

function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatsPage() {
  const queryClient = useQueryClient();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");

  // Realtime takeover states
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [visitorOnline, setVisitorOnline] = useState(false); // Default to offline on mount
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastActiveTime, setLastActiveTime] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingSentRef = useRef(false);
  const presenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TanStack Query: Fetch all sessions
  const { data: sessionsData, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: async () => {
      const res = await client.chats.get();
      if (res.error) throw new Error("Failed to fetch sessions");
      return res.data as unknown as ChatSession[];
    },
  });

  useEffect(() => {
    if (sessionsData) {
      setSessions(sessionsData);
    }
  }, [sessionsData]);

  // TanStack Query: Fetch active session details
  const { data: threadData } = useQuery({
    queryKey: ["chatSessionDetails", selected],
    queryFn: async () => {
      if (!selected) return null;
      const res = await client.chats({ id: selected }).get();
      if (res.error) throw new Error("Failed to fetch session details");
      return res.data as unknown as ChatSession;
    },
    enabled: !!selected,
  });

  useEffect(() => {
    if (threadData) {
      setThread(threadData);
    }
  }, [threadData]);

  // Initialize lastActiveTime from visitor's last message time
  useEffect(() => {
    if (thread) {
      const visitorMessages = thread.messages.filter(
        (m: any) => m.role === "user" || m.senderType === "visitor"
      );
      if (visitorMessages.length > 0) {
        const lastMsg = visitorMessages[visitorMessages.length - 1];
        setLastActiveTime(new Date(lastMsg.createdAt).getTime());
      } else {
        setLastActiveTime(new Date(thread.createdAt).getTime());
      }
    }
  }, [thread?.id]);

  // Subscribe to real-time updates via Upstash Realtime client hooks
  useRealtime({
    channels: selected ? ["conversations:lobby", `conversations:${selected}`] : ["conversations:lobby"],
    events: ["new-session", "message-update", "typing", "message"],
    onData({ event, data, channel }) {
      // Mark visitor online on any event received from their channel
      if (selected && channel === `conversations:${selected}`) {
        setVisitorOnline(true);
        setLastActiveTime(Date.now());
        if (presenceTimeoutRef.current) clearTimeout(presenceTimeoutRef.current);
        presenceTimeoutRef.current = setTimeout(() => {
          setVisitorOnline(false);
        }, 60000); // 60s of inactivity marks offline
      }

      if (event === "new-session") {
        queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
        setSessions((prev) => {
          if (prev.some((s) => s.id === data.id)) return prev;
          const newSess: ChatSession = {
            id: data.id,
            name: data.visitorName || null,
            email: data.visitorEmail || null,
            isAiActive: data.isAiActive ?? true,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            messages: data.messages || [],
            _count: data._count || { messages: 0 },
          };
          return [newSess, ...prev];
        });
      } else if (event === "message-update") {
        const { sessionId, message } = data;
        queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
        if (selected === sessionId) {
          queryClient.invalidateQueries({ queryKey: ["chatSessionDetails", selected] });
        }
        const formattedMsg = {
          id: message.id || `temp-${Date.now()}`,
          role: message.role,
          senderType: message.senderType,
          content: message.content,
          createdAt: message.createdAt || new Date().toISOString(),
        };
        
        setSessions((prev) => {
          const target = prev.find((s) => s.id === sessionId);
          if (!target) return prev; 
          
          const updated = {
            ...target,
            updatedAt: formattedMsg.createdAt,
            messages: [formattedMsg],
            _count: {
              messages: target._count.messages + 1
            }
          };
          
          const filtered = prev.filter((s) => s.id !== sessionId);
          return [updated, ...filtered];
        });

        setThread((prevThread) => {
          if (!prevThread || prevThread.id !== sessionId) return prevThread;
          const exists = prevThread.messages.some((m) =>
            m.id === formattedMsg.id ||
            (m.content === formattedMsg.content && m.id.startsWith("temp-admin-"))
          );
          if (exists) {
            return {
              ...prevThread,
              messages: prevThread.messages.map((m) =>
                (m.id === formattedMsg.id || (m.content === formattedMsg.content && m.id.startsWith("temp-admin-")))
                  ? { ...formattedMsg, status: undefined }
                  : m
              )
            };
          }
          return {
            ...prevThread,
            messages: [...prevThread.messages, formattedMsg]
          };
        });
      } else if (event === "typing" && channel === `conversations:${selected}`) {
        if (data.clientId !== "admin") {
          setVisitorTyping(data.isTyping);
        }
      } else if (event === "message" && channel === `conversations:${selected}`) {
        queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
        queryClient.invalidateQueries({ queryKey: ["chatSessionDetails", selected] });
        const formattedMsg = {
          id: data.id || `temp-${Date.now()}`,
          role: data.role,
          senderType: data.senderType,
          content: data.content,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setThread((prevThread) => {
          if (!prevThread || prevThread.id !== selected) return prevThread;
          const exists = prevThread.messages.some((m) =>
            m.id === formattedMsg.id ||
            (m.content === formattedMsg.content && m.id.startsWith("temp-admin-"))
          );
          if (exists) {
            return {
              ...prevThread,
              messages: prevThread.messages.map((m) =>
                (m.id === formattedMsg.id || (m.content === formattedMsg.content && m.id.startsWith("temp-admin-")))
                  ? { ...formattedMsg, status: undefined }
                  : m
              )
            };
          }
          return {
            ...prevThread,
            messages: [...prevThread.messages, formattedMsg]
          };
        });
      }
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages, visitorTyping]);

  // TanStack mutations for takeover, typing, reply, and deletion
  const toggleAiMutation = useMutation({
    mutationFn: async ({ id, isAiActive }: { id: string; isAiActive: boolean }) => {
      const res = await client.chats({ id }).put({ isAiActive });
      if (res.error) throw new Error("Failed to toggle AI mode");
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
      if (selected === variables.id) {
        queryClient.invalidateQueries({ queryKey: ["chatSessionDetails", selected] });
      }
    },
  });

  const typingMutation = useMutation({
    mutationFn: async ({ sessionId, isTyping, clientId }: { sessionId: string; isTyping: boolean; clientId?: string }) => {
      await client.chat.typing.post({ sessionId, isTyping, clientId });
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const res = await client.chats({ id }).message.post({ message });
      if (res.error) throw new Error("Failed to send reply");
      return res.data;
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.chats({ id }).delete();
      if (res.error) throw new Error("Failed to delete session");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
  });

  async function selectSession(id: string) {
    setSelected(id);
  }

  async function toggleAi(checked: boolean) {
    if (!thread) return;
    setThread((prev: any) => ({ ...prev, isAiActive: checked }));
    setSessions((prev) =>
      prev.map((s) => (s.id === thread.id ? { ...s, isAiActive: checked } : s))
    );
    toggleAiMutation.mutate({ id: thread.id, isAiActive: checked });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!selected) return;

    if (!typingSentRef.current) {
      typingSentRef.current = true;
      typingMutation.mutate({ sessionId: selected, isTyping: true, clientId: "admin" });
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      typingMutation.mutateAsync({ sessionId: selected, isTyping: false, clientId: "admin" })
        .then(() => {
          typingSentRef.current = false;
        })
        .catch((err) => {
          console.error(err);
          typingSentRef.current = false;
        });
    }, 2000);

    setTypingTimeout(timeout);
  };

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !thread) return;

    const replyMsg = input.trim();
    setInput("");

    // Create a temporary message in "sending" state immediately
    const tempId = `temp-admin-${Date.now()}`;
    const newMsg = {
      id: tempId,
      role: "assistant",
      senderType: "admin",
      content: replyMsg,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setThread((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMsg],
      };
    });

    try {
      const savedMsg = (await sendReplyMutation.mutateAsync({ id: thread.id, message: replyMsg })) as any;

      // Update status of this message from "sending" to undefined so checkmarks default to double-checks
      setThread((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m: any) =>
            m.id === tempId ? { ...savedMsg, status: undefined } : m
          ),
        };
      });

      // Update list preview
      setSessions((prev) =>
        prev.map((s) =>
          s.id === thread.id
            ? {
                ...s,
                updatedAt: savedMsg.createdAt,
                messages: [savedMsg],
                _count: { messages: s._count.messages + 1 },
              }
            : s
        )
      );
    } catch (e) {
      console.error("Error sending reply:", e);
      setThread((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m: any) =>
            m.id === tempId ? { ...m, status: "failed" } : m
          ),
        };
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this chat session?")) return;
    deleteSessionMutation.mutate(id);
    if (selected === id) {
      setSelected(null);
      setThread(null);
    }
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

      {isSessionsLoading ? (
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

                    <span className={cn("w-2 h-2 rounded-full", visitorOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-none">{thread.name || "Anonymous Guest"}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {visitorOnline ? "Online" : "Last seen recently"}
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
                                    <div className="flex items-center justify-end gap-1.5 px-1 mt-1 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                                      <span>
                                        {isVisitor
                                          ? "Visitor"
                                          : isManualAdmin
                                          ? "Admin (You)"
                                          : `Gemini AI (${m.latency ? `${m.latency}ms` : "Live"})`}
                                      </span>
                                      <span>•</span>
                                      <span>{formatTime(m.createdAt)}</span>
                                      {!isVisitor && (
                                        <span className="inline-flex items-center">
                                          {m.status === "sending" ? (
                                            <Clock className="w-2.5 h-2.5 text-muted-foreground animate-pulse" />
                                          ) : m.status === "failed" ? (
                                            <AlertCircle className="w-2.5 h-2.5 text-destructive" />
                                          ) : m.status === "sent" ? (
                                            <Check className="w-2.5 h-2.5 text-muted-foreground" />
                                          ) : (visitorOnline || new Date(m.createdAt).getTime() <= lastActiveTime) ? (
                                            <CheckCheck className="w-2.5 h-2.5 text-emerald-400" />
                                          ) : (
                                            <CheckCheck className="w-2.5 h-2.5 text-muted-foreground/60" />
                                          )}
                                        </span>
                                      )}
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
                      disabled={thread.isAiActive}
                      className="flex-1 px-4 py-3 rounded-xl border border-border/60 bg-background text-foreground text-xs focus:outline-none focus:border-border transition-colors disabled:opacity-50 placeholder:text-muted-foreground/50 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={thread.isAiActive || !input.trim()}
                      className="p-3 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
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
