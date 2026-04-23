export type Department = {
  id: number
  slug: string
  name: string
  icon: string
  sort_order: number
  is_active: boolean
  open_time: string | null
  close_time: string | null
}

export type Category = {
  id: number
  department_id: number
  name: string
  sort_order: number
  is_active: boolean
}

export type MenuItem = {
  id: number
  category_id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
}

export type Order = {
  id: number
  user_id: number
  location_id: number
  order_type: 'delivery' | 'pickup'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  total: number
  delivery_address: string | null
  delivery_lat: number | null
  delivery_lng: number | null
  comment: string | null
  clopos_order_id: string | null
  created_at: string
}

export type OrderItem = {
  id: number
  order_id: number
  menu_item_id: number
  name: string
  price: number
  quantity: number
}

export type Location = {
  id: number
  name: string
  address: string
  is_active: boolean
  sort_order: number
}

export type CartItem = MenuItem & { quantity: number }

export type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}
