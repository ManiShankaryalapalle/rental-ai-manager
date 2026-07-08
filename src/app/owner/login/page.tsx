"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import { GlowCard } from "@/components/GlowCard";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Incorrect password.");
        return;
      }

      router.push("/owner");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <span className="inline-flex items-center gap-2 rounded-full border border-neon-forest/30 bg-white/60 px-3 py-1 text-xs font-semibold text-neon-forest">
        <Sparkles size={13} /> Owner Sign In
      </span>
      <h1 className="font-display mt-4 text-2xl font-bold text-ink">
        Welcome back
      </h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        This dashboard is for the property owner only. Sign in to view
        inquiries and manage the tenant directory.
      </p>

      <GlowCard glow="forest" className="mt-8 w-full p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Owner password
            <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 focus-within:border-neon-forest/50">
              <Lock size={15} className="text-ink-soft" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          {error && <p className="text-xs font-medium text-neon-amber">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !password.trim()}
            className="btn-neon mt-1 text-sm disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </GlowCard>
    </div>
  );
}
