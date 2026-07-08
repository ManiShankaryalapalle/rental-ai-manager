"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { GlowCard } from "@/components/GlowCard";
import type { Tenant } from "@/lib/types";

export default function TenantDirectoryPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [unit, setUnit] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/tenants", { cache: "no-store" });
    const data = await res.json();
    setTenants(data.tenants ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tenants", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setTenants(data.tenants ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !unit.trim() || saving) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, unit, address }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't add tenant.");
        return;
      }
      setFullName("");
      setUnit("");
      setAddress("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tenants/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/owner"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <span className="inline-flex items-center gap-2 rounded-full border border-neon-forest/30 bg-white/60 px-3 py-1 text-xs font-semibold text-neon-forest">
        <Sparkles size={13} /> Tenant Directory
      </span>
      <h1 className="font-display mt-4 text-3xl font-bold text-ink">
        Who&apos;s <span className="text-gradient-neon">actually living here</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Add a tenant here as soon as their lease is signed. The chatbot checks
        every new conversation against this list — full name and unit are
        used to verify a tenant before the AI will respond (matched on last
        name + unit number, so small typos in other fields won&apos;t lock
        anyone out).
      </p>

      <GlowCard glow="forest" className="mt-6 p-5">
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.8fr_1.2fr_auto]">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name (e.g. Maria Chen)"
            className="rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-forest/50"
          />
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit (e.g. 4B)"
            className="rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-forest/50"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
            className="rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-forest/50"
          />
          <button
            type="submit"
            disabled={saving || !fullName.trim() || !unit.trim()}
            className="btn-neon flex items-center justify-center gap-1.5 whitespace-nowrap text-sm disabled:opacity-50"
          >
            <Plus size={15} /> Add
          </button>
        </form>
        {error && <p className="mt-2 text-xs font-medium text-neon-amber">{error}</p>}
      </GlowCard>

      <GlowCard className="mt-6 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink/10 p-4">
          <Users size={16} className="text-ink-soft" />
          <span className="text-sm font-semibold text-ink">
            {tenants.length} tenant{tenants.length === 1 ? "" : "s"} on file
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-ink-soft">Loading…</div>
        ) : tenants.length === 0 ? (
          <div className="p-6 text-sm text-ink-soft">
            No tenants added yet — add one above.
          </div>
        ) : (
          <div className="divide-y divide-ink/10">
            {tenants.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.fullName}</p>
                  <p className="text-xs text-ink-soft">
                    Unit {t.unit}
                    {t.address ? ` · ${t.address}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="rounded-full p-2 text-ink-soft transition-colors hover:bg-neon-amber/10 hover:text-neon-amber"
                  aria-label={`Remove ${t.fullName}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlowCard>
    </div>
  );
}
