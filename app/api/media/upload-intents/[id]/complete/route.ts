import { NextResponse } from "next/server"
import { proxy } from "@/lib/api/backend"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_: Request, { params }: Ctx) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
  }
  return proxy(`/media/upload-intents/${id}/complete`, "POST")
}