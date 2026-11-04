"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStaffRoles, StaffApiError } from "@/lib/api/staff/client"
import type { StaffRole } from "@/lib/api/staff/types"

type RolesState = { revision: number; roles: StaffRole[]; error?: string }

export function useStaffRoles() {
  const router = useRouter()
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<RolesState | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getStaffRoles(controller.signal).then((roles) => {
      if (!controller.signal.aborted) setState({ revision, roles })
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      if (error instanceof StaffApiError && error.status === 401) router.replace("/login")
      setState({ revision, roles: [], error: error instanceof Error ? error.message : "Không thể tải vai trò. Vui lòng thử lại." })
    })
    return () => controller.abort()
  }, [revision, router])

  const current = state?.revision === revision ? state : null
  return {
    roles: current?.roles ?? [],
    isLoading: current === null,
    error: current?.error,
    retry: () => setRevision((value) => value + 1),
  }
}
