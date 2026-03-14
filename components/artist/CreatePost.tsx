// @ts-nocheck
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import type { Genre } from '@/types'

const GENRES: { value: Genre; label: string }[] = [
  { value: 'wedding', label: '💒 Wedding' },
  { value: 'glam', label: '✨ Glam' },
  { value: 'drag', label: '👑 Drag' },
  { value: 'editorial', label: '📸 Editorial' },
  { value: 'natural', label: '🌿 Natural' },
  { value: 'sfx', label: '🎭 SFX' },
  { value: 'avant-garde', label: '🎨 Avant-Garde' },
  { value: 'quinceanera', label: '💐 Quinceanera' },
  { value: 'bridal', label: '👰 Bridal' },
  { value: 'prom', label: '🌟 Prom' },
]

interface Props {
  artistId: string
  onPostCreated?: () => void
}

export function CreatePost({ artistId, onPostCreated }: Props) {
  const { supabase } = useSupabase()
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [genre, setGenre] = useState<Genre | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isValidUrl = (url: string) => {
    try { new URL(url); return true } catch { return false }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!imageUrl.trim()) { setError('Image URL is required.'); return }
    if (!isValidUrl(imageUrl)) { setError('Please enter a valid image URL.'); return }

    setLoading(true)
    try {
      const { error: insertError } = await supabase.from('posts').insert({
        artist_id: artistId,
        image_url: imageUrl.trim(),
        caption: caption.trim() || null,
        genre: genre || null,
      })

      if (insertError) throw insertError

      // Reset form
      setImageUrl('')
      setCaption('')
      setGenre('')
      setSuccess(true)
      onPostCreated?.()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Failed to create post.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1c161c] rounded-2xl border border-white/08 p-6">
      <h3 className="font-playfair text-xl font-bold mb-5 text-cream">Create Post</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image URL */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8b0a8] mb-1.5">
            Image URL *
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white/06 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50 transition-colors"
          />
        </div>

        {/* Image preview */}
        {imageUrl && isValidUrl(imageUrl) && (
          <div className="relative aspect-square w-full max-w-xs rounded-xl overflow-hidden bg-white/04">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => {}}
            />
          </div>
        )}

        {/* Genre */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8b0a8] mb-1.5">
            Genre
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as Genre | '')}
            className="w-full bg-white/06 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-electric/50 transition-colors appearance-none"
          >
            <option value="">Select a genre...</option>
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8b0a8] mb-1.5">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share the story behind this look..."
            rows={3}
            maxLength={600}
            className="w-full bg-white/06 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream placeholder-[#b8b0a8]/60 focus:outline-none focus:border-electric/50 transition-colors resize-none"
          />
          <p className="text-right text-xs text-[#b8b0a8] mt-1">{caption.length}/600</p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
            ✨ Post published successfully!
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-electric text-white font-semibold uppercase tracking-wider text-sm shadow-[0_4px_20px_rgba(255,77,141,0.3)] hover:shadow-[0_8px_30px_rgba(255,77,141,0.45)] hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  )
}
