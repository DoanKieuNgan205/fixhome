import type { NextResponse } from "next/server"
import { COOKIE, type AppRole } from "./config"

export type SessionTokens = {
  access_token: string
  refresh_token: string
  expires_in: number
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export function setSessionCookies(
  response: NextResponse,
  tokens: SessionTokens,
  remember: boolean,
  role?: AppRole,
) {
  const keep = remember ? { maxAge: 60 * 60 * 24 * 30 } : {}
  response.cookies.set(COOKIE.access, tokens.access_token, {
    ...cookieOptions,
    maxAge: tokens.expires_in,
  })
  response.cookies.set(COOKIE.refresh, tokens.refresh_token, { ...cookieOptions, ...keep })
  response.cookies.set(COOKIE.remember, remember ? "1" : "0", { ...cookieOptions, ...keep })
  if (role) response.cookies.set(COOKIE.role, role, { ...cookieOptions, ...keep })
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of Object.values(COOKIE)) {
    response.cookies.set(name, "", { ...cookieOptions, maxAge: 0, expires: new Date(0) })
  }
}
