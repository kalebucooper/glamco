'use client'
// @ts-nocheck

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { ArtistProfile } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Schema ───────────────────────────────────────────────────────────────────

const bookingSchema = z.object({
  service_type: z.string().min(1, 'Please select a service'),
  date: z.string().min(1, 'Please select a date'),
  location: z.string().min(5, 'Please enter a location'),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

// ─── Payment Step ─────────────────────────────────────────────────────────────

function PaymentStep({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success`,
      },
    })

    if (error) {
      setError(error.message ?? 'Payment failed')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 rounded-xl bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm disabled:opacity-50 hover:shadow-[0_8px_30px_rgba(255,77,141,0.4)] transition-all"
      >
        {loading ? 'Processing…' : 'Confirm & Pay'}
      </button>
    </form>
  )
}

// ─── Main Booking Form ────────────────────────────────────────────────────────

interface BookingFormProps {
  artist: ArtistProfile & { profile: { full_name: string } }
  onClose: () => void
}

const SERVICE_TYPES = [
  'Wedding Day Makeup',
  'Glam Session',
  'Drag Transformation',
  'Editorial / Campaign',
  'Event Makeup',
  'Bridal Trial',
  'Prom Glam',
]

export function BookingForm({ artist, onClose }: BookingFormProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingTotal, setBookingTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const platformFee = Math.round(artist.session_rate * 0.15 * 100) / 100
  const total = Math.round((artist.session_rate + platformFee) * 100) / 100

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({ resolver: zodResolver(bookingSchema) })

  const onSubmitDetails = async (data: BookingFormData) => {
    setLoading(true)
    setApiError(null)

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: artist.id,
          ...data,
          subtotal: artist.session_rate,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create booking')

      setClientSecret(json.clientSecret)
      setBookingTotal(json.total)
      setStep('payment')
    } catch (err: any) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
      <div className="bg-[#1c161c] rounded-3xl border border-white/10 w-full max-w-lg p-12 relative shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/08 flex items-center justify-center text-[#b8b0a8] hover:bg-electric/20 hover:text-electric transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        {step !== 'success' && (
          <div className="mb-8">
            <h2 className="font-playfair text-3xl font-black mb-2">
              Book{' '}
              <em className="italic text-gradient-electric">{artist.profile.full_name}</em>
            </h2>
            <p className="text-sm text-[#b8b0a8]">
              Secure your slot — payment on confirmation
            </p>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#b8b0a8] mb-2">
                Service Type
              </label>
              <select
                {...register('service_type')}
                className="w-full px-4 py-3.5 bg-white/05 border border-white/10 rounded-xl text-cream font-sans outline-none focus:border-electric/50 transition-colors"
              >
                <option value="">Select a service…</option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.service_type && (
                <p className="text-red-400 text-xs mt-1">{errors.service_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#b8b0a8] mb-2">
                Date
              </label>
              <input
                type="date"
                {...register('date')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3.5 bg-white/05 border border-white/10 rounded-xl text-cream outline-none focus:border-electric/50 transition-colors"
              />
              {errors.date && (
                <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#b8b0a8] mb-2">
                Your Location
              </label>
              <input
                type="text"
                placeholder="Full address or city"
                {...register('location')}
                className="w-full px-4 py-3.5 bg-white/05 border border-white/10 rounded-xl text-cream placeholder-[#b8b0a8]/50 outline-none focus:border-electric/50 transition-colors"
              />
              {errors.location && (
                <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#b8b0a8] mb-2">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Any special requests, inspiration photos, etc."
                {...register('notes')}
                className="w-full px-4 py-3.5 bg-white/05 border border-white/10 rounded-xl text-cream placeholder-[#b8b0a8]/50 outline-none focus:border-electric/50 transition-colors resize-none"
              />
            </div>

            {/* Fee Breakdown */}
            <div className="bg-electric/08 border border-electric/20 rounded-xl p-4 text-sm text-blush space-y-1">
              <div className="flex justify-between">
                <span>Session rate</span>
                <span className="text-cream">${artist.session_rate}</span>
              </div>
              <div className="flex justify-between text-xs opacity-70">
                <span>Platform fee (15%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-electric border-t border-electric/20 pt-1 mt-1">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            {apiError && <p className="text-red-400 text-sm">{apiError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm disabled:opacity-50 hover:shadow-[0_8px_30px_rgba(255,77,141,0.4)] transition-all"
            >
              {loading ? 'Creating booking…' : 'Continue to Payment →'}
            </button>
          </form>
        )}

        {/* Step 2 — Payment */}
        {step === 'payment' && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#ff4d8d',
                  colorBackground: '#1c161c',
                  colorText: '#f8f3ee',
                  fontFamily: 'DM Sans, sans-serif',
                  borderRadius: '12px',
                },
              },
            }}
          >
            <PaymentStep clientSecret={clientSecret} onSuccess={() => setStep('success')} />
          </Elements>
        )}

        {/* Step 3 — Success */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="font-playfair text-3xl font-black mb-3">You&apos;re booked!</h2>
            <p className="text-[#b8b0a8] mb-8">
              {artist.profile.full_name} has been notified. Check your dashboard for updates.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-gradient-electric text-white font-semibold text-sm uppercase tracking-wider"
            >
              View Booking
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
