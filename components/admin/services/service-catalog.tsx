"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlignLeft, ChevronLeft, ChevronRight, Droplets, House,
  Pencil, Plus, Search, Snowflake, Tv, Utensils,
} from "lucide-react"
import { Toggle } from "@/components/admin/toggle"
import {
  categories as initialCategories,
  devices as initialDevices,
  type Category,
} from "@/lib/admin/mock-services"
import { PauseDialog, type PauseTarget } from "@/components/admin/services/pause-dialog"
import { Trash2 } from "lucide-react"
import { DeleteDialog, type DeleteTarget } from "@/components/admin/services/delete-dialog"

const PAGE_SIZE = 6

const iconMap = {
  snowflake: Snowflake,
  droplets: Droplets,
  utensils: Utensils,
  house: House,
  tv: Tv,
}

const toneMap: Record<Category["tone"], string> = {
  cyan: "bg-cyan-50 text-cyan-600",
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-purple-50 text-purple-600",
}

export function ServiceCatalog() {
  const [cats, setCats] = useState(initialCategories)
  const [devs, setDevs] = useState(initialDevices)
  const [selected, setSelected] = useState<string>("cooling")
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)

  const selectedCat = cats.find((c) => c.id === selected)
  const [pending, setPending] = useState<{ target: PauseTarget; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState<{ target: DeleteTarget; id: string; name: string } | null>(null)

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return devs.filter((d) => {
      const okCat = selected === "all" || d.categoryId === selected
      const okStatus =
        status === "all" || (status === "active" ? d.active : !d.active)
      const okKey = !k || d.name.toLowerCase().includes(k) || d.desc.toLowerCase().includes(k)
      return okCat && okStatus && okKey
    })
  }, [devs, selected, status, keyword])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  function selectCategory(id: string) {
    setSelected(id)
    setPage(1)
  }

  function toggleCategory(id: string, v: boolean) {
    if (!v) {
      const c = cats.find((x) => x.id === id)
      if (c) setPending({ target: "category", id, name: c.name })
      return
    }
    setCats((list) => list.map((c) => (c.id === id ? { ...c, active: true } : c)))
  }


  function toggleDevice(id: string, v: boolean) {
    if (!v) {
      const d = devs.find((x) => x.id === id)
      if (d) setPending({ target: "device", id, name: d.name })
      return
    }
    setDevs((list) => list.map((d) => (d.id === id ? { ...d, active: true } : d)))
  }

  function confirmPause(data: { reason: string; note: string }) {
    if (!pending) return

    // TODO: gọi API tạm ngưng, gửi kèm data.reason và data.note
    console.log("Tạm ngưng", pending, data)

    if (pending.target === "category") {
      setCats((list) => list.map((c) => (c.id === pending.id ? { ...c, active: false } : c)))
    } else {
      setDevs((list) => list.map((d) => (d.id === pending.id ? { ...d, active: false } : d)))
    }
    setPending(null)
  }

  function askDeleteCategory(id: string) {
  const c = cats.find((x) => x.id === id)
  if (c) setDeleting({ target: "category", id, name: c.name })
}

function askDeleteDevice(id: string) {
  const d = devs.find((x) => x.id === id)
  if (d) setDeleting({ target: "device", id, name: d.name })
}

function confirmDelete() {
  if (!deleting) return

  // TODO: gọi API xóa (DELETE), thành công mới cập nhật giao diện
  console.log("Xóa", deleting)

  if (deleting.target === "category") {
    setCats((list) => list.filter((c) => c.id !== deleting.id))
    setDevs((list) => list.filter((d) => d.categoryId !== deleting.id))
    if (selected === deleting.id) {
      setSelected("all")
      setPage(1)
    }
  } else {
    setDevs((list) => list.filter((d) => d.id !== deleting.id))
  }
  setDeleting(null)
}

  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? ""

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
      {/* Cột trái: phân loại danh mục */}
      <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold tracking-wider text-muted">
            PHÂN LOẠI DANH MỤC
          </h3>
          <span className="rounded bg-field px-2 py-0.5 text-[10px] font-semibold text-body">
            {cats.length} nhóm
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

          {cats.map((c) => {
            const Icon = iconMap[c.icon]
            const active = selected === c.id
            return (
              <div
                key={c.id}
                onClick={() => selectCategory(c.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 shadow-sm transition ${
                  active ? "border-cta bg-orange-50/40" : "border-line bg-white hover:bg-field/60"
                }`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${toneMap[c.tone]}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                    <span className="truncate">{c.name}</span>
                    {active && <span className="size-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <div className={`text-[11px] ${active ? "text-cta" : "text-muted"}`}>{c.subtitle}</div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Toggle checked={c.active} onChange={(v) => toggleCategory(c.id, v)} label={`Bật nhóm ${c.name}`} />
                  <Link
                      href={`/admin/services/categories/${c.id}/edit`}
                      className="text-muted hover:text-ink"
                      aria-label="Sửa nhóm"
                  >
                      <Pencil className="size-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => askDeleteCategory(c.id)}
                    className="text-muted hover:text-red-500"
                    aria-label={`Xóa nhóm ${c.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}

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
              placeholder="Tìm kiếm loại thiết bị, mã thiết bị, dịch vụ..."
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
                    <div className="text-[11px] text-muted">{d.desc}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                      {catName(d.categoryId)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${d.active ? "text-emerald-600" : "text-muted"}`}>
                        <span className={`size-1.5 rounded-full ${d.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                        {d.active ? "Áp dụng" : "Tạm dừng"}
                      </span>
                      <Toggle checked={d.active} onChange={(v) => toggleDevice(d.id, v)} label={`Bật ${d.name}`} />
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
                        onClick={() => askDeleteDevice(d.id)}
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
            href={`/admin/services/new?category=${selected}`}
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
          runningOrders={5} // TODO: lấy từ API
          affectedCount={
            pending.target === "category"
              ? devs.filter((d) => d.categoryId === pending.id).length
              : 12 // TODO: lấy từ API
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
              ? devs.filter((d) => d.categoryId === deleting.id).length
              : 0
          }
          runningOrders={0} // TODO: lấy từ API. Đổi thử thành 3 để xem trạng thái bị chặn
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}