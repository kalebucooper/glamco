'use client'
// @ts-nocheck

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '@/components/providers/CartProvider'
import { useToast } from '@/components/ui/Toaster'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
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
      confirmParams: { return_url: `${window.location.origin}/booking/success` },
    })

    if (error) {
      setError(error.message ?? 'Payment failed')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 rounded-xl bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm disabled:opacity-50 hover:shadow-[0_8px_30px_rgba(255,77,141,0.4)] transition-all"
      >
        {loading ? 'Processing…' : 'Complete Purchase'}
      </button>
    </form>
  )
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart()
  const { toast } = useToast()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            unit_price: i.product.sale_price ?? i.product.price,
          })),
          subtotal: total(),
          total: total(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Checkout failed')
      setClientSecret(json.clientSecret)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (itemCount() === 0) {
    return (
      <main className="min-h-screen bg-[#0a060a] pt-24 flex flex-col items-center justify-center gap-6 text-center px-6">
        <span className="text-6xl">🛍️</span>
        <h1 className="font-playfair text-3xl font-black">Your cart is empty</h1>
        <p className="text-[#b8b0a8] text-sm">Find artist-curated products in the shop.</p>
        <Link
          href="/shop"
          className="px-8 py-3 rounded-full bg-gradient-electric text-white font-semibold text-sm uppercase tracking-wider"
        >
          Browse Shop
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a060a] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-playfair text-4xl font-black mb-10">Your Cart</h1>

        <div className="grid md:grid-cols-[1fr_380px] gap-10">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => {
              const price = item.product.sale_price ?? item.product.price
              return (
                <div
                  key={item.product.id}
                  className="flex gap-5 bg-card-bg border border-white/08 rounded-2xl p-5"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-white/05 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">💄</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-cream text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-[#b8b0a8] mb-3">{item.product.brand}</p>
                    <div className="flex items-center gap-4">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 border border-white/10 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-3 py-1 text-[#b8b0a8] hover:text-cream hover:bg-white/05 transition-colors text-sm"
                        >
                          −
                        </button>
                        <span className="text-cream text-sm font-semibold px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-3 py-1 text-[#b8b0a8] hover:text-cream hover:bg-white/05 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-[#b8b0a8] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-cream">${(price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-[#b8b0a8]">${price} each</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary + Payment */}
          <div className="bg-card-bg border border-white/08 rounded-3xl p-8 h-fit sticky top-28">
            <h2 className="font-playfair text-xl font-black mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6 text-sm">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-[#b8b0a8]">
                  <span className="truncate mr-2">{item.product.name} × {item.quantity}</span>
                  <span className="shrink-0">${((item.product.sale_price ?? item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-cream">
                <span>Total</span>
                <span>${total().toFixed(2)}</span>
              </div>
            </div>

            {clientSecret ? (
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
                <CheckoutForm onSuccess={() => { clearCart(); toast('Order placed!') }} />
              </Elements>
            ) : (
              <>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm disabled:opacity-50 hover:shadow-[0_8px_30px_rgba(255,77,141,0.4)] transition-all"
                >
                  {loading ? 'Preparing…' : `Pay $${total().toFixed(2)}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
