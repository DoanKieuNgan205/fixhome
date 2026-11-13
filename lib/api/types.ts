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

export type ApiTechnician = {
  id: number
  account_id: number
  full_name: string
  email: string | null
  phone: string | null
  status: string
  verification_status: string
  verification_rejection_reason: string | null
  is_available: boolean
  updated_at: string
  profile?: {
    id: number
    account_id: number
    avatar_url: string | null
    date_of_birth: string | null
    gender: string | null
    citizen_id: string | null
    current_address: string | null
    current_ward_code: string | null
    emergency_contact_name: string | null
    emergency_contact_relationship: string | null
    emergency_contact_phone: string | null
    verification_status: string
    verification_rejection_reason: string | null
    is_available: boolean
    verified_at: string | null
    identity_media: { id: number; media_url: string; media_type: string }[]
  }
}