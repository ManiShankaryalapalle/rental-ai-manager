"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  LogOut,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Zap,
  Inbox as InboxIcon,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";
import {
  CategoryBadge,
  ChannelBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/Badges";
import type { Inquiry } from "@/lib/types";

type Filter = "all" | "needs_you" | "ai_resolved" | "website" | "email";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_you", label: "Needs You" },
  { key: "ai_resolved", label: "AI Resolved" },
  { key: "website", label: "Website" },
  { key: "email", label: "Gmail" },
];

const GMAIL_TEMPLATES = [
  {
    label: "Rent question",
    tenantName: "Alex Rivera",
    unit: "Unit 6",
    text: "Hi, quick question — is there a grace period if I pay rent a couple days late?",
  },
  {
    label: "Maintenance issue",
    tenantName: "Sophie Turner",
    unit: "Unit 11",
    text: "The bathroom light has been flickering and now won't turn on at all, can someone fix it?",
  },
  {
    label: "Emergency",
    tenantName: "Marcus Webb",
    unit: "Unit 3",
    text: "There's water flooding in from the ceiling right now, it's an emergency!",
  },
  {
    label: "Legal threat",
    tenantName: "Elena Kowalski",
    unit: "Unit 8",
    text: "I've contacted a lawyer about the mold issue that still hasn't been fixed. Expect to hear from them.",
  },
  {
    label: "Explicit escalation",
    tenantName: "Marcus Webb",
    unit: "Unit 3",
    text: "There's water flooding in from the ceiling right now, please contact landlord immediately!",
  },
];

const DEFAULT_STATS = {
  total: 0,
  aiResolved: 0,
  escalated: 0,
  ownerReplied: 0,
  pending: 0,
  resolutionRate: 0,
};

async function fetchInquiriesData(): Promise<{
  inquiries: Inquiry[];
  stats: typeof DEFAULT_STATS;
}> {
  const res = await fetch("/api/inquiries", { cache: "no-store" });
  return res.json();
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statsData, setStatsData] = useState(DEFAULT_STATS);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simText, setSimText] = useState("");
  const [simName, setSimName] = useState("");
  const [simUnit, setSimUnit] = useState("");
  const [simSending, setSimSending] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchInquiriesData();
    setInquiries(data.inquiries ?? []);
    setStatsData(data.stats ?? DEFAULT_STATS);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchInquiriesData().then((data) => {
      if (cancelled) return;
      setInquiries(data.inquiries ?? []);
      setStatsData(data.stats ?? DEFAULT_STATS);
      setLoading(false);
    });

    const interval = setInterval(() => {
      fetchInquiriesData().then((data) => {
        if (cancelled) return;
        setInquiries(data.inquiries ?? []);
        setStatsData(data.stats ?? DEFAULT_STATS);
      });
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "needs_you":
        return inquiries.filter((i) => i.status === "escalated");
      case "ai_resolved":
        return inquiries.filter((i) => i.status === "ai_resolved");
      case "website":
        return inquiries.filter((i) => i.channel === "website");
      case "email":
        return inquiries.filter((i) => i.channel === "email");
      default:
        return inquiries;
    }
  }, [inquiries, filter]);

  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/inquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText.trim() }),
      });
      const data = await res.json();
      if (data.inquiry) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === data.inquiry.id ? data.inquiry : i))
        );
        setReplyText("");
      }
    } finally {
      setReplying(false);
    }
  }

  async function simulateEmail() {
    if (!simText.trim()) return;
    setSimSending(true);
    try {
      const res = await fetch("/api/gmail/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: simName || "Unknown Sender",
          unit: simUnit || "Unassigned",
          text: simText.trim(),
        }),
      });
      const data = await res.json();
      await load();
      if (data.inquiry) {
        setSelectedId(data.inquiry.id);
        setFilterSafe("all");
      }
      setSimText("");
      setSimName("");
      setSimUnit("");
      setShowSimulator(false);
    } finally {
      setSimSending(false);
    }
  }

  function setFilterSafe(f: Filter) {
    setFilter(f);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/owner/login");
    router.refresh();
  }

  const statTiles = [
    { label: "Total Inquiries", value: statsData.total, icon: InboxIcon, glow: "forest" as const },
    { label: "AI Resolved", value: `${statsData.resolutionRate}%`, icon: Bot, glow: "green" as const },
    { label: "Needs You", value: statsData.pending, icon: UserRound, glow: "amber" as const },
    { label: "Avg Response", value: "<10s", icon: Zap, glow: "forest" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-forest/30 bg-white/60 px-3 py-1 text-xs font-semibold text-neon-forest">
            <Sparkles size={13} /> Owner Dashboard
          </span>
          <h1 className="font-display mt-3 text-3xl font-bold text-ink">
            Everything the AI handled, <span className="text-gradient-neon">and what needs you</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/owner/tenants"
            className="btn-outline-neon flex items-center gap-2 text-sm"
          >
            <Users size={14} /> Manage Tenants
          </Link>
          <button
            onClick={load}
            className="btn-outline-neon flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="btn-outline-neon flex items-center gap-2 text-sm"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statTiles.map((s) => (
          <GlowCard key={s.label} glow={s.glow} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                {s.label}
              </span>
              <s.icon size={16} className="text-ink-soft" />
            </div>
            <div className="font-display mt-2 text-2xl font-bold text-ink">{s.value}</div>
          </GlowCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Inbox */}
        <GlowCard className="flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 p-4">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f.key
                    ? "bg-ink text-white"
                    : "bg-white/60 text-ink-soft hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="max-h-[600px] divide-y divide-ink/5 overflow-y-auto">
            {loading && (
              <div className="p-8 text-center text-sm text-ink-soft">Loading inbox…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-ink-soft">
                Nothing here yet.
              </div>
            )}
            {filtered.map((inq) => (
              <button
                key={inq.id}
                onClick={() => setSelectedId(inq.id)}
                className={`flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors hover:bg-white/50 ${
                  selectedId === inq.id ? "bg-white/70" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {inq.tenantName} · {inq.unit}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {timeAgo(inq.updatedAt)}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm text-ink-soft">{inq.subject}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <ChannelBadge channel={inq.channel} />
                  <CategoryBadge category={inq.category} />
                  <StatusBadge status={inq.status} />
                  <PriorityBadge priority={inq.priority} />
                </div>
              </button>
            ))}
          </div>
        </GlowCard>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <GlowCard glow={selected ? "forest" : "none"} className="flex flex-col overflow-hidden">
            {!selected && (
              <div className="p-8 text-center text-sm text-ink-soft">
                Select an inquiry to view the full thread.
              </div>
            )}
            {selected && (
              <div className="flex flex-col">
                <div className="border-b border-ink/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">
                      {selected.tenantName} · {selected.unit}
                    </span>
                    <ChannelBadge channel={selected.channel} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={selected.category} />
                    <StatusBadge status={selected.status} />
                    <PriorityBadge priority={selected.priority} />
                  </div>
                  {selected.escalationReason && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-neon-amber/5 px-3 py-2 text-xs text-neon-amber">
                      <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                      <span>{selected.escalationReason}</span>
                    </div>
                  )}
                </div>

                <div className="max-h-[280px] space-y-3 overflow-y-auto p-4">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === "owner" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                          m.sender === "tenant"
                            ? "bg-white/80 text-ink"
                            : m.sender === "ai"
                              ? "bg-neon-green/10 text-ink"
                              : "bg-ink text-white"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">
                          {m.sender === "ai" && <Bot size={10} />}
                          {m.sender === "owner" && <UserRound size={10} />}
                          {m.sender}
                        </div>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {selected.status === "escalated" && (
                  <div className="flex items-center gap-2 border-t border-ink/10 p-3">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Reply as the owner…"
                      className="flex-1 rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-xs outline-none focus:border-neon-forest/50"
                      onKeyDown={(e) => e.key === "Enter" && sendReply()}
                    />
                    <button
                      onClick={sendReply}
                      disabled={replying || !replyText.trim()}
                      className="btn-neon flex h-9 w-9 items-center justify-center !p-0 disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}
                {selected.status !== "escalated" && (
                  <div className="border-t border-ink/10 p-3 text-center text-xs text-ink-soft">
                    Handled — no action needed.
                  </div>
                )}
              </div>
            )}
          </GlowCard>

          <GlowCard className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-ink-soft" />
                <span className="text-sm font-semibold text-ink">Gmail Integration</span>
              </div>
              <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
                Not Connected
              </span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-ink-soft">
              Connecting Gmail lets the AI read and auto-reply to tenant emails
              directly in the owner&apos;s inbox. Needs Google OAuth credentials to
              go live — for now, simulate an inbound email to see the pipeline
              work end to end.
            </p>
            <button
              className="btn-outline-neon mb-2 w-full text-xs"
              disabled
              title="Requires Google OAuth setup — coming later"
            >
              Connect Gmail (needs setup later)
            </button>
            <button
              onClick={() => setShowSimulator((v) => !v)}
              className="btn-neon w-full text-xs"
            >
              Simulate Incoming Email
            </button>

            {showSimulator && (
              <div className="mt-4 space-y-2 border-t border-ink/10 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {GMAIL_TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => {
                        setSimText(t.text);
                        setSimName(t.tenantName);
                        setSimUnit(t.unit);
                      }}
                      className="rounded-full border border-ink/10 bg-white/70 px-2.5 py-1 text-[11px] text-ink-soft hover:text-ink"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <input
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Sender name"
                  className="w-full rounded-lg border border-ink/10 bg-white/80 px-3 py-2 text-xs outline-none"
                />
                <input
                  value={simUnit}
                  onChange={(e) => setSimUnit(e.target.value)}
                  placeholder="Unit"
                  className="w-full rounded-lg border border-ink/10 bg-white/80 px-3 py-2 text-xs outline-none"
                />
                <textarea
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="Email body…"
                  rows={3}
                  className="w-full rounded-lg border border-ink/10 bg-white/80 px-3 py-2 text-xs outline-none"
                />
                <button
                  onClick={simulateEmail}
                  disabled={simSending || !simText.trim()}
                  className="btn-neon w-full text-xs disabled:opacity-50"
                >
                  {simSending ? "Sending…" : "Send Simulated Email"}
                </button>
              </div>
            )}
          </GlowCard>

          <GlowCard className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Bot size={16} className="text-ink-soft" />
              <span className="text-sm font-semibold text-ink">AI Behavior</span>
            </div>
            <div className="mb-3 flex items-center justify-between rounded-lg bg-white/60 px-3 py-2">
              <span className="text-xs text-ink-soft">Auto-reply to tenants</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neon-green">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-green pulse-dot" /> On
              </span>
            </div>
            <p className="mb-2 text-xs leading-relaxed text-ink-soft">
              The AI answers or acknowledges every message itself — rent,
              maintenance, emergencies, disputes, all of it. It only escalates
              to you when a tenant explicitly says:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-neon-amber/10 px-2.5 py-1 text-[11px] font-medium text-neon-amber">
                &ldquo;contact landlord&rdquo;
              </span>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
