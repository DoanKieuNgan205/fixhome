import "server-only"
import { cookies } from "next/headers"
import { COOKIE } from "@/lib/auth/config"

export async function backendGet<T>(path: string): Promise<T> {
  const base = process.env.API_BASE_URL
  if (!base) throw new Error("SERVER")

  const token = (await cookies()).get(COOKIE.access)?.value
  if (!token) throw new Error("UNAUTHORIZED")

  let res: Response
  try {
    res = await fetch(`${base}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    })
  } catch (e) {
    console.error("[backendGet] Không gọi được backend:", path, e)
    throw new Error("NETWORK")
  }

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (res.status === 403) throw new Error("FORBIDDEN")
  if (res.status === 404) throw new Error("NOT_FOUND")
  if (!res.ok) throw new Error("SERVER")
  return res.json()
}