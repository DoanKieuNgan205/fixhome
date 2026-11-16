import { proxy } from "@/lib/api/backend"
import { parseReviewBody } from "@/lib/api/review-body"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return Response.json({ error: "VALIDATION" }, { status: 400 })
  const body = parseReviewBody(await req.json().catch(() => null))
  if (!body) return Response.json({ error: "VALIDATION" }, { status: 400 })
  return proxy(`/operator/technicians/${id}/verification`, "PATCH", body)
}