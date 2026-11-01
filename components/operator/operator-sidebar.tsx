"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, ChevronDown, LogOut, Plus } from "lucide-react"
import { operatorMenu } from "@/lib/operator/menu"
import { LogoutButton } from "@/components/shared/logout-button"
export function OperatorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-navy text-slate-300 md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-cta text-white">
          <Briefcase className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-white">FixHome</div>
          <div className="text-[9px] tracking-widest text-slate-400"></div>
        </div>
      </div>

      <div className="px-4">
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-semibold text-white transition hover:brightness-95">
          <Plus className="size-4" /> Tạo đơn hộ khách
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3">
        {operatorMenu.map((item) => {
          const active =
            item.href === "/operator"
              ? pathname === "/operator"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-[13px] transition ${
                active
                  ? "border-cta bg-white/10 text-white"
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              <item.icon className={`size-4 ${active ? "text-cta" : ""}`} />
              <span className="flex-1">{item.title}</span>
              {"badge" in item && item.badge && (
                <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              )}
              {item.hasChildren && <ChevronDown className="size-3.5 text-slate-500" />}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-cta text-sm font-semibold text-white">
          Đ
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">Trần Minh Đức</div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span className="size-1.5 rounded-full bg-green-400" /> Nhân viên vận hành
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}