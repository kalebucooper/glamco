// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { constructWebhookEvent } from '@/lib/stripe'
import type Stripe from 'stripe'

// Next.js App Router — disable body parsing so we can read the raw buffer
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = Buffer.from(await req.arrayBuffer())
    event = constructWebhookEvent(rawBody, signature)
  } catch (err: any) {
    console.error('[stripe/webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  try {
    switch (event.type) {
      // ── Booking payment succeeded ──────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = pi.metadata?.booking_id

        if (bookingId) {
          const { error } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              stripe_transfer_id: pi.transfer_data?.destination as string ?? null,
            })
            .eq('stripe_payment_intent_id', pi.id)

          if (error) {
            console.error('[stripe/webhook] Failed to confirm booking:', error)
          }
        } else {
          // Product order payment
          const orderId = pi.metadata?.order_id
          if (orderId) {
            const { error } = await supabase
              .from('orders')
              .update({ status: 'paid' })
              .eq('stripe_payment_intent_id', pi.id)

            if (error) {
              console.error('[stripe/webhook] Failed to confirm order:', error)
            }
          }
        }
        break
      }

      // ── Booking payment failed ─────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = pi.metadata?.booking_id

        if (bookingId) {
          await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('stripe_payment_intent_id', pi.id)
        }
        break
      }

      // ── Stripe Connect account updated (onboarding complete) ───────────────
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        const artistId = account.metadata?.artist_id

        if (artistId) {
          const onboarded =
            account.charges_enabled &&
            account.payouts_enabled &&
            account.details_submitted

          await supabase
            .from('artist_profiles')
            .update({ stripe_onboarded: onboarded })
            .eq('stripe_account_id', account.id)
        }
        break
      }

      default:
        // Unhandled event type — acknowledge receipt and move on
        break
    }
  } catch (err: any) {
    console.error('[stripe/webhook] Handler error:', err)
    // Return 200 regardless to prevent Stripe retrying non-idempotent events
  }

  return NextResponse.json({ received: true })
}
