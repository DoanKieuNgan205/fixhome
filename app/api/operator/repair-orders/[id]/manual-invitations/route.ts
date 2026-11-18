import { proxy } from "@/lib/api/backend"
import { invalid, isId } from "@/lib/api/route-helpers"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isId(id)) return invalid()
  const body = await req.json().catch(() => undefined)
  if (body === undefined) return invalid()
  return proxy(`/operator/repair-orders/${id}/manual-invitations`, "POST", body)
}