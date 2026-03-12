export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'client' | 'artist'
          location: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'client' | 'artist'
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'client' | 'artist'
          location?: string | null
          created_at?: string
        }
      }
      artist_profiles: {
        Row: {
          id: string
          profile_id: string
          bio: string | null
          genres: string[]
          hourly_rate: number
          session_rate: number
          stripe_account_id: string | null
          stripe_onboarded: boolean
          instagram_url: string | null
          avg_rating: number
          total_reviews: number
          total_bookings: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          bio?: string | null
          genres?: string[]
          hourly_rate?: number
          session_rate?: number
          stripe_account_id?: string | null
          stripe_onboarded?: boolean
          instagram_url?: string | null
          avg_rating?: number
          total_reviews?: number
          total_bookings?: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          bio?: string | null
          genres?: string[]
          hourly_rate?: number
          session_rate?: number
          stripe_account_id?: string | null
          stripe_onboarded?: boolean
          instagram_url?: string | null
          avg_rating?: number
          total_reviews?: number
          total_bookings?: number
          created_at?: string
        }
      }
      portfolio_images: {
        Row: {
          id: string
          artist_id: string
          url: string
          caption: string | null
          genre: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          url: string
          caption?: string | null
          genre?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          url?: string
          caption?: string | null
          genre?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      artist_availability: {
        Row: {
          id: string
          artist_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          artist_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Update: {
          id?: string
          artist_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string | null
          artist_id: string | null
          service_type: string
          date: string
          start_time: string | null
          location: string
          notes: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          subtotal: number
          platform_fee: number
          total: number
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          artist_id?: string | null
          service_type: string
          date: string
          start_time?: string | null
          location: string
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          subtotal: number
          platform_fee: number
          total: number
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          artist_id?: string | null
          service_type?: string
          date?: string
          start_time?: string | null
          location?: string
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          subtotal?: number
          platform_fee?: number
          total?: number
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          client_id: string | null
          artist_id: string
          rating: number
          body: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          client_id?: string | null
          artist_id: string
          rating: number
          body?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          client_id?: string | null
          artist_id?: string
          rating?: number
          body?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          artist_id: string
          name: string
          brand: string
          description: string | null
          price: number
          sale_price: number | null
          image_url: string | null
          label: 'artist_pick' | 'new' | 'sale'
          in_stock: boolean
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          name: string
          brand: string
          description?: string | null
          price: number
          sale_price?: number | null
          image_url?: string | null
          label?: 'artist_pick' | 'new' | 'sale'
          in_stock?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          name?: string
          brand?: string
          description?: string | null
          price?: number
          sale_price?: number | null
          image_url?: string | null
          label?: 'artist_pick' | 'new' | 'sale'
          in_stock?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          subtotal: number
          total: number
          stripe_payment_intent_id: string | null
          status: 'pending' | 'paid' | 'shipped' | 'delivered'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          subtotal: number
          total: number
          stripe_payment_intent_id?: string | null
          status?: 'pending' | 'paid' | 'shipped' | 'delivered'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          subtotal?: number
          total?: number
          stripe_payment_intent_id?: string | null
          status?: 'pending' | 'paid' | 'shipped' | 'delivered'
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
      }
      favorites: {
        Row: {
          user_id: string
          artist_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          artist_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          artist_id?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'client' | 'artist'
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
      product_label: 'artist_pick' | 'new' | 'sale'
      order_status: 'pending' | 'paid' | 'shipped' | 'delivered'
      genre: 'wedding' | 'glam' | 'drag' | 'editorial' | 'natural' | 'sfx' | 'avant-garde' | 'quinceanera' | 'bridal' | 'prom'
    }
  }
}
