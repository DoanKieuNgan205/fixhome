import { proxy } from "@/lib/api/backend"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  return proxy(`/admin/catalog/device-types/${id}/status`, "PATCH", await req.json())
}