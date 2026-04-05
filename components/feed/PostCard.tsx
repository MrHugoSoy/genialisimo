'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MessageCircle, Share2, ChevronUp, ChevronDown, Flame, Sparkles, Tag } from 'lucide-react'
import { Post, CATEGORIES } from '@/types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { CommentSection } from './CommentSection'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

interface PostCardProps {
  post: Post
  onVote: (id: number, value: 1 | -1) => void
  onAuthRequired: () => void
  delay?: number
}

function formatNum(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export function PostCard({ post, onVote, onAuthRequired, delay = 0 }: PostCardProps) {
  const { user } = useAuthContext()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [votes, setVotes] = useState(post.votes)
  const cat = CATEGORIES[post.category as keyof typeof CATEGORIES]
  const isHot = votes > 5000
  const isFresh = (Date.now() - new Date(post.created_at).getTime()) < 3600_000

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`post-${post.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts', filter: `id=eq.${post.id}` },
        (payload) => {
          const updated = payload.new as Post
          setCommentCount(updated.comment_count)
          setVotes(updated.votes)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [post.id])

  function handleVote(v: 1 | -1) {
    if (!user) { onAuthRequired(); return }
    onVote(post.id, v)
    if (v === 1 && post.user_vote !== 1) toast('🔥', '+1 punto')
  }

  function handleShare() {
    navigator.clipboard?.writeText(`${window.location.origin}/#post-${post.id}`)
      .then(() => toast('📋', 'Link copiado'))
      .catch(() => toast('📋', 'Link copiado'))
  }

  function handleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tag', tag)
    router.push(`?${params.toString()}`)
  }

  return (
    <article
      id={`post-${post.id}`}
      className="bg-surface border border-border rounded-xl overflow-hidden hover:-translate-y-0.5 hover:border-[#3e3e50] transition-all animate-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="w-9 h-9 rounded-full bg-surface2 border-2 border-border flex items-center justify-center text-lg shrink-0">
          {post.profiles?.avatar_emoji ?? '😂'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{post.profiles?.username ?? 'anon'}</p>
          <p className="text-[11px] font-mono text-muted">{timeAgo(post.created_at)}</p>
        </div>
        {cat && (
          <span
            className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border shrink-0"
            style={{ color: cat.color, background: `${cat.color}22`, borderColor: `${cat.color}44` }}
          >
            {cat.emoji} {cat.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="px-4 pb-3 text-lg font-bold leading-snug">{post.title}</h2>

      {/* Media */}
      {post.image_url && (
        <div className="relative bg-black overflow-hidden" style={{ maxHeight: 560 }}>
          <Image
            src={post.image_url}
            alt={post.title}
            width={800}
            height={560}
            className="w-full object-contain"
            style={{ maxHeight: 560 }}
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {isHot && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-hot text-white">
                <Flame size={11} /> HOT
              </span>
            )}
            {isFresh && !isHot && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-fresh text-black">
                <Sparkles size={11} /> NEW
              </span>
            )}
          </div>
        </div>
      )}
      {!post.image_url && (
        <div className="mx-4 mb-3 h-48 bg-surface2 rounded-lg flex items-center justify-center text-5xl">
          😂
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-border">
          {post.tags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTag(tag)}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-border text-muted hover:text-accent hover:border-accent transition-all font-mono"
            >
              <Tag size={9} /> {tag}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3 border-t border-border">
        <button
          onClick={() => handleVote(1)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all',
            post.user_vote === 1
              ? 'text-accent2 bg-accent2/10'
              : 'text-muted hover:text-white hover:bg-surface2'
          )}
        >
          <ChevronUp size={22} strokeWidth={2.5} />
        </button>
        <span className="font-mono text-sm font-bold w-12 text-center">
          {formatNum(votes)}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all',
            post.user_vote === -1
              ? 'text-blue-400 bg-blue-400/10'
              : 'text-muted hover:text-white hover:bg-surface2'
          )}
        >
          <ChevronDown size={22} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => setCommentsOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-muted hover:text-white hover:bg-surface2 transition-all"
        >
          <MessageCircle size={19} strokeWidth={2} />
          <span className={clsx('transition-all tabular-nums', commentCount > 0 && 'text-white')}>
            {commentCount}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-muted hover:text-white hover:bg-surface2 transition-all ml-auto"
        >
          <Share2 size={18} strokeWidth={2} />
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>

      {commentsOpen && (
        <CommentSection postId={post.id} onAuthRequired={onAuthRequired} />
      )}
    </article>
  )
}
