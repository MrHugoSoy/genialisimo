import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { PostDetailClient } from '@/components/feed/PostDetailClient'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: post } = await supabase.from('posts').select('title, image_url').eq('id', id).single()
  if (!post) return { title: 'Post no encontrado' }
  return {
    title: `${post.title} — Genialisimo`,
    openGraph: {
      title: post.title,
      images: post.image_url ? [post.image_url] : [],
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji)')
    .eq('id', id)
    .single()
  if (!post) notFound()
  return <PostDetailClient post={post} />
}