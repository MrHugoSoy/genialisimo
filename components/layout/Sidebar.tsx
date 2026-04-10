'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Globe, Laugh, Gamepad2, PawPrint, Monitor, Trophy, Skull, Heart, Film, Youtube, Sword, Music, UtensilsCrossed } from 'lucide-react'
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
  youtube:   Youtube,
  anime:     Sword,
  music:     Music,
  food:      UtensilsCrossed,
}

const CATEGORY_COLORS: Record<string, string> = {
  memes:     '#ff6b35',
  gaming:    '#7b61ff',
  animals:   '#00d4aa',
  tech:      '#378ADD',
  sports:    '#ffcc00',
  fails:     '#ff4654',
  relatable: '#ff69b4',
  movies:    '#a78bfa',
  youtube:   '#ff0000',
  anime:     '#e879f9',
  music:     '#06b6d4',
  food:      '#f97316',
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
    <>
      <div className="w-48 shrink-0 hidden lg:block" />
      <aside className="w-48 shrink-0 hidden lg:block fixed top-20 left-[max(16px,calc(50vw-550px))] overflow-y-auto max-h-[calc(100vh-88px)]">
        <p className="text-[10px] font-mono uppercase tracking-[3px] text-muted mb-3 px-1">Categorias</p>
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
            <Globe
              size={15}
              strokeWidth={current === 'all' ? 2.5 : 1.8}
              style={{ color: current === 'all' ? '#ffffff' : '#8888a0' }}
            />
            Todo
          </button>
          {(Object.entries(CATEGORIES) as [Category, { label: string; emoji: string; color: string }][]).map(([key, cat]) => {
            const Icon = CATEGORY_ICONS[key] ?? Globe
            const isActive = current === key
            const color = CATEGORY_COLORS[key] ?? cat.color
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
                  style={{ color: isActive ? '#ffffff' : color }}
                />
                {cat.label}
              </button>
            )
          })}
        </div>
      </aside>
    </>
  )
}