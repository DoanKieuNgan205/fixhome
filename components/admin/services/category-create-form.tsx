"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { Toggle } from "@/components/admin/toggle"


type DraftDevice = {
  id: string
  sku: string
  name: string
  desc: string
  active: boolean
  image: string | null
  file: File | null
}

// Dữ liệu mẫu giống Figma. Khi làm thật, đổi thành mảng rỗng: []
const SAMPLE: DraftDevice[] = [
  { id: "s1", sku: "TB-DH-TREO", name: "Điều hòa treo tường", desc: "Inverter & Thường, công suất 9.000 BTU - 24.000 BTU", active: true, image: null, file: null },
  { id: "s2", sku: "TB-DH-CASSETTE", name: "Điều hòa âm trần Cassette", desc: "Thổi 4 hướng / 360 độ, phục vụ căn hộ diện tích lớn & văn phòng", active: true, image: null, file: null },
  { id: "s3", sku: "TB-TL-MULTIDOOR", name: "Tủ lạnh Side by Side / Multi Door", desc: "Dung tích trên 450L, công nghệ Dual Inverter, làm đá tự động", active: true, image: null, file: null },
  { id: "s4", sku: "TB-MG-FRONT", name: "Máy giặt cửa ngang (Front Load)", desc: "Tải trọng giặt từ 8.5kg - 15kg, có tính năng sấy ngưng tụ", active: true, image: null, file: null },
]

const label = "mb-1.5 block text-[11px] font-semibold text-body"
const input =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-cta focus:ring-2 focus:ring-cta/15"

export function CategoryCreateForm() {
  const router = useRouter()
  const counter = useRef(SAMPLE.length + 1)

  // 01. Thông tin nhóm
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [nameError, setNameError] = useState("")

  // 02. Thiết bị
  const [items, setItems] = useState<DraftDevice[]>(SAMPLE)
  const [dName, setDName] = useState("")
  const [dDesc, setDDesc] = useState("")
  const [dImage, setDImage] = useState<string | null>(null)
  const [dFile, setDFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dErrors, setDErrors] = useState<{ name?: string; desc?: string }>({})

  function resetDraft() {
    setDName("")
    setDDesc("")
    setDImage(null)
    setDFile(null)
    setEditingId(null)
    setDErrors({})
  }

  function saveDevice() {
    const err: typeof dErrors = {}
    if (!dName.trim()) err.name = "Vui lòng nhập tên loại thiết bị"
    if (!dDesc.trim()) err.desc = "Vui lòng nhập mô tả thiết bị"
    setDErrors(err)
    if (Object.keys(err).length > 0) return

    if (editingId) {
      setItems((list) =>
        list.map((i) =>
          i.id === editingId
            ? { ...i, name: dName.trim(), desc: dDesc.trim(), image: dImage, file: dFile }
            : i,
        ),
      )
    } else {
      const n = counter.current++
      setItems((list) => [
        ...list,
        {
          id: `draft-${n}`,
          sku: `TB-${String(n).padStart(3, "0")}`,
          name: dName.trim(),
          desc: dDesc.trim(),
          active: true,
          image: dImage,
          file: dFile,
        },
      ])
    }
    resetDraft()
  }

  function editDevice(i: DraftDevice) {
    setEditingId(i.id)
    setDName(i.name)
    setDDesc(i.desc)
    setDImage(i.image)
    setDFile(i.file)
    setDErrors({})
  }

  function removeDevice(id: string) {
    setItems((list) => list.filter((i) => i.id !== id))
    if (editingId === id) resetDraft()
  }

  function toggleDevice(id: string, v: boolean) {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, active: v } : i)))
  }

  function handleSubmit() {
    if (!name.trim()) {
      setNameError("Vui lòng nhập tên nhóm danh mục")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setNameError("")

    // TODO: gọi API tạo danh mục (dùng FormData nếu có ảnh)
    console.log({ name, description, active, imageFile, devices: items })

    router.push("/admin/services")
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveDevice()
    }
  }

  return (
    <div className="space-y-5">
      {/* 01. Thông tin nhóm danh mục cơ bản */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="rounded bg-orange-50 px-1.5 py-0.5 text-xs font-bold text-cta">01</span>
            Thông tin nhóm danh mục cơ bản
          </h2>
          <div className="flex items-center gap-2 text-xs text-body">
            Trạng thái phát hành
            <Toggle checked={active} onChange={setActive} label="Trạng thái phát hành" />
            <span className={`font-semibold ${active ? "text-emerald-600" : "text-muted"}`}>
              {active ? "Kích hoạt ngay" : "Lưu nháp"}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="cat-name" className={label}>
              Tên nhóm danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên nhóm danh mục, ví dụ: Điện máy gia đình, Cơ khí gia dụng, Thiết bị vệ sinh..."
              className={`${input} bg-field/60 ${nameError ? "border-red-400" : ""}`}
            />
            {nameError && <p className="mt-1 text-[11px] text-red-500">{nameError}</p>}
          </div>

          <div className="max-w-2xl">
            <label htmlFor="cat-desc" className={label}>Mô tả ngắn phạm vi nhóm dịch vụ</label>
            <input
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nêu tóm lược các dòng thiết bị và tiêu chuẩn công việc thuộc nhóm danh mục này..."
              className={`${input} bg-field/60`}
            />
          </div>

          <div>
            <span className={label}>Hình ảnh mô tả</span>
            <ImageUpload
              preview={image}
              onPick={(f, url) => { setImageFile(f); setImage(url) }}
              onRemove={() => { setImageFile(null); setImage(null) }}
              boxClassName="h-28 max-w-sm"
            />
          </div>
        </div>
      </section>

      {/* 02. Danh sách thiết bị thuộc danh mục */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 border-b border-line pb-3 text-sm font-semibold text-ink">
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-600">02</span>
          Danh sách thiết bị thuộc danh mục
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600">
            {items.length} thiết bị đã thêm
          </span>
        </h2>

        <div className="mt-4 space-y-4 rounded-lg bg-field/60 p-5">
          <div>
            <label htmlFor="dev-name" className={label}>
              Tên loại thiết bị <span className="text-red-500">*</span>
            </label>
            <input
              id="dev-name"
              value={dName}
              onChange={(e) => setDName(e.target.value)}
              onKeyDown={onEnter}
              placeholder="VD: Máy hút ẩm công nghiệp, Máy sấy quần áo..."
              className={`${input} ${dErrors.name ? "border-red-400" : ""}`}
            />
            {dErrors.name && <p className="mt-1 text-[11px] text-red-500">{dErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="dev-desc" className={label}>
              Mô tả thiết bị <span className="text-red-500">*</span>
            </label>
            <input
              id="dev-desc"
              value={dDesc}
              onChange={(e) => setDDesc(e.target.value)}
              onKeyDown={onEnter}
              placeholder="VD: Máy hút ẩm công nghiệp, Máy sấy quần áo..."
              className={`${input} ${dErrors.desc ? "border-red-400" : ""}`}
            />
            {dErrors.desc && <p className="mt-1 text-[11px] text-red-500">{dErrors.desc}</p>}
          </div>

          <div>
            <span className={label}>Hình ảnh mô tả</span>
            <ImageUpload
              preview={dImage}
              onPick={(f, url) => { setDFile(f); setDImage(url) }}
              onRemove={() => { setDFile(null); setDImage(null) }}
              boxClassName="h-16 max-w-[280px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={saveDevice}
              className="flex h-10 min-w-[200px] items-center justify-center gap-2 rounded-lg bg-cta px-6 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <Plus className="size-4" />
              {editingId ? "Cập nhật thiết bị" : "Thêm thiết bị"}
            </button>
            {editingId && (
              <button type="button" onClick={resetDraft} className="text-sm font-medium text-muted hover:text-ink">
                Hủy sửa
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="w-16 px-4 py-3 text-center">STT</th>
                <th className="px-4 py-3">Tên thiết bị</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3 text-center">Trạng thái áp dụng</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-20 text-center text-xs text-muted">
                    Chưa có thiết bị nào, hãy thêm thiết bị ở khung phía trên
                  </td>
                </tr>
              )}
              {items.map((i, idx) => (
                <tr key={i.id} className={editingId === i.id ? "bg-orange-50/50" : ""}>
                  <td className="px-4 py-3 text-center text-xs text-muted">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink">{i.name}</div>
                    <div className="text-[10px] text-muted">SKU: {i.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-body">{i.desc}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Toggle checked={i.active} onChange={(v) => toggleDevice(i.id, v)} label={`Bật ${i.name}`} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3 text-muted">
                      <button type="button" onClick={() => editDevice(i)} aria-label="Sửa thiết bị" className="hover:text-ink">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" onClick={() => removeDevice(i.id)} aria-label="Xóa thiết bị" className="hover:text-red-500">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-end gap-4">
        <Link href="/admin/services" className="text-sm font-medium text-muted hover:text-ink">
          Hủy
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex h-10 items-center gap-2 rounded-lg bg-cta px-6 text-sm font-semibold text-white shadow-md shadow-cta/20 transition hover:brightness-95"
        >
          <CheckCircle2 className="size-4" /> Tạo nhóm danh mục &amp; Hoàn tất
        </button>
      </div>
    </div>
  )
}