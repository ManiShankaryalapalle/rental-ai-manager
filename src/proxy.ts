import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OWNER_SESSION_COOKIE, OWNER_SESSION_TOKEN } from "@/lib/authConfig";

// Routes tenants (or anyone unauthenticated) legitimately need to call.
const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/logout",
  "/api/tenants/verify",
]);

function isOwnerAuthorized(request: NextRequest): boolean {
  return request.cookies.get(OWNER_SESSION_COOKIE)?.value === OWNER_SESSION_TOKEN;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOwnerPage = pathname.startsWith("/owner") && pathname !== "/owner/login";
  const isPublicApi =
    PUBLIC_API_PATHS.has(pathname) ||
    (pathname === "/api/inquiries" && request.method === "POST");
  const isProtectedApi = pathname.startsWith("/api/") && !isPublicApi;

  if (!isOwnerPage && !isProtectedApi) {
    return NextResponse.next();
  }

  if (isOwnerAuthorized(request)) {
    return NextResponse.next();
  }

  if (isOwnerPage) {
    return NextResponse.redirect(new URL("/owner/login", request.url));
  }

  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/owner/:path*", "/api/:path*"],
};
