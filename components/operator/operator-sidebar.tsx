"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, ChevronDown, LogOut, Plus } from "lucide-react"
import { operatorMenu } from "@/lib/operator/menu"
import { LogoutButton } from "@/components/shared/logout-button"
export function OperatorSidebar() {
  const pathname = usePathname()

  const technicianActive =
    pathname.startsWith("/operator/technicians") ||
    pathname.startsWith("/operator/technician-approvals") ||
    pathname.startsWith("/operator/technician-violations")

  const [technicianOpen, setTechnicianOpen] = useState<boolean | null>(null)

  const isTechnicianOpen = technicianOpen ?? technicianActive


  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-navy text-slate-300 md:flex">

      {/* LOGO */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-cta text-white">
          <Briefcase className="size-5" />
        </div>

        <div className="leading-tight">
          <div className="font-bold text-white">FixHome</div>
        </div>
      </div>

      {/* BUTTON TẠO ĐƠN */}
      <div className="px-4">
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-semibold text-white transition hover:brightness-95">
          <Plus className="size-4" />
          Tạo đơn hộ khách
        </button>
      </div>

      {/* MENU */}
      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3">

        {operatorMenu.map((item) => {

          // MENU QUẢN LÝ KTV CÓ MENU CON
          if ("children" in item && item.children?.length) {
            return (
              <div key={item.href}>

                <button
                  onClick={() =>
                    setTechnicianOpen(!isTechnicianOpen)
                  }
                  className={`flex w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-left text-[13px] transition ${
                    technicianActive
                      ? "border-cta bg-white/10 text-white"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    className={`size-4 ${
                      technicianActive ? "text-cta" : ""
                    }`}
                  />

                  <span className="flex-1">
                    {item.title}
                  </span>

                  {"badge" in item && item.badge && (
                    <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}

                  <ChevronDown
                    className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                      isTechnicianOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DANH SÁCH MENU CON */}
                <div
                  className={`grid transition-all duration-200 ${
                    isTechnicianOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">

                      {item.children.map((child) => {
                        const childActive =
                          pathname === child.href ||
                          (child.href !== "/operator/technicians" &&
                            pathname.startsWith(child.href + "/"))

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-md px-3 py-2 text-xs transition ${
                              childActive
                                ? "bg-cta/15 font-semibold text-orange-400"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {child.title}
                          </Link>
                        )
                      })}

                    </div>
                  </div>
                </div>

              </div>
            )
          }

          // CÁC MENU KHÁC
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
              <item.icon
                className={`size-4 ${active ? "text-cta" : ""}`}
              />

              <span className="flex-1">
                {item.title}
              </span>

              {"badge" in item && item.badge && (
                <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              )}

              {"hasChildren" in item && item.hasChildren && (
                <ChevronDown className="size-3.5 text-slate-500" />
              )}
            </Link>
          )
        })}

      </nav>

      {/* THÔNG TIN NHÂN VIÊN */}
      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-cta text-sm font-semibold text-white">
          Đ
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">
            Trần Minh Đức
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span className="size-1.5 rounded-full bg-green-400" />
            Nhân viên vận hành
          </div>
        </div>

        <LogoutButton />
      </div>

    </aside>
  )
}