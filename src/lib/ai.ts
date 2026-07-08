import { knowledgeBase as kb } from "./knowledgeBase";
import type { AiVerdict, Category } from "./types";

interface Rule {
  category: Category;
  keywords: string[];
}

const RULES: Rule[] = [
  {
    category: "emergency",
    keywords: [
      "fire",
      "flood",
      "flooding",
      "gas smell",
      "gas leak",
      "smoke",
      "no heat",
      "no water",
      "burst pipe",
      "water everywhere",
      "sparking",
      "electrical fire",
      "break-in",
      "break in",
      "carbon monoxide",
    ],
  },
  {
    category: "legal_dispute",
    keywords: [
      "lawyer",
      "attorney",
      "lawsuit",
      "sue",
      "sued",
      "eviction",
      "evict",
      "discrimination",
      "illegal",
      "legal action",
      "small claims",
    ],
  },
  {
    category: "harassment",
    keywords: [
      "harass",
      "threat",
      "threatened",
      "unsafe",
      "stalking",
      "assault",
      "afraid",
    ],
  },
  {
    category: "noise_complaint",
    keywords: ["noise", "loud", "noisy", "neighbor", "party", "yelling"],
  },
  {
    category: "rent_payment",
    keywords: [
      "rent",
      "due date",
      "autopay",
      "auto-pay",
      "late fee",
      "payment",
      "pay rent",
      "balance",
    ],
  },
  {
    category: "maintenance",
    keywords: [
      "leak",
      "leaking",
      "broken",
      "repair",
      "fix",
      "not working",
      "ac",
      "air conditioning",
      "heater",
      "plumbing",
      "clogged",
      "appliance",
      "light out",
      "maintenance",
      "dishwasher",
      "fridge",
      "refrigerator",
    ],
  },
  {
    category: "lease_terms",
    keywords: [
      "lease",
      "renew",
      "renewal",
      "terminate",
      "move out",
      "moving out",
      "sublet",
      "sign",
      "notice to vacate",
    ],
  },
  {
    category: "parking",
    keywords: ["parking", "parking spot", "garage", "tow", "towed"],
  },
  {
    category: "pet_policy",
    keywords: ["pet", "dog", "cat", "animal", "pet deposit", "pet rent"],
  },
  {
    category: "amenities",
    keywords: ["gym", "pool", "laundry", "amenity", "amenities", "package", "locker"],
  },
];

// This is the ONLY thing that escalates an inquiry to the owner — the AI
// answers or acknowledges every other message itself, no matter the topic.
const CONTACT_LANDLORD_PHRASES = [
  "contact landlord",
  "contact the landlord",
  "contact owner",
  "contact the owner",
  "reach out to the landlord",
  "reach out to landlord",
  "notify the landlord",
  "notify landlord",
  "talk to owner",
  "talk to the owner",
  "speak to owner",
  "speak to the owner",
  "speak to a human",
  "real person",
  "talk to a manager",
  "speak with the manager",
  "human please",
];

const DISPUTE_PHRASES = [
  "overcharged",
  "over charged",
  "wrong amount",
  "dispute",
  "refund",
  "didn't receive credit",
  "did not receive credit",
  "double charged",
];

const EARLY_TERMINATION_PHRASES = [
  "break my lease",
  "break the lease",
  "early termination",
  "get out of my lease",
];

// Short greetings/acks are checked as whole-message/prefix word-boundary
// matches (not plain substring) — a naive `.includes("ok")` would false-hit
// inside words like "broken" or "smoke" and misclassify real maintenance
// requests as small talk.
const GREETING_WORDS = ["hi", "hey", "hello", "hiya", "howdy", "yo", "sup"];
const GREETING_PHRASES = [
  "good morning",
  "good afternoon",
  "good evening",
  "hows it going",
  "how is it going",
  "how are you",
  "hows things",
  "hows everything",
  "whats up",
  "wassup",
];
const FAREWELL_WORDS = ["bye", "goodbye", "cya", "night"];
const FAREWELL_PHRASES = ["see you", "see ya", "take care", "have a good one"];
const THANKS_PATTERN = /\b(thanks|thank you|thx|appreciate it|much appreciated)\b/;
const ACK_WORDS = ["ok", "okay", "k", "cool", "alright", "sure", "understood", "noted", "great", "perfect"];
const ACK_PHRASES = ["got it", "sounds good", "no worries", "will do"];

function normalize(text: string): string {
  return text.toLowerCase();
}

function matchesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function stripPunctuation(text: string): string {
  return text.replace(/[^a-z0-9\s]/g, "").trim();
}

function matchesShortPhrase(text: string, words: string[], phrases: string[]): boolean {
  const clean = stripPunctuation(text);
  if (clean.length === 0) return false;
  const tokens = clean.split(/\s+/);
  // Whole message is just one of the bare words (e.g. "ok", "hi there" -> "hi").
  if (tokens.length <= 3 && words.includes(tokens[0])) return true;
  return phrases.some((phrase) => clean === phrase || clean.startsWith(`${phrase} `));
}

function classifySmallTalk(text: string): "greeting" | "farewell" | "thanks" | "ack" | null {
  if (matchesShortPhrase(text, GREETING_WORDS, GREETING_PHRASES)) return "greeting";
  if (matchesShortPhrase(text, FAREWELL_WORDS, FAREWELL_PHRASES)) return "farewell";
  if (THANKS_PATTERN.test(text)) return "thanks";
  if (matchesShortPhrase(text, ACK_WORDS, ACK_PHRASES)) return "ack";
  return null;
}

function smallTalkReply(kind: "greeting" | "farewell" | "thanks" | "ack"): string {
  switch (kind) {
    case "greeting":
      return "Hey there! I'm the AI assistant for Willowbrook Apartments — ask me about rent, maintenance, parking, pets, amenities, or your lease and I'll help right away.";
    case "farewell":
      return "Take care! I'm here anytime you have a question.";
    case "thanks":
      return "You're welcome! Let me know if anything else comes up.";
    case "ack":
      return "Got it — let me know if there's anything else I can help with.";
  }
}

function classify(text: string): { category: Category; score: number } {
  let best: { category: Category; score: number } = { category: "other", score: 0 };

  for (const rule of RULES) {
    const score = rule.keywords.reduce(
      (acc, kw) => (text.includes(kw) ? acc + 1 : acc),
      0
    );
    if (score > best.score) {
      best = { category: rule.category, score };
    }
  }

  return best;
}

function resolvedReply(category: Category): string {
  switch (category) {
    case "rent_payment":
      return `Rent is due on ${kb.rentDueDay}. There's a ${kb.lateFeeGraceDays}-day grace period, after which a ${kb.lateFeeAmount} late fee applies. You can set up autopay or check your balance from the tenant portal any time.`;
    case "maintenance":
      return `Sorry about that! Please submit a maintenance request with as much detail as you can (and a photo if possible) through the tenant portal — non-emergency requests are typically handled ${kb.maintenanceEta}. If this becomes urgent, call ${kb.maintenanceEmergencyPhone}.`;
    case "lease_terms":
      return `${kb.leasePolicy} Let me know if you'd like the exact dates for your unit and I can pull them up.`;
    case "parking":
      return kb.parkingPolicy;
    case "pet_policy":
      return kb.petPolicy;
    case "amenities":
      return `Here's what's available on-site: ${kb.amenities}`;
    default:
      return "Thanks for reaching out — happy to help with that.";
  }
}

const RESOLVABLE_CATEGORIES: Category[] = [
  "rent_payment",
  "maintenance",
  "lease_terms",
  "parking",
  "pet_policy",
  "amenities",
];

const CONTACT_LANDLORD_HINT = 'If you\'d like me to contact the landlord directly, just say "contact landlord".';

export function getAiVerdict(rawText: string): AiVerdict {
  const text = normalize(rawText);
  const { category, score } = classify(text);

  if (matchesAny(text, CONTACT_LANDLORD_PHRASES)) {
    const urgent = category === "emergency" || category === "legal_dispute" || category === "harassment";
    return {
      category,
      escalate: true,
      priority: urgent ? "urgent" : "normal",
      reason: "Tenant explicitly asked to contact the landlord.",
      reply:
        "Of course — I've forwarded this straight to the property owner and they'll follow up with you directly.",
    };
  }

  if (category === "emergency") {
    return {
      category,
      escalate: false,
      priority: "normal",
      reason: null,
      reply: `If there's any immediate danger, please call ${kb.maintenanceEmergencyPhone} or 911 right away. ${CONTACT_LANDLORD_HINT}`,
    };
  }

  if (category === "legal_dispute" || category === "harassment") {
    return {
      category,
      escalate: false,
      priority: "normal",
      reason: null,
      reply: `I hear you, and I want to make sure this gets the right attention. ${CONTACT_LANDLORD_HINT}`,
    };
  }

  if (category === "noise_complaint") {
    return {
      category,
      escalate: false,
      priority: "normal",
      reason: null,
      reply: `Thanks for letting me know. ${CONTACT_LANDLORD_HINT}`,
    };
  }

  if (category === "rent_payment" && matchesAny(text, DISPUTE_PHRASES)) {
    return {
      category,
      escalate: false,
      priority: "normal",
      reason: null,
      reply: `I've noted the concern about your charge. ${CONTACT_LANDLORD_HINT}`,
    };
  }

  if (category === "lease_terms" && matchesAny(text, EARLY_TERMINATION_PHRASES)) {
    return {
      category,
      escalate: false,
      priority: "normal",
      reason: null,
      reply: `Ending a lease early needs the property owner's sign-off. ${CONTACT_LANDLORD_HINT}`,
    };
  }

  if (RESOLVABLE_CATEGORIES.includes(category) && score > 0) {
    return {
      category,
      escalate: false,
      priority: "normal",
      reason: null,
      reply: resolvedReply(category),
    };
  }

  if (category === "other") {
    const smallTalk = classifySmallTalk(text);
    if (smallTalk) {
      return {
        category: "small_talk",
        escalate: false,
        priority: "normal",
        reason: null,
        reply: smallTalkReply(smallTalk),
      };
    }
  }

  return {
    category: "other",
    escalate: false,
    priority: "normal",
    reason: null,
    reply: `Thanks for the message! Ask me anything about rent, maintenance, parking, pets, amenities, or your lease. ${CONTACT_LANDLORD_HINT}`,
  };
}
