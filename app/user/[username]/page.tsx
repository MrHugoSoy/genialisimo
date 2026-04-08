import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { UserProfileClient } from '@/components/auth/UserProfileClient'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, bio, avatar_emoji')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Usuario no encontrado — Genialisimo' }

  return {
    title: `${profile.avatar_emoji} ${profile.username} — Genialisimo`,
    description: profile.bio ?? `Mira los posts de ${profile.username} en Genialisimo`,
    openGraph: {
      title: `${profile.username} en Genialisimo`,
      description: profile.bio ?? `Posts de ${profile.username} en Genialisimo`,
      siteName: 'Genialisimo',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${profile.username} en Genialisimo`,
      description: profile.bio ?? `Posts de ${profile.username} en Genialisimo`,
    },
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  return <UserProfileClient profile={profile} posts={posts ?? []} />
}