import { NextRequest } from "next/server";
import { addTenant, listTenants } from "@/lib/tenantStore";

export async function GET() {
  return Response.json({ tenants: listTenants() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fullName, unit, address } = body as {
    fullName?: string;
    unit?: string;
    address?: string;
  };

  if (!fullName?.trim() || !unit?.trim()) {
    return Response.json(
      { error: "Full name and unit are required." },
      { status: 400 }
    );
  }

  const tenant = addTenant({
    fullName: fullName.trim(),
    unit: unit.trim(),
    address: address?.trim() ?? "",
  });

  return Response.json({ tenant }, { status: 201 });
}
