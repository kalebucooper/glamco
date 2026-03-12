// @ts-nocheck
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const GENRES = [
  { label: 'Wedding', emoji: '💍' },
  { label: 'Glam', emoji: '✨' },
  { label: 'Drag', emoji: '👑' },
  { label: 'Editorial', emoji: '📸' },
  { label: 'SFX', emoji: '🎭' },
  { label: 'Avant-Garde', emoji: '🎨' },
  { label: 'Bridal', emoji: '🌸' },
  { label: 'Prom', emoji: '🌟' },
]

const STATS = [
  { value: '500+', label: 'Verified Artists' },
  { value: '12K+', label: 'Bookings Completed' },
  { value: '4.9', label: 'Average Rating' },
  { value: '48hr', label: 'Avg Response Time' },
]

export default async function HomePage() {
  const supabase = createSupabaseServerClient()

  // Fetch a few top-rated artists for the hero grid
  const { data: featuredArtists } = await supabase
    .from('artist_profiles')
    .select('id, avg_rating, genres, profile:profiles(full_name, avatar_url, location)')
    .eq('stripe_onboarded', true)
    .order('avg_rating', { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen bg-[#0a060a]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric mb-6">
            The Makeup Artist Marketplace
          </p>

          <h1 className="font-playfair text-6xl md:text-8xl font-black leading-[0.95] mb-8">
            Your look,<br />
            <span className="text-gradient-electric italic">perfectly</span><br />
            executed.
          </h1>

          <p className="text-lg text-[#b8b0a8] max-w-xl mx-auto mb-12 leading-relaxed">
            Find and book exceptional makeup artists for any occasion —
            from bridal glam to avant-garde editorial. Secure payments, instant booking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/artists"
              className="px-10 py-4 rounded-full bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm shadow-[0_4px_30px_rgba(255,77,141,0.4)] hover:shadow-[0_8px_40px_rgba(255,77,141,0.55)] hover:-translate-y-0.5 transition-all"
            >
              Find an Artist
            </Link>
            <Link
              href="/auth/signup"
              className="px-10 py-4 rounded-full border border-white/20 text-cream font-semibold uppercase tracking-wider text-sm hover:border-electric hover:text-electric transition-all"
            >
              Join as an Artist
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/06 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="font-playfair text-4xl font-black text-gradient-electric mb-1">{value}</p>
              <p className="text-xs text-[#b8b0a8] uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Genre Browse ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl font-black mb-3">Browse by Style</h2>
            <p className="text-[#b8b0a8] text-sm">Find artists who specialize in exactly what you need</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {GENRES.map(({ label, emoji }) => (
              <Link
                key={label}
                href={`/artists?genre=${label.toLowerCase()}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.03] border border-white/08 hover:border-electric/40 hover:bg-electric/05 transition-all"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-sm font-semibold text-[#b8b0a8] group-hover:text-cream transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Artists ──────────────────────────────────────────────── */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="py-24 px-6 bg-white/[0.015]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-14">
              <div>
                <h2 className="font-playfair text-4xl font-black mb-2">Top Artists</h2>
                <p className="text-[#b8b0a8] text-sm">Highest-rated on the platform</p>
              </div>
              <Link
                href="/artists"
                className="text-xs font-semibold uppercase tracking-widest text-electric hover:text-blush transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {featuredArtists.map((artist) => {
                const profile = Array.isArray(artist.profile) ? artist.profile[0] : artist.profile
                return (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="group bg-card-bg rounded-3xl border border-white/08 overflow-hidden hover:border-electric/30 transition-all hover:-translate-y-1"
                  >
                    {/* Avatar placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-electric/20 to-purple-800/20 flex items-center justify-center text-5xl font-black text-white/20">
                      {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-playfair">{profile?.full_name?.[0] ?? '?'}</span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-semibold text-cream text-sm mb-1">{profile?.full_name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#b8b0a8]">{profile?.location ?? 'Remote'}</p>
                        {artist.avg_rating > 0 && (
                          <p className="text-xs text-yellow-400">★ {artist.avg_rating.toFixed(1)}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {artist.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-electric/10 text-electric border border-electric/20 uppercase tracking-wider">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-black mb-3">How It Works</h2>
          <p className="text-[#b8b0a8] text-sm mb-16">Booking your artist takes less than 2 minutes</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Find Your Artist', desc: 'Browse by genre, location, or rating. Every artist is verified.' },
              { step: '02', title: 'Book Instantly', desc: 'Pick your date, service, and location. No back-and-forth.' },
              { step: '03', title: 'Pay Securely', desc: 'Stripe handles everything. Artists get paid automatically after your session.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-4">
                <span className="font-playfair text-5xl font-black text-gradient-electric">{step}</span>
                <h3 className="font-semibold text-cream text-lg">{title}</h3>
                <p className="text-sm text-[#b8b0a8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-electric rounded-3xl p-16 shadow-[0_20px_80px_rgba(255,77,141,0.3)]">
          <h2 className="font-playfair text-4xl font-black text-white mb-4">
            Are you a makeup artist?
          </h2>
          <p className="text-white/80 mb-8 text-sm leading-relaxed">
            Join glam.co and get discovered. Set your rates, manage bookings,
            and receive payouts automatically via Stripe. It&apos;s free to join.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 rounded-full bg-white text-electric font-bold uppercase tracking-wider text-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all"
          >
            Apply as an Artist
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/06 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-playfair text-2xl font-black text-gradient-electric">
            glam<span className="italic">.</span>co
          </span>
          <p className="text-xs text-[#b8b0a8]">© 2026 glam.co. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-[#b8b0a8]">
            <Link href="/artists" className="hover:text-cream transition-colors">Artists</Link>
            <Link href="/shop" className="hover:text-cream transition-colors">Shop</Link>
            <Link href="/auth/login" className="hover:text-cream transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
