// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getOrCreateConnectAccount, createOnboardingLink } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // ── Auth check ──────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Fetch profile + artist profile ───────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'artist') {
      return NextResponse.json({ error: 'Only artists can connect Stripe' }, { status: 403 })
    }

    const { data: artistProfile, error: artistError } = await supabase
      .from('artist_profiles')
      .select('id, stripe_account_id')
      .eq('profile_id', user.id)
      .single()

    if (artistError || !artistProfile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    // ── Get or create Connect account ────────────────────────────────────────
    const account = await getOrCreateConnectAccount(
      artistProfile.id,
      profile.email,
      artistProfile.stripe_account_id
    )

    // ── Persist Stripe account ID if newly created ───────────────────────────
    if (!artistProfile.stripe_account_id) {
      const { error: updateError } = await supabase
        .from('artist_profiles')
        .update({ stripe_account_id: account.id })
        .eq('id', artistProfile.id)

      if (updateError) {
        console.error('[artists/connect] Failed to save stripe_account_id:', updateError)
        return NextResponse.json({ error: 'Failed to save account' }, { status: 500 })
      }
    }

    // ── Generate onboarding link ─────────────────────────────────────────────
    const url = await createOnboardingLink(account.id)

    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('[artists/connect] Unexpected error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
