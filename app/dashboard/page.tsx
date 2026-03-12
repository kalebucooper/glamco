// @ts-nocheck
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ClientDashboard } from './ClientDashboard'
import { ArtistDashboard } from './ArtistDashboard'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  if (profile.role === 'artist') {
    const { data: artistProfile } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, client:profiles(full_name, avatar_url)')
      .eq('artist_id', artistProfile?.id)
      .order('date', { ascending: false })
      .limit(20)

    return (
      <ArtistDashboard
        profile={profile as any}
        artistProfile={artistProfile as any}
        bookings={(bookings ?? []) as any}
      />
    )
  }

  // Client dashboard
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, artist:artist_profiles(*, profile:profiles(full_name, avatar_url))')
    .eq('client_id', user.id)
    .order('date', { ascending: false })
    .limit(20)

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <ClientDashboard
      profile={profile as any}
      bookings={(bookings ?? []) as any}
      orders={(orders ?? []) as any}
    />
  )
}
