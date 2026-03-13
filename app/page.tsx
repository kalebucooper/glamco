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

export default async function HomePage() {
  const supabase = createSupabaseServerClient()

  const { data: featuredArtists } = await supabase
    .from('artist_profiles')
    .select('id, avg_rating, genres, profile:profiles(full_name, avatar_url, location)')
    .order('avg_rating', { ascending: false })
    .limit(9)

  return (
    <main className="min-h-screen bg-[#0a060a]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Free badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric/10 border border-electric/25 mb-8">
            <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-electric">100% Free for Artists & Clients</span>
          </div>

          <h1 className="font-playfair text-6xl md:text-8xl font-black leading-[0.95] mb-8">
            Your look,<br />
            <span className="text-gradient-electric italic">perfectly</span><br />
            executed.
          </h1>

          <p className="text-lg text-[#b8b0a8] max-w-xl mx-auto mb-4 leading-relaxed">
            Discover and book exceptional makeup artists. Browse portfolios, read reviews, and book instantly.
          </p>
          <p className="text-sm text-electric font-semibold mb-12">
            Free to join. Free to browse. Only pay when you book.
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

      {/* ── Free for Everyone Banner ───────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/06">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🎨', title: 'Free for Artists', desc: 'Create your profile, showcase your portfolio, and get discovered. No monthly fees, ever.' },
            { icon: '💅', title: 'Free for Clients', desc: 'Browse artists, view portfolios, and read reviews — all for free. Pay only when you book.' },
            { icon: '🔒', title: 'Only Pay to Book', desc: 'Secure Stripe payments. Artists get paid automatically after your session. No surprises.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.03] border border-white/08">
              <span className="text-4xl mb-4">{icon}</span>
              <h3 className="font-semibold text-cream mb-2">{title}</h3>
              <p className="text-sm text-[#b8b0a8] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Instagram-style Artist Grid ───────────────────────────────────── */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-playfair text-4xl font-black mb-2">Featured Artists</h2>
                <p className="text-[#b8b0a8] text-sm">Discover talented artists near you</p>
              </div>
              <Link href="/artists" className="text-xs font-semibold uppercase tracking-widest text-electric hover:text-blush transition-colors">
                See All →
              </Link>
            </div>

            {/* Genre story pills */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
              {GENRES.map(({ label, emoji }) => (
                <Link
                  key={label}
                  href={`/artists?genre=${label.toLowerCase()}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-electric p-0.5">
                    <div className="w-full h-full rounded-full bg-[#0a060a] flex items-center justify-center text-2xl">
                      {emoji}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#b8b0a8] uppercase tracking-wider">{label}</span>
                </Link>
              ))}
            </div>

            {/* Photo grid — Instagram style */}
            <div className="grid grid-cols-3 gap-0.5">
              {featuredArtists.map((artist) => {
                const profile = Array.isArray(artist.profile) ? artist.profile[0] : artist.profile
                return (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="group relative aspect-square overflow-hidden bg-gradient-to-br from-electric/15 to-purple-900/20"
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
                        <span className="font-playfair text-5xl font-black text-white/20">
                          {profile?.full_name?.[0] ?? '?'}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <p className="font-semibold text-white text-sm">{profile?.full_name}</p>
                      <p className="text-xs text-white/70">{artist.genres?.slice(0, 2).join(' · ')}</p>
                      {artist.avg_rating > 0 && (
                        <p className="text-xs text-yellow-400 mt-1">★ {artist.avg_rating.toFixed(1)}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.015]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-black mb-3">How It Works</h2>
          <p className="text-[#b8b0a8] text-sm mb-16">Booking your artist takes less than 2 minutes</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse Portfolios', desc: 'Scroll through real work from verified artists. Filter by style, location, or rating.' },
              { step: '02', title: 'Book Instantly', desc: 'Pick your date, service, and location. No DMs, no back-and-forth.' },
              { step: '03', title: 'Pay at Booking', desc: 'Secure payment via Stripe. Free to browse — you only pay when you book.' },
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

      {/* ── Dual CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* For Clients */}
          <div className="rounded-3xl border border-white/10 p-10 flex flex-col gap-4 bg-white/[0.02]">
            <span className="text-3xl">💅</span>
            <h3 className="font-playfair text-3xl font-black">Looking for an artist?</h3>
            <p className="text-[#b8b0a8] text-sm leading-relaxed flex-1">
              Browse hundreds of verified artists. Read real reviews, see real portfolios. <strong className="text-cream">Free to join, free to browse.</strong> Pay only when you book.
            </p>
            <Link
              href="/artists"
              className="self-start px-8 py-3.5 rounded-full bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm hover:shadow-[0_8px_30px_rgba(255,77,141,0.4)] transition-all"
            >
              Find an Artist — It&apos;s Free
            </Link>
          </div>

          {/* For Artists */}
          <div className="rounded-3xl bg-gradient-electric p-10 flex flex-col gap-4 shadow-[0_20px_60px_rgba(255,77,141,0.25)]">
            <span className="text-3xl">🎨</span>
            <h3 className="font-playfair text-3xl font-black text-white">Are you an artist?</h3>
            <p className="text-white/80 text-sm leading-relaxed flex-1">
              Get discovered by clients in your area. Share your portfolio, set your rates, and manage bookings. <strong className="text-white">Zero monthly fees — ever.</strong>
            </p>
            <Link
              href="/auth/signup"
              className="self-start px-8 py-3.5 rounded-full bg-white text-electric font-bold uppercase tracking-wider text-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all"
            >
              Join Free as an Artist
            </Link>
          </div>
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
