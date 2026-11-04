import { NextResponse } from "next/server"
import { LOGIN_PATH, ROLE_HOME, ROLE_MAP } from "@/lib/auth/config"
import { setSessionCookies } from "@/lib/auth/session"

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status })

export async function POST(request: Request) {
  const base = process.env.API_BASE_URL
  if (!base) return fail("SERVER", 500)

  const { email, password, remember = false, role: selectedRole } = await request.json()
  if (!email || !password) return fail("INVALID_CREDENTIALS", 400)

  let res: Response
  try {
    res = await fetch(`${base}${LOGIN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000), // server miễn phí có thể mất 1 phút để "thức dậy"
    })
  } catch {
    return fail("NETWORK", 502)
  }

  if (res.status === 401) return fail("INVALID_CREDENTIALS", 401)
  if (res.status === 429) return fail("TOO_MANY", 429)
  if (!res.ok) return fail("SERVER", 502)

  const { tokens, account } = await res.json()

  if (account.status !== "ACTIVE") return fail("ACCOUNT_INACTIVE", 403)

  const appRole = ROLE_MAP[account.role]
  if (!appRole) return fail("FORBIDDEN_ROLE", 403)
  if (selectedRole && selectedRole !== appRole) return fail("ROLE_MISMATCH", 403)

  const response = NextResponse.json({ redirectTo: ROLE_HOME[appRole] })

  setSessionCookies(response, tokens, Boolean(remember), appRole)

  return response
}
