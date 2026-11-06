import { NextResponse } from "next/server"
import { proxy } from "@/lib/api/backend"
import { updateStaffSchema } from "@/lib/validations/staff"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[1-9]\d*$/.test(id) || BigInt(id) > BigInt("9223372036854775807")) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 })
  }
  const payload: unknown = await request.json().catch(() => null)
  const result = updateStaffSchema.safeParse(payload)
  if (!result.success) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 })
  }
  return proxy(`/admin/staff/${id}`, "PATCH", result.data)
}
