import type { ReactNode } from "react";

type Glow = "cyan" | "pink" | "violet" | "none";

const glowClass: Record<Glow, string> = {
  cyan: "glow-ring-cyan",
  pink: "glow-ring-pink",
  violet: "glow-ring-violet",
  none: "",
};

export function GlowCard({
  children,
  glow = "none",
  className = "",
}: {
  children: ReactNode;
  glow?: Glow;
  className?: string;
}) {
  return (
    <div className={`glass-panel rounded-3xl ${glowClass[glow]} ${className}`}>
      {children}
    </div>
  );
}
