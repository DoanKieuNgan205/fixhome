import { NextResponse, type NextRequest } from "next/server"
import { COOKIE, ROLE_HOME, type AppRole } from "@/lib/auth/config"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasSession = !!(
    request.cookies.get(COOKIE.access)?.value ||
    request.cookies.get(COOKIE.refresh)?.value
  )
  const role = request.cookies.get(COOKIE.role)?.value as AppRole | undefined
  const home = role && role in ROLE_HOME ? ROLE_HOME[role] : null

  // Đã đăng nhập mà vào /login thì đưa về trang của vai trò
  if (pathname === "/login") {
    return hasSession && home
      ? NextResponse.redirect(new URL(home, request.url))
      : NextResponse.next()
  }

  // Chưa đăng nhập
  if (!hasSession || !home) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Sai khu vực (vận hành vào /admin và ngược lại)
  const area: AppRole = pathname.startsWith("/admin") ? "admin" : "operator"
  if (area !== role) return NextResponse.redirect(new URL(home, request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/operator/:path*"],
}