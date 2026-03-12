// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import {
  calculateBookingAmounts,
  createBookingPaymentIntent,
} from '@/lib/stripe'
import type { CreateBookingPayload } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // ── Auth check ──────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body: CreateBookingPayload = await req.json()
    const { artist_id, service_type, date, location, notes, subtotal } = body

    if (!artist_id || !service_type || !date || !location || !subtotal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Fetch artist (need Stripe account ID + session rate) ─────────────────
    const { data: artist, error: artistError } = await supabase
      .from('artist_profiles')
      .select('id, stripe_account_id, stripe_onboarded, session_rate')
      .eq('id', artist_id)
      .single()

    if (artistError || !artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    if (!artist.stripe_account_id || !artist.stripe_onboarded) {
      return NextResponse.json(
        { error: 'Artist has not completed payment setup' },
        { status: 422 }
      )
    }

    // ── Calculate amounts ────────────────────────────────────────────────────
    const { subtotalCents, platformFeeCents, artistPayoutCents } =
      calculateBookingAmounts(subtotal)
    const totalCents = subtotalCents + platformFeeCents
    const totalDollars = totalCents / 100

    // ── Insert booking (status: pending) ─────────────────────────────────────
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        artist_id,
        service_type,
        date,
        location,
        notes: notes ?? null,
        status: 'pending',
        subtotal,
        platform_fee: platformFeeCents / 100,
        total: totalDollars,
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      console.error('[bookings/create] DB insert error:', bookingError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // ── Create Stripe PaymentIntent (Connect) ────────────────────────────────
    const paymentIntent = await createBookingPaymentIntent({
      subtotalCents: totalCents,        // client pays total (subtotal + fee)
      platformFeeCents,
      artistStripeAccountId: artist.stripe_account_id,
      bookingId: booking.id,
      metadata: {
        client_id: user.id,
        artist_id,
        service_type,
      },
    })

    // ── Store PaymentIntent ID on booking ────────────────────────────────────
    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', booking.id)

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      total: totalDollars,
    })
  } catch (err: any) {
    console.error('[bookings/create] Unexpected error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
