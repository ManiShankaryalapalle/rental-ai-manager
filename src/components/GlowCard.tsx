import type { ReactNode } from "react";

type Glow = "green" | "amber" | "forest" | "none";

const glowClass: Record<Glow, string> = {
  green: "glow-ring-green",
  amber: "glow-ring-amber",
  forest: "glow-ring-forest",
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
