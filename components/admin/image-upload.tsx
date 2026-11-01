"use client"

import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

type Props = {
  preview: string | null
  onPick: (file: File, previewUrl: string) => void
  onRemove: () => void
  boxClassName?: string
}

export function ImageUpload({ preview, onPick, onRemove, boxClassName = "h-28 max-w-sm" }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function pick(f?: File) {
    if (!f) return
    if (!f.type.startsWith("image/")) {
      setError("Chỉ nhận tệp hình ảnh (JPG, PNG, WEBP)")
      return
    }
    if (f.size > MAX_SIZE) {
      setError("Ảnh quá lớn, tối đa 5MB")
      return
    }
    setError(null)
    onPick(f, URL.createObjectURL(f))
  }

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {preview ? (
        <div className="relative inline-block rounded-lg border border-line bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Hình ảnh mô tả" className="h-24 w-auto max-w-[220px] object-contain" />
          <button
            type="button"
            onClick={() => { setError(null); onRemove() }}
            aria-label="Xóa ảnh"
            className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-ink text-white shadow"
          >
            <X className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="mt-2 block w-full text-center text-[11px] font-semibold text-cta hover:underline"
          >
            Đổi ảnh
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            pick(e.dataTransfer.files?.[0])
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed text-xs text-muted transition ${boxClassName} ${
            dragging ? "border-cta bg-orange-50" : "border-slate-300 bg-white hover:bg-field"
          }`}
        >
          <ImagePlus className="size-4" />
          Chọn tệp hoặc kéo thả hình ảnh
        </button>
      )}

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}