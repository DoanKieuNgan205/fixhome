import "server-only"
import { cookies } from "next/headers"
import { COOKIE } from "@/lib/auth/config"
import type { Category, DeviceType } from "./types"

export type CategoryWithDevices = Category & { device_types: DeviceType[] }

async function adminGet<T>(path: string): Promise<T> {
  const base = process.env.API_BASE_URL
  if (!base) throw new Error("SERVER")

  const token = (await cookies()).get(COOKIE.access)?.value
  if (!token) throw new Error("UNAUTHORIZED")

  let res: Response
  try {
    res = await fetch(`${base}/admin/catalog${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    })
  } catch {
    throw new Error("NETWORK")
  }

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (res.status === 403) throw new Error("FORBIDDEN")
  if (res.status === 404) throw new Error("NOT_FOUND")
  if (!res.ok) throw new Error("SERVER")
  return res.json()
}

// Chấp nhận cả mảng thuần lẫn dạng bọc { data | content | items | results: [...] }
function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    for (const key of ["data", "content", "items", "results"]) {
      const inner = obj[key]
      if (Array.isArray(inner)) return inner as T[]
      if (inner && typeof inner === "object") {
        const nested = (inner as Record<string, unknown>).content
        if (Array.isArray(nested)) return nested as T[]
      }
    }
  }
  console.error("[catalog-read] Dữ liệu không phải mảng:", JSON.stringify(payload)?.slice(0, 300))
  throw new Error("SERVER")
}

export const getCategories = async () =>
  toArray<Category>(await adminGet<unknown>("/categories"))

export const getCategory = (id: number) => adminGet<Category>(`/categories/${id}`)

export const getDeviceTypes = async (categoryId: number) =>
  toArray<DeviceType>(await adminGet<unknown>(`/categories/${categoryId}/device-types`))

export async function getDeviceType(id: number): Promise<DeviceType | null> {
  try {
    return await adminGet<DeviceType>(`/device-types/${id}`)
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") return null
    throw e
  }
}

export async function getCatalog(): Promise<CategoryWithDevices[]> {
  const categories = await getCategories()
  return Promise.all(
    categories.map(async (c) => ({ ...c, device_types: await getDeviceTypes(c.id) })),
  )
}