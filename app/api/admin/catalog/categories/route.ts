import { proxy } from "@/lib/api/backend"

export async function POST(req: Request) {
  return proxy("/admin/catalog/categories", "POST", await req.json())
}