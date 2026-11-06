"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/admin/image-upload"
import type { Category } from "@/lib/api/types"
import { updateCategory } from "@/lib/api/catalog"
import { uploadImage, uploadErrorMessage } from "@/lib/api/media"

const label = "mb-1.5 block text-[11px] font-semibold text-body"
const input =
  "h-10 w-full rounded-lg border border-line bg-field/60 px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-cta focus:bg-white focus:ring-2 focus:ring-cta/15"

export function CategoryEditForm({ category }: { category: Category }) {
  const router = useRouter()

  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description ?? "")
  const [image, setImage] = useState<string | null>(category.icon_url)
  const [file, setFile] = useState<File | null>(null)
  const [nameError, setNameError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên nhóm danh mục")
      return
    }

    setNameError("")
    setSubmitError("")
    setSaving(true)

    /*try {
      let iconUrl: string | undefined
      if (file) {
        iconUrl = (await uploadImage(file)).url // ảnh mới chọn: tải lên Cloudinary
      } else if (image) {
        iconUrl = image // giữ ảnh cũ (đã là URL)
      } else if (category.icon_url) {
        iconUrl = "" // admin đã bấm xóa ảnh cũ
      }

      await updateCategory(category.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon_url: iconUrl,
      })
      router.push("/admin/services")
      router.refresh()
    }*/
    try {
      let iconUrl: string | undefined
      if (file) {
        iconUrl = (await uploadImage(file)).url // ảnh mới chọn: tải lên Cloudinary
      } else if (image) {
        iconUrl = image // giữ ảnh cũ (đã là URL)
      } else if (category.icon_url) {
        iconUrl = "" // admin đã bấm xóa ảnh cũ
      }

      const saved = (await updateCategory(category.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon_url: iconUrl,
      })) as { icon_url?: string | null } | null

      // Kiểm tra backend đã thật sự lưu ảnh chưa
      if (iconUrl && !saved?.icon_url) {
        setSubmitError(
          `Ảnh đã tải lên nhưng backend KHÔNG lưu ảnh (icon_url trống). Link ảnh: ${iconUrl}`,
        )
        return
      }

      router.push("/admin/services")
      router.refresh()
    } catch (err) {
      setSubmitError(uploadErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-line bg-white p-5 shadow-sm"
    >
      <h2 className="border-b border-line pb-3 text-sm font-semibold text-ink">
        Thông tin nhóm danh mục cơ bản
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className={label}>
            Tên nhóm danh mục <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Điện lạnh"
            className={`${input} ${nameError ? "border-red-400" : ""}`}
          />
          {nameError && <p className="mt-1 text-[11px] text-red-500">{nameError}</p>}
        </div>

        <div className="max-w-2xl">
          <label htmlFor="desc" className={label}>
            Mô tả ngắn phạm vi nhóm dịch vụ
          </label>
          <input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Các dịch vụ thuộc về điện lạnh"
            className={input}
          />
        </div>

        <div>
          <span className={label}>Hình ảnh mô tả</span>
          <ImageUpload
            preview={image}
            onPick={(f, url) => {
              setFile(f)
              setImage(url)
            }}
            onRemove={() => {
              setFile(null)
              setImage(null)
            }}
            boxClassName="h-28 max-w-sm"
          />
        </div>
      </div>

      {submitError && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex h-10 items-center justify-center rounded-lg bg-cta px-6 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-70"
        >
          {saving ? "Đang cập nhật..." : "Cập nhật thông tin danh mục"}
        </button>
        <Link href="/admin/services" className="text-sm font-medium text-muted hover:text-ink">
          Hủy
        </Link>
      </div>
    </form>
  )
}