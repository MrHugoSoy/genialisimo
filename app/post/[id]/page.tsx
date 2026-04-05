import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { PostDetailClient } from '@/components/feed/PostDetailClient'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles(id, username, avatar_emoji)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return <PostDetailClient post={post} />
}
