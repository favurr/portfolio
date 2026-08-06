"use client";

import { useSidebar } from "@/components/sidebar-context";
import { type Session } from "better-auth/types";
import {
  ArrowLeft,
  FolderKanban,
  Globe,
  Inbox,
  LayoutDashboard,
  LucideAward,
  MessageCircle,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import Link from "next/link";
import { FaBlog } from "react-icons/fa6";

interface ClientSidebarProps {
  session: {
    session: any;
    user: {
      email: string;
      [key: string]: any;
    };
  };
}

export function ClientSidebar({ session }: ClientSidebarProps) {
  const { isCompact, setIsCompact } = useSidebar();

  return (
    <aside
      className={`border-r border-border/40 bg-muted/10 flex flex-col justify-between p-6 shrink-0 hidden md:flex transition-all duration-300 ${
        isCompact ? "w-20 items-center px-4" : "w-64"
      }`}
    >
      <div className="space-y-8 w-full flex flex-col items-center">
        {/* Studio Brand Header */}
        {!isCompact ? (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Studio Engine</span>
              </div>
              <button
                onClick={() => setIsCompact(true)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <h1 className="font-serif text-2xl font-normal text-foreground">
              Favurr <span className="italic font-normal">Studio</span>
            </h1>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full border-b border-border/20 pb-4">
            <button
              onClick={() => setIsCompact(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
              title="Expand Sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1 font-mono text-xs uppercase tracking-wider w-full">
          <Link
            href="/studio"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 text-foreground transition-all ${
              isCompact ? "justify-center" : ""
            }`}
            title="Overview"
          >
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            {!isCompact && <span>Overview</span>}
          </Link>
          <Link
            href="/studio/projects"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 text-foreground transition-all ${
              isCompact ? "justify-center" : ""
            }`}
            title="Projects CMS"
          >
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
            {!isCompact && <span>Projects CMS</span>}
          </Link>
          <Link
            href="/studio/blog"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 text-foreground transition-all ${
              isCompact ? "justify-center" : ""
            }`}
            title="Blog CMS"
          >
            <FaBlog className="w-4 h-4 text-muted-foreground" />
            {!isCompact && <span>Blog CMS</span>}
          </Link>
          <Link
            href="/studio/inbox"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 text-foreground transition-all ${
              isCompact ? "justify-center" : ""
            }`}
            title="Inbox"
          >
            <Inbox className="w-4 h-4 text-muted-foreground" />
            {!isCompact && <span>Inbox</span>}
          </Link>
          <Link
            href="/studio/knowledge"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 text-foreground transition-all ${
              isCompact ? "justify-center" : ""
            }`}
            title="Knowledge Base"
          >
            <Globe className="w-4 h-4 text-muted-foreground" />
            {!isCompact && <span>Knowledge Base</span>}
          </Link>
          <Link
            href="/studio/ventures"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 text-foreground transition-all ${
              isCompact ? "justify-center" : ""
            }`}
            title="Ventures"
          >
            <LucideAward className="w-4 h-4 text-muted-foreground" />
            {!isCompact && <span>Ventures</span>}
          </Link>
          <Link
            href="/studio/chats"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 text-foreground transition-all ${
              isCompact ? "justify-center" : ""
            }`}
            title="Chats"
          >
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            {!isCompact && <span>Chats</span>}
          </Link>
        </nav>
      </div>

      {/* Bottom Actions: Public Site Link & User Session */}
      <div className="space-y-6 pt-6 border-t border-border/30 w-full">
        <Link
          href="/"
          className={`group/back flex items-center justify-between w-full p-3 rounded-xl border border-border/60 bg-background hover:bg-muted/20 text-xs font-mono uppercase tracking-wider text-foreground transition-all ${
            isCompact ? "justify-center p-2 border-0" : ""
          }`}
          title="Back to Public Site"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover/back:-translate-x-1" />
            {!isCompact && <span>Public Site</span>}
          </span>
          {!isCompact && (
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </Link>

        {!isCompact ? (
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span className="truncate max-w-35">{session.user.email}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
              Admin
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 font-mono text-[9px] text-muted-foreground text-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              A
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
