
import type { Metadata } from "next"
import { Suspense } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { TooltipProvider } from "@/components/ui/tooltip"

const font = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"] })

export const metadata: Metadata = {
  title: "FixHome - Quản trị",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <TooltipProvider>
    <div className={`${font.className} flex min-h-screen bg-field/50`}>
      <Suspense fallback={
        <aside aria-hidden="true" className="sticky top-0 hidden h-screen w-64 shrink-0 bg-navy md:block" />
      }>
        <AdminSidebar />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={
          <header aria-hidden="true" className="sticky top-0 z-10 h-14 shrink-0 border-b border-line bg-white" />
        }>
          <AdminHeader />
        </Suspense>

        <main className="flex-1 space-y-5 p-6">
          {children}
        </main>
      </div>
    </div>
  </TooltipProvider>
  )
}
