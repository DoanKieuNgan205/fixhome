
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { LanguageProvider } from "@/lib/i18n/language-provider"
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
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 space-y-5 p-6">
          {children}
        </main>
      </div>
    </div>
  </TooltipProvider>
  )
}
