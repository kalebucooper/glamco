// @ts-nocheck
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import type { Genre } from '@/types'

const GENRES: Genre[] = [
  'wedding', 'glam', 'drag', 'editorial',
  'natural', 'sfx', 'avant-garde', 'quinceanera', 'bridal', 'prom',
]

interface Props {
  searchParams: { genre?: string; q?: string }
}

export default async function ArtistsPage({ searchParams }: Props) {
  const supabase = createSupabaseServerClient()
  const activeGenre = searchParams.genre as Genre | undefined
  const query = searchParams.q ?? ''

  let dbQuery = supabase
    .from('artist_profiles')
    .select(`
      id, avg_rating, total_reviews, total_bookings,
      session_rate, hourly_rate, genres,
      profile:profiles(full_name, avatar_url, location)
    `)
    .eq('stripe_onboarded', true)
    .order('avg_rating', { ascending: false })

  if (activeGenre) {
    dbQuery = dbQuery.contains('genres', [activeGenre])
  }

  const { data: artists } = await dbQuery.limit(48)

  // Client-side name filter (simple, works for MVP)
  const filtered = query
    ? (artists ?? []).filter((a) => {
        const profile = Array.isArray(a.profile) ? a.profile[0] : a.profile
        return profile?.full_name?.toLowerCase().includes(query.toLowerCase())
      })
    : (artists ?? [])

  return (
    <main className="min-h-screen bg-[#0a060a] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-playfair text-5xl font-black mb-3">Find an Artist</h1>
          <p className="text-[#b8b0a8] text-sm">
            {filtered.length} artist{filtered.length !== 1 ? 's' : ''} available
            {activeGenre ? ` for ${activeGenre}` : ''}
          </p>
        </div>

        {/* Search + Genre Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search box — client-side via URL */}
          <form method="GET" className="flex-1">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by name…"
              className="w-full px-5 py-3.5 bg-white/05 border border-white/10 rounded-xl text-cream placeholder-[#b8b0a8]/50 outline-none focus:border-electric/50 transition-colors text-sm"
            />
          </form>
        </div>

        {/* Genre pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/artists"
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
              !activeGenre
                ? 'bg-electric/15 border-electric/40 text-electric'
                : 'border-white/15 text-[#b8b0a8] hover:border-white/30 hover:text-cream'
            }`}
          >
            All
          </Link>
          {GENRES.map((g) => (
            <Link
              key={g}
              href={`/artists?genre=${g}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
                activeGenre === g
                  ? 'bg-electric/15 border-electric/40 text-electric'
                  : 'border-white/15 text-[#b8b0a8] hover:border-white/30 hover:text-cream'
              }`}
            >
              {g}
            </Link>
          ))}
        </div>

        {/* Artist Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[#b8b0a8]">
            No artists found. Try a different genre or search term.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((artist) => {
              const profile = Array.isArray(artist.profile) ? artist.profile[0] : artist.profile
              return (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="group bg-card-bg rounded-3xl border border-white/08 overflow-hidden hover:border-electric/30 transition-all hover:-translate-y-1"
                >
                  {/* Avatar */}
                  <div className="aspect-square bg-gradient-to-br from-electric/15 to-purple-900/20 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="font-playfair text-5xl font-black text-white/20">
                        {profile?.full_name?.[0] ?? '?'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <p className="font-semibold text-cream text-sm mb-1 truncate">
                      {profile?.full_name}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-[#b8b0a8] truncate">{profile?.location ?? 'Remote'}</p>
                      {artist.avg_rating > 0 && (
                        <p className="text-xs text-yellow-400 shrink-0">
                          ★ {artist.avg_rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {artist.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-electric/08 text-electric border border-electric/20 uppercase tracking-wider"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[#b8b0a8] mt-3">
                      From <span className="text-cream font-semibold">${artist.session_rate}</span>
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
