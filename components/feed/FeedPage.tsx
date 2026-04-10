'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from './PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { AuthModal } from '@/components/auth/AuthModal'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Category } from '@/types'
import { Tag, Users } from 'lucide-react'

type FeedType = 'hot' | 'trending' | 'fresh' | 'top' | 'following'

const FEED_TITLES: Record<FeedType, string> = {
  hot:       'HOT 🔥',
  trending:  'TRENDING 📈',
  fresh:     'FRESH ✨',
  top:       'TOP 👑',
  following: 'SIGUIENDO 👥',
}

export function FeedPage({ feedType, initialPosts = [] }: { feedType: FeedType, initialPosts?: any[] }) {
  const searchParams = useSearchParams()
  const category = (searchParams.get('cat') as Category) ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const { posts, loading, hasMore, loadMore, vote } = usePosts(feedType, category, tag, initialPosts)
  const [authOpen, setAuthOpen] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting && hasMore && !loading) {
      loadMore()
    }
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-4 pt-20 pb-16 flex gap-7 items-start">
        <Sidebar />

        <div className="flex-1 min-w-0">
          {/* Feed header */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <h1 className="font-bebas text-3xl tracking-wide">
              {tag ? (
                <span className="flex items-center gap-2">
                  <Tag size={24} strokeWidth={2.5} className="text-accent" />
                  #{tag}
                </span>
              ) : FEED_TITLES[feedType]}
            </h1>
            <span className="text-[11px] font-mono text-muted bg-surface2 border border-border px-3 py-1 rounded-full">
              {posts.length} posts
            </span>
            {tag && (
              <span className="text-[11px] font-mono text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
                filtrando por #{tag}
              </span>
            )}
            {category && (
              <span className="text-[11px] font-mono text-fresh bg-fresh/10 border border-fresh/30 px-3 py-1 rounded-full">
                categoria activa
              </span>
            )}
          </div>

          {/* Posts */}
          <div className="space-y-5">
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={vote}
                onAuthRequired={() => setAuthOpen(true)}
                delay={Math.min(i, 5) * 50}
              />
            ))}
            {loading && (
              [...Array(posts.length === 0 ? 4 : 2)].map((_, i) => <SkeletonCard key={i} />)
            )}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="h-10 mt-4" />

          {/* Fin del feed */}
          {!loading && !hasMore && posts.length > 0 && (
            <p className="text-center text-muted text-sm font-mono py-8">— fin del feed —</p>
          )}

          {/* Empty states */}
          {!loading && posts.length === 0 && feedType === 'following' && (
            <div className="text-center py-20 text-muted">
              <p className="text-5xl mb-4">👥</p>
              <p className="font-bebas text-2xl tracking-wide">No sigues a nadie todavia</p>
              <p className="text-sm mt-2">Ve al perfil de alguien y dale Seguir</p>
            </div>
          )}

          {!loading && posts.length === 0 && feedType !== 'following' && (
            <div className="text-center py-20 text-muted">
              <p className="text-5xl mb-4">{tag ? '🏷️' : '😶'}</p>
              <p className="font-bebas text-2xl tracking-wide">
                {tag ? `Sin posts con #${tag}` : 'Nada por aqui todavia'}
              </p>
              <p className="text-sm mt-2">
                {tag ? 'Se el primero en publicar con este tag' : 'Se el primero en publicar algo!'}
              </p>
            </div>
          )}
        </div>

        <RightSidebar trending={posts} />
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}