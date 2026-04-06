'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Comment } from '@/types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { SendHorizonal, ThumbsUp, CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react'

interface CommentSectionProps {
  postId: number
  onAuthRequired: () => void
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]
  parent_id?: number | null
}

interface CommentItemProps {
  comment: CommentWithReplies
  onReply: (id: number, username: string) => void
  onLike: (id: number) => void
  depth?: number
}

function CommentItem({ comment, onReply, onLike, depth = 0 }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className={depth > 0 ? 'ml-8 border-l border-border pl-3' : ''}>
      <div className="flex gap-3 py-2.5">
        <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-sm shrink-0">
          {comment.profiles?.avatar_emoji ?? '😐'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-bold text-accent2">{comment.profiles?.username}</span>
            <span className="text-[10px] font-mono text-muted">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-white/90 mt-0.5 leading-snug">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1 text-[11px] text-muted hover:text-accent2 transition-colors"
            >
              <ThumbsUp size={11} strokeWidth={2} /> {comment.likes}
            </button>
            <button
              onClick={() => onReply(comment.id, comment.profiles?.username ?? 'usuario')}
              className="flex items-center gap-1 text-[11px] text-muted hover:text-accent transition-colors"
            >
              <CornerDownRight size={11} strokeWidth={2} /> Responder
            </button>
            {hasReplies && (
              <button
                onClick={() => setShowReplies(o => !o)}
                className="flex items-center gap-1 text-[11px] text-muted hover:text-white transition-colors"
              >
                {showReplies ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {comment.replies!.length} {comment.replies!.length === 1 ? 'respuesta' : 'respuestas'}
              </button>
            )}
          </div>
        </div>
      </div>

      {hasReplies && showReplies && (
        <div className="mt-1">
          {comment.replies!.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentSection({ postId, onAuthRequired }: CommentSectionProps) {
  const { user, profile } = useAuthContext()
  const { toast } = useToast()
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null)

  useEffect(() => { fetchComments() }, [postId])

  async function fetchComments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(id, username, avatar_emoji)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })

    if (data) {
      const roots = data.filter((c: any) => !c.parent_id)
      const replies = data.filter((c: any) => c.parent_id)
      const nested = roots.map((root: any) => ({
        ...root,
        replies: replies
          .filter((r: any) => r.parent_id === root.id)
          .reverse(),
      }))
      setComments(nested)
    }
    setLoading(false)
  }

  function handleReply(id: number, username: string) {
    if (!user) { onAuthRequired(); return }
    setReplyTo({ id, username })
    setText(`@${username} `)
  }

  function cancelReply() {
    setReplyTo(null)
    setText('')
  }

  async function handleLike(commentId: number) {
    if (!user) { onAuthRequired(); return }
    const supabase = createClient()
    await supabase.rpc('increment_comment_likes', { comment_id: commentId })
    setComments(prev => prev.map(c => {
      if (c.id === commentId) return { ...c, likes: c.likes + 1 }
      const updatedReplies = c.replies?.map(r =>
        r.id === commentId ? { ...r, likes: r.likes + 1 } : r
      )
      return { ...c, replies: updatedReplies }
    }))
  }

  async function handleSubmit() {
    if (!user) { onAuthRequired(); return }
    if (!text.trim()) return
    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: text.trim(),
        parent_id: replyTo?.id ?? null,
      })
      .select('*, profiles!comments_user_id_fkey(id, username, avatar_emoji)')
      .single()

    if (!error && data) {
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo.id
            ? { ...c, replies: [...(c.replies ?? []), data] }
            : c
        ))
      } else {
        setComments(prev => [{ ...data, replies: [] }, ...prev])
      }
      setText('')
      setReplyTo(null)
      toast('💬', 'Comentario enviado')
    }
    setSending(false)
  }

  return (
    <div className="border-t border-border px-4 py-4 space-y-3">
      {/* Input */}
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-sm shrink-0 mt-1">
          {profile?.avatar_emoji ?? '🫠'}
        </div>
        <div className="flex-1 space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-[11px] text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-1.5">
              <CornerDownRight size={11} />
              Respondiendo a <span className="font-bold">@{replyTo.username}</span>
              <button onClick={cancelReply} className="ml-auto text-muted hover:text-white transition-colors">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={user
                ? replyTo ? `Responder a @${replyTo.username}...` : 'Añade un comentario...'
                : 'Inicia sesión para comentar...'}
              onClick={() => !user && onAuthRequired()}
              readOnly={!user}
              className="flex-1 px-3 py-2 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={sending || !text.trim()}
              className="px-3 py-2 bg-accent text-white rounded-lg disabled:opacity-40 hover:bg-red-500 transition-colors shrink-0"
            >
              <SendHorizonal size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 skeleton rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 skeleton rounded w-24" />
                <div className="h-3 skeleton rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              onReply={handleReply}
              onLike={handleLike}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted text-center py-4">Sé el primero en comentar 👀</p>
          )}
        </div>
      )}
    </div>
  )
}