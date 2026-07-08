import { NextRequest } from "next/server";
import { deleteTenant } from "@/lib/tenantStore";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = deleteTenant(id);
  if (!ok) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
