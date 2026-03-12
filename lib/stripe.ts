import Stripe from 'stripe'

// Singleton Stripe server client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 15)

/**
 * Calculate booking amounts in cents
 */
export function calculateBookingAmounts(subtotalDollars: number) {
  const subtotalCents = Math.round(subtotalDollars * 100)
  const platformFeeCents = Math.round(subtotalCents * (PLATFORM_FEE_PERCENT / 100))
  const artistPayoutCents = subtotalCents - platformFeeCents
  return { subtotalCents, platformFeeCents, artistPayoutCents }
}

/**
 * Create or retrieve a Stripe Connect account for an artist
 */
export async function getOrCreateConnectAccount(artistId: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    metadata: { artist_id: artistId },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  return account
}

/**
 * Generate a Stripe Connect onboarding link
 */
export async function createOnboardingLink(stripeAccountId: string) {
  const link = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?success=true`,
    type: 'account_onboarding',
  })
  return link.url
}

/**
 * Create a payment intent for a booking
 * The platform fee is held by Stripe — artist receives their cut via transfer
 */
export async function createBookingPaymentIntent({
  subtotalCents,
  platformFeeCents,
  artistStripeAccountId,
  bookingId,
  metadata,
}: {
  subtotalCents: number
  platformFeeCents: number
  artistStripeAccountId: string
  bookingId: string
  metadata: Record<string, string>
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: subtotalCents,
    currency: 'usd',
    application_fee_amount: platformFeeCents,
    transfer_data: {
      destination: artistStripeAccountId,
    },
    metadata: {
      booking_id: bookingId,
      ...metadata,
    },
  })
  return paymentIntent
}

/**
 * Create a payment intent for a product order
 */
export async function createOrderPaymentIntent({
  totalCents,
  orderId,
  userId,
}: {
  totalCents: number
  orderId: string
  userId: string
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    metadata: { order_id: orderId, user_id: userId },
  })
  return paymentIntent
}

/**
 * Verify a Stripe webhook signature
 */
export function constructWebhookEvent(payload: Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
