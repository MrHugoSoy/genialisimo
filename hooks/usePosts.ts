'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Post, Category } from '@/types'

type FeedType = 'hot' | 'trending' | 'fresh' | 'top' | 'following'

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new window.Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const maxW = 1200
      const ratio = Math.min(1, maxW / img.width)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          }))
        },
        'image/jpeg',
        0.82
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function usePosts(feedType: FeedType = 'hot', category?: Category, tag?: string, initialPosts: Post[] = []) {
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(initialPosts.length === 0)
  const [page, setPage] = useState(initialPosts.length > 0 ? 1 : 0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 10

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true)
    const currentPage = reset ? 0 : page

    if (feedType === 'following') {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); setPosts([]); return }

      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (!follows || follows.length === 0) {
        setPosts([])
        setHasMore(false)
        setLoading(false)
        return
      }

      const followingIds = follows.map(f => f.following_id)

      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji, avatar_url)')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

      if (!error && data) {
        setPosts(prev => reset ? data : [...prev, ...data])
        setHasMore(data.length === PAGE_SIZE)
        if (reset) setPage(1)
        else setPage(p => p + 1)
      }
      setLoading(false)
      return
    }

    let query = supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji, avatar_url)')
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    if (category) query = query.eq('category', category)
    if (tag) query = query.contains('tags', [tag])

    if (feedType === 'top') {
      query = query.order('votes', { ascending: false })
    } else if (feedType === 'hot') {
      if (!category && !tag) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', yesterday)
      }
      query = query.order('votes', { ascending: false })
    } else if (feedType === 'trending') {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', lastWeek).order('comment_count', { ascending: false })
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

  useEffect(() => {
    fetchPosts(true)
  }, [feedType, category, tag])

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

  async function createPost(
    title: string,
    category: Category,
    imageFile?: File,
    tags: string[] = [],
    videoUrl?: string
  ) {
    const supabaseClient = createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return { data: null, error: 'No autenticado' }

    // Sanitizar titulo
    title = title.trim().replace(/<[^>]*>/g, '').slice(0, 120)
    if (!title) return { data: null, error: 'Titulo invalido' }

    // Validar tamaño de imagen — max 10MB
    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      return { data: null, error: 'La imagen no puede pesar mas de 10MB' }
    }

    // Validar tipo de archivo
    if (imageFile && !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(imageFile.type)) {
      return { data: null, error: 'Formato de imagen no permitido' }
    }

    let image_url: string | null = null
    let video_url: string | null = null

    if (videoUrl) {
      const youtubeId = extractYoutubeId(videoUrl)
      if (youtubeId) {
        video_url = `https://www.youtube.com/embed/${youtubeId}`
      }
    }

    if (imageFile) {
      const fileToUpload = imageFile.type === 'image/gif'
        ? imageFile
        : await compressImage(imageFile)

      const path = `${user.id}/${Date.now()}-${fileToUpload.name}`
      const { error: uploadError } = await supabaseClient.storage
        .from('posts')
        .upload(path, fileToUpload)

      if (uploadError) {
        console.warn('Upload error:', uploadError.message)
      } else {
        image_url = supabaseClient.storage.from('posts').getPublicUrl(path).data.publicUrl
      }
    }

    const { data, error } = await supabaseClient
      .from('posts')
      .insert({ title, category, image_url, video_url, user_id: user.id, tags })
      .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji, avatar_url)')
      .single()

    if (error) {
      console.error('Post insert error:', JSON.stringify(error, null, 2))
      return { data: null, error: error.message }
    }

    if (data) setPosts(prev => [data, ...prev])
    return { data, error: null }
  }

  async function deletePost(postId: number) {
    const supabaseClient = createClient()
    const { error } = await supabaseClient
      .from('posts')
      .delete()
      .eq('id', postId)
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId))
    }
    return { error: error ? error.message : null }
  }

  return {
    posts,
    loading,
    hasMore,
    loadMore: () => fetchPosts(false),
    vote,
    createPost,
    deletePost,
    refresh: () => fetchPosts(true),
  }
}