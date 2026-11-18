// app/api/admin/orders/export/route.ts
import { filterOrders } from "@/lib/admin/orders-read"
import { CASH_LABEL, STATUS_LABEL, dmy, hm, type OrderStatus } from "@/lib/admin/order-types"

const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams
  const status = u.get("status") as OrderStatus | null
  const rows = filterOrders({
    q: u.get("q") ?? undefined,
    status: status && status in STATUS_LABEL ? status : undefined,
    area: u.get("area") ?? undefined,
    from: u.get("from") ?? undefined,
    to: u.get("to") ?? undefined,
  })
  const head = ["Mã đơn", "Khách hàng", "SĐT", "Dịch vụ", "KTV phụ trách", "Ngày hẹn", "Trạng thái", "Tổng tiền", "Thu tiền mặt"]
  const lines = rows.map((o) =>
    [o.code, o.customer.name, o.customer.phone, o.service, o.technician?.name ?? "", `${hm(o.scheduledAt)} ${dmy(o.scheduledAt)}`,
      STATUS_LABEL[o.status], o.finalPrice ?? "", CASH_LABEL[o.cash]].map(esc).join(","),
  )
  const csv = "﻿" + [head.map(esc).join(","), ...lines].join("\r\n")
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="don-hang.csv"',
    },
  })
}