// ============================================================
// GLAM.CO — Shared TypeScript Types
// ============================================================

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'artist'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered'

export type ProductLabel = 'artist_pick' | 'new' | 'sale'

export type Genre =
  | 'wedding'
  | 'glam'
  | 'drag'
  | 'editorial'
  | 'natural'
  | 'sfx'
  | 'avant-garde'
  | 'quinceanera'
  | 'bridal'
  | 'prom'

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  location: string | null
  created_at: string
}

export interface ArtistProfile {
  id: string
  profile_id: string
  bio: string | null
  genres: Genre[]
  hourly_rate: number
  session_rate: number
  stripe_account_id: string | null
  stripe_onboarded: boolean
  instagram_url: string | null
  avg_rating: number
  total_reviews: number
  total_bookings: number
  follower_count: number
  post_count: number
  created_at: string
  // Joined relation — available when queried with profile data
  profile?: Profile
}

export interface PortfolioImage {
  id: string
  artist_id: string
  url: string
  caption: string | null
  genre: Genre | null
  sort_order: number
  created_at: string
}

export interface ArtistAvailability {
  id: string
  artist_id: string
  /** 0 = Sunday, 6 = Saturday */
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6
  start_time: string // HH:MM:SS
  end_time: string   // HH:MM:SS
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface Booking {
  id: string
  client_id: string | null
  artist_id: string | null
  service_type: string
  date: string           // YYYY-MM-DD
  start_time: string | null
  location: string
  notes: string | null
  status: BookingStatus
  subtotal: number
  platform_fee: number
  total: number
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  created_at: string
  // Joined relations
  client?: Profile
  artist?: ArtistProfile & { profile: Profile }
}

export interface CreateBookingPayload {
  artist_id: string
  service_type: string
  date: string
  location: string
  notes?: string
  subtotal: number
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  booking_id: string
  client_id: string | null
  artist_id: string
  rating: 1 | 2 | 3 | 4 | 5
  body: string | null
  created_at: string
  // Joined relations
  client?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

// ─── Products & Orders ────────────────────────────────────────────────────────

export interface Product {
  id: string
  artist_id: string
  name: string
  brand: string
  description: string | null
  price: number
  sale_price: number | null
  image_url: string | null
  label: ProductLabel
  in_stock: boolean
  created_at: string
  // Joined relation
  artist?: Pick<ArtistProfile, 'id'> & { profile: Pick<Profile, 'full_name'> }
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  user_id: string | null
  subtotal: number
  total: number
  stripe_payment_intent_id: string | null
  status: OrderStatus
  created_at: string
  // Joined relation
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string   // snapshot at purchase time
  quantity: number
  unit_price: number
}

export interface CreateOrderPayload {
  items: Array<{ product_id: string; quantity: number; unit_price: number; product_name: string }>
  subtotal: number
  total: number
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export interface Favorite {
  user_id: string
  artist_id: string
  created_at: string
  artist?: ArtistProfile & { profile: Profile }
}

// ─── Social Features ──────────────────────────────────────────────────────────

export interface Post {
  id: string
  artist_id: string
  caption: string | null
  image_url: string
  genre: Genre | null
  likes_count: number
  comments_count: number
  created_at: string
  artist?: ArtistProfile & { profile: Profile }
  liked_by_me?: boolean
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
  user?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface KitProduct {
  id: string
  artist_id: string
  name: string
  brand: string
  description: string | null
  image_url: string | null
  affiliate_url: string
  price_display: string | null
  category: string | null
  is_favorite: boolean
  sort_order: number
  created_at: string
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface CreateBookingResponse {
  bookingId: string
  clientSecret: string
  total: number
}

export interface CreateOrderResponse {
  orderId: string
  clientSecret: string
  total: number
}

export interface ConnectOnboardingResponse {
  url: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface ArtistDashboardStats {
  totalEarnings: number
  pendingPayouts: number
  totalBookings: number
  avgRating: number
  totalReviews: number
}

export interface ClientDashboardStats {
  totalBookings: number
  upcomingBookings: number
  totalOrders: number
  totalSpent: number
}
