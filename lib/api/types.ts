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
  //created_at: string
  created_at?: string
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

export type ReviewDecision = "APPROVE" | "REJECT"

// Phần tử của GET /operator/technician-specialties và response của PATCH .../review
export type ApiTechnicianSpecialty = {
  id: number
  technician_id: number
  category_id: number
  experience_level: string
  accept_all_devices: boolean
  status: string
  rejection_reason: string | null
  device_type_ids: number[]
  evidence_urls: string[]
  created_at: string
  reviewed_at: string | null
}