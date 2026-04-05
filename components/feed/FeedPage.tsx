'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from './PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { AuthModal } from '@/components/auth/AuthModal'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Category } from '@/types'
import { Tag } from 'lucide-react'

type FeedType = 'hot' | 'trending' | 'fresh' | 'top'

const FEED_TITLES: Record<FeedType, string> = {
  hot:      'HOT 🔥',
  trending: 'TRENDING 📈',
  fresh:    'FRESH ✨',
  top:      'TOP 👑',
}

export function FeedPage({ feedType }: { feedType: FeedType }) {
  const searchParams = useSearchParams()
  const category = (searchParams.get('cat') as Category) ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const { posts, loading, hasMore, loadMore, vote } = usePosts(feedType, category, tag)
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-4 pt-20 pb-16 flex gap-7">
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
                categoría activa
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

            {loading && posts.length === 0 && (
              [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            )}
          </div>

          {/* Load more */}
          {!loading && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-8 py-3 bg-surface border border-border hover:border-accent text-muted hover:text-white rounded-xl font-bold text-sm transition-all"
              >
                Cargar más 👇
              </button>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-20 text-muted">
              <p className="text-5xl mb-4">{tag ? '🏷️' : '😶'}</p>
              <p className="font-bebas text-2xl tracking-wide">
                {tag ? `Sin posts con #${tag}` : 'Nada por aquí todavía'}
              </p>
              <p className="text-sm mt-2">
                {tag ? 'Sé el primero en publicar con este tag' : '¡Sé el primero en publicar algo!'}
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
