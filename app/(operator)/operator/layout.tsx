import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { OperatorSidebar } from "@/components/operator/operator-sidebar"
import { OperatorHeader } from "@/components/operator/operator-header"

const font = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"] })

export const metadata: Metadata = {
  title: "FixHome - Điều phối",
  robots: { index: false, follow: false },
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${font.className} flex min-h-screen bg-field/50`}>
      <OperatorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OperatorHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}