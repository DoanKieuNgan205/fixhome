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