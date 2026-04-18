import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  console.log('[callback] code:', code)
  console.log('[callback] token_hash:', token_hash)
  console.log('[callback] type:', type)
  console.log('[callback] origin:', origin)

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[callback] exchangeCodeForSession error:', error)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[callback] user:', user?.id, user?.email)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle()
        console.log('[callback] profile:', profile)
        if (!profile || !profile.username) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.verifyOtp({ 
      token_hash, 
      type: type as any 
    })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  console.log('[callback] fallthrough — no code, no token_hash')
  return NextResponse.redirect(`${origin}/`)
}