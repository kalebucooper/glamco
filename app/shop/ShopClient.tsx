'use client'
// @ts-nocheck

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/providers/CartProvider'
import { useToast } from '@/components/ui/Toaster'
import type { Product } from '@/types'

type ProductWithArtist = Product & {
  artist: { id: string; profile: { full_name: string } | null } | null
}

const LABELS = {
  artist_pick: { label: "Artist's Pick", color: 'bg-electric/10 text-electric border-electric/20' },
  new: { label: 'New', color: 'bg-green-400/10 text-green-400 border-green-400/20' },
  sale: { label: 'Sale', color: 'bg-red-400/10 text-red-400 border-red-400/20' },
}

export function ShopClient({ products }: { products: ProductWithArtist[] }) {
  const addItem = useCart((s) => s.addItem)
  const itemCount = useCart((s) => s.itemCount)
  const { toast } = useToast()
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  const filtered = activeLabel
    ? products.filter((p) => p.label === activeLabel)
    : products

  const handleAdd = (product: ProductWithArtist) => {
    addItem(product)
    toast(`${product.name} added to cart`)
  }

  return (
    <main className="min-h-screen bg-[#0a060a] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="font-playfair text-5xl font-black mb-2">Shop</h1>
            <p className="text-[#b8b0a8] text-sm">
              Artist-curated products — used and recommended by the pros
            </p>
          </div>
          <Link
            href="/shop/cart"
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-cream text-sm font-semibold hover:border-electric transition-colors"
          >
            <ShoppingBag size={16} />
            Cart
            {itemCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-electric rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                {itemCount()}
              </span>
            )}
          </Link>
        </div>

        {/* Label Filter */}
        <div className="flex gap-2 mb-10">
          <button
            onClick={() => setActiveLabel(null)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
              !activeLabel
                ? 'bg-electric/15 border-electric/40 text-electric'
                : 'border-white/15 text-[#b8b0a8] hover:border-white/30'
            }`}
          >
            All
          </button>
          {Object.entries(LABELS).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setActiveLabel(activeLabel === key ? null : key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
                activeLabel === key ? color : 'border-white/15 text-[#b8b0a8] hover:border-white/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[#b8b0a8]">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product) => {
              const displayPrice = product.sale_price ?? product.price
              const artistName = product.artist?.profile?.full_name
              const labelConfig = LABELS[product.label]

              return (
                <div
                  key={product.id}
                  className="group bg-card-bg rounded-3xl border border-white/08 overflow-hidden hover:border-electric/30 transition-all hover:-translate-y-1 flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-white/05 to-white/02 flex items-center justify-center overflow-hidden relative">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-4xl">💄</span>
                    )}
                    {/* Label badge */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${labelConfig.color}`}>
                      {labelConfig.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="font-semibold text-cream text-sm mb-0.5 truncate">{product.name}</p>
                    <p className="text-xs text-[#b8b0a8] mb-1">{product.brand}</p>
                    {artistName && (
                      <p className="text-xs text-electric/70 mb-3">By {artistName}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/06">
                      <div className="flex items-baseline gap-2">
                        <span className="text-cream font-bold">${displayPrice}</span>
                        {product.sale_price && (
                          <span className="text-[#b8b0a8] text-xs line-through">${product.price}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAdd(product)}
                        className="w-8 h-8 rounded-full bg-electric/10 border border-electric/30 text-electric flex items-center justify-center hover:bg-electric hover:text-white transition-colors text-lg leading-none"
                        aria-label="Add to cart"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
