import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/session";

const COOKIE_NAME = "rally_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const expectedUser = process.env.RALLY_AUTH_USER;
  const expectedPass = process.env.RALLY_AUTH_PASS;
  const secret = process.env.RALLY_SESSION_SECRET;
  if (!expectedUser || !expectedPass || !secret) {
    return NextResponse.json({ error: "Sign-in is not configured." }, { status: 503 });
  }

  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = typeof body.username === "string" ? body.username : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  const token = await createSessionToken(secret, `password:${expectedUser}`, MAX_AGE);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return response;
}
