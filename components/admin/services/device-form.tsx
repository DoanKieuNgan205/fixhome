"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImagePlus, Plus, Save, X } from "lucide-react"
import { categories, type Device } from "@/lib/admin/mock-services"

type Props = {
  mode: "create" | "edit"
  device?: Device
  defaultCategoryId?: string
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function DeviceForm({ mode, device, defaultCategoryId }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const initialCategory =
    device?.categoryId ??
    (categories.some((c) => c.id === defaultCategoryId) ? defaultCategoryId! : categories[0].id)

  const [categoryId, setCategoryId] = useState(initialCategory)
  const [name, setName] = useState(device?.name ?? "")
  const [code, setCode] = useState((device as any)?.code ?? "") // Dùng code thay vì desc
  const [preview, setPreview] = useState<string | null>(device?.image ?? null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; code?: string; image?: string }>({})

  function pickFile(f: File | undefined) {
    if (!f) return
    if (!f.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "Chỉ nhận tệp hình ảnh (JPG, PNG, WEBP)" }))
      return
    }
    if (f.size > MAX_SIZE) {
      setErrors((e) => ({ ...e, image: "Ảnh quá lớn, tối đa 5MB" }))
      return
    }
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setErrors((e) => ({ ...e, image: undefined }))
  }

  function removeImage() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    setPreview(null)
    setFile(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!name.trim()) next.name = "Vui lòng nhập tên loại thiết bị"
    if (!code.trim()) next.code = "Vui lòng nhập mã thiết bị"
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || ""

      if (mode === "create") {
        // Gọi đến API Route nội bộ của Next.js để tránh tuyệt đối lỗi CORS
        const response = await fetch("/api/admin/devices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            categoryId,
            code: code.trim(),
            name: name.trim(),
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || "Thêm thiết bị thất bại")
        }

        alert("Thêm thiết bị mới thành công!")
      }

      router.push("/admin/services")
      router.refresh()
    } catch (error: any) {
      console.error("Lỗi:", error)
      alert(error.message || "Có lỗi xảy ra khi kết nối tới server.")
    } finally {
      setLoading(false)
    }
  }

  const label = "mb-1.5 block text-[11px] font-semibold text-body"
  const input =
    "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-cta focus:ring-2 focus:ring-cta/15"

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="space-y-4 rounded-lg bg-field/60 p-5">
        <div>
          <label htmlFor="category" className={label}>Nhóm dịch vụ</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={input}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name" className={label}>
            Tên loại thiết bị <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Máy hút ẩm công nghiệp, Máy sấy quần áo..."
            className={`${input} ${errors.name ? "border-red-400" : ""}`}
          />
          {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="code" className={label}>
            Mã thiết bị (Code) <span className="text-red-500">*</span>
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VD: DEV_01"
            className={`${input} ${errors.code ? "border-red-400" : ""}`}
          />
          {errors.code && <p className="mt-1 text-[11px] text-red-500">{errors.code}</p>}
        </div>

        <div>
          <span className={label}>{mode === "edit" ? "Hình ảnh mô tả" : "Chọn hình ảnh"}</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {preview ? (
            <div className="relative inline-block rounded-lg border border-line bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Hình ảnh thiết bị" className="h-24 w-auto max-w-[220px] object-contain" />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Xóa ảnh"
                className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-ink text-white shadow"
              >
                <X className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 block w-full text-center text-[11px] font-semibold text-cta hover:underline"
              >
                Đổi ảnh
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                pickFile(e.dataTransfer.files?.[0])
              }}
              className={`flex h-16 w-full max-w-[280px] items-center justify-center gap-2 rounded-lg border border-dashed text-xs text-muted transition ${
                dragging ? "border-cta bg-orange-50" : "border-slate-300 bg-white hover:bg-field"
              }`}
            >
              <ImagePlus className="size-4" />
              Chọn tệp hoặc kéo thả hình ảnh
            </button>
          )}
          {errors.image && <p className="mt-1 text-[11px] text-red-500">{errors.image}</p>}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 min-w-[200px] items-center justify-center gap-2 rounded-lg bg-cta px-8 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {mode === "create" ? <Plus className="size-4" /> : <Save className="size-4" />}
          {loading ? "Đang xử lý..." : mode === "create" ? "Thêm thiết bị" : "Cập nhật thông tin thiết bị"}
        </button>
        <Link href="/admin/services" className="text-sm font-medium text-muted hover:text-ink">
          Hủy
        </Link>
      </div>
    </form>
  )
}