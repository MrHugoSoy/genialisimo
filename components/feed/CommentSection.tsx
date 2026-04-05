'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Comment } from '@/types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { SendHorizonal, ThumbsUp } from 'lucide-react'

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

export function CommentSection({ postId, onAuthRequired }: CommentSectionProps) {
  const { user, profile } = useAuthContext()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => { fetchComments() }, [postId])

  async function fetchComments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(id, username, avatar_emoji)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
    setLoading(false)
  }

  async function handleSubmit() {
    if (!user) { onAuthRequired(); return }
    if (!text.trim()) return
    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content: text.trim() })
      .select('*, profiles!comments_user_id_fkey(id, username, avatar_emoji)')
      .single()
    if (!error && data) {
      setComments(prev => [...prev, data])
      setText('')
      toast('💬', 'Comentario enviado')
    }
    setSending(false)
  }

  return (
    <div className="border-t border-border px-4 py-4 space-y-4">
      {/* Input */}
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-sm shrink-0">
          {profile?.avatar_emoji ?? '🫠'}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={user ? 'Añade un comentario...' : 'Inicia sesión para comentar...'}
            onClick={() => !user && onAuthRequired()}
            readOnly={!user}
            className="flex-1 px-3 py-2 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={sending || !text.trim()}
            className="px-3 py-2 bg-accent text-white rounded-lg disabled:opacity-40 hover:bg-red-500 transition-colors"
          >
            <SendHorizonal size={14} strokeWidth={2} />
          </button>
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
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0 animate-slideUp">
              <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-sm shrink-0">
                {c.profiles?.avatar_emoji ?? '😐'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-accent2">{c.profiles?.username}</span>
                  <span className="text-[10px] font-mono text-muted">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-white/90 mt-0.5 leading-snug">{c.content}</p>
                <button className="flex items-center gap-1 mt-1 text-[11px] text-muted hover:text-accent2 transition-colors">
                  <ThumbsUp size={11} strokeWidth={2} /> {c.likes}
                </button>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted text-center py-2">Sé el primero en comentar 👀</p>
          )}
        </div>
      )}
    </div>
  )
}
