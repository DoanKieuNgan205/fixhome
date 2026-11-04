import { NextResponse, type NextRequest } from "next/server"
import { COOKIE, ROLE_HOME, type AppRole } from "@/lib/auth/config"
import { refreshSession, RefreshError } from "@/lib/auth/refresh"
import { clearSessionCookies, setSessionCookies, type SessionTokens } from "@/lib/auth/session"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = request.cookies.get(COOKIE.role)?.value as AppRole | undefined
  const home = role === "admin" || role === "operator" ? ROLE_HOME[role] : null
  let access = request.cookies.get(COOKIE.access)?.value
  let refreshed: SessionTokens | undefined

  const unauthenticated = () => {
    const response = pathname === "/login"
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url))
    clearSessionCookies(response)
    return response
  }

  if (!home) return unauthenticated()

  // Keep the login form reachable without waiting for an unavailable backend.
  // A refresh cookie alone is not proof of a currently authenticated session.
  if (pathname === "/login" && !access) return NextResponse.next()

  if (!access) {
    const refreshToken = request.cookies.get(COOKIE.refresh)?.value
    if (!refreshToken) return unauthenticated()
    try {
      refreshed = await refreshSession(refreshToken)
      access = refreshed.access_token
      // Forward renewed cookies to the current server render as well as the browser.
      request.cookies.set(COOKIE.access, access)
      request.cookies.set(COOKIE.refresh, refreshed.refresh_token)
    } catch (error) {
      if (!(error instanceof RefreshError)) throw error
      if (error.status === 401) return unauthenticated()
      // Show the login form on page requests; API handlers retain JSON errors.
      // Preserve cookies so a temporary outage does not destroy the session.
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  let response: NextResponse
  if (pathname === "/login") {
    response = NextResponse.redirect(new URL(home, request.url))
  } else {
    const area: AppRole = pathname.startsWith("/admin") ? "admin" : "operator"
    response = area !== role
      ? NextResponse.redirect(new URL(home, request.url))
      : NextResponse.next({ request: { headers: new Headers(request.headers) } })
  }

  if (refreshed) {
    setSessionCookies(response, refreshed, request.cookies.get(COOKIE.remember)?.value === "1")
  }
  return response
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/operator/:path*"],
}
