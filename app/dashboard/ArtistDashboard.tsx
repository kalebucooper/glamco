'use client'
// @ts-nocheck

import { useState } from 'react'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/Toaster'
import { CreatePost } from '@/components/artist/CreatePost'
import { KitManager } from '@/components/artist/KitManager'
import type { Profile, ArtistProfile, Booking } from '@/types'

interface Props {
  profile: Profile
  artistProfile: ArtistProfile | null
  bookings: (Booking & { client: { full_name: string; avatar_url: string | null } | null })[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  confirmed: 'text-green-400 border-green-400/30 bg-green-400/10',
  completed: 'text-[#b8b0a8] border-white/20 bg-white/5',
  cancelled: 'text-red-400 border-red-400/30 bg-red-400/10',
}

export function ArtistDashboard({ profile, artistProfile, bookings }: Props) {
  const { toast } = useToast()
  const [connectLoading, setConnectLoading] = useState(false)

  const totalEarnings = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.subtotal, 0) // subtotal = artist payout (before platform fee)

  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  const handleConnectStripe = async () => {
    setConnectLoading(true)
    try {
      const res = await fetch('/api/artists/connect', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to connect')
      window.location.href = json.url
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setConnectLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="font-playfair text-4xl font-black mb-1">
              {profile.full_name.split(' ')[0]}&apos;s Studio
            </h1>
            <p className="text-[#b8b0a8] text-sm">Manage your bookings and earnings</p>
          </div>

          {/* Stripe Connect CTA */}
          {!artistProfile?.stripe_onboarded && (
            <button
              onClick={handleConnectStripe}
              disabled={connectLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-electric text-white text-xs font-semibold uppercase tracking-wider shadow-[0_4px_20px_rgba(255,77,141,0.3)] hover:shadow-[0_8px_30px_rgba(255,77,141,0.45)] hover:-translate-y-px transition-all disabled:opacity-50"
            >
              <ExternalLink size={14} />
              {connectLoading ? 'Redirecting…' : 'Connect Stripe to Get Paid'}
            </button>
          )}

          {artistProfile?.stripe_onboarded && (
            <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-400/30 text-green-400 text-xs font-semibold uppercase tracking-wider">
              ✓ Payouts Active
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Earnings', value: `$${totalEarnings.toFixed(0)}` },
            { label: 'Total Bookings', value: artistProfile?.total_bookings ?? 0 },
            { label: 'Avg Rating', value: artistProfile?.avg_rating ? artistProfile.avg_rating.toFixed(1) : '—' },
            { label: 'Pending', value: pendingCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/08 rounded-2xl p-6">
              <p className="text-xs text-[#b8b0a8] uppercase tracking-widest mb-2">{label}</p>
              <p className="text-3xl font-black text-cream">{value}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <section>
          <h2 className="font-playfair text-2xl font-black mb-5">Bookings</h2>
          {bookings.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/08 rounded-2xl p-10 text-center text-[#b8b0a8]">
              No bookings yet. Your profile is live — share it to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between bg-white/[0.03] border border-white/08 rounded-2xl px-6 py-5"
                >
                  <div>
                    <p className="font-semibold text-cream text-sm mb-1">{booking.service_type}</p>
                    <p className="text-xs text-[#b8b0a8]">
                      {booking.client?.full_name ?? 'Client'} ·{' '}
                      {format(new Date(booking.date), 'MMM d, yyyy')} ·{' '}
                      {booking.location}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-[#b8b0a8]/60 mt-1 italic">&ldquo;{booking.notes}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-cream font-bold text-sm">${booking.subtotal}</p>
                      <p className="text-xs text-[#b8b0a8]">your cut</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${STATUS_COLORS[booking.status] ?? ''}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Create Post + Kit Manager */}
        {artistProfile?.id && (
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <CreatePost artistId={artistProfile.id} />
            <KitManager artistId={artistProfile.id} />
          </div>
        )}

      </div>
    </main>
  )
}
