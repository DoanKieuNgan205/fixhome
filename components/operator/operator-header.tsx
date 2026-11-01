"use client"

import { usePathname } from "next/navigation"
import { Bell, RefreshCw } from "lucide-react"
import { LangToggle } from "@/components/shared/lang-toggle"
import { operatorMenu } from "@/lib/operator/menu"

export function OperatorHeader() {
  const pathname = usePathname()
  const current = [...operatorMenu].reverse().find((m) => pathname.startsWith(m.href))

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-white px-6">
      <h2 className="text-sm font-semibold text-ink">{current?.title ?? "Điều phối"}</h2>
      <div className="flex items-center gap-2.5">
        <button
          className="rounded-lg border border-line p-2 text-muted transition hover:bg-field"
          aria-label="Làm mới"
        >
          <RefreshCw className="size-4" />
        </button>
        <button
          className="relative rounded-lg border border-line p-2 text-muted transition hover:bg-field"
          aria-label="Thông báo"
        >
          <Bell className="size-4" />
          <span className="absolute -right-1 -top-1 rounded-full bg-cta px-1 text-[10px] font-semibold text-white">
            4
          </span>
        </button>
        <LangToggle />
      </div>
    </header>
  )
}