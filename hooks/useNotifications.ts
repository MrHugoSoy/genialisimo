'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthContext } from '@/components/auth/AuthProvider'

export interface Notification {
  id: number
  user_id: string
  from_user_id: string
  type: 'comment' | 'reply' | 'vote' | 'mention'
  post_id: number
  comment_id: number
  read: boolean
  created_at: string
  from_profile?: {
    username: string
    avatar_emoji: string
  }
  post?: {
    title: string
  }
}

export function useNotifications() {
  const { user } = useAuthContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchNotifications()
    subscribeToNotifications()
  }, [user])

  async function fetchNotifications() {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        from_profile:profiles!notifications_from_user_id_fkey(username, avatar_emoji),
        post:posts!notifications_post_id_fkey(title)
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    }
    setLoading(false)
  }

  function subscribeToNotifications() {
    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user!.id}`,
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  async function markAllRead() {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user!.id)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function markRead(id: number) {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return { notifications, unreadCount, loading, markAllRead, markRead, refetch: fetchNotifications }
}
