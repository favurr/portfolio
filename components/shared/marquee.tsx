import * as React from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
}

export function Marquee({
  className,
  reverse,
  pauseOnHover = true,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:30s] [gap:var(--gap)]",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]"
        )}
      >
        {/* Render children twice to handle the seamless loop transition */}
        {React.Children.map(children, (child) => child)}
        {React.Children.map(children, (child) => child)}
      </div>
    </div>
  )
}
