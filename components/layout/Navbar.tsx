"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { type Session } from "better-auth/types";
import gsap from "gsap";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";

import { TransitionLink } from "@/components/transition-provider";

interface NavbarProps {
  session: Session | null;
}

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ session }: NavbarProps) {
  const [timeString, setTimeString] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      setTimeString(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mobile menu animation
  useEffect(() => {
    const menu = mobileMenuRef.current;
    const links = linkRefs.current.filter(Boolean);

    if (!menu) return;

    if (mobileOpen) {
      // Prevent body scroll while open
      document.body.style.overflow = "hidden";

      gsap.set(menu, { display: "flex" });
      gsap.fromTo(
        menu,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
      );

      // Stagger links: each one starts when previous is halfway done
      gsap.fromTo(
        links,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.12, // next link starts at 50% of previous link's duration
          delay: 0.1,
        },
      );
    } else {
      document.body.style.overflow = "";

      gsap.to(menu, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => gsap.set(menu, { display: "none" }),
      });
    }
  }, [mobileOpen]);

  // Close mobile nav on route navigation (link click)
  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header className="site-header sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-350">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12 relative">
          {/* Logo */}
          <TransitionLink
            href="/"
            className="font-serif text-lg tracking-wide text-foreground hover:text-foreground/80 transition-colors flex items-baseline gap-1"
            aria-label="Home"
          >
            <span className="italic">Favurr</span>
            <span className="text-muted-foreground/30 px-0.5 hidden lg:block">
              |
            </span>
            <span className="text-muted-foreground tracking-wide font-sans text-xs font-medium hidden lg:block">
              Design Engineer
            </span>
          </TransitionLink>

          {/* Center: Live Time & Location */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>{timeString}</span>
            <span className="text-border">•</span>
            <span className="uppercase tracking-wider">Lagos, NG</span>
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <nav className="flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground transition-colors"
                >
                  {link.label}
                </TransitionLink>
              ))}
              {session && (
                <TransitionLink
                  href="/studio"
                  className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] text-foreground hover:bg-accent transition-all"
                >
                  Studio
                </TransitionLink>
              )}
            </nav>

            <Separator orientation="vertical" className="h-4 bg-border" />

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Favourokereke"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
            </div>

            <Separator orientation="vertical" className="h-4 bg-border" />
            <ModeToggle />
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <ModeToggle />
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        style={{ display: "none" }}
        className="fixed inset-0 top-16 z-40 flex flex-col bg-background/95 backdrop-blur-lg px-6 pt-10 pb-8"
      >
        <nav className="flex flex-col gap-2">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-border/40 py-5 text-3xl font-serif italic text-foreground hover:text-muted-foreground transition-colors"
            >
              {link.label}
              <span className="text-sm font-sans not-italic text-muted-foreground">
                0{i + 1}
              </span>
            </a>
          ))}
          {session && (
            <a
              href="/studio"
              ref={(el) => {
                linkRefs.current[NAV_LINKS.length] = el;
              }}
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-border/40 py-5 text-3xl font-serif italic text-foreground hover:text-muted-foreground transition-colors"
            >
              Studio
              <span className="text-sm font-sans not-italic text-muted-foreground">
                0{NAV_LINKS.length + 1}
              </span>
            </a>
          )}
        </nav>

        {/* Social links at bottom */}
        <div className="mt-auto flex items-center gap-4 text-muted-foreground">
          <a
            href="https://github.com/Favourokereke"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <FaGithub className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn className="w-5 h-5" />
          </a>
        </div>
      </div>
    </>
  );
}
