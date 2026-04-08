'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MessageCircle, Share2, ChevronUp, ChevronDown, Flame, Sparkles, Tag, Trash2, MoreHorizontal, Flag, Copy, X, Pencil, Check } from 'lucide-react'
import { Post, CATEGORIES } from '@/types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { CommentSection } from './CommentSection'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePosts } from '@/hooks/usePosts'
import clsx from 'clsx'

interface PostCardProps {
  post: Post
  onVote: (id: number, value: 1 | -1) => void
  onAuthRequired: () => void
  onDelete?: (id: number) => void
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

const REPORT_REASONS = [
  'Contenido inapropiado',
  'Spam',
  'Violencia o gore',
  'Desinformacion',
  'Acoso',
  'Otro',
]

export function PostCard({ post, onVote, onAuthRequired, onDelete, delay = 0 }: PostCardProps) {
  const { user } = useAuthContext()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { deletePost } = usePosts()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [votes, setVotes] = useState(post.votes)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [currentTitle, setCurrentTitle] = useState(post.title)
  const [saving, setSaving] = useState(false)
  const cat = CATEGORIES[post.category as keyof typeof CATEGORIES]
  const isHot = votes > 5000
  const isFresh = (Date.now() - new Date(post.created_at).getTime()) < 3600_000
  const isOwner = user?.id === post.user_id
  const postUrl = `https://genialisimo.com/post/${post.id}`

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

  function handleCopyLink() {
    navigator.clipboard?.writeText(postUrl)
      .then(() => toast('📋', 'Link copiado'))
      .catch(() => toast('📋', 'Link copiado'))
    setShareOpen(false)
  }

  function handleShareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${currentTitle} ${postUrl}`)}`, '_blank')
    setShareOpen(false)
  }

  function handleShareX() {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(currentTitle)}&url=${encodeURIComponent(postUrl)}`, '_blank')
    setShareOpen(false)
  }

  function handleShareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank')
    setShareOpen(false)
  }

  function handleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tag', tag)
    router.push(`?${params.toString()}`)
  }

  async function handleDelete() {
    if (!confirm('Borrar este post? No se puede deshacer.')) return
    setDeleting(true)
    const { error } = await deletePost(post.id)
    if (error) {
      toast('❌', 'Error al borrar')
      setDeleting(false)
      return
    }
    setDeleted(true)
    toast('🗑️', 'Post borrado')
    onDelete?.(post.id)
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) { toast('⚠️', 'El titulo no puede estar vacio'); return }
    if (editTitle === currentTitle) { setEditing(false); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .update({ title: editTitle.trim() })
      .eq('id', post.id)
    setSaving(false)
    if (error) { toast('❌', 'Error al editar'); return }
    setCurrentTitle(editTitle.trim())
    setEditing(false)
    toast('✅', 'Post actualizado')
  }

  function handleCancelEdit() {
    setEditTitle(currentTitle)
    setEditing(false)
  }

  async function handleReport(reason: string) {
    if (!user) { onAuthRequired(); return }
    setReporting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('reports')
      .insert({ post_id: post.id, user_id: user.id, reason })
    setReporting(false)
    setReportOpen(false)
    setMenuOpen(false)
    if (error?.code === '23505') {
      toast('ℹ️', 'Ya reportaste este post')
    } else if (error) {
      toast('❌', 'Error al reportar')
    } else {
      toast('🚩', 'Post reportado, gracias')
    }
  }

  if (deleted) return null

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
          <p
            className="text-sm font-bold truncate hover:text-accent cursor-pointer transition-colors"
            onClick={() => router.push(`/user/${post.profiles?.username}`)}
          >
            {post.profiles?.username ?? 'anon'}
          </p>
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

        {/* Menu opciones */}
        <div className="relative">
          <button
            onClick={() => { setMenuOpen(o => !o); setReportOpen(false) }}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface2 transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl p-1 shadow-2xl z-20 w-44 animate-popIn">
              {isOwner && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); setEditing(true) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-surface2 transition-colors"
                  >
                    <Pencil size={14} strokeWidth={2} /> Editar titulo
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); handleDelete() }}
                    disabled={deleting}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-accent hover:bg-surface2 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    {deleting ? 'Borrando...' : 'Borrar post'}
                  </button>
                </>
              )}
              {!isOwner && (
                <button
                  onClick={() => { setReportOpen(true); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-orange-400 hover:bg-surface2 transition-colors"
                >
                  <Flag size={14} strokeWidth={2} /> Reportar
                </button>
              )}
            </div>
          )}

          {/* Modal de reporte */}
          {reportOpen && (
            <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl p-3 shadow-2xl z-20 w-52 animate-popIn">
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2 font-mono">Por que reportas?</p>
              <div className="space-y-0.5">
                {REPORT_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => handleReport(reason)}
                    disabled={reporting}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-surface2 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setReportOpen(false)}
                className="w-full mt-2 text-[11px] text-muted hover:text-white transition-colors font-mono"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      {editing ? (
        <div className="px-4 pb-3 flex gap-2 items-center">
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSaveEdit()
              if (e.key === 'Escape') handleCancelEdit()
            }}
            maxLength={120}
            autoFocus
            className="flex-1 px-3 py-2 bg-surface2 border border-accent rounded-lg text-sm font-bold outline-none"
          />
          <button
            onClick={handleSaveEdit}
            disabled={saving}
            className="p-2 bg-fresh/20 text-fresh hover:bg-fresh/30 rounded-lg transition-colors"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-2 bg-surface2 text-muted hover:text-white rounded-lg transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <h2 className="px-4 pb-3 text-lg font-bold leading-snug">{currentTitle}</h2>
      )}

      {/* Media */}
      {post.video_url && (
        <div className="relative bg-black overflow-hidden aspect-video">
          <iframe
            src={post.video_url}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
      {!post.video_url && post.image_url && (
        <div className="relative bg-black overflow-hidden" style={{ maxHeight: 560 }}>
          <Image
            src={post.image_url}
            alt={currentTitle}
            width={800}
            height={560}
            className="w-full object-contain"
            style={{ maxHeight: 560 }}
            priority={delay === 0}
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
      {!post.video_url && !post.image_url && (
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

        {/* Compartir */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShareOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-muted hover:text-white hover:bg-surface2 transition-all"
          >
            <Share2 size={18} strokeWidth={2} />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          {shareOpen && (
            <div className="absolute right-0 bottom-full mb-2 bg-surface border border-border rounded-xl p-2 shadow-2xl z-20 w-48 animate-popIn">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-border mb-1">
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Compartir en</p>
                <button onClick={() => setShareOpen(false)} className="text-muted hover:text-white">
                  <X size={12} />
                </button>
              </div>
              <button onClick={handleShareWhatsApp} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-surface2 transition-colors">
                <span className="text-base">💬</span> WhatsApp
              </button>
              <button onClick={handleShareX} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-surface2 transition-colors">
                <span className="text-base font-bold text-white">𝕏</span> Twitter / X
              </button>
              <button onClick={handleShareFacebook} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-surface2 transition-colors">
                <span className="text-base">👤</span> Facebook
              </button>
              <div className="h-px bg-border my-1" />
              <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-surface2 transition-colors">
                <Copy size={14} strokeWidth={2} /> Copiar link
              </button>
            </div>
          )}
        </div>
      </div>

      {commentsOpen && (
        <CommentSection postId={post.id} onAuthRequired={onAuthRequired} />
      )}
    </article>
  )
}