/*import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIE, LOGOUT_PATH } from "@/lib/auth/config"

export async function POST() {
  const base = process.env.API_BASE_URL
  const store = await cookies()
  const access = store.get(COOKIE.access)?.value
  const refresh = store.get(COOKIE.refresh)?.value

  // Báo backend thu hồi refresh token (lỗi cũng bỏ qua, vẫn xóa cookie)
  if (base && refresh) {
    try {
      await fetch(`${base}${LOGOUT_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refresh }),
        signal: AbortSignal.timeout(10_000),
      })
    } catch {}
  }

  const response = NextResponse.json({ ok: true })
  for (const name of Object.values(COOKIE)) response.cookies.delete(name)
  return response
}*/


import { NextResponse } from "next/server"
import { COOKIE } from "@/lib/auth/config"

export async function POST() {
  const response = NextResponse.json({ success: true })

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  }

  response.cookies.set(COOKIE.access, "", cookieOptions)
  response.cookies.set(COOKIE.refresh, "", cookieOptions)
  response.cookies.set(COOKIE.role, "", cookieOptions)

  return response
}
