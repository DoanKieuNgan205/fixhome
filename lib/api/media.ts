import { apiErrorMessage } from "./errors"

type UploadIntent = {
  upload_intent_id: string
  upload_url: string
  api_key: string
  signature: string
  upload_params: Record<string, string>
  expires_at: string
  max_file_size_bytes: number
}

type CompletedMedia = {
  media_id: number
  file_url: string
}

// Lỗi có sẵn câu tiếng Việt để hiện cho người dùng
export class UploadError extends Error {}

const DEFAULT_MAX = 5 * 1024 * 1024 // 5MB

async function post<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "POST" })
  if (res.status === 401) {
    window.location.href = "/login"
    throw new Error("UNAUTHORIZED")
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? "SERVER")
  }
  return res.json()
}

export async function uploadImage(file: File): Promise<{ mediaId: number; url: string }> {
  if (!file.type.startsWith("image/")) {
    throw new UploadError("Chỉ nhận tệp hình ảnh (JPG, PNG, WEBP)")
  }
  if (file.size > DEFAULT_MAX) throw new UploadError("Ảnh quá lớn, tối đa 5MB")

  // 1. Xin phiên upload
  const intent = await post<UploadIntent>("/api/media/upload-intents")
  if (intent.max_file_size_bytes > 0 && file.size > intent.max_file_size_bytes) {
    const mb = Math.floor(intent.max_file_size_bytes / 1024 / 1024)
    throw new UploadError(`Ảnh quá lớn, tối đa ${mb}MB`)
  }

  // 2. Gửi thẳng lên Cloudinary. Phải gửi đúng các tham số đã ký, không thêm bớt
  const form = new FormData()
  for (const [k, v] of Object.entries(intent.upload_params ?? {})) form.append(k, String(v))
  if (!form.has("api_key")) form.append("api_key", intent.api_key)
  if (!form.has("signature")) form.append("signature", intent.signature)
  form.append("file", file) // file phải nằm cuối

  let res: Response
  try {
    res = await fetch(intent.upload_url, { method: "POST", body: form })
  } catch {
    throw new UploadError("Không kết nối được máy chủ lưu ảnh, vui lòng thử lại")
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    console.error("[uploadImage] Cloudinary từ chối:", res.status, data)
    throw new UploadError("Tải ảnh lên thất bại, vui lòng thử lại")
  }

  // 3. Xác nhận với backend
  const media = await post<CompletedMedia>(
    `/api/media/upload-intents/${intent.upload_intent_id}/complete`,
  )
  return { mediaId: media.media_id, url: media.file_url }
}

export const uploadErrorMessage = (e: unknown) =>
  e instanceof UploadError ? e.message : apiErrorMessage(e)