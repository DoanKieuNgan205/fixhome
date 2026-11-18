import { proxy } from "@/lib/api/backend"

export const isId = (v: string) => /^\d{1,18}$/.test(v)
export const invalid = () => Response.json({ error: "VALIDATION" }, { status: 400 })

// Chuyển tiếp GET tới backend kèm nguyên query string
export function forwardGet(req: Request, path: string) {
  return proxy(`${path}${new URL(req.url).search}`, "GET")
}