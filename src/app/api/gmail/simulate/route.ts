import { NextRequest } from "next/server";
import { createInquiry } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantName, unit, text } = body as {
    tenantName?: string;
    unit?: string;
    text?: string;
  };

  if (!text || !text.trim()) {
    return Response.json({ error: "Message text is required." }, { status: 400 });
  }

  const inquiry = createInquiry({
    tenantName: tenantName?.trim() || "Unknown Sender",
    unit: unit?.trim() || "Unassigned",
    channel: "email",
    text: text.trim(),
  });

  return Response.json({ inquiry }, { status: 201 });
}
