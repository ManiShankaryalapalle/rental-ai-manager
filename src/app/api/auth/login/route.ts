import { NextRequest, NextResponse } from "next/server";
import { OWNER_PASSWORD, OWNER_SESSION_COOKIE, OWNER_SESSION_TOKEN } from "@/lib/authConfig";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = (body as { password?: string }).password ?? "";

  if (password !== OWNER_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_SESSION_COOKIE, OWNER_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
