'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, TrendingUp, Sparkles, Crown, PlusCircle, Users } from 'lucide-react'
import { useAuthContext } from '@/components/auth/AuthProvider'
import clsx from 'clsx'

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuthContext()

  const NAV = [
    { label: 'Hot',    href: '/',          icon: Flame },
    { label: 'Trend',  href: '/trending',  icon: TrendingUp },
    { label: 'Fresh',  href: '/fresh',     icon: Sparkles },
    { label: 'Top',    href: '/top',       icon: Crown },
    ...(user ? [{ label: 'Siguiendo', href: '/following', icon: Users }] : []),
    { label: 'Crear',  href: '/create',    icon: PlusCircle },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-bg/95 backdrop-blur-xl border-t border-border">
      {NAV.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-bold uppercase tracking-wide transition-colors min-w-0',
            pathname === href ? 'text-accent' : 'text-muted hover:text-white'
          )}
        >
          <Icon
            size={18}
            strokeWidth={pathname === href ? 2.5 : 1.8}
            className="transition-all shrink-0"
          />
          <span className="truncate w-full text-center">{label}</span>
        </Link>
      ))}
    </nav>
  )
}