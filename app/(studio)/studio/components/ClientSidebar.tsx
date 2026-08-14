"use client";

import { useSidebar } from "@/components/sidebar-context";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  Image,
  Menu,
  X,
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
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/studio", label: "Overview", icon: LayoutDashboard },
    { href: "/studio/projects", label: "Projects CMS", icon: FolderKanban },
    { href: "/studio/media", label: "Media Library", icon: Image },
    { href: "/studio/blog", label: "Blog CMS", icon: FaBlog },
    { href: "/studio/inbox", label: "Inbox", icon: Inbox },
    { href: "/studio/knowledge", label: "Knowledge Base", icon: Globe },
    { href: "/studio/ventures", label: "Ventures", icon: LucideAward },
    { href: "/studio/chats", label: "Chats", icon: MessageCircle },
  ];

  return (
    <>
      {/* 1. Mobile Header (Visible on mobile only) */}
      <header className="md:hidden flex items-center justify-between border-b border-border/40 p-4 bg-muted/10 shrink-0 w-full fixed top-0 left-0 z-40 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-serif text-lg font-normal">Favurr Studio</span>
        </div>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-foreground inline-flex items-center gap-1.5 border border-border px-3 py-1.5 rounded-md"
        >
          <span>Public</span>
        </Link>
      </header>

      {/* Spacer to push content down below fixed mobile header */}
      <div className="h-14 md:hidden shrink-0" />

      {/* 2. Slide-out Mobile Menu Drawer (Visible on mobile only when open) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-30 md:hidden flex">
          {/* Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpenMobile(false)}
          />

          {/* Drawer Body */}
          <aside className="relative flex flex-col justify-between w-64 bg-background border-r border-border/40 p-6 h-full shadow-lg">
            <div className="space-y-8 w-full flex flex-col">
              {/* Drawer Brand Header */}
              <div className="space-y-2 w-full pt-12">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Studio Engine</span>
                </div>
                <h1 className="font-serif text-2xl font-normal text-foreground">
                  Favurr <span className="italic font-normal">Studio</span>
                </h1>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 font-mono text-xs uppercase tracking-wider w-full">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpenMobile(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        isActive
                          ? "border-border/60 bg-muted/40 text-foreground"
                          : "border-transparent hover:border-border/30 hover:bg-muted/20 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-6 pt-6 border-t border-border/30 w-full">
              <Link
                href="/"
                className="group/back flex items-center justify-between w-full p-3 rounded-xl border border-border/60 bg-background hover:bg-muted/20 text-xs font-mono uppercase tracking-wider text-foreground transition-all"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover/back:-translate-x-1" />
                  <span>Public Site</span>
                </span>
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span className="truncate max-w-[15ch]">{session.user.email}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">
                  Admin
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Desktop Aside Sidebar (Visible on desktop only) */}
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
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                    isCompact ? "justify-center" : ""
                  } ${
                    isActive
                      ? "border-border/60 bg-muted/40 text-foreground"
                      : "border-transparent hover:border-border/40 hover:bg-muted/30 text-foreground"
                  }`}
                  title={link.label}
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {!isCompact && <span>{link.label}</span>}
                </Link>
              );
            })}
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
    </>
  );
}
