// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createOrderPaymentIntent } from '@/lib/stripe'
import type { CreateOrderPayload } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // ── Auth check ──────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body: CreateOrderPayload = await req.json()
    const { items, subtotal, total } = body

    if (!items?.length || !subtotal || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Validate all products exist and are in stock ─────────────────────────
    const productIds = items.map((i) => i.product_id)
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, price, sale_price, in_stock, name')
      .in('id', productIds)

    if (productError || !products) {
      return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 })
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 })
      }
      if (!product.in_stock) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 })
      }
    }

    // ── Create order in DB ───────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        subtotal,
        total,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('[checkout] Failed to create order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // ── Insert order items ───────────────────────────────────────────────────
    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    )

    if (itemsError) {
      console.error('[checkout] Failed to insert order items:', itemsError)
      // Clean up the order
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    // ── Create Stripe PaymentIntent ──────────────────────────────────────────
    const totalCents = Math.round(total * 100)
    const paymentIntent = await createOrderPaymentIntent({
      totalCents,
      orderId: order.id,
      userId: user.id,
    })

    // ── Store PaymentIntent ID ───────────────────────────────────────────────
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id)

    return NextResponse.json({
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      total,
    })
  } catch (err: any) {
    console.error('[checkout] Unexpected error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
