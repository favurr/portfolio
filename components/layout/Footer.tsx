import { FaHeart } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="site-footer border-t border-border/40 bg-background py-10 text-muted-foreground transition-colors duration-350">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12 flex flex-row items-center justify-between gap-4 text-xs font-mono">
        <p>
          &copy; {new Date().getFullYear()} Favour
        </p>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          Captured with passion. <FaHeart className="w-3 h-3 text-foreground inline-block fill-current" />
        </p>
      </div>
    </footer>
  );
}
