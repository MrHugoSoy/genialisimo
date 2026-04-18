import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.verifyOtp({ token_hash, type: type as any })
  }

  return NextResponse.redirect(`${origin}/`)
}