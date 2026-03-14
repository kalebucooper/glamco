// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Trash2, Plus, ExternalLink } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import type { KitProduct } from '@/types'

const CATEGORIES = [
  'Foundation', 'Concealer', 'Contour', 'Blush', 'Highlighter',
  'Eyeshadow', 'Liner', 'Mascara', 'Brow', 'Lip', 'Skincare',
  'Primer', 'Setting Spray', 'Brushes & Tools', 'Other',
]

interface Props {
  artistId: string
}

const emptyForm = {
  name: '',
  brand: '',
  description: '',
  image_url: '',
  affiliate_url: '',
  price_display: '',
  category: '',
}

export function KitManager({ artistId }: Props) {
  const { supabase } = useSupabase()
  const [items, setItems] = useState<KitProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchItems = async () => {
    const { data } = await supabase
      .from('kit_products')
      .select('*')
      .eq('artist_id', artistId)
      .order('sort_order', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [artistId])

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) { setError('Product name is required.'); return }
    if (!form.brand.trim()) { setError('Brand is required.'); return }
    if (!form.affiliate_url.trim()) { setError('Shop link is required.'); return }
    try { new URL(form.affiliate_url) } catch { setError('Please enter a valid shop URL.'); return }

    setSaving(true)
    try {
      const { error: insertError } = await supabase.from('kit_products').insert({
        artist_id: artistId,
        name: form.name.trim(),
        brand: form.brand.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        affiliate_url: form.affiliate_url.trim(),
        price_display: form.price_display.trim() || null,
        category: form.category || null,
        sort_order: items.length,
      })

      if (insertError) throw insertError

      setForm(emptyForm)
      setFormOpen(false)
      await fetchItems()
    } catch (err: any) {
      setError(err.message ?? 'Failed to add product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this product from your kit?')) return
    setDeletingId(id)
    try {
      await supabase.from('kit_products').delete().eq('id', id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-[#1c161c] rounded-2xl border border-white/08 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-playfair text-xl font-bold text-cream">My Kit</h3>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-electric/12 border border-electric/30 text-electric text-xs font-bold uppercase tracking-wider hover:bg-electric/20 transition-all"
        >
          <Plus size={14} />
          Add Product
        </button>
      </div>

      {/* Add form */}
      {formOpen && (
        <form onSubmit={handleAdd} className="mb-6 p-5 bg-white/04 rounded-xl border border-white/08 space-y-3">
          <h4 className="text-sm font-semibold text-cream mb-3">New Kit Product</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#b8b0a8] mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Pro Filt'r Foundation"
                className="w-full bg-white/06 border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#b8b0a8] mb-1">Brand *</label>
              <input
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="Fenty Beauty"
                className="w-full bg-white/06 border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#b8b0a8] mb-1">Price</label>
              <input
                value={form.price_display}
                onChange={(e) => handleChange('price_display', e.target.value)}
                placeholder="$36"
                className="w-full bg-white/06 border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#b8b0a8] mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-white/06 border border-white/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-electric/50 appearance-none"
              >
                <option value="">Select...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#b8b0a8] mb-1">Shop Link *</label>
            <input
              type="url"
              value={form.affiliate_url}
              onChange={(e) => handleChange('affiliate_url', e.target.value)}
              placeholder="https://fentybeauty.com/..."
              className="w-full bg-white/06 border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#b8b0a8] mb-1">Image URL</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/06 border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#b8b0a8] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Why you love it..."
              rows={2}
              className="w-full bg-white/06 border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-electric text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? 'Adding...' : 'Add to Kit'}
            </button>
            <button
              type="button"
              onClick={() => { setFormOpen(false); setForm(emptyForm); setError(null) }}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-sm text-[#b8b0a8] hover:text-cream transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Product list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/04 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-[#b8b0a8]">
          <p className="text-3xl mb-2">💼</p>
          <p className="text-sm">Add your favorite products to your kit!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 bg-white/04 rounded-xl border border-white/08 hover:border-white/12 transition-colors"
            >
              {/* Image */}
              <div className="w-12 h-12 rounded-lg bg-plum/50 flex-shrink-0 overflow-hidden relative">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">💄</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-cream truncate">{item.name}</p>
                <p className="text-xs text-electric truncate">{item.brand}</p>
                {item.price_display && (
                  <p className="text-xs text-[#b8b0a8]">{item.price_display}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={item.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#b8b0a8] hover:text-cream transition-colors"
                  title="Open shop link"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-2 text-[#b8b0a8] hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Remove from kit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
