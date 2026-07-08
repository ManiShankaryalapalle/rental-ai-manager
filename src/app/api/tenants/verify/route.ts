import { NextRequest } from "next/server";
import { findTenantMatch } from "@/lib/tenantStore";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fullName, unit } = body as { fullName?: string; unit?: string };

  if (!fullName?.trim() || !unit?.trim()) {
    return Response.json(
      { verified: false, error: "Full name and unit are required." },
      { status: 400 }
    );
  }

  const tenant = findTenantMatch(fullName, unit);
  if (!tenant) {
    return Response.json({ verified: false });
  }

  return Response.json({ verified: true, tenant });
}
