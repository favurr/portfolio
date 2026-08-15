"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Maximize2,
  Minimize2,
  Check,
  User,
  Mail,
  Sparkles,
  Copy,
  ArrowDown,
} from "lucide-react";
import { useRealtime } from "@/lib/realtime-client";
import ReactMarkdown from "react-markdown";
import {
  MessageGroup,
  Message as ShadcnMessage,
  MessageContent as ShadcnMessageContent,
  MessageHeader as ShadcnMessageHeader,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@/components/ui/message-scroller";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";

interface Message {
  id?: string;
  role: "user" | "assistant" | "admin" | "system";
  senderType: "visitor" | "assistant" | "admin" | "system";
  content: string;
  createdAt?: string;
}

// Copy Button Component for Codeblocks & Quotes
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="p-1 rounded bg-muted-foreground/10 hover:bg-muted-foreground/20 text-muted-foreground transition-colors cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}

// Custom Markdown Component
function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed text-sm font-sans">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-4 mb-2 space-y-1 text-sm font-sans">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-4 mb-2 space-y-1 text-sm font-sans">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-sm leading-relaxed">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-base font-bold mt-3 mb-1.5 font-sans">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-sm font-semibold mt-2.5 mb-1 font-sans">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-xs font-medium mt-2 mb-1 font-sans">{children}</h3>;
        },
        pre({ children }) {
          let text = "";
          try {
            if (
              children &&
              (children as any).props &&
              (children as any).props.children
            ) {
              text = String((children as any).props.children);
            } else {
              text = String(children);
            }
          } catch (e) {
            text = String(children);
          }
          return (
            <div className="relative group/code my-2 p-3 bg-muted/40 rounded-lg border border-border/40 font-mono text-xs overflow-x-auto">
              <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                <CopyButton text={text} />
              </div>
              <pre className="pr-6 leading-relaxed whitespace-pre-wrap">
                {children}
              </pre>
            </div>
          );
        },
        code({ node, className, children, ...props }) {
          return (
            <code
              className={cn(
                "bg-muted/60 px-1.5 py-0.5 rounded font-mono text-xs text-foreground",
                className,
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        blockquote({ children }) {
          let text = "";
          try {
            text = String((children as any)?.[0]?.props?.children || children);
          } catch {
            text = String(children);
          }
          return (
            <div className="relative group/quote my-2 pl-3 border-l-2 border-primary/40 italic text-muted-foreground bg-muted/20 py-1.5 pr-2 rounded-r-md">
              <div className="absolute right-2 top-1 opacity-0 group-hover/quote:opacity-100 transition-opacity z-10">
                <CopyButton text={text} />
              </div>
              <blockquote>{children}</blockquote>
            </div>
          );
        },
        a({ href, children }) {
          const isEmail = href?.startsWith("mailto:");
          return (
            <a
              href={href}
              target={isEmail ? undefined : "_blank"}
              rel={isEmail ? undefined : "noopener noreferrer"}
              className="text-primary hover:underline font-medium break-all"
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// Inline Claim Form Component
function InlineClaimForm({
  sessionId,
  history,
  onSubmitted,
}: {
  sessionId: string | null;
  history: Message[];
  onSubmitted: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (payload: { sessionId: string; name: string; email: string; history: any }) => {
      const res = await client.chat.message.post(payload);
      if (res.error) throw new Error("Failed to submit details");
      return res.data;
    },
    onSuccess: () => {
      localStorage.setItem("favurr-chat-registered", "true");
      setDone(true);
      onSubmitted();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !sessionId) return;
    setSubmitting(true);
    try {
      await submitMutation.mutateAsync({ sessionId, name, email, history });
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
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-3 rounded-xl border border-border/40 bg-background/30 space-y-2.5"
    >
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
        className="w-full font-mono text-[9px] uppercase tracking-wider py-1.5 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 transition-opacity cursor-pointer"
      >
        {submitting ? "Saving..." : "Submit Details"}
      </button>
    </form>
  );
}

export function ChatWidget() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      message?: string;
      name?: string;
      email?: string;
      history?: any;
    }) => {
      const res = await client.chat.message.post(payload);
      if (res.error) throw new Error("Failed to send message");
      return res.data;
    },
    onSuccess: () => {
      localStorage.setItem("favurr-chat-registered", "true");
    },
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "searching" | "generating">(
    "idle",
  );
  const [statusText, setStatusText] = useState(
    "Scanning project catalog & experience logs...",
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [infoSubmitted, setInfoSubmitted] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Realtime states
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [realtimeConnected, setRealtimeConnected] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamMessageRef = useRef<string>("");
  const typingSentRef = useRef(false);

  // Initialize sessionId from localStorage on mount
  useEffect(() => {
    let storedId = localStorage.getItem("favurr-chat-session");
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem("favurr-chat-session", storedId);
      localStorage.setItem("favurr-chat-registered", "false");
    }
    setSessionId(storedId);

    const registered = localStorage.getItem("favurr-chat-registered") === "true";
    if (!registered) {
      const savedMessages = localStorage.getItem("favurr-chat-messages");
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Error parsing saved messages:", e);
        }
      }
    }
  }, []);

  const isRegistered = typeof window !== "undefined" && localStorage.getItem("favurr-chat-registered") === "true";

  // Fetch registered session data using React Query
  const { data: chatData } = useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const res = await client.chat({ sessionId }).get();
      if (res.error) throw new Error("Failed to fetch session");
      return res.data;
    },
    enabled: !!sessionId && isRegistered,
  });

  // Sync React Query loaded data to local state
  useEffect(() => {
    if (chatData && !("error" in chatData) && chatData.messages) {
      setMessages(
        chatData.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          senderType: m.senderType || (m.role === "user" ? "visitor" : "assistant"),
          content: m.content,
          createdAt: m.createdAt,
        }))
      );
      if (chatData.name || chatData.email) {
        setInfoSubmitted(true);
      }
    }
  }, [chatData]);

  // Save messages in-memory cache to localStorage
  useEffect(() => {
    if (sessionId) {
      const registered = localStorage.getItem("favurr-chat-registered") === "true";
      if (!registered && messages.length > 0) {
        localStorage.setItem("favurr-chat-messages", JSON.stringify(messages));
      }
    }
  }, [messages, sessionId]);

  // Subscribe to real-time events via Upstash Realtime hook
  useRealtime({
    channels: sessionId ? [`conversations:${sessionId}`] : [],
    events: ["status", "token", "done", "message", "takeover", "typing"],
    onData({ event, data }) {
      if (event === "status") {
        setStatusText(data.text);
        if (
          data.text.includes("Generating") ||
          data.text.includes("Synthesizing")
        ) {
          setAiStatus("generating");
        } else {
          setAiStatus("searching");
        }
      } else if (event === "token") {
        setLoading(false);
        setAiStatus("generating");
        const token = data.text;
        streamMessageRef.current += token;

        setMessages((prev) => {
          const baseMessages = prev.filter((m) => m.id || m.role !== "assistant");
          return [
            ...baseMessages,
            {
              role: "assistant" as const,
              senderType: "assistant" as const,
              content: streamMessageRef.current,
            },
          ];
        });
      } else if (event === "done") {
        streamMessageRef.current = "";
        setAiStatus("idle");

        const registered =
          localStorage.getItem("favurr-chat-registered") === "true";
        if (registered && sessionId) {
          queryClient.invalidateQueries({ queryKey: ["chatSession", sessionId] });
        } else {
          // Unregistered visitor: assign a temporary ID to the completed AI response so it stays persistent
          setMessages((prev) => {
            const copy = [...prev];
            for (let i = copy.length - 1; i >= 0; i--) {
              if (copy[i].role === "assistant" && !copy[i].id) {
                copy[i] = {
                  ...copy[i],
                  id: `ai-done-${Date.now()}`,
                };
                break;
              }
            }
            return copy;
          });
        }
        setLoading(false);
      } else if (event === "message") {
        if (data.senderType === "admin") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [
              ...prev,
              {
                id: data.id,
                role: "admin",
                senderType: "admin",
                content: data.content,
                createdAt: data.createdAt,
              },
            ];
          });
        }
      } else if (event === "takeover") {
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            senderType: "system",
            content: data.text,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else if (event === "typing") {
        if (data.clientId !== sessionId) {
          setIsTyping(data.isTyping);
        }
      }
    },
  });

  // Automatically scroll to bottom when new messages arrive OR during active streaming
  // but only if the user hasn't scrolled up
  useEffect(() => {
    if (scrollRef.current && !showScrollBottomBtn) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, loading, open, showScrollBottomBtn]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShowScrollBottomBtn(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Detect if visitor scrolled up by more than 100px from the bottom
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollBottomBtn(!isNearBottom);
  };

  // Trigger typing notification to the Admin
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (!sessionId) return;

    // Only send typing:true once when starting to type
    if (!typingSentRef.current) {
      typingSentRef.current = true;
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, isTyping: true, clientId: sessionId }),
      }).catch(console.error);
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, isTyping: false, clientId: sessionId }),
      }).then(() => {
        typingSentRef.current = false;
      }).catch((err) => {
        console.error(err);
        typingSentRef.current = false;
      });
    }, 2000);

    setTypingTimeout(timeout);
  };

  async function sendMessage() {
    if (!input.trim() || isNetworkLoading) return;
    const userMsg = input.trim();
    setInput("");

    const isRegistered =
      localStorage.getItem("favurr-chat-registered") === "true";

    // Add user message locally
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user" as const,
        senderType: "visitor" as const,
        content: userMsg,
      },
    ];
    setMessages(updatedMessages);
    setLoading(true);
    setAiStatus("searching");
    setStatusText("Analyzing query...");
    setIsNetworkLoading(true);

    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      setAiStatus("idle");
    }, 15000);

    try {
      const data = await sendMessageMutation.mutateAsync({
        sessionId: sessionId!,
        message: userMsg,
        history: isRegistered ? undefined : updatedMessages,
      });
      if (data && data.isAiActive === false) {
        clearTimeout(safetyTimeout);
        setLoading(false);
        setAiStatus("idle");
      }
    } catch {
      clearTimeout(safetyTimeout);
      setAiStatus("idle");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          senderType: "assistant",
          content: "Connection timed out. Please try again.",
        },
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
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
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
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Favurr Studio Agent
                </p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                  Automated Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:block p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                title={isExpanded ? "Collapse Window" : "Expand Window"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content - Relative container to position scroll to bottom overlay */}
          <div className="flex-1 relative min-h-0 flex flex-col">
            <MessageScrollerProvider>
              <MessageScroller className="flex-1">
                <MessageScrollerViewport
                  ref={scrollRef}
                  className="px-4 py-4"
                  data-lenis-prevent
                  onScroll={handleScroll}
                >
                  <MessageScrollerContent className="gap-4">
                    {messages.length === 0 && (
                      <MessageScrollerItem className="text-center py-12 space-y-3">
                        <MessageCircle className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Chat with Favurr AI
                          </p>
                          <p className="text-xs text-muted-foreground max-w-[28ch] mx-auto mt-1 leading-relaxed">
                            Ask about Favurr's project stack, photography
                            skills, availability, or experience details.
                          </p>
                        </div>
                      </MessageScrollerItem>
                    )}

                    <MessageGroup className="gap-3.5 w-full">
                      {messages.map((m, i) => {
                        const isVisitor =
                          m.senderType === "visitor" || m.role === "user";
                        const hasClaimForm =
                          m.content.includes("[CLAIM_FORM]") && !infoSubmitted;
                        const textContent = m.content
                          .replace("[CLAIM_FORM]", "")
                          .trim();

                        if (m.role === "system") {
                          return (
                            <MessageScrollerItem key={i}>
                              <Marker
                                role="status"
                                className="w-full justify-center text-center"
                              >
                                <MarkerContent className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                                  {m.content}
                                </MarkerContent>
                              </Marker>
                            </MessageScrollerItem>
                          );
                        }

                        return (
                          <MessageScrollerItem key={i}>
                            <ShadcnMessage align={isVisitor ? "end" : "start"} className={cn("max-w-[80%] my-0.5", isVisitor ? "ml-auto" : "mr-auto")}>
                              <ShadcnMessageContent className="w-full">
                                <Bubble
                                  variant={isVisitor ? "default" : "ghost"}
                                  align={isVisitor ? "end" : "start"}
                                  className={cn(
                                    isVisitor && "w-full",
                                    !isVisitor &&
                                      "bg-transparent border-none shadow-none p-0 max-w-[100%]",
                                  )}
                                >
                                  <BubbleContent
                                    className={cn(
                                      !isVisitor &&
                                        "bg-transparent border-none shadow-none p-0 text-foreground text-sm",
                                    )}
                                  >
                                    {!isVisitor ? (
                                      <ChatMarkdown content={textContent} />
                                    ) : (
                                      <div className="whitespace-pre-wrap">
                                        {textContent}
                                      </div>
                                    )}
                                    {hasClaimForm && (
                                      <InlineClaimForm
                                        sessionId={sessionId}
                                        history={messages}
                                        onSubmitted={() =>
                                          setInfoSubmitted(true)
                                        }
                                      />
                                    )}
                                    {m.content.includes("[CLAIM_FORM]") &&
                                      infoSubmitted && (
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
                              <Bubble variant="ghost" align="start">
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
                        <Marker
                          variant="separator"
                          role="status"
                          className="w-full"
                        >
                          <MarkerContent className="shimmer text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                            {statusText}
                          </MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    )}

                    {aiStatus === "generating" && (
                      <MessageScrollerItem>
                        <Marker
                          role="status"
                          className="flex items-center gap-1.5 px-2"
                        >
                          <MarkerIcon className="size-3">
                            <Spinner className="text-primary size-3" />
                          </MarkerIcon>
                          <MarkerContent className="shimmer text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                            {statusText}
                          </MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
              </MessageScroller>
            </MessageScrollerProvider>

            {/* Scroll-to-bottom Floating overlay Button */}
            {showScrollBottomBtn && (
              <button
                onClick={scrollToBottom}
                type="button"
                className="absolute bottom-4 right-[50%] z-20 flex items-center gap-1.5 p-1 rounded-full bg-foreground text-background text-[10px] font-mono uppercase tracking-wider shadow-lg hover:opacity-90 transition-opacity cursor-pointer border border-border/20"
              >
                <ArrowDown size={20} />
              </button>
            )}
          </div>

          {/* Message Input Form */}
          <div className="px-4 py-3 border-t border-border/40 bg-muted/5 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="resize-none w-full">
                <Textarea
                  ref={inputRef as any}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a question..."
                  className="flex-1 min-h-full max-h-28 resize-none overflow-y-auto px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-foreground text-sm focus:outline-none focus:border-border transition-colors placeholder:text-muted-foreground/50 font-sans"
                  disabled={isNetworkLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
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
