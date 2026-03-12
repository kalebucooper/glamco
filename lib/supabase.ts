'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Client-side only — safe to import in any component
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
