'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Post } from '@/types'
import { PostCard } from './PostCard'
import { AuthModal } from '@/components/auth/AuthModal'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Search, X } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'

export function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { vote } = usePosts()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Buscar automáticamente si viene ?q= en la URL
  useEffect(() => {
    inputRef.current?.focus()
    if (initialQuery) search(initialQuery)
  }, [])

  // Buscar mientras escribe con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setSearched(false); return }
    debounceRef.current = setTimeout(() => search(query), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function search(q: string) {
    setLoading(true)
    setSearched(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(id, username, avatar_emoji)')
      .ilike('title', `%${q}%`)
      .order('votes', { ascending: false })
      .limit(20)
    setResults(data ?? [])
    setLoading(false)
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">
        <div className="relative mb-8">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar posts, memes, tags..."
            className="w-full pl-12 pr-12 py-4 bg-surface border border-border rounded-xl text-base outline-none focus:border-accent transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {loading && <div className="space-y-5">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bebas text-2xl tracking-wide">Sin resultados para "{query}"</p>
            <p className="text-sm mt-2">Intenta con otras palabras</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-[11px] font-mono text-muted mb-4">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
            </p>
            <div className="space-y-5">
              {results.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={vote}
                  onAuthRequired={() => setAuthOpen(true)}
                  delay={i * 40}
                />
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="text-center py-16 text-muted">
            <p className="text-5xl mb-4">🔎</p>
            <p className="font-bebas text-2xl tracking-wide">Busca cualquier cosa</p>
            <p className="text-sm mt-2">Títulos, tags, categorías...</p>
          </div>
        )}
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}