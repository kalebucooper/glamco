// @ts-nocheck
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import type { Genre } from '@/types'

const GENRES: { value: Genre; label: string; emoji: string }[] = [
  { value: 'wedding', label: 'Wedding', emoji: '💍' },
  { value: 'glam', label: 'Glam', emoji: '✨' },
  { value: 'drag', label: 'Drag', emoji: '👑' },
  { value: 'editorial', label: 'Editorial', emoji: '📸' },
  { value: 'natural', label: 'Natural', emoji: '🌿' },
  { value: 'sfx', label: 'SFX', emoji: '🎭' },
  { value: 'avant-garde', label: 'Avant-Garde', emoji: '🎨' },
  { value: 'quinceanera', label: 'Quinceañera', emoji: '💐' },
  { value: 'bridal', label: 'Bridal', emoji: '🌸' },
  { value: 'prom', label: 'Prom', emoji: '🌟' },
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
    .order('avg_rating', { ascending: false })

  if (activeGenre) {
    dbQuery = dbQuery.contains('genres', [activeGenre])
  }

  const { data: artists } = await dbQuery.limit(48)

  const filtered = query
    ? (artists ?? []).filter((a) => {
        const profile = Array.isArray(a.profile) ? a.profile[0] : a.profile
        return profile?.full_name?.toLowerCase().includes(query.toLowerCase())
      })
    : (artists ?? [])

  return (
    <main className="min-h-screen bg-[#0a060a] pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">

        {/* Search bar */}
        <div className="py-4 sticky top-16 z-40 bg-[#0a060a]/90 backdrop-blur-xl">
          <form method="GET">
            {activeGenre && <input type="hidden" name="genre" value={activeGenre} />}
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search artists..."
              className="w-full px-5 py-3 bg-[#1a1420] border border-white/10 rounded-xl text-cream placeholder-[#b8b0a8]/50 outline-none focus:border-electric/50 transition-colors text-sm"
            />
          </form>
        </div>

        {/* Genre story-style pills */}
        <div className="flex gap-4 overflow-x-auto py-4 mb-6 scrollbar-hide">
          <Link href="/artists" className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className={`w-16 h-16 rounded-full p-0.5 ${!activeGenre ? 'bg-gradient-electric' : 'bg-white/20'}`}>
              <div className="w-full h-full rounded-full bg-[#0a060a] flex items-center justify-center text-xl">
                🔍
              </div>
            </div>
            <span className={`text-[10px] uppercase tracking-wider ${!activeGenre ? 'text-electric' : 'text-[#b8b0a8]'}`}>All</span>
          </Link>
          {GENRES.map(({ value, label, emoji }) => (
            <Link key={value} href={`/artists?genre=${value}`} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className={`w-16 h-16 rounded-full p-0.5 ${activeGenre === value ? 'bg-gradient-electric' : 'bg-white/20'}`}>
                <div className="w-full h-full rounded-full bg-[#0a060a] flex items-center justify-center text-xl">
                  {emoji}
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-wider ${activeGenre === value ? 'text-electric' : 'text-[#b8b0a8]'}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Count */}
        <p className="text-xs text-[#b8b0a8] uppercase tracking-widest mb-4">
          {filtered.length} artist{filtered.length !== 1 ? 's' : ''}
          {activeGenre ? ` · ${activeGenre}` : ''}
        </p>

        {/* Instagram-style grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[#b8b0a8]">
            No artists found. Try a different style or search.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {filtered.map((artist) => {
              const profile = Array.isArray(artist.profile) ? artist.profile[0] : artist.profile
              return (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="group relative aspect-square overflow-hidden bg-gradient-to-br from-electric/10 to-purple-900/15"
                >
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-playfair text-5xl font-black text-white/10">
                        {profile?.full_name?.[0] ?? '?'}
                      </span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-3">
                    <p className="font-semibold text-white text-sm text-center leading-tight">{profile?.full_name}</p>
                    <p className="text-xs text-white/60 text-center">{artist.genres?.slice(0, 2).join(' · ')}</p>
                    {artist.avg_rating > 0 && (
                      <p className="text-xs text-yellow-400 mt-1">★ {artist.avg_rating.toFixed(1)}</p>
                    )}
                    {artist.session_rate > 0 && (
                      <p className="text-xs text-electric mt-0.5">From ${artist.session_rate}</p>
                    )}
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
