'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Post } from '@/types'
import { POPULAR_TAGS } from '@/types'
import clsx from 'clsx'

function formatNum(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

interface RightSidebarProps {
  trending?: Post[]
}

export function RightSidebar({ trending = [] }: RightSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''

  function handleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeTag === tag) {
      params.delete('tag')
    } else {
      params.set('tag', tag)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <aside className="w-56 shrink-0 sticky top-20 self-start hidden xl:block space-y-4">
      {/* Trending */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bebas text-lg tracking-wide mb-3">🔥 Trending</h3>
        <div className="space-y-0">
          {trending.slice(0, 5).map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-2.5 py-2 border-b border-border last:border-0 cursor-pointer hover:opacity-75 transition-opacity"
            >
              <span className="font-mono text-[11px] text-accent font-bold w-5 text-center">#{i + 1}</span>
              <div className="w-12 h-9 rounded bg-surface2 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  : p.profiles?.avatar_emoji ?? '😂'
                }
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{p.title}</p>
                <p className="text-[10px] font-mono text-muted">{formatNum(p.votes)} pts</p>
              </div>
            </div>
          ))}
          {trending.length === 0 && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-2 py-1.5">
                  <div className="w-5 h-3 skeleton rounded" />
                  <div className="w-10 h-8 skeleton rounded" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2.5 skeleton rounded w-full" />
                    <div className="h-2 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="font-bebas text-lg tracking-wide mb-3">🏷️ Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTag(tag)}
              className={clsx(
                'text-[11px] px-2.5 py-1 border rounded-full font-bold transition-all',
                activeTag === tag
                  ? 'bg-accent text-white border-accent'
                  : 'border-border text-muted hover:border-accent hover:text-white'
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
        {activeTag && (
          <button
            onClick={() => handleTag(activeTag)}
            className="mt-3 w-full text-[11px] text-muted hover:text-accent transition-colors font-mono"
          >
            ✕ quitar filtro #{activeTag}
          </button>
        )}
      </div>
    </aside>
  )
}
