// @ts-nocheck
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ShopClient } from './ShopClient'

export default async function ShopPage() {
  const supabase = createSupabaseServerClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      artist:artist_profiles(
        id,
        profile:profiles(full_name)
      )
    `)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  return <ShopClient products={(products ?? []) as any} />
}
