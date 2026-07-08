import { NextRequest } from "next/server";
import { createInquiry, listInquiries, stats } from "@/lib/store";
import { findTenantMatch } from "@/lib/tenantStore";
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

  // Re-check server-side — the tenant portal only lets verified tenants
  // reach this point, but that's a UX gate, not enforcement. Anyone could
  // otherwise call this endpoint directly with a made-up name/unit.
  if (!tenantName?.trim() || !unit?.trim() || !findTenantMatch(tenantName, unit)) {
    return Response.json(
      {
        error:
          "We couldn't verify these tenant details. Please check your name and unit number.",
      },
      { status: 403 }
    );
  }

  const inquiry = createInquiry({
    tenantName: tenantName.trim(),
    unit: unit.trim(),
    channel: channel === "email" ? "email" : "website",
    text: text.trim(),
  });

  return Response.json({ inquiry }, { status: 201 });
}
