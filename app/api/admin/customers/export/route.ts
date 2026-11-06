import { cookies } from "next/headers"
import { COOKIE } from "@/lib/auth/config"

export async function GET(req: Request) {
  const base = process.env.API_BASE_URL
  if (!base) return Response.json({ error: "SERVER" }, { status: 500 })

  const token = (await cookies()).get(COOKIE.access)?.value
  if (!token) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 })

  const incoming = new URL(req.url).searchParams
  const qs = new URLSearchParams()
  for (const key of ["q", "status"]) {
    const v = incoming.get(key)
    if (v) qs.set(key, v)
  }
  const query = qs.toString()

  let res: Response
  try {
    res = await fetch(`${base}/admin/customers/export${query ? `?${query}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    })
  } catch {
    return Response.json({ error: "NETWORK" }, { status: 502 })
  }

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      { error: res.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" },
      { status: res.status },
    )
  }
  if (!res.ok) return Response.json({ error: "SERVER" }, { status: 502 })

  return new Response(res.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="khach-hang.csv"',
      "Cache-Control": "no-store",
    },
  })
}