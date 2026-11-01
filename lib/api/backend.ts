import "server-only"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIE } from "@/lib/auth/config"

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status })

export async function proxy(path: string, method: string, body?: unknown) {
  const base = process.env.API_BASE_URL
  if (!base) return fail("SERVER", 500)

  const token = (await cookies()).get(COOKIE.access)?.value
  if (!token) return fail("UNAUTHORIZED", 401)

  let res: Response
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    })
  } catch {
    return fail("NETWORK", 502)
  }

  if (res.status === 401) return fail("UNAUTHORIZED", 401)
  if (res.status === 403) return fail("FORBIDDEN", 403)
  if (res.status === 404) return fail("NOT_FOUND", 404)
  if (res.status === 409) return fail("CONFLICT", 409)
  if (res.status === 400) return fail("VALIDATION", 400)
  if (!res.ok) return fail("SERVER", 502)

  const data = await res.json().catch(() => null)
  return data === null
    ? new NextResponse(null, { status: res.status })
    : NextResponse.json(data, { status: res.status })
}