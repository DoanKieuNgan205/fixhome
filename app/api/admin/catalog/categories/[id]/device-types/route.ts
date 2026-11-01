import { proxy } from "@/lib/api/backend"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  return proxy(`/admin/catalog/categories/${id}/device-types`, "POST", await req.json())
}