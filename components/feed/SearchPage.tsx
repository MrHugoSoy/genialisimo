'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Post, Profile } from '@/types'
import { PostCard } from './PostCard'
import { AuthModal } from '@/components/auth/AuthModal'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Search, X, User, FileText } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'

export function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { vote } = usePosts()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    inputRef.current?.focus()
    if (initialQuery) search(initialQuery)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setPosts([]); setUsers([]); setSearched(false); return }
    debounceRef.current = setTimeout(() => search(query), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function search(q: string) {
    setLoading(true)
    setSearched(true)
    const supabase = createClient()

    const [postsRes, usersRes] = await Promise.all([
      supabase
        .from('posts')
        .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji)')
        .ilike('title', `%${q}%`)
        .order('votes', { ascending: false })
        .limit(20),
      supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${q}%`)
        .limit(10)
    ])

    setPosts(postsRes.data ?? [])
    setUsers(usersRes.data ?? [])
    setLoading(false)
  }

  const totalResults = posts.length + users.length

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">
        {/* Input */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar posts, usuarios, tags..."
            className="w-full pl-12 pr-12 py-4 bg-surface border border-border rounded-xl text-base outline-none focus:border-accent transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setPosts([]); setUsers([]); setSearched(false) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        {searched && !loading && totalResults > 0 && (
          <div className="flex gap-1 bg-surface2 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'posts' ? 'bg-surface text-white' : 'text-muted hover:text-white'}`}
            >
              <FileText size={13} /> Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-surface text-white' : 'text-muted hover:text-white'}`}
            >
              <User size={13} /> Usuarios ({users.length})
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <div className="space-y-5">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>}

        {/* Sin resultados */}
        {!loading && searched && totalResults === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bebas text-2xl tracking-wide">Sin resultados para "{query}"</p>
            <p className="text-sm mt-2">Intenta con otras palabras</p>
          </div>
        )}

        {/* Tab Posts */}
        {!loading && searched && activeTab === 'posts' && posts.length > 0 && (
          <div className="space-y-5">
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={vote}
                onAuthRequired={() => setAuthOpen(true)}
                delay={i * 40}
              />
            ))}
          </div>
        )}

        {/* Tab Usuarios */}
        {!loading && searched && activeTab === 'users' && users.length > 0 && (
          <div className="space-y-3">
            {users.map(user => (
              <div
                key={user.id}
                onClick={() => router.push(`/user/${user.username}`)}
                className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl cursor-pointer hover:border-accent transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-surface2 border-2 border-border flex items-center justify-center text-2xl shrink-0">
                  {user.avatar_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">@{user.username}</p>
                  {user.bio && <p className="text-xs text-muted truncate mt-0.5">{user.bio}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bebas text-lg text-accent2 leading-none">{user.points ?? 0}</p>
                  <p className="text-[10px] text-muted font-mono">puntos</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado inicial */}
        {!searched && (
          <div className="text-center py-16 text-muted">
            <p className="text-5xl mb-4">🔎</p>
            <p className="font-bebas text-2xl tracking-wide">Busca cualquier cosa</p>
            <p className="text-sm mt-2">Posts, usuarios, tags...</p>
          </div>
        )}
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}