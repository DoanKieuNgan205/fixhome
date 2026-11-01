import {
  BarChart3, ClipboardList, Headphones, LayoutDashboard,
  MapPin, ShieldCheck, Users, Wallet,
} from "lucide-react"

export const operatorMenu = [
  { title: "Tổng quan", href: "/operator", icon: LayoutDashboard },
  { title: "Tiếp nhận & Đơn hàng", href: "/operator/orders", icon: ClipboardList, hasChildren: true },
  { title: "Điều phối KTV", href: "/operator/dispatch", icon: MapPin, badge: 4, hasChildren: true },
  { title: "Quản lý KTV", href: "/operator/technicians", icon: Users, badge: 5, hasChildren: true },
  { title: "Thu tiền", href: "/operator/payments", icon: Wallet, hasChildren: true },
  { title: "Chăm sóc KH", href: "/operator/support", icon: Headphones, badge: 7, hasChildren: true },
  { title: "Bảo hành", href: "/operator/warranty", icon: ShieldCheck, badge: 2, hasChildren: true },
  { title: "Giám sát & Báo cáo", href: "/operator/reports", icon: BarChart3, hasChildren: true },
]