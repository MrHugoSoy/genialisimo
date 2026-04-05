'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Post } from '@/types'
import { PostCard } from './PostCard'
import { AuthModal } from '@/components/auth/AuthModal'
import { createClient } from '@/lib/supabase'

export function PostDetailClient({ post: initialPost }: { post: Post }) {
  const router = useRouter()
  const [post, setPost] = useState(initialPost)
  const [authOpen, setAuthOpen] = useState(false)

  async function handleVote(id: number, value: 1 | -1) {
    const supabase = createClient()
    await supabase.rpc('vote_post', { p_post_id: id, p_value: value })
    setPost(p => ({
      ...p,
      votes: p.user_vote === value ? p.votes - value : p.votes + (p.user_vote ? value * 2 : value),
      user_vote: p.user_vote === value ? 0 : value,
    }))
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-semibold mb-5"
        >
          <ChevronLeft size={16} /> Volver
        </button>
        <PostCard
          post={post}
          onVote={handleVote}
          onAuthRequired={() => setAuthOpen(true)}
        />
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
