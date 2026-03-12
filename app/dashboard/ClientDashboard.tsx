'use client'
// @ts-nocheck

import Link from 'next/link'
import { format } from 'date-fns'
import type { Profile, Booking, Order } from '@/types'

interface Props {
  profile: Profile
  bookings: (Booking & { artist: { profile: { full_name: string; avatar_url: string | null } } | null })[]
  orders: (Order & { items: { product_name: string; quantity: number; unit_price: number }[] })[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  confirmed: 'text-green-400 border-green-400/30 bg-green-400/10',
  completed: 'text-[#b8b0a8] border-white/20 bg-white/5',
  cancelled: 'text-red-400 border-red-400/30 bg-red-400/10',
  paid: 'text-green-400 border-green-400/30 bg-green-400/10',
  shipped: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  delivered: 'text-[#b8b0a8] border-white/20 bg-white/5',
}

export function ClientDashboard({ profile, bookings, orders }: Props) {
  const totalSpent = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.total, 0)

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.date) >= new Date()
  )

  return (
    <main className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-playfair text-4xl font-black mb-1">
            Welcome back, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-[#b8b0a8] text-sm">Your bookings and orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Total Bookings', value: bookings.length },
            { label: 'Upcoming', value: upcomingBookings.length },
            { label: 'Total Spent', value: `$${totalSpent.toFixed(0)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/08 rounded-2xl p-6">
              <p className="text-xs text-[#b8b0a8] uppercase tracking-widest mb-2">{label}</p>
              <p className="text-3xl font-black text-cream">{value}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <section className="mb-12">
          <h2 className="font-playfair text-2xl font-black mb-5">Bookings</h2>
          {bookings.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/08 rounded-2xl p-10 text-center text-[#b8b0a8]">
              No bookings yet.{' '}
              <Link href="/artists" className="text-electric hover:underline">
                Find an artist
              </Link>
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
                      {booking.artist?.profile.full_name ?? 'Artist'} ·{' '}
                      {format(new Date(booking.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-cream font-bold text-sm">${booking.total}</span>
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

        {/* Orders */}
        <section>
          <h2 className="font-playfair text-2xl font-black mb-5">Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/08 rounded-2xl p-10 text-center text-[#b8b0a8]">
              No orders yet.{' '}
              <Link href="/shop" className="text-electric hover:underline">
                Browse the shop
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-white/[0.03] border border-white/08 rounded-2xl px-6 py-5"
                >
                  <div>
                    <p className="font-semibold text-cream text-sm mb-1">
                      {order.items.map((i) => i.product_name).join(', ')}
                    </p>
                    <p className="text-xs text-[#b8b0a8]">
                      {format(new Date(order.created_at), 'MMM d, yyyy')} ·{' '}
                      {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-cream font-bold text-sm">${order.total}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${STATUS_COLORS[order.status] ?? ''}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
