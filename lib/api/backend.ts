import "server-only"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIE } from "@/lib/auth/config"
import { refreshSession, RefreshError } from "@/lib/auth/refresh"
import { clearSessionCookies, setSessionCookies, type SessionTokens } from "@/lib/auth/session"

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status })

export async function proxy(path: string, method: string, body?: unknown) {
  const base = process.env.API_BASE_URL
  if (!base) return fail("SERVER", 500)

  const store = await cookies()
  let token = store.get(COOKIE.access)?.value
  const refreshToken = store.get(COOKIE.refresh)?.value
  let refreshed: SessionTokens | undefined

  const finish = (response: NextResponse) => {
    response.headers.set("Cache-Control", "no-store")
    if (response.status === 401) clearSessionCookies(response)
    else if (refreshed) {
      setSessionCookies(response, refreshed, store.get(COOKIE.remember)?.value === "1")
    }
    return response
  }

  const renew = async () => {
    if (!refreshToken) throw new RefreshError(401, "UNAUTHORIZED")
    refreshed = await refreshSession(refreshToken)
    token = refreshed.access_token
  }

  let res: Response
  try {
    if (!token) await renew()

    const send = () => fetch(`${base}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    })
    res = await send()
    // Retry once only, including mutations rejected by authentication.
    if (res.status === 401 && !refreshed) {
      await renew()
      res = await send()
    }
  } catch (error) {
    if (error instanceof RefreshError) return finish(fail(error.message, error.status))
    return finish(fail("NETWORK", 502))
  }

  if (res.status === 401) return finish(fail("UNAUTHORIZED", 401))
  if (res.status === 403) return finish(fail("FORBIDDEN", 403))
  if (res.status === 404) return finish(fail("NOT_FOUND", 404))
  if (res.status === 409) return finish(fail("CONFLICT", 409))
  if (res.status === 400) return finish(fail("VALIDATION", 400))
  if (res.status === 422) return finish(fail("VALIDATION", 422))
  if (!res.ok) return finish(fail("SERVER", 502))

  const data = await res.json().catch(() => null)
  return finish(data === null
    ? new NextResponse(null, { status: res.status })
    : NextResponse.json(data, { status: res.status }))
}
