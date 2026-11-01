import { MapPin, UserCheck } from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { areas, kpis, topTechnicians } from "@/lib/admin/mock-dashboard"

const avatarTone = {
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-600",
}

function rateStyle(rate: number) {
  if (rate >= 90) return { text: "text-emerald-600", bar: "bg-emerald-500", online: "text-emerald-600", dot: "bg-emerald-500" }
  if (rate >= 80) return { text: "text-ink", bar: "bg-amber-400", online: "text-amber-600", dot: "bg-amber-400" }
  return { text: "text-rose-600", bar: "bg-rose-500", online: "text-rose-600", dot: "bg-rose-500" }
}

export default function AdminOverviewPage() {
  return (
    <>
      {/* 3 thẻ số liệu */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-muted">{k.label}</span>
              {k.badge === "Live" ? (
                <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Live
                </span>
              ) : (
                <span className="rounded bg-field px-2 py-0.5 text-[10px] text-muted">{k.badge}</span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-ink">{k.value}</span>
              {k.sub && <span className="text-xs text-muted">{k.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 thợ + biểu đồ */}
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 border-b border-line pb-3 text-sm font-semibold text-ink">
            <span className="flex size-7 items-center justify-center rounded-md bg-orange-50 text-cta">
              <UserCheck className="size-4" />
            </span>
            Top 3 thợ doanh thu cao nhất trong tháng
          </h3>
          <ul className="mt-3 space-y-3">
            {topTechnicians.map((t) => (
              <li key={t.name} className="flex items-center gap-3 rounded-lg border border-line/60 p-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarTone[t.tone]}`}>
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink">{t.name}</span>
                    <span className="rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600">
                      {t.revenue}
                    </span>
                  </div>
                  <div className="mt-1 text-muted">
                    Chuyên môn: <span className="text-body">{t.skill}</span>
                  </div>
                  <div className="text-muted">Khu vực: {t.area}</div>
                </div>
                <button className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-field">
                  Xem chi tiết
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Doanh thu &amp; số đơn</h3>
              <p className="text-[11px] text-muted">Tháng này (Kỳ hiện tại)</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-body">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#1e3a5f]" /> Doanh thu (triệu đ)</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-cta" /> Số đơn</span>
            </div>
          </div>
          <div className="mt-4">
            <RevenueChart />
          </div>
        </section>
      </div>

      {/* Bảng khu vực */}
      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <h3 className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold text-ink">
          <span className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <MapPin className="size-4" />
          </span>
          Danh sách khu vực hoạt động
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-field/60 text-[11px] uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Mã / Khu vực</th>
                <th className="px-5 py-3 font-semibold">Quận / Huyện &amp; Tỉnh thành</th>
                <th className="px-5 py-3 font-semibold">Số lượng KTV hoạt động</th>
                <th className="px-5 py-3 font-semibold">Tỷ lệ đáp ứng đơn</th>
                <th className="px-5 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {areas.map((a) => {
                const s = rateStyle(a.rate)
                return (
                  <tr key={a.code}>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <span className={`size-2 rounded-full ${s.dot}`} /> {a.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-ink">{a.name}</td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-semibold text-ink">{a.techs} KTV</div>
                      <div className={s.online}>(Đang online: {a.online})</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-12 text-xs font-bold ${s.text}`}>{a.rate.toFixed(1)}%</span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-field">
                          <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${a.rate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-field">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}