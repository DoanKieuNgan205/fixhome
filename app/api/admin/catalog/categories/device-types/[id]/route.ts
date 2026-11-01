import { proxy } from "@/lib/api/backend"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  return proxy(`/admin/catalog/device-types/${id}`, "PUT", await req.json())
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params
  return proxy(`/admin/catalog/device-types/${id}`, "DELETE")
}