import { NextRequest, NextResponse } from "next/server";
import { verifySessionAccount } from "@/lib/session";

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.svg|login|pricing|help|manifest.webmanifest|sw.js|app-icon|apple-touch-icon|api/login).*)",
};

const COOKIE_NAME = "rally_session";

export async function proxy(request: NextRequest) {
  const secret = process.env.RALLY_SESSION_SECRET;
  if (!secret) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (await verifySessionAccount(secret, token)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("return_to", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
