'use client'
import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, MessageCircle, CornerDownRight, Check, CheckCheck } from 'lucide-react'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import clsx from 'clsx'

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'reply') return <CornerDownRight size={13} className="text-accent2" />
  return <MessageCircle size={13} className="text-accent" />
}

function NotifText({ notif }: { notif: Notification }) {
  const user = notif.from_profile?.username ?? 'alguien'
  const title = notif.post?.title ? `"${notif.post.title.slice(0, 30)}${notif.post.title.length > 30 ? '...' : ''}"` : 'tu post'
  if (notif.type === 'reply') return <span><b>{user}</b> respondió tu comentario en {title}</span>
  if (notif.type === 'comment') return <span><b>{user}</b> comentó en {title}</span>
  return <span><b>{user}</b> interactuó con {title}</span>
}

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, loading, markAllRead, markRead } = useNotifications()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleNotifClick(notif: Notification) {
    markRead(notif.id)
    onClose()
    if (notif.post_id) router.push(`/post/${notif.post_id}`)
  }

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 animate-popIn overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={15} strokeWidth={2} />
          <span className="font-bold text-sm">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-accent2 transition-colors font-mono"
          >
            <CheckCheck size={12} /> Marcar leídas
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 skeleton rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 skeleton rounded w-full" />
                  <div className="h-3 skeleton rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-10 text-muted">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sin notificaciones</p>
          </div>
        )}

        {!loading && notifications.map(notif => (
          <button
            key={notif.id}
            onClick={() => handleNotifClick(notif)}
            className={clsx(
              'w-full flex items-start gap-3 px-4 py-3 hover:bg-surface2 transition-colors text-left border-b border-border last:border-0',
              !notif.read && 'bg-accent/5'
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-sm shrink-0">
              {notif.from_profile?.avatar_emoji ?? '😐'}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <NotifIcon type={notif.type} />
                <span className="text-[10px] font-mono text-muted">{timeAgo(notif.created_at)}</span>
                {!notif.read && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                )}
              </div>
              <p className="text-xs text-white/90 leading-snug">
                <NotifText notif={notif} />
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Bell button con badge
export function NotificationBell() {
  const { unreadCount } = useNotifications()
  return (
    <div className="relative">
      <Bell size={18} strokeWidth={2} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  )
}
