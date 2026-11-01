/*"use client"

import { Bell, RefreshCw } from "lucide-react"
import { LangToggle } from "@/components/shared/lang-toggle"

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-white px-6">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="flex items-center gap-2.5">
        <button className="rounded-lg border border-line p-2 text-muted transition hover:bg-field" aria-label="Làm mới">
          <RefreshCw className="size-4" />
        </button>
        <button className="relative rounded-lg border border-line p-2 text-muted transition hover:bg-field" aria-label="Thông báo">
          <Bell className="size-4" />
          <span className="absolute -right-1 -top-1 rounded-full bg-cta px-1 text-[10px] font-semibold text-white">4</span>
        </button>
        <LangToggle />
      </div>
    </header>
  )
}*/

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, RefreshCw } from "lucide-react"
import { LangToggle } from "@/components/shared/lang-toggle"
import { adminMenu } from "@/lib/admin/menu"

function capitalize(s: string) {
  const l = s.toLowerCase()
  return l.charAt(0).toUpperCase() + l.slice(1)
}

export function AdminHeader() {
  const pathname = usePathname()

  const found = adminMenu
    .flatMap((s) => s.items.map((item) => ({ group: s.group, item })))
    .reverse()
    .find((x) => pathname.startsWith(x.item.href))

  const isHome = pathname === "/admin"

  /*const subTitle = pathname.endsWith("/new")
    ? "Thêm thiết bị mới"
    : pathname.endsWith("/edit")
      ? "Chỉnh sửa thông tin thiết bị"
      : <null>*/
  
  const subTitle = pathname.endsWith("/categories/new")
  ? "Thêm nhóm danh mục mới"
  : pathname.includes("/categories/") && pathname.endsWith("/edit")
    ? "Chỉnh sửa thông tin danh mục"
    : pathname.endsWith("/new")
      ? "Thêm thiết bị mới"
      : pathname.endsWith("/edit")
        ? "Chỉnh sửa thông tin thiết bị"
        : null

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-white px-6">
      <div className="flex items-center gap-2 text-sm">
        {isHome && <span className="font-semibold text-ink">Tổng quan hệ thống</span>}

        {found && !isHome && (
          <>
            <span className="text-muted">{capitalize(found.group)} &gt;</span>
            {subTitle ? (
              <>
                <Link href={found.item.href} className="text-muted hover:text-ink">
                  {found.item.title}
                </Link>
                <span className="text-muted">&gt;</span>
                <span className="font-semibold text-ink">{subTitle}</span>
              </>
            ) : (
              <span className="font-semibold text-ink">{found.item.title}</span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button className="rounded-lg border border-line p-2 text-muted transition hover:bg-field" aria-label="Làm mới">
          <RefreshCw className="size-4" />
        </button>
        <button className="relative rounded-lg border border-line p-2 text-muted transition hover:bg-field" aria-label="Thông báo">
          <Bell className="size-4" />
          <span className="absolute -right-1 -top-1 rounded-full bg-cta px-1 text-[10px] font-semibold text-white">4</span>
        </button>
        <LangToggle />
      </div>
    </header>
  )
}