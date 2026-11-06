import type { Operator } from "@/lib/admin/operators"

export type OperatorTab = "all" | "Active" | "suspended"
export type OperatorAction = { type: "view" | "edit" | "lock" | "reset"; operator: Operator } | { type: "create" }
export type OperatorManagementOptions = { initialMode?: "create" | "edit"; initialOperator?: Operator }

export type OperatorFiltersState = {
  keyword: string
}
