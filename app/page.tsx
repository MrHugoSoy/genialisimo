import type { Metadata } from 'next'
import { FeedPage } from '@/components/feed/FeedPage'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Genialisimo 🔥 — Memes y contenido viral en español',
  description: 'Los mejores memes, fails y contenido viral en español. Vota, comenta y comparte.',
}

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: initialPosts } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji)')
    .order('created_at', { ascending: false })
    .range(0, 9)

  return <FeedPage feedType="fresh" initialPosts={initialPosts ?? []} />
}