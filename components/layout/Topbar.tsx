'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Flame, TrendingUp, Sparkles, Crown, Plus } from 'lucide-react'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { UserMenu } from '@/components/auth/UserMenu'
import { AuthModal } from '@/components/auth/AuthModal'
import clsx from 'clsx'

const NAV = [
  { label: 'Hot',     href: '/',         icon: Flame },
  { label: 'Trend',   href: '/trending', icon: TrendingUp },
  { label: 'Fresh',   href: '/fresh',    icon: Sparkles },
  { label: 'Top',     href: '/top',      icon: Crown },
]

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthContext()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [search, setSearch] = useState('')

  function openAuth(tab: 'login' | 'register' = 'login') {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  function handleUpload() {
    if (!user) { openAuth('login'); return }
    router.push('/create')
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center gap-4 px-4 bg-bg/90 backdrop-blur-xl border-b border-border">
        {/* Logo */}
        <Link href="/" className="font-bebas text-2xl tracking-widest text-accent shrink-0" style={{ textShadow: '0 0 20px rgba(255,70,84,0.4)' }}>
          Geniali<span className="text-accent2">simo</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" strokeWidth={2} />
          <input
            type="text"
            placeholder="Buscar memes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Nav tabs */}
        <nav className="hidden md:flex gap-1 ml-auto">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href} href={href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all',
                pathname === href
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-white hover:bg-surface2'
              )}
            >
              <Icon size={13} strokeWidth={2.5} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth zone */}
        <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
          {user ? (
            <>
              <UserMenu />
              <button
                onClick={handleUpload}
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-accent2 text-black font-bebas text-base tracking-wider rounded-lg hover:scale-105 transition-transform"
              >
                <Plus size={16} strokeWidth={3} /> SUBIR
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth('login')}
                className="px-3 py-1.5 border border-border rounded-lg text-muted text-sm font-bold hover:border-accent hover:text-white transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => openAuth('register')}
                className="px-3 py-1.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors"
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </header>

      <AuthModal isOpen={authOpen} defaultTab={authTab} onClose={() => setAuthOpen(false)} />
    </>
  )
}
