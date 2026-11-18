import { forwardGet, invalid, isId } from "@/lib/api/route-helpers"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isId(id)) return invalid()
  return forwardGet(req, `/operator/repair-orders/${id}/quotes`)
}