"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlignLeft, ChevronLeft, ChevronRight, Droplets, House,
  Pencil, Plus, Search, Snowflake, Trash2, Tv, Utensils,
} from "lucide-react"
import { Toggle } from "@/components/admin/toggle"
import { DeleteDialog, type DeleteTarget } from "@/components/admin/services/delete-dialog"
import { PauseDialog, type PauseTarget } from "@/components/admin/services/pause-dialog"
import {
  deleteCategory, deleteDeviceType, setCategoryStatus, setDeviceTypeStatus,
} from "@/lib/api/catalog"
import { apiErrorMessage } from "@/lib/api/errors"
import type { CategoryWithDevices } from "@/lib/api/catalog-read"

const PAGE_SIZE = 6

// Backend chưa có icon/màu cho danh mục nên xoay vòng theo thứ tự
const ICONS = [Snowflake, Droplets, Utensils, House, Tv]
const TONES = [
  "bg-cyan-50 text-cyan-600",
  "bg-indigo-50 text-indigo-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
]

type Selected = number | "all"

export function ServiceCatalog({ categories }: { categories: CategoryWithDevices[] }) {
  const router = useRouter()

  const [selectedRaw, setSelected] = useState<Selected>("all")
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<{ target: DeleteTarget; id: number; name: string } | null>(null)
  const [pending, setPending] = useState<{ target: PauseTarget; id: number; name: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState("")

  // Nếu danh mục đang chọn vừa bị xóa thì quay về "Tất cả"
  const selected: Selected =
    selectedRaw === "all" || categories.some((c) => c.id === selectedRaw) ? selectedRaw : "all"
  const selectedCat = categories.find((c) => c.id === selected)

  // Gộp thiết bị của mọi danh mục thành một danh sách phẳng
  const devs = useMemo(
    () =>
      categories.flatMap((c) =>
        c.device_types.map((d) => ({ ...d, categoryName: c.name })),
      ),
    [categories],
  )

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return devs.filter((d) => {
      const okCat = selected === "all" || d.category_id === selected
      const okStatus = status === "all" || (status === "active" ? d.is_active : !d.is_active)
      const okKey = !k || d.name.toLowerCase().includes(k) || d.code.toLowerCase().includes(k)
      return okCat && okStatus && okKey
    })
  }, [devs, selected, status, keyword])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  function selectCategory(id: Selected) {
    setSelected(id)
    setPage(1)
  }

  // ---- Xóa ----
  async function confirmDelete() {
    if (!deleting) return
    // Ném lỗi ra ngoài để DeleteDialog hiện thông báo và giữ hộp thoại mở
    if (deleting.target === "category") await deleteCategory(deleting.id)
    else await deleteDeviceType(deleting.id)

    setDeleting(null)
    router.refresh()
  }

  // ---- Bật / tắt ----
  async function applyStatus(target: PauseTarget, id: number, value: boolean) {
    setBusy(true)
    setActionError("")
    try {
      if (target === "category") await setCategoryStatus(id, value)
      else await setDeviceTypeStatus(id, value)
      router.refresh()
    } catch (e) {
      setActionError(apiErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  // Tắt thì hỏi xác nhận, bật thì làm luôn
  function toggleCategory(c: CategoryWithDevices, v: boolean) {
    if (v) applyStatus("category", c.id, true)
    else setPending({ target: "category", id: c.id, name: c.name })
  }

  function toggleDevice(d: { id: number; name: string }, v: boolean) {
    if (v) applyStatus("device", d.id, true)
    else setPending({ target: "device", id: d.id, name: d.name })
  }

  /*async function confirmPause() {
    if (!pending) return
    const p = pending
    setPending(null)
    // Backend chỉ nhận is_active, chưa có chỗ lưu lý do / ghi chú
    await applyStatus(p.target, p.id, false)
  }*/

  async function confirmPause() {
    if (!pending) return
    const p = pending
    setPending(null)
    setBusy(true)
    setActionError("")

    try {
      if (p.target === "category") {
        const cat = categories.find((c) => c.id === p.id)
        const activeDevices = cat?.device_types.filter((d) => d.is_active) ?? []

        // Bước 1: tắt các thiết bị đang bật (chạy song song cho nhanh)
        await Promise.all(activeDevices.map((d) => setDeviceTypeStatus(d.id, false)))
        // Bước 2: tắt danh mục
        await setCategoryStatus(p.id, false)
      } else {
        await setDeviceTypeStatus(p.id, false)
      }
    } catch (e) {
      setActionError(apiErrorMessage(e))
    } finally {
      // Làm mới cả khi lỗi giữa chừng, để thấy phần đã tắt được
      router.refresh()
      setBusy(false)
    }
  }

  const busyCls = busy ? "pointer-events-none opacity-60" : ""

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
      {actionError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 lg:col-span-2"
        >
          {actionError}
        </p>
      )}

      {/* Cột trái: phân loại danh mục */}
      <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold tracking-wider text-muted">
            PHÂN LOẠI DANH MỤC
          </h3>
          <span className="rounded bg-field px-2 py-0.5 text-[10px] font-semibold text-body">
            {categories.length} nhóm
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          <button
            onClick={() => selectCategory("all")}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
              selected === "all" ? "border-cta bg-orange-50/40" : "border-transparent hover:bg-field"
            }`}
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <AlignLeft className="size-4" />
            </span>
            <span className="flex-1 text-[13px] font-semibold text-ink">Tất cả danh mục</span>
            <span className="rounded-full bg-field px-2.5 py-0.5 text-[11px] font-semibold text-body">
              {devs.length}
            </span>
          </button>

          {categories.map((c, idx) => {
            const Icon = ICONS[idx % ICONS.length]
            const tone = TONES[idx % TONES.length]
            const active = selected === c.id
            return (
              <div
                key={c.id}
                onClick={() => selectCategory(c.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 shadow-sm transition ${
                  active ? "border-cta bg-orange-50/40" : "border-line bg-white hover:bg-field/60"
                } ${c.is_active ? "" : "opacity-70"}`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${tone}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                    <span className="truncate">{c.name}</span>
                    {active && <span className="size-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <div className={`text-[11px] ${active ? "text-cta" : "text-muted"}`}>
                    {c.device_types.length} thiết bị{c.is_active ? "" : " • Tạm dừng"}
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className={busyCls}>
                    <Toggle
                      checked={c.is_active}
                      onChange={(v) => toggleCategory(c, v)}
                      label={`Bật nhóm ${c.name}`}
                    />
                  </span>
                  <Link
                    href={`/admin/services/categories/${c.id}/edit`}
                    className="text-muted hover:text-ink"
                    aria-label="Sửa nhóm"
                  >
                    <Pencil className="size-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleting({ target: "category", id: c.id, name: c.name })}
                    className="text-muted hover:text-red-500"
                    aria-label={`Xóa nhóm ${c.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}

          {categories.length === 0 && (
            <p className="py-4 text-center text-xs text-muted">Chưa có nhóm danh mục nào</p>
          )}

          <Link
            href="/admin/services/categories/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-xs font-medium text-body transition hover:bg-field"
          >
            <Plus className="size-4" /> Thêm nhóm danh mục mới
          </Link>
        </div>
      </section>

      {/* Cột phải: danh sách thiết bị */}
      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-line px-3 focus-within:ring-2 focus-within:ring-cta/20">
            <Search className="size-4 text-muted" />
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
              placeholder="Tìm kiếm loại thiết bị, mã thiết bị..."
              className="h-full w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted"
            />
          </div>

          <label className="flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-xs text-body">
            Trạng thái:
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1) }}
              className="bg-transparent font-semibold text-ink outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="active">Áp dụng</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </label>

          <div className="text-xs text-muted">
            Đang xem:{" "}
            <b className="text-ink">
              {selected === "all" ? "Tất cả" : selectedCat?.name} ({filtered.length})
            </b>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Tên loại thiết bị</th>
                <th className="px-5 py-3">Danh mục</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="h-24 text-center text-xs text-muted">
                    Không có thiết bị nào phù hợp
                  </td>
                </tr>
              )}
              {rows.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-ink">{d.name}</div>
                    <div className="text-[11px] text-muted">Mã: {d.code}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                      {d.categoryName}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${d.is_active ? "text-emerald-600" : "text-muted"}`}>
                        <span className={`size-1.5 rounded-full ${d.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                        {d.is_active ? "Áp dụng" : "Tạm dừng"}
                      </span>
                      <span className={busyCls}>
                        <Toggle
                          checked={d.is_active}
                          onChange={(v) => toggleDevice(d, v)}
                          label={`Bật ${d.name}`}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-3 text-muted">
                      <Link
                        href={`/admin/services/${d.id}/edit`}
                        className="inline-flex text-muted hover:text-ink"
                        aria-label="Sửa thiết bị"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleting({ target: "device", id: d.id, name: d.name })}
                        className="hover:text-red-500"
                        aria-label={`Xóa thiết bị ${d.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link
          href={selected === "all" ? "/admin/services/new" : `/admin/services/new?category=${selected}`}
          className="flex w-full items-center justify-center gap-2 border-y border-dashed border-slate-300 py-3 text-xs font-medium text-body transition hover:bg-field"
        >
          <Plus className="size-4" /> Thêm thiết bị mới
        </Link>

        <div className="flex items-center justify-end gap-1.5 bg-field/40 px-4 py-3">
          <button
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
            className="flex size-7 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
            aria-label="Trang trước"
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`size-7 rounded-md text-xs font-semibold ${
                n === current ? "bg-cta text-white" : "border border-line bg-white text-body hover:bg-field"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
            className="flex size-7 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
            aria-label="Trang sau"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </section>

      {pending && (
        <PauseDialog
          target={pending.target}
          name={pending.name}
          runningOrders={0} // TODO: backend chưa có API số đơn đang chạy
          affectedCount={
            pending.target === "category"
              ? categories.find((c) => c.id === pending.id)?.device_types.filter((d) => d.is_active).length ?? 0
              : 0
          }
          onCancel={() => setPending(null)}
          onConfirm={confirmPause}
        />
      )}

      {deleting && (
        <DeleteDialog
          target={deleting.target}
          name={deleting.name}
          deviceCount={
            deleting.target === "category"
              ? categories.find((c) => c.id === deleting.id)?.device_types.length ?? 0
              : 0
          }
          runningOrders={0} // TODO: backend chưa có API số đơn đang chạy
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}