// @ts-nocheck
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ArtistPageClient } from './ArtistPageClient'

interface Props {
  params: { id: string }
}

export default async function ArtistPage({ params }: Props) {
  const supabase = createSupabaseServerClient()

  // ── Fetch artist profile with nested profile + portfolio ──────────────────
  const { data: artist, error } = await supabase
    .from('artist_profiles')
    .select(`
      *,
      profile:profiles(*),
      portfolio_images(*),
      reviews(
        id, rating, body, created_at,
        client:profiles(full_name, avatar_url)
      )
    `)
    .eq('id', params.id)
    .order('sort_order', { referencedTable: 'portfolio_images', ascending: true })
    .order('created_at', { referencedTable: 'reviews', ascending: false })
    .single()

  if (error || !artist) notFound()

  // ── Fetch artist's products ───────────────────────────────────────────────
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('artist_id', artist.id)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  return <ArtistPageClient artist={artist as any} products={products ?? []} />
}
