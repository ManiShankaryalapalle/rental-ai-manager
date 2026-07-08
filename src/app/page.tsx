import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Mail,
  ShieldCheck,
  Inbox,
  Zap,
  MessageSquareText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";

const features = [
  {
    icon: Bot,
    glow: "cyan" as const,
    title: "AI Auto-Replies",
    body: "Tenants get instant, accurate answers on rent dates, maintenance steps, parking, pets, and lease basics — no waiting on a callback.",
  },
  {
    icon: Mail,
    glow: "violet" as const,
    title: "Gmail Autopilot",
    body: "The AI reads and replies to tenant emails straight from the owner's Gmail, so nothing falls through the cracks off-platform either.",
  },
  {
    icon: ShieldCheck,
    glow: "pink" as const,
    title: "Escalation On Request",
    body: 'The AI handles every message itself — tenants only reach the owner when they explicitly say "contact landlord."',
  },
  {
    icon: Inbox,
    glow: "cyan" as const,
    title: "Unified Inbox",
    body: "Every inquiry from the website and Gmail lands in one dashboard, tagged by what the AI handled and what still needs a human.",
  },
  {
    icon: Zap,
    glow: "violet" as const,
    title: "Always On",
    body: "No off-hours, no missed messages. Tenants get a response in seconds, any time of day.",
  },
  {
    icon: MessageSquareText,
    glow: "pink" as const,
    title: "Owner Peace of Mind",
    body: "Only the handful of issues that truly need a decision ever reach the owner's desk — everything routine is already resolved.",
  },
];

const steps = [
  {
    title: "Tenant asks a question",
    body: "Through the website chat or a regular email to the owner's Gmail — whichever the tenant prefers.",
  },
  {
    title: "AI answers instantly, every time",
    body: 'It handles the question itself and only escalates when the tenant explicitly says "contact landlord."',
  },
  {
    title: "Owner only sees what matters",
    body: "Escalations land in the dashboard with full context, so the owner can act in seconds — not dig through a backlog.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-violet/30 bg-white/60 px-3 py-1 text-xs font-semibold text-neon-violet">
            <Sparkles size={13} /> Autonomous rental management
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Let AI handle your tenants.{" "}
            <span className="text-gradient-neon">You handle the rest.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-soft">
            Every tenant question — on the website or in Gmail — gets an instant AI
            response. The owner only hears about it when a tenant explicitly asks
            to be connected. Hassle-free, tension-free property management.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/tenant" className="btn-neon inline-flex items-center gap-2">
              Try the Tenant Chat <ArrowRight size={16} />
            </Link>
            <Link href="/owner" className="btn-outline-neon inline-flex items-center gap-2">
              View Owner Dashboard
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-neon-cyan" /> Instant AI replies
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-neon-violet" /> Gmail-aware
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-neon-pink" /> Escalates only on request
            </span>
          </div>
        </div>

        <GlowCard glow="violet" className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Live inquiry preview
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neon-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan pulse-dot" /> AI
              active
            </span>
          </div>

          <div className="space-y-3">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-white">
              Is parking included with my unit?
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white/80 px-4 py-2.5 text-sm text-ink glow-ring-cyan">
              Each unit includes one assigned parking spot. Extra spots are
              $40/month, first-come first-served — ask the office for
              availability.
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-white">
              There&apos;s a gas smell in my apartment, please contact landlord.
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white/80 px-4 py-2.5 text-sm text-ink glow-ring-pink">
              Of course — I&apos;ve forwarded this straight to the property
              owner and they&apos;ll follow up with you directly.
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-neon-pink/25 bg-neon-pink/5 px-3 py-2 text-xs font-medium text-neon-pink">
              <ShieldCheck size={14} /> Escalated to owner · urgent
            </div>
          </div>
        </GlowCard>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-3">
        {[
          { value: "24/7", label: "Always on, no office hours needed" },
          { value: "<10s", label: "Typical AI response time" },
          { value: "Only the hard stuff", label: "Reaches the owner's desk" },
        ].map((s) => (
          <GlowCard key={s.label} className="p-6 text-center">
            <div className="font-display text-2xl font-bold text-gradient-neon">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
          </GlowCard>
        ))}
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-ink">
            Everything routine, <span className="text-gradient-neon">solved on autopilot</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            The AI is the first line of support across every channel your tenants
            already use.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <GlowCard key={f.title} glow={f.glow} className="p-6">
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                  f.glow === "cyan"
                    ? "bg-neon-cyan/10 text-neon-cyan"
                    : f.glow === "pink"
                      ? "bg-neon-pink/10 text-neon-pink"
                      : "bg-neon-violet/10 text-neon-violet"
                }`}
              >
                <f.icon size={20} />
              </div>
              <h3 className="font-display text-base font-semibold text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-ink">How it works</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <GlowCard key={step.title} className="relative p-6 pt-10">
              <span className="font-display absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet text-sm font-bold text-white glow-ring-violet">
                {i + 1}
              </span>
              <h3 className="font-display text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <GlowCard glow="cyan" className="flex flex-col items-center gap-5 p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            See it handle a real question
          </h2>
          <p className="max-w-md text-ink-soft">
            Try the tenant chat, then check the owner dashboard to see exactly
            what the AI resolved and what it sent your way.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/tenant" className="btn-neon inline-flex items-center gap-2">
              Open Tenant Chat <ArrowRight size={16} />
            </Link>
            <Link href="/owner" className="btn-outline-neon">
              Open Owner Dashboard
            </Link>
          </div>
        </GlowCard>
      </section>

      <footer className="mt-8 flex flex-col items-center gap-2 border-t border-ink/10 py-8 text-center text-xs text-ink-soft">
        <p>RentalPilot AI — placeholder name, domain to be decided later.</p>
        <p>Prototype build · AI replies and Gmail sync shown here are simulated for demo purposes.</p>
      </footer>
    </div>
  );
}
