"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createStaff, StaffApiError } from "@/lib/api/staff/client"
import type { Staff } from "@/lib/api/staff/types"
import type { CreateStaffRequest } from "@/lib/validations/staff"

export function useCreateStaff(onCreated: (staff: Staff) => void, onPendingChange: (pending: boolean) => void) {
  const router = useRouter()
  const submitting = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function submit(values: CreateStaffRequest) {
    if (submitting.current) return
    submitting.current = true
    setIsSubmitting(true)
    onPendingChange(true)
    setError("")
    try {
      const staff = await createStaff(values)
      onCreated(staff)
    } catch (error) {
      if (error instanceof StaffApiError && error.status === 401) router.replace("/login")
      setError(error instanceof Error ? error.message : "Không thể tạo nhân viên. Vui lòng thử lại.")
    } finally {
      submitting.current = false
      setIsSubmitting(false)
      onPendingChange(false)
    }
  }

  return { submit, isSubmitting, error }
}
