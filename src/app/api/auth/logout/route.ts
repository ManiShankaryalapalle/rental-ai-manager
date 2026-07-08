import { NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE } from "@/lib/authConfig";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
