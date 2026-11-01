import {
  AlertTriangle, ArrowRight, Clock, FileText,
  Headphones, MapPin, ShieldCheck, Star,
} from "lucide-react"
import { onlineTechnicians, requests, stats, type RequestItem } from "@/lib/operator/mock-dashboard"

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

function RequestCard({ r }: { r: RequestItem }) {
  return (
    <article className="rounded-lg border border-line border-l-4 border-l-red-400 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 font-medium text-red-600">
            <span className="size-1.5 rounded-full bg-red-500" /> Chưa có thợ nhận
          </span>
          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-red-600">
            <Clock className="size-3" /> Chờ {r.waitMinutes} phút
          </span>
        </div>
        <span className="font-medium text-muted">{r.id}</span>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">
            {r.title}
            {r.note && <span className="ml-2 text-xs font-normal text-red-500">({r.note})</span>}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <MapPin className="size-3" /> {r.area}
            <span>• Khách: <b className="text-ink">{r.customer}</b></span>
          </p>
          {r.estimate && (
            <p className="mt-1 text-xs text-muted">
              • Dự kiến: <b className="text-cta">{r.estimate}</b>
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-field">
            Xem chi tiết
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95 ${
              r.state === "unhandled" ? "bg-cta" : "bg-emerald-400"
            }`}
          >
            {r.state === "unhandled" ? "Chưa xử lý" : "Đang xử lý"}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function OperatorOverviewPage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const st = statStyle[s.tone]
          return (
            <div key={s.label} className={`relative rounded-xl border p-4 ${st.box}`}>
              <ArrowRight className="absolute right-4 top-4 size-4 text-slate-300" />
              <div className={`flex size-8 items-center justify-center rounded-lg ${st.icon}`}>
                <st.Icon className="size-4" />
              </div>
              <div className={`mt-3 text-2xl font-bold ${st.value}`}>{s.value}</div>
              <div className="text-xs text-body">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <section className="space-y-3">
          <h2 className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">
            Danh sách yêu cầu tìm thợ
          </h2>
          {requests.map((r, i) => (
            <RequestCard key={`${r.id}-${i}`} r={r} />
          ))}
        </section>

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