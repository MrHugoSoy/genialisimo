'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Globe, Laugh, Gamepad2, PawPrint, Monitor, Trophy, Skull, Heart, Film } from 'lucide-react'
import { CATEGORIES, Category } from '@/types'
import clsx from 'clsx'

const CATEGORY_ICONS: Record<string, any> = {
  memes:     Laugh,
  gaming:    Gamepad2,
  animals:   PawPrint,
  tech:      Monitor,
  sports:    Trophy,
  fails:     Skull,
  relatable: Heart,
  movies:    Film,
}

export function Sidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get('cat') ?? 'all') as Category | 'all'

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === 'all') params.delete('cat')
    else params.set('cat', cat)
    router.push(`?${params.toString()}`)
  }

  return (
    <aside className="w-48 shrink-0 sticky top-20 self-start hidden lg:block">
      <p className="text-[10px] font-mono uppercase tracking-[3px] text-muted mb-3 px-1">Categorías</p>
      <div className="space-y-0.5">
        <button
          onClick={() => setCategory('all')}
          className={clsx(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
            current === 'all'
              ? 'text-white bg-surface border-border'
              : 'text-muted hover:text-white hover:bg-surface border-transparent'
          )}
        >
          <Globe size={15} strokeWidth={current === 'all' ? 2.5 : 1.8} /> Todo
        </button>

        {(Object.entries(CATEGORIES) as [Category, { label: string; emoji: string; color: string }][]).map(([key, cat]) => {
          const Icon = CATEGORY_ICONS[key] ?? Globe
          const isActive = current === key
          return (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                isActive
                  ? 'text-white bg-surface border-border'
                  : 'text-muted hover:text-white hover:bg-surface border-transparent'
              )}
            >
              <Icon
                size={15}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? cat.color : undefined }}
              />
              {cat.label}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
