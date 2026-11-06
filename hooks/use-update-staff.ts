"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { updateStaff, StaffApiError } from "@/lib/api/staff/client"
import type { UpdateStaffRequest } from "@/lib/validations/staff"

export function useUpdateStaff(id: string, onUpdated: () => void, onPendingChange: (pending: boolean) => void) {
  const router = useRouter()
  const submitting = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function submit(values: UpdateStaffRequest) {
    if (submitting.current) return
    submitting.current = true
    setIsSubmitting(true)
    onPendingChange(true)
    setError("")
    try {
      await updateStaff(id, values)
      onUpdated()
    } catch (error) {
      if (error instanceof StaffApiError && error.status === 401) router.replace("/login")
      setError(error instanceof Error ? error.message : "Không thể cập nhật nhân viên. Vui lòng thử lại.")
    } finally {
      submitting.current = false
      setIsSubmitting(false)
      onPendingChange(false)
    }
  }

  return { submit, isSubmitting, error }
}
