import "server-only"
import { cookies } from "next/headers"
import { connection } from "next/server"
import { COOKIE } from "@/lib/auth/config"

export async function backendGet<T>(path: string): Promise<T> {
  await connection()
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
    // fetch bị Next hủy khi kết thúc bước prerender: không phải lỗi backend, ném lại nguyên trạng
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("prerender is complete") || (e as { digest?: string })?.digest?.startsWith("NEXT_")) throw e
    console.error("[backendGet] Không gọi được backend:", path, e)
    throw new Error("NETWORK")
  }

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (res.status === 403) throw new Error("FORBIDDEN")
  if (res.status === 404) throw new Error("NOT_FOUND")
  if (!res.ok) throw new Error("SERVER")
  return res.json()
}