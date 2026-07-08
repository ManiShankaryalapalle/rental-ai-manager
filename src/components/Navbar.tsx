"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/tenant", label: "Tenant Portal" },
  { href: "/owner", label: "Owner Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full glass-panel px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet text-white glow-ring-violet">
            <Sparkles size={16} />
          </span>
          <span className="font-display text-sm font-bold tracking-wide text-ink">
            RentalPilot<span className="text-gradient-neon"> AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full bg-white/50 p-1 sm:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <Link href="/tenant" className="btn-neon text-sm sm:hidden">
          Ask AI
        </Link>
        <Link href="/tenant" className="hidden btn-neon text-sm sm:block">
          Get Started
        </Link>
      </nav>
    </header>
  );
}
