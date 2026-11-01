"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, LogOut } from "lucide-react"
import { adminMenu } from "@/lib/admin/menu"
import { LogoutButton } from "@/components/shared/logout-button"
const badgeTone = {
  orange: "bg-cta text-white",
  amber: "bg-amber-400/20 text-amber-300",
  red: "bg-red-500/20 text-red-300",
}

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy text-slate-300 md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-cta text-white">
          <Briefcase className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-white">
            FixHome <span className="text-cta">Admin</span>
          </div>
          <div className="text-[8px] tracking-widest text-slate-400"></div>
        </div>
      </div>

      <nav className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        {adminMenu.map((section) => (
          <div key={section.group}>
            <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-500">
              {section.group}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition ${
                      active
                        ? "bg-blue-500/20 text-white ring-1 ring-blue-400/30"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`size-4 ${active ? "text-blue-300" : ""}`} />
                    <span className="flex-1">{item.title}</span>
                    {"badge" in item && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${badgeTone[item.badgeTone]}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-amber-700 text-xs font-semibold text-white">
            NT
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">Nguyễn Minh Tuấn</div>
            <div className="text-[11px] text-slate-400">Quản trị viên</div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}