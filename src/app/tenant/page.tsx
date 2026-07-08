"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { GlowCard } from "@/components/GlowCard";
import type { Inquiry, Tenant } from "@/lib/types";

interface ChatEntry {
  id: string;
  sender: "tenant" | "ai";
  text: string;
  escalated?: boolean;
  priority?: "normal" | "urgent";
}

const SUGGESTIONS = [
  "When is rent due this month?",
  "How do I submit a maintenance request?",
  "Are dogs allowed in my unit?",
  "There's a gas smell in my apartment",
  "Please contact landlord about my deposit dispute",
];

type VerifyStatus = "checking" | "unverified" | "verified";

export default function TenantPortal() {
  const [tenantName, setTenantName] = useState("");
  const [unit, setUnit] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("checking");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localIdRef = useRef(0);

  async function verifyTenant(name: string, unitValue: string): Promise<Tenant | null> {
    try {
      const res = await fetch("/api/tenants/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, unit: unitValue }),
      });
      const data = await res.json();
      return data.verified ? (data.tenant as Tenant) : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    // Reading localStorage must happen post-mount (client-only) to avoid an
    // SSR/hydration mismatch, so this setState-in-effect is intentional.
    /* eslint-disable react-hooks/set-state-in-effect */
    const savedName = localStorage.getItem("tenantName");
    const savedUnit = localStorage.getItem("tenantUnit");

    if (!savedName || !savedUnit) {
      setVerifyStatus("unverified");
      return;
    }

    let cancelled = false;
    /* eslint-enable react-hooks/set-state-in-effect */
    verifyTenant(savedName, savedUnit).then((tenant) => {
      if (cancelled) return;
      if (tenant) {
        localStorage.setItem("tenantName", tenant.fullName);
        localStorage.setItem("tenantUnit", tenant.unit);
        setTenantName(tenant.fullName);
        setUnit(tenant.unit);
        setEntries([welcomeEntry(tenant.fullName)]);
        setVerifyStatus("verified");
      } else {
        localStorage.removeItem("tenantName");
        localStorage.removeItem("tenantUnit");
        setVerifyError(
          "We couldn't re-verify your previous details — please check them and try again."
        );
        setVerifyStatus("unverified");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, thinking]);

  function welcomeEntry(name: string): ChatEntry {
    const firstName = name.trim().split(/\s+/)[0] || "there";
    return {
      id: "welcome",
      sender: "ai",
      text: `Hi ${firstName}! I'm the AI assistant for Willowbrook Apartments. Ask me about rent, maintenance, parking, pets, or anything else — I'll answer instantly, or loop in the owner if you ask me to.`,
    };
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantName.trim() || !unit.trim() || verifying) return;

    setVerifying(true);
    setVerifyError(null);
    const tenant = await verifyTenant(tenantName, unit);
    setVerifying(false);

    if (!tenant) {
      setVerifyError(
        "We couldn't verify these details against our tenant records. Double-check your full name and unit number, or contact the office."
      );
      return;
    }

    localStorage.setItem("tenantName", tenant.fullName);
    localStorage.setItem("tenantUnit", tenant.unit);
    setTenantName(tenant.fullName);
    setUnit(tenant.unit);
    setEntries([welcomeEntry(tenant.fullName)]);
    setVerifyStatus("verified");
  }

  function switchTenant() {
    localStorage.removeItem("tenantName");
    localStorage.removeItem("tenantUnit");
    setTenantName("");
    setUnit("");
    setEntries([]);
    setVerifyStatus("unverified");
  }

  async function sendMessage(text: string) {
    if (!text.trim() || thinking || verifyStatus !== "verified") return;

    const tenantEntry: ChatEntry = {
      id: `local-${++localIdRef.current}`,
      sender: "tenant",
      text: text.trim(),
    };
    setEntries((prev) => [...prev, tenantEntry]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName,
          unit,
          text: text.trim(),
          channel: "website",
        }),
      });
      const data = await res.json();
      const inquiry: Inquiry | undefined = data.inquiry;
      const aiMessage = inquiry?.messages.find((m) => m.sender === "ai");

      await new Promise((resolve) => setTimeout(resolve, 500));

      setEntries((prev) => [
        ...prev,
        {
          id: `ai-${++localIdRef.current}`,
          sender: "ai",
          text: aiMessage?.text ?? "Sorry, something went wrong on my end.",
          escalated: inquiry?.status === "escalated",
          priority: inquiry?.priority,
        },
      ]);
    } catch {
      setEntries((prev) => [
        ...prev,
        {
          id: `err-${++localIdRef.current}`,
          sender: "ai",
          text: "Sorry, I couldn't reach the server. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-white/60 px-3 py-1 text-xs font-semibold text-neon-green">
          <Sparkles size={13} /> Tenant Portal
        </span>
        <h1 className="font-display mt-4 text-3xl font-bold text-ink">
          Ask the <span className="text-gradient-neon">AI Assistant</span>
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Most questions get answered instantly. Anything complex goes straight
          to your property owner.
        </p>
      </div>

      {verifyStatus === "checking" && (
        <GlowCard glow="forest" className="mb-6 p-5 text-center text-sm text-ink-soft">
          Checking your details…
        </GlowCard>
      )}

      {verifyStatus === "unverified" && (
        <GlowCard glow="forest" className="mb-6 p-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink">
            <ShieldCheck size={15} className="text-neon-forest" />
            Verify you&apos;re a resident to start chatting:
          </p>
          <form onSubmit={handleVerify} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Your full name"
              className="flex-1 rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-forest/50"
            />
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Unit (e.g. 4B)"
              className="flex-1 rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-forest/50"
            />
            <button
              type="submit"
              disabled={verifying || !tenantName.trim() || !unit.trim()}
              className="btn-neon whitespace-nowrap text-sm disabled:opacity-50"
            >
              {verifying ? "Verifying…" : "Verify & Start Chat"}
            </button>
          </form>
          {verifyError && (
            <p className="mt-3 text-xs font-medium text-neon-amber">{verifyError}</p>
          )}
          <p className="mt-3 text-xs text-ink-soft">
            Your name and unit are checked against the property&apos;s tenant
            records — this keeps the chat limited to actual residents.
          </p>
        </GlowCard>
      )}

      {verifyStatus === "verified" && (
        <>
          <div className="mb-4 flex items-center justify-between text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-neon-green" />
              Verified as <strong className="text-ink">{tenantName}</strong> · Unit{" "}
              {unit}
            </span>
            <button
              onClick={switchTenant}
              className="underline decoration-dotted underline-offset-2 hover:text-ink"
            >
              not you?
            </button>
          </div>

          <GlowCard glow="green" className="flex flex-col overflow-hidden">
        <div ref={scrollRef} className="h-[420px] space-y-4 overflow-y-auto p-5">
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2.5 ${
                  entry.sender === "tenant" ? "flex-row-reverse" : ""
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    entry.sender === "tenant"
                      ? "bg-ink text-white"
                      : "bg-gradient-to-br from-neon-green to-neon-forest text-white"
                  }`}
                >
                  {entry.sender === "tenant" ? <User size={14} /> : <Bot size={14} />}
                </span>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    entry.sender === "tenant"
                      ? "rounded-br-sm bg-ink text-white"
                      : `rounded-bl-sm bg-white/85 text-ink ${
                          entry.escalated ? "glow-ring-amber" : "glow-ring-green"
                        }`
                  }`}
                >
                  {entry.text}
                  {entry.escalated && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-neon-amber">
                      <ShieldAlert size={13} />
                      {entry.priority === "urgent"
                        ? "Escalated to owner · urgent"
                        : "Escalated to owner"}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-green to-neon-forest text-white">
                <Bot size={14} />
              </span>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/85 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft [animation-delay:0.2s]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-ink/10 bg-white/40 px-5 py-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={thinking}
              className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs text-ink-soft transition-colors hover:border-neon-forest/40 hover:text-ink disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2 border-t border-ink/10 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 rounded-full border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-green/50"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="btn-neon flex h-10 w-10 items-center justify-center !p-0 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
          </GlowCard>
        </>
      )}
    </div>
  );
}
