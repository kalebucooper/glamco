// @ts-nocheck
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookingForm } from '@/components/booking/BookingForm'
import { useCart } from '@/components/providers/CartProvider'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import type { ArtistProfile, Product } from '@/types'

const GENRE_LABELS: Record<string, string> = {
  wedding: '💒 Wedding', glam: '✨ Glam', drag: '👑 Drag',
  editorial: '📸 Editorial', natural: '🌿 Natural', sfx: '🎭 SFX',
  'avant-garde': '🎨 Avant-Garde', quinceanera: '💐 Quinceanera',
  bridal: '👰 Bridal', prom: '🌟 Prom',
}

interface Props {
  artist: ArtistProfile & {
    profile: { full_name: string; avatar_url: string | null; location: string | null }
    portfolio_images: { id: string; url: string; caption: string | null }[]
    reviews: { id: string; rating: number; body: string; client: { full_name: string } | null }[]
  }
  products: Product[]
}

export function ArtistPageClient({ artist, products }: Props) {
  const { user } = useSupabase()
  const router = useRouter()
  const addItem = useCart((s) => s.addItem)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'shop'>('portfolio')

  const handleBookNow = () => {
    if (!user) { router.push('/auth/login'); return }
    setBookingOpen(true)
  }

  return (
    <>
      {bookingOpen && (
        <BookingForm
          artist={artist as any}
          onClose={() => setBookingOpen(false)}
        />
      )}

      <div className="min-h-screen bg-[#0a0a0a] pt-20">
        {/* Hero Banner */}
        <div className="h-64 bg-gradient-to-br from-plum via-violet-700 to-fuchsia-500 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-[10rem] opacity-20">💄</div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-8 -mt-20 relative z-10 pb-20">
          {/* Artist Header */}
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-electric to-rose flex items-center justify-center text-4xl border-4 border-[#0a0a0a] shadow-2xl">
                {artist.profile.avatar_url ? (
                  <Image src={artist.profile.avatar_url} alt={artist.profile.full_name} width={112} height={112} className="rounded-2xl object-cover" />
                ) : '💄'}
              </div>
              <div className="pb-2">
                <h1 className="font-playfair text-3xl font-black mb-1">{artist.profile.full_name}</h1>
                <p className="text-[#b8b0a8] text-sm mb-2">{artist.profile.location}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gold font-semibold">★ {artist.avg_rating?.toFixed(2) || '—'}</span>
                  <span className="text-[#b8b0a8]">({artist.total_reviews} reviews)</span>
                  <span className="text-[#b8b0a8]">{artist.total_bookings} bookings</span>
                </div>
              </div>
            </div>

            <div className="pb-2 flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="font-playfair text-3xl font-bold">${artist.session_rate}</p>
                <p className="text-xs text-[#b8b0a8]">per session</p>
              </div>
              <button
                onClick={handleBookNow}
                className="px-8 py-3.5 rounded-xl bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm shadow-[0_4px_20px_rgba(255,77,141,0.3)] hover:shadow-[0_8px_30px_rgba(255,77,141,0.45)] hover:-translate-y-px transition-all"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-8">
            {artist.genres?.map((g) => (
              <span key={g} className="px-4 py-1.5 rounded-full bg-white/06 border border-white/10 text-sm">
                {GENRE_LABELS[g] ?? g}
              </span>
            ))}
          </div>

          {/* Bio */}
          {artist.bio && (
            <p className="text-[#b8b0a8] leading-relaxed mb-10 max-w-2xl">{artist.bio}</p>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white/04 rounded-xl p-1 w-fit mb-8">
            {(['portfolio', 'reviews', 'shop'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-electric text-white'
                    : 'text-[#b8b0a8] hover:text-cream'
                }`}
              >
                {tab === 'portfolio' ? '🖼 Portfolio' : tab === 'reviews' ? '★ Reviews' : '🛍 Shop'}
              </button>
            ))}
          </div>

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-3 gap-4">
              {artist.portfolio_images.length === 0 ? (
                <div className="col-span-3 text-center py-16 text-[#b8b0a8]">No portfolio images yet.</div>
              ) : (
                artist.portfolio_images.map((img) => (
                  <div key={img.id} className="aspect-square rounded-2xl overflow-hidden bg-white/04 group cursor-pointer relative">
                    <Image src={img.url} alt={img.caption ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    {img.caption && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-sm">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {artist.reviews.length === 0 ? (
                <div className="text-center py-16 text-[#b8b0a8]">No reviews yet.</div>
              ) : (
                artist.reviews.map((review) => (
                  <div key={review.id} className="bg-[#1c161c] rounded-2xl border border-white/08 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">{review.client?.full_name ?? 'Anonymous'}</p>
                      <span className="text-gold font-bold">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-[#b8b0a8] text-sm leading-relaxed">{review.body}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div className="grid grid-cols-3 gap-4">
              {products.length === 0 ? (
                <div className="col-span-3 text-center py-16 text-[#b8b0a8]">No products listed yet.</div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="bg-[#1c161c] rounded-2xl border border-white/08 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all">
                    <div className="h-40 bg-gradient-to-br from-plum to-violet-900 flex items-center justify-center text-4xl">💄</div>
                    <div className="p-4">
                      <p className="text-xs text-electric font-bold uppercase tracking-wider mb-1">{product.brand}</p>
                      <p className="font-semibold mb-3">{product.name}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.sale_price && (
                            <span className="text-[#b8b0a8] line-through text-sm mr-2">${product.price}</span>
                          )}
                          <span className="font-bold">${product.sale_price ?? product.price}</span>
                        </div>
                        <button
                          onClick={() => addItem(product)}
                          className="px-3 py-1.5 rounded-full bg-electric/12 border border-electric/30 text-electric text-xs font-bold hover:bg-electric hover:text-white transition-all"
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
