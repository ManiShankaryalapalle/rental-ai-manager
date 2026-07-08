"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, ShieldAlert, Sparkles } from "lucide-react";
import { GlowCard } from "@/components/GlowCard";
import type { Inquiry } from "@/lib/types";

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

export default function TenantPortal() {
  const [tenantName, setTenantName] = useState("");
  const [unit, setUnit] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! I'm the AI assistant for Willowbrook Apartments. Ask me about rent, maintenance, parking, pets, or anything else — I'll answer instantly, or loop in the owner if it's something only they can handle.",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localIdRef = useRef(0);

  useEffect(() => {
    // Reading localStorage must happen post-mount (client-only) to avoid an
    // SSR/hydration mismatch, so this setState-in-effect is intentional.
    /* eslint-disable react-hooks/set-state-in-effect */
    const savedName = localStorage.getItem("tenantName");
    const savedUnit = localStorage.getItem("tenantUnit");
    if (savedName && savedUnit) {
      setTenantName(savedName);
      setUnit(savedUnit);
      setProfileSaved(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, thinking]);

  function saveProfile() {
    if (!tenantName.trim() || !unit.trim()) return;
    localStorage.setItem("tenantName", tenantName.trim());
    localStorage.setItem("tenantUnit", unit.trim());
    setProfileSaved(true);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || thinking) return;

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
          tenantName: tenantName || "Anonymous Tenant",
          unit: unit || "Unassigned",
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
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-white/60 px-3 py-1 text-xs font-semibold text-neon-cyan">
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

      {!profileSaved && (
        <GlowCard glow="violet" className="mb-6 p-5">
          <p className="mb-3 text-sm font-medium text-ink">
            Quick intro so replies can reference your unit:
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Your name"
              className="flex-1 rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50"
            />
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Unit (e.g. 4B)"
              className="flex-1 rounded-xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50"
            />
            <button onClick={saveProfile} className="btn-neon whitespace-nowrap text-sm">
              Save
            </button>
          </div>
        </GlowCard>
      )}

      {profileSaved && (
        <div className="mb-4 flex items-center justify-between text-xs text-ink-soft">
          <span>
            Chatting as <strong className="text-ink">{tenantName}</strong> · Unit{" "}
            {unit}
          </span>
          <button
            onClick={() => setProfileSaved(false)}
            className="underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            edit
          </button>
        </div>
      )}

      <GlowCard glow="cyan" className="flex flex-col overflow-hidden">
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
                      : "bg-gradient-to-br from-neon-cyan to-neon-violet text-white"
                  }`}
                >
                  {entry.sender === "tenant" ? <User size={14} /> : <Bot size={14} />}
                </span>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    entry.sender === "tenant"
                      ? "rounded-br-sm bg-ink text-white"
                      : `rounded-bl-sm bg-white/85 text-ink ${
                          entry.escalated ? "glow-ring-pink" : "glow-ring-cyan"
                        }`
                  }`}
                >
                  {entry.text}
                  {entry.escalated && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-neon-pink">
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
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet text-white">
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
              className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs text-ink-soft transition-colors hover:border-neon-violet/40 hover:text-ink disabled:opacity-50"
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
            className="flex-1 rounded-full border border-ink/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-neon-cyan/50"
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
    </div>
  );
}
