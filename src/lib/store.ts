import { getAiVerdict } from "./ai";
import type { Channel, Inquiry, Message } from "./types";

// Persisted on globalThis (like __inquiryStore below) so a Next.js dev-mode
// hot reload of this module doesn't reset the counter to 1000 while
// previously-seeded ids are still sitting in the store — that would cause
// duplicate ids/React keys the next time an inquiry is created.
const globalCounter = globalThis as unknown as { __inquiryIdCounter?: number };

function nextId(prefix: string): string {
  if (globalCounter.__inquiryIdCounter === undefined) {
    globalCounter.__inquiryIdCounter = 1000;
  }
  globalCounter.__inquiryIdCounter += 1;
  return `${prefix}-${globalCounter.__inquiryIdCounter}`;
}

function minutesAgo(mins: number): number {
  return Date.now() - mins * 60_000;
}

function seed(): Inquiry[] {
  const items: Inquiry[] = [];

  const push = (partial: Omit<Inquiry, "id">) => {
    items.push({ ...partial, id: nextId("inq") });
  };

  push({
    tenantName: "Maria Chen",
    unit: "Unit 4B",
    channel: "website",
    subject: "When is rent due this month?",
    category: "rent_payment",
    status: "ai_resolved",
    priority: "normal",
    escalationReason: null,
    createdAt: minutesAgo(180),
    updatedAt: minutesAgo(179),
    messages: [
      {
        id: nextId("msg"),
        sender: "tenant",
        text: "Hey, when is rent due this month and is there a grace period?",
        createdAt: minutesAgo(180),
      },
      {
        id: nextId("msg"),
        sender: "ai",
        text: "Rent is due on the 1st of each month. There's a 5-day grace period, after which a $75 late fee applies. You can set up autopay or check your balance from the tenant portal any time.",
        createdAt: minutesAgo(179),
      },
    ],
  });

  push({
    tenantName: "James Okafor",
    unit: "Unit 12",
    channel: "email",
    subject: "Kitchen sink leaking",
    category: "maintenance",
    status: "ai_resolved",
    priority: "normal",
    escalationReason: null,
    createdAt: minutesAgo(340),
    updatedAt: minutesAgo(338),
    messages: [
      {
        id: nextId("msg"),
        sender: "tenant",
        text: "The kitchen sink has a slow leak under the cabinet, can someone take a look?",
        createdAt: minutesAgo(340),
      },
      {
        id: nextId("msg"),
        sender: "ai",
        text: "Sorry about that! Please submit a maintenance request with as much detail as you can (and a photo if possible) through the tenant portal — non-emergency requests are typically handled within 48 hours. If this becomes urgent, call (555) 010-9911.",
        createdAt: minutesAgo(338),
      },
    ],
  });

  push({
    tenantName: "Priya Patel",
    unit: "Unit 7A",
    channel: "email",
    subject: "No heat since last night",
    category: "emergency",
    status: "escalated",
    priority: "urgent",
    escalationReason: "Tenant explicitly asked to contact the landlord.",
    createdAt: minutesAgo(40),
    updatedAt: minutesAgo(39),
    messages: [
      {
        id: nextId("msg"),
        sender: "tenant",
        text: "We've had no heat since last night and it's freezing, please contact landlord ASAP",
        createdAt: minutesAgo(40),
      },
      {
        id: nextId("msg"),
        sender: "ai",
        text: "Of course — I've forwarded this straight to the property owner and they'll follow up with you directly.",
        createdAt: minutesAgo(39),
      },
    ],
  });

  push({
    tenantName: "Diego Fernandez",
    unit: "Unit 2C",
    channel: "website",
    subject: "Neighbor's dog barking constantly",
    category: "noise_complaint",
    status: "owner_replied",
    priority: "normal",
    escalationReason: "Tenant explicitly asked to contact the landlord.",
    createdAt: minutesAgo(600),
    updatedAt: minutesAgo(560),
    messages: [
      {
        id: nextId("msg"),
        sender: "tenant",
        text: "The dog in 2D barks nonstop all day, it's been going on for weeks. Can you contact landlord about this?",
        createdAt: minutesAgo(600),
      },
      {
        id: nextId("msg"),
        sender: "ai",
        text: "Of course — I've forwarded this straight to the property owner and they'll follow up with you directly.",
        createdAt: minutesAgo(598),
      },
      {
        id: nextId("msg"),
        sender: "owner",
        text: "Thanks Diego — I've spoken with the tenant in 2D and they've agreed to keep it down after 9pm. Let me know if it continues.",
        createdAt: minutesAgo(560),
      },
    ],
  });

  push({
    tenantName: "Grace Lin",
    unit: "Unit 9",
    channel: "email",
    subject: "Considering legal action over deposit",
    category: "legal_dispute",
    status: "escalated",
    priority: "urgent",
    escalationReason: "Tenant explicitly asked to contact the landlord.",
    createdAt: minutesAgo(20),
    updatedAt: minutesAgo(19),
    messages: [
      {
        id: nextId("msg"),
        sender: "tenant",
        text: "It's been 45 days and I still haven't gotten my security deposit back. I've spoken to a lawyer — please contact landlord about this.",
        createdAt: minutesAgo(20),
      },
      {
        id: nextId("msg"),
        sender: "ai",
        text: "Of course — I've forwarded this straight to the property owner and they'll follow up with you directly.",
        createdAt: minutesAgo(19),
      },
    ],
  });

  push({
    tenantName: "Tom Baxter",
    unit: "Unit 15",
    channel: "website",
    subject: "Are dogs allowed?",
    category: "pet_policy",
    status: "ai_resolved",
    priority: "normal",
    escalationReason: null,
    createdAt: minutesAgo(900),
    updatedAt: minutesAgo(899),
    messages: [
      {
        id: nextId("msg"),
        sender: "tenant",
        text: "Thinking about getting a dog — what's the pet policy?",
        createdAt: minutesAgo(900),
      },
      {
        id: nextId("msg"),
        sender: "ai",
        text: "Cats and dogs under 40 lbs are welcome with a $300 refundable pet deposit and $25/month pet rent. Max 2 pets per unit.",
        createdAt: minutesAgo(899),
      },
    ],
  });

  return items;
}

const globalStore = globalThis as unknown as { __inquiryStore?: Inquiry[] };

function getStore(): Inquiry[] {
  if (!globalStore.__inquiryStore) {
    globalStore.__inquiryStore = seed();
  }
  return globalStore.__inquiryStore;
}

export function listInquiries(): Inquiry[] {
  return [...getStore()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getInquiry(id: string): Inquiry | undefined {
  return getStore().find((i) => i.id === id);
}

export function createInquiry(params: {
  tenantName: string;
  unit: string;
  channel: Channel;
  text: string;
}): Inquiry {
  const verdict = getAiVerdict(params.text);
  const now = Date.now();

  const tenantMessage: Message = {
    id: nextId("msg"),
    sender: "tenant",
    text: params.text,
    createdAt: now,
  };

  const aiMessage: Message = {
    id: nextId("msg"),
    sender: "ai",
    text: verdict.reply,
    createdAt: now + 500,
  };

  const inquiry: Inquiry = {
    id: nextId("inq"),
    tenantName: params.tenantName,
    unit: params.unit,
    channel: params.channel,
    subject: params.text.length > 60 ? `${params.text.slice(0, 60)}…` : params.text,
    category: verdict.category,
    status: verdict.escalate ? "escalated" : "ai_resolved",
    priority: verdict.priority,
    escalationReason: verdict.reason,
    messages: [tenantMessage, aiMessage],
    createdAt: now,
    updatedAt: now + 500,
  };

  getStore().unshift(inquiry);
  return inquiry;
}

export function addOwnerReply(id: string, text: string): Inquiry | undefined {
  const inquiry = getInquiry(id);
  if (!inquiry) return undefined;

  const now = Date.now();
  inquiry.messages.push({
    id: nextId("msg"),
    sender: "owner",
    text,
    createdAt: now,
  });
  inquiry.status = "owner_replied";
  inquiry.updatedAt = now;
  return inquiry;
}

export function stats() {
  const all = getStore();
  const total = all.length;
  const aiResolved = all.filter((i) => i.status === "ai_resolved").length;
  const escalated = all.filter((i) => i.status === "escalated").length;
  const ownerReplied = all.filter((i) => i.status === "owner_replied").length;
  const pending = escalated;
  const resolutionRate = total === 0 ? 0 : Math.round(((aiResolved) / total) * 100);

  return { total, aiResolved, escalated, ownerReplied, pending, resolutionRate };
}
