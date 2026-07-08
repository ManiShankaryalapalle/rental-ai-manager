export type Channel = "website" | "email";

export type Category =
  | "rent_payment"
  | "maintenance"
  | "lease_terms"
  | "parking"
  | "pet_policy"
  | "amenities"
  | "noise_complaint"
  | "emergency"
  | "legal_dispute"
  | "harassment"
  | "small_talk"
  | "other";

export type Status = "ai_resolved" | "escalated" | "owner_replied";

export type Priority = "normal" | "urgent";

export type Sender = "tenant" | "ai" | "owner";

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  createdAt: number;
}

export interface Inquiry {
  id: string;
  tenantName: string;
  unit: string;
  channel: Channel;
  subject: string;
  category: Category;
  status: Status;
  priority: Priority;
  escalationReason: string | null;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AiVerdict {
  category: Category;
  escalate: boolean;
  priority: Priority;
  reply: string;
  reason: string | null;
}
