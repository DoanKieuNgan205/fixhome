import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIE } from "@/lib/auth/config"
import { refreshSession, RefreshError } from "@/lib/auth/refresh"
import { clearSessionCookies, setSessionCookies } from "@/lib/auth/session"

export async function POST() {
  const store = await cookies()
  const refreshToken = store.get(COOKIE.refresh)?.value
  if (!refreshToken) {
    const response = NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    clearSessionCookies(response)
    return response
  }

  try {
    const tokens = await refreshSession(refreshToken)
    const response = NextResponse.json({ success: true })
    response.headers.set("Cache-Control", "no-store")
    setSessionCookies(response, tokens, store.get(COOKIE.remember)?.value === "1")
    return response
  } catch (error) {
    if (!(error instanceof RefreshError)) throw error
    const response = NextResponse.json({ error: error.message }, { status: error.status })
    if (error.status === 401) clearSessionCookies(response)
    return response
  }
}
