import { Suspense } from "react"
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
}