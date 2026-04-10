'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from './PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { AuthModal } from '@/components/auth/AuthModal'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Category, Post } from '@/types'
import { Tag, Users, Zap, MessageCircle, TrendingUp } from 'lucide-react'

type FeedType = 'hot' | 'trending' | 'fresh' | 'top' | 'following'

const FEED_TITLES: Record<FeedType, string> = {
  hot:       'HOT 🔥',
  trending:  'TRENDING 📈',
  fresh:     'FRESH ✨',
  top:       'TOP 👑',
  following: 'SIGUIENDO 👥',
}

function WelcomeBanner({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent2 to-accent" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-bebas text-2xl tracking-wide mb-1">
            Bienvenido a <span className="text-accent">Geniali</span><span className="text-accent2">simo</span> 🔥
          </h2>
          <p className="text-sm text-muted mb-3">
            El mejor feed de memes y contenido viral en español. Únete a la comunidad latina.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Zap size={13} className="text-accent2" />
              <span>Vota el mejor contenido</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <MessageCircle size={13} className="text-accent" />
              <span>Comenta y conecta</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <TrendingUp size={13} className="text-accent2" />
              <span>Sube tu contenido</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onRegister}
            className="px-5 py-2.5 bg-accent text-white font-bebas text-lg tracking-wider rounded-xl hover:bg-red-500 transition-colors"
          >
            Unirse gratis
          </button>
        </div>
      </div>
    </div>
  )
}

export function FeedPage({ feedType, initialPosts = [] }: { feedType: FeedType, initialPosts?: Post[] }) {
  const searchParams = useSearchParams()
  const category = (searchParams.get('cat') as Category) ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const { posts, loading, hasMore, loadMore, vote } = usePosts(feedType, category, tag, initialPosts)
  const { user } = useAuthContext()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
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

  function openRegister() {
    setAuthTab('register')
    setAuthOpen(true)
  }

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-4 pt-20 pb-16 flex gap-7 items-start">
        <Sidebar />

        <div className="flex-1 min-w-0">
          {/* Banner de bienvenida — solo para usuarios no logueados */}
          {!user && feedType === 'hot' && (
            <WelcomeBanner onRegister={openRegister} />
          )}

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

      <AuthModal isOpen={authOpen} defaultTab={authTab} onClose={() => setAuthOpen(false)} />
    </>
  )
}