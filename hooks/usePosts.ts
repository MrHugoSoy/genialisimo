'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Post, Category } from '@/types'

type FeedType = 'hot' | 'trending' | 'fresh' | 'top'

export function usePosts(feedType: FeedType = 'hot', category?: Category, tag?: string) {
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 10

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true)
    const currentPage = reset ? 0 : page

    let query = supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji)')
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    if (category) query = query.eq('category', category)
    if (tag) query = query.contains('tags', [tag])

    if (feedType === 'hot' || feedType === 'top') {
      query = query.order('votes', { ascending: false })
    } else if (feedType === 'trending') {
      query = query.order('comment_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (!error && data) {
      setPosts(prev => reset ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
      if (reset) setPage(1)
      else setPage(p => p + 1)
    }
    setLoading(false)
  }, [feedType, category, tag, page])

  useEffect(() => { fetchPosts(true) }, [feedType, category, tag])

  async function vote(postId: number, value: 1 | -1) {
    const { error } = await supabase.rpc('vote_post', { p_post_id: postId, p_value: value })
    if (!error) {
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        const wasVoted = p.user_vote === value
        return {
          ...p,
          votes: wasVoted ? p.votes - value : p.votes + (p.user_vote ? value * 2 : value),
          user_vote: wasVoted ? 0 : value,
        }
      }))
    }
  }

  async function createPost(title: string, category: Category, imageFile?: File, tags: string[] = []) {
    const supabaseClient = createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return { data: null, error: 'No autenticado' }

    let image_url: string | null = null
    if (imageFile) {
      const path = `${user.id}/${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabaseClient.storage
        .from('posts')
        .upload(path, imageFile)
      if (uploadError) {
        console.warn('Upload error:', uploadError.message)
      } else {
        image_url = supabaseClient.storage.from('posts').getPublicUrl(path).data.publicUrl
      }
    }

    const { data, error } = await supabaseClient
      .from('posts')
      .insert({ title, category, image_url, user_id: user.id, tags })
      .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji)')
      .single()

    if (error) {
      console.error('Post insert error:', JSON.stringify(error, null, 2))
      return { data: null, error: error.message }
    }

    if (data) setPosts(prev => [data, ...prev])
    return { data, error: null }
  }

  return {
    posts,
    loading,
    hasMore,
    loadMore: () => fetchPosts(false),
    vote,
    createPost,
    refresh: () => fetchPosts(true),
  }
}
