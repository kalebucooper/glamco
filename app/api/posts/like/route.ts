// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { post_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { post_id } = body
  if (!post_id) {
    return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .eq('post_id', post_id)
    .maybeSingle()

  if (existing) {
    // Unlike
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', post_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Fetch updated count
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', post_id)
      .single()

    return NextResponse.json({ liked: false, likes_count: post?.likes_count ?? 0 })
  } else {
    // Like
    const { error: insertError } = await supabase
      .from('post_likes')
      .insert({ user_id: user.id, post_id })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Fetch updated count
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', post_id)
      .single()

    return NextResponse.json({ liked: true, likes_count: post?.likes_count ?? 0 })
  }
}
