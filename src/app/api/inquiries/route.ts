import { NextRequest } from "next/server";
import { createInquiry, listInquiries, stats } from "@/lib/store";
import type { Channel } from "@/lib/types";

export async function GET() {
  return Response.json({ inquiries: listInquiries(), stats: stats() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantName, unit, text, channel } = body as {
    tenantName?: string;
    unit?: string;
    text?: string;
    channel?: Channel;
  };

  if (!text || !text.trim()) {
    return Response.json({ error: "Message text is required." }, { status: 400 });
  }

  const inquiry = createInquiry({
    tenantName: tenantName?.trim() || "Anonymous Tenant",
    unit: unit?.trim() || "Unassigned",
    channel: channel === "email" ? "email" : "website",
    text: text.trim(),
  });

  return Response.json({ inquiry }, { status: 201 });
}
