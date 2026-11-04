import { proxy } from "@/lib/api/backend"

export async function GET() {
  return proxy("/admin/staff/roles", "GET")
}
