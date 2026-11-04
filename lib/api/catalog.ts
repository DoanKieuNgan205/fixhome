async function request(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (res.status === 401) {
    window.location.href = "/login"
    throw new Error("UNAUTHORIZED")
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? "SERVER")
  }
  return res.status === 204 ? null : res.json().catch(() => null)
}

const C = "/api/admin/catalog"

// Danh mục (cột trái)
export const createCategory = (b: { code: string; name: string; description?: string; icon_url?: string }) =>
  request(`${C}/categories`, "POST", b)
export const updateCategory = (id: number, b: { name: string; description?: string; icon_url?: string }) =>
  request(`${C}/categories/${id}`, "PUT", b)
export const deleteCategory = (id: number) =>
  request(`${C}/categories/${id}`, "DELETE")

// Thiết bị (bảng bên phải)
export const createDeviceType = (categoryId: number, b: { code: string; name: string }) =>
  request(`${C}/categories/${categoryId}/device-types`, "POST", b)
export const updateDeviceType = (id: number, b: { name: string }) =>
  request(`${C}/device-types/${id}`, "PUT", b)
export const deleteDeviceType = (id: number) =>
  request(`${C}/device-types/${id}`, "DELETE")
export const setCategoryStatus = (id: number, is_active: boolean) =>
  request(`${C}/categories/${id}/status`, "PATCH", { is_active })
export const setDeviceTypeStatus = (id: number, is_active: boolean) =>
  request(`${C}/device-types/${id}/status`, "PATCH", { is_active })