import { CategoryCreateForm } from "@/components/admin/services/category-create-form"

export default function NewCategoryPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Thêm nhóm danh mục mới</h1>
      <CategoryCreateForm />
    </>
  )
}