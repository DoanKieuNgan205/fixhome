import { NextResponse, type NextRequest } from "next/server"
import { proxy } from "@/lib/api/backend"
import { buildStaffQuery } from "@/lib/api/staff/query"
import { createStaffSchema } from "@/lib/validations/staff"

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null)
  const result = createStaffSchema.safeParse(payload)
  if (!result.success) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 })
  }
  return proxy("/admin/staff", "POST", result.data)
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams
  const page = Number(search.get("page") ?? 1)
  const pageSize = Number(search.get("page_size") ?? 20)
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 })
  }
  const query = buildStaffQuery({
    page,
    page_size: pageSize,
    q: search.get("q") ?? undefined,
    status: search.get("status") ?? undefined,
  })
  return proxy(`/admin/staff?${query}`, "GET")
}
