import { NextRequest } from "next/server";
import { addOwnerReply, getInquiry } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const inquiry = getInquiry(id);
  if (!inquiry) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ inquiry });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const text = (body as { text?: string }).text?.trim();

  if (!text) {
    return Response.json({ error: "Reply text is required." }, { status: 400 });
  }

  const inquiry = addOwnerReply(id, text);
  if (!inquiry) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ inquiry });
}
