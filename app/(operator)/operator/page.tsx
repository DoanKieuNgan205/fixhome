import {
  AlertTriangle, ArrowRight, FileText, Headphones, ShieldCheck, Star,
} from "lucide-react"
import { DispatchRequestList } from "@/components/operator/dispatch/dispatch-request-list"
import { getManualQueue } from "@/lib/api/operator-orders-read"
import type { QueueOrder } from "@/lib/operator/repair-order-mappers"
import { onlineTechnicians, requests, stats } from "@/lib/operator/mock-dashboard"

const statStyle = {
  red: { box: "bg-red-50 border-red-100", icon: "bg-red-100 text-red-500", value: "text-red-600", Icon: AlertTriangle },
  blue: { box: "bg-blue-50 border-blue-100", icon: "bg-blue-100 text-blue-500", value: "text-ink", Icon: FileText },
  purple: { box: "bg-purple-50 border-purple-100", icon: "bg-purple-100 text-purple-500", value: "text-ink", Icon: Headphones },
  green: { box: "bg-green-50 border-green-100", icon: "bg-green-100 text-green-600", value: "text-ink", Icon: ShieldCheck },
}

const techTone = {
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
}

// Chuyển dữ liệu mẫu cũ sang dạng QueueOrder để xem giao diện (?demo=1)
function demoData() {
  const processing: number[] = []
  const orders: QueueOrder[] = requests.map((r, i) => {
    const id = Number(String(r.id).replace(/\D/g, "")) * 10 + i // mã mẫu bị trùng nên cộng thêm i
    if (r.state !== "unhandled") processing.push(id)
    return {
      id,
      code: r.id,
      title: r.title,
      customerName: r.customer,
      customerPhone: null,
      address: null,
      area: r.area,
      createdAt: new Date(Date.now() - r.waitMinutes * 60_000).toISOString(),
      expiresAt: null,
      priority: r.note && /gấp/i.test(r.note) ? "URGENT" : null,
      estimate: r.estimate ? Number(String(r.estimate).replace(/\D/g, "")) : null,
      raw: {},
    }
  })
  return { orders, processing }
}

export default async function OperatorOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  const isDemo = demo === "1"

  const queue = isDemo ? null : await getManualQueue(1, 5).catch(() => null)
  const sample = isDemo ? demoData() : null
  const failed = !isDemo && queue === null

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => {
          const st = statStyle[s.tone]
          // Thẻ "Đơn ngoại lệ" lấy số thật từ hàng chờ gán thợ
          const value = i === 0 && queue ? queue.total : s.value
          return (
            <div key={s.label} className={`relative rounded-xl border p-4 ${st.box}`}>
              <ArrowRight className="absolute right-4 top-4 size-4 text-slate-300" />
              <div className={`flex size-8 items-center justify-center rounded-lg ${st.icon}`}>
                <st.Icon className="size-4" />
              </div>
              <div className={`mt-3 text-2xl font-bold ${st.value}`}>{value}</div>
              <div className="text-xs text-body">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {failed && (
            <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              Không tải được danh sách yêu cầu tìm thợ. Vui lòng tải lại trang.
            </p>
          )}
          <DispatchRequestList
            orders={isDemo ? sample!.orders : (queue?.items ?? [])}
            total={queue?.total}
            demo={isDemo}
            initialProcessing={sample?.processing}
          />
        </div>

        {/* TODO: chưa có API danh sách thợ đang online, tạm giữ dữ liệu mẫu */}
        <aside className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-semibold text-body">
              <span className="size-2 rounded-full bg-green-500" /> THỢ ĐANG ONLINE
            </span>
            <button className="font-semibold text-cta">Xem tất cả</button>
          </div>

          <ul className="mt-3 space-y-2">
            {onlineTechnicians.map((t) => (
              <li key={t.name} className="flex items-center gap-2.5 rounded-lg bg-field/60 p-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-300 text-[11px] font-semibold text-white">
                  {t.name.split(" ").slice(-2).map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[13px] font-semibold text-ink">
                    <span className="truncate">{t.name}</span>
                    <span className="flex items-center text-[11px] text-amber-500">
                      <Star className="size-3 fill-current" />
                      {t.rating}
                    </span>
                  </div>
                  <div className="truncate text-[11px] text-muted">{t.info}</div>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${techTone[t.tone]}`}>
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}