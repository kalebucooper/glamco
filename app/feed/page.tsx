// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Search } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import type { Post, Genre } from '@/types'

const GENRES: { value: Genre | 'all'; label: string }[] = [
  { value: 'all', label: '✨ All' },
  { value: 'wedding', label: '💒 Wedding' },
  { value: 'glam', label: '✨ Glam' },
  { value: 'drag', label: '👑 Drag' },
  { value: 'editorial', label: '📸 Editorial' },
  { value: 'natural', label: '🌿 Natural' },
  { value: 'sfx', label: '🎭 SFX' },
  { value: 'avant-garde', label: '🎨 Avant-Garde' },
  { value: 'bridal', label: '👰 Bridal' },
  { value: 'prom', label: '🌟 Prom' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function PostCard({ post, onLikeToggle }: { post: Post; onLikeToggle: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const caption = post.caption ?? ''
  const shouldTruncate = caption.length > 120

  return (
    <article className="border-b border-white/08 pb-4 mb-4">
      {/* Artist header */}
      <Link
        href={`/artist/${post.artist_id}`}
        className="flex items-center gap-3 px-4 py-3 hover:bg-white/04 transition-colors rounded-xl"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-rose flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
          {post.artist?.profile?.avatar_url ? (
            <Image
              src={post.artist.profile.avatar_url}
              alt={post.artist.profile.full_name ?? ''}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : '💄'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cream truncate">
            {post.artist?.profile?.full_name ?? 'Artist'}
          </p>
          {post.genre && (
            <span className="text-xs text-electric">
              {GENRES.find((g) => g.value === post.genre)?.label ?? post.genre}
            </span>
          )}
        </div>
        <span className="ml-auto text-xs text-[#b8b0a8] flex-shrink-0">{timeAgo(post.created_at)}</span>
      </Link>

      {/* Post image */}
      <div className="relative aspect-[4/5] bg-[#1c161c] overflow-hidden">
        <Image
          src={post.image_url}
          alt={post.caption ?? 'Post image'}
          fill
          className="object-cover"
          sizes="(max-width: 28rem) 100vw, 28rem"
        />
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 flex items-center gap-4">
        <button
          onClick={() => onLikeToggle(post.id)}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
            post.liked_by_me ? 'text-electric' : 'text-[#b8b0a8] hover:text-cream'
          }`}
        >
          <Heart
            size={22}
            className={`transition-all ${post.liked_by_me ? 'fill-electric stroke-electric scale-110' : ''}`}
          />
          <span>{post.likes_count}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm font-semibold text-[#b8b0a8] hover:text-cream transition-colors">
          <MessageCircle size={22} />
          <span>{post.comments_count}</span>
        </button>
      </div>

      {/* Caption */}
      {caption && (
        <div className="px-4 pt-2 text-sm text-[#b8b0a8] leading-relaxed">
          {shouldTruncate && !expanded ? (
            <>
              {caption.slice(0, 120)}…{' '}
              <button
                onClick={() => setExpanded(true)}
                className="text-cream font-semibold hover:text-electric transition-colors"
              >
                more
              </button>
            </>
          ) : (
            caption
          )}
        </div>
      )}
    </article>
  )
}

export default function FeedPage() {
  const { supabase, user } = useSupabase()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGenre, setActiveGenre] = useState<Genre | 'all'>('all')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          artist:artist_profiles(
            id, genres, follower_count, post_count,
            profile:profiles(id, full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(40)

      if (activeGenre !== 'all') {
        query = query.eq('genre', activeGenre)
      }

      const { data, error } = await query
      if (error) throw error

      // If user is logged in, check their likes
      let likedPostIds: Set<string> = new Set()
      if (user && data && data.length > 0) {
        const postIds = data.map((p) => p.id)
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)
        if (likes) {
          likedPostIds = new Set(likes.map((l) => l.post_id))
        }
      }

      const enriched = (data ?? []).map((p) => ({
        ...p,
        liked_by_me: likedPostIds.has(p.id),
      }))

      setPosts(enriched)
    } catch (err) {
      console.error('Feed fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, user, activeGenre])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleLikeToggle = async (postId: string) => {
    if (!user) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked_by_me: !p.liked_by_me,
              likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    )

    try {
      const res = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      })
      const json = await res.json()
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, liked_by_me: json.liked, likes_count: json.likes_count }
              : p
          )
        )
      } else {
        // Revert on error
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, liked_by_me: post.liked_by_me, likes_count: post.likes_count }
              : p
          )
        )
      }
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked_by_me: post.liked_by_me, likes_count: post.likes_count }
            : p
        )
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#0a060a]">
      {/* Sticky top bar */}
      <header className="sticky top-[57px] z-40 bg-[#0a060a]/95 backdrop-blur-xl border-b border-white/08">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-playfair text-2xl font-black text-gradient-electric">
            glam<span className="italic">.</span>co
          </span>
          <button className="p-2 text-[#b8b0a8] hover:text-cream transition-colors">
            <Search size={20} />
          </button>
        </div>

        {/* Genre pills */}
        <div className="max-w-md mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GENRES.map((g) => (
              <button
                key={g.value}
                onClick={() => setActiveGenre(g.value)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeGenre === g.value
                    ? 'bg-gradient-electric text-white shadow-[0_2px_12px_rgba(255,77,141,0.35)]'
                    : 'bg-white/06 border border-white/10 text-[#b8b0a8] hover:text-cream hover:border-white/20'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-md mx-auto pt-4">
        {loading ? (
          <div className="flex flex-col gap-6 px-4 pt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                    <div className="h-2.5 bg-white/06 rounded w-1/5" />
                  </div>
                </div>
                <div className="aspect-[4/5] bg-white/06 rounded-xl" />
                <div className="mt-3 h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 px-8">
            <div className="text-6xl mb-4">💄</div>
            <h2 className="font-playfair text-2xl font-bold mb-2 text-cream">Nothing here yet</h2>
            <p className="text-[#b8b0a8] text-sm mb-6">
              {activeGenre !== 'all'
                ? 'No posts in this genre yet.'
                : 'Follow some artists to see their posts here, or check back soon!'}
            </p>
            <Link
              href="/artists"
              className="inline-block px-6 py-3 rounded-full bg-gradient-electric text-white text-sm font-semibold"
            >
              Discover Artists
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
          ))
        )}
      </main>
    </div>
  )
}
