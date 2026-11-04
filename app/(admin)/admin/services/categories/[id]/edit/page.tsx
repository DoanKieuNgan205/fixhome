import { FormSkeleton } from "@/components/shared/skeletons"
/*import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CategoryEditForm } from "@/components/admin/services/category-edit-form"
import { categories } from "@/lib/admin/mock-services"

async function EditCategoryContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = categories.find((c) => c.id === id)
  if (!category) notFound()
  return <CategoryEditForm category={category} />
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Chỉnh sửa thông tin danh mục</h1>
      <Suspense fallback={null}>
        <EditCategoryContent params={params} />
      </Suspense>
    </>
  )
}*/

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CategoryEditForm } from "@/components/admin/services/category-edit-form"
import { getCategory } from "@/lib/api/catalog-read"

async function EditCategoryContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()

  let category
  try {
    category = await getCategory(Number(id))
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") notFound()
    throw e
  }
  return <CategoryEditForm category={category} />
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Chỉnh sửa thông tin danh mục</h1>
      <Suspense fallback={<FormSkeleton />}>
        <EditCategoryContent params={params} />
      </Suspense>
    </>
  )
}