import { Bot, Mail, Globe, Flame, UserRound } from "lucide-react";
import type { Category, Channel, Priority, Status } from "@/lib/types";

const categoryLabels: Record<Category, string> = {
  rent_payment: "Rent & Payment",
  maintenance: "Maintenance",
  lease_terms: "Lease Terms",
  parking: "Parking",
  pet_policy: "Pet Policy",
  amenities: "Amenities",
  noise_complaint: "Noise Complaint",
  emergency: "Emergency",
  legal_dispute: "Legal",
  harassment: "Safety Concern",
  small_talk: "Just Saying Hi",
  other: "General",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center rounded-full border border-ink/10 bg-white/70 px-2.5 py-1 text-xs font-medium text-ink-soft">
      {categoryLabels[category]}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  if (status === "ai_resolved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-green/10 px-2.5 py-1 text-xs font-semibold text-neon-green">
        <Bot size={12} /> AI Resolved
      </span>
    );
  }
  if (status === "escalated") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-amber/10 px-2.5 py-1 text-xs font-semibold text-neon-amber">
        <UserRound size={12} /> Needs Owner
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-forest/10 px-2.5 py-1 text-xs font-semibold text-neon-forest">
      <UserRound size={12} /> Owner Replied
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority !== "urgent") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500">
      <Flame size={12} className="pulse-dot" /> Urgent
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  if (channel === "email") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border border-ink/10 px-2.5 py-1 text-xs font-medium text-ink-soft">
        <Mail size={12} /> Gmail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border border-ink/10 px-2.5 py-1 text-xs font-medium text-ink-soft">
      <Globe size={12} /> Website
    </span>
  );
}
