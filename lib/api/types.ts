export type Category = {
  id: number
  code: string
  name: string
  description: string | null
  icon_url: string | null
  is_active: boolean
}

export type DeviceType = {
  id: number
  category_id: number
  code: string
  name: string
  is_active: boolean
}

export type ApiCustomer = {
  id: number
  full_name: string
  email: string
  phone: string
  status: string
  roles: string[]
  permissions: string[]
  created_at: string
}

export type Paginated<T> = {
  items: T[]
  page: number
  page_size: number
  total_items: number
  total_pages: number
}