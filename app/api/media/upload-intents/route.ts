import { proxy } from "@/lib/api/backend"

export async function POST() {
  return proxy("/media/upload-intents", "POST", { media_type: "IMAGE" })
}