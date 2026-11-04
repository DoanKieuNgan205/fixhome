# Skeleton dùng chung

Import từ `@/components/shared/skeletons`. Tất cả mẫu dùng cùng màu và animation
trong `components/ui/skeleton.tsx`, hỗ trợ `prefers-reduced-motion` và nhãn đọc màn hình.

| Component | Cách dùng |
| --- | --- |
| `PageSkeleton` | Fallback cho trang; `variant`: `list`, `detail`, `catalog`, `content` |
| `StatsSkeleton` | Nhóm thẻ thống kê; `count`: 2, 3 hoặc 4 |
| `TableSkeleton` | Toàn bảng, toolbar và phân trang; `rows`, `columns`, `avatar` |
| `TableRowsSkeleton` | Các dòng placeholder bên trong `tbody`; `rows`, `columns`, `avatar` |
| `FormSkeleton` | Form đang lấy dữ liệu; `fields`, `label` |
| `SkeletonRegion` | Bọc skeleton tự thiết kế, cung cấp `role="status"` và `label` |

Server Component:

```tsx
<Suspense fallback={<PageSkeleton variant="catalog" />}>
  <CatalogContent />
</Suspense>
```

Client Component:

```tsx
<div aria-busy={isLoading}>
  {isLoading && <span role="status" className="sr-only">Đang tải danh sách…</span>}
  <table>
    <tbody>
      {isLoading ? <TableRowsSkeleton columns={7} avatar /> : rows.map(renderRow)}
    </tbody>
  </table>
</div>
```

`app/loading.tsx` là fallback chung; các khu vực admin và operator có fallback riêng.
Với fetch phía client, vẫn cần dùng `isLoading` vì `loading.tsx` không chờ `useEffect`.
Chỉ hiện skeleton lúc tải dữ liệu; dữ liệu rỗng và lỗi dùng giao diện riêng.
Các thao tác lưu, đăng nhập, đăng xuất giữ trạng thái tiến trình trên nút.
