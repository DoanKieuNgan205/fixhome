/*"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }

  return (
    <button onClick={logout} aria-label="Đăng xuất" className="text-slate-400 hover:text-white">
      <LogOut className="size-4" />
    </button>
  )
}*/


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  /*async function logout() {
    if (loading) return

    setLoading(true)

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Logout failed")
      }

      router.replace("/login")
      router.refresh()
    } catch (error) {
      console.error("Lỗi đăng xuất:", error)
      alert("Đăng xuất thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }*/
 async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      window.location.href = "/login"
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      aria-label="Đăng xuất"
      className="text-slate-400 hover:text-white disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
    </button>
  )
}
