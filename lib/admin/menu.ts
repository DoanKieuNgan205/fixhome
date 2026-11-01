import {
  Banknote, ClipboardList, Gauge, Headset, LayoutGrid, Map,
  ScrollText, Settings, ShieldCheck, Tags, Users, Wallet, Workflow, Wrench,
} from "lucide-react"

export const adminMenu = [
  {
    group: "TỔNG QUAN",
    items: [{ title: "Tổng quan hệ thống", href: "/admin", icon: LayoutGrid }],
  },
  {
    group: "VẬN HÀNH",
    items: [
      { title: "Quản lý đơn hàng", href: "/admin/orders", icon: ClipboardList, badge: "38", badgeTone: "orange" },
      { title: "Danh mục dịch vụ", href: "/admin/services", icon: Tags },
      { title: "Khu vực hoạt động", href: "/admin/areas", icon: Map },
      { title: "Quy tắc phân công tự động", href: "/admin/dispatch-rules", icon: Workflow },
    ],
  },
  {
    group: "NGƯỜI DÙNG",
    items: [
      { title: "Khách hàng", href: "/admin/customers", icon: Users },
      { title: "Kỹ thuật viên", href: "/admin/technicians", icon: Wrench, badge: "5", badgeTone: "amber" },
      { title: "Nhân viên vận hành", href: "/admin/operators", icon: Headset },
      { title: "Phân quyền", href: "/admin/roles", icon: ShieldCheck },
    ],
  },
  {
    group: "TÀI CHÍNH",
    items: [
      { title: "Doanh thu & đối soát", href: "/admin/revenue", icon: Banknote },
      { title: "Công nợ KTV", href: "/admin/debts", icon: Wallet, badge: "28 CẦN NỘP", badgeTone: "red" },
      { title: "Hạn mức & chính sách", href: "/admin/policies", icon: Gauge },
    ],
  },
  {
    group: "HỆ THỐNG",
    items: [
      { title: "Cài đặt", href: "/admin/settings", icon: Settings },
      { title: "Nhật ký kiểm toán", href: "/admin/audit-logs", icon: ScrollText },
    ],
  },
] as const