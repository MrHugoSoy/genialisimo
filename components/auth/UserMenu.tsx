'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { User, LogOut, Upload, Settings, ChevronDown, Shield } from 'lucide-react'
import { NotificationPanel, NotificationBell } from '@/components/ui/NotificationPanel'
import { Avatar } from '@/components/ui/Avatar'
import clsx from 'clsx'

export function UserMenu() {
  const { profile, signOut } = useAuthContext()
  const { toast } = useToast()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!profile) return null

  async function handleLogout() {
    await signOut()
    toast('👋', 'Hasta luego!')
    setMenuOpen(false)
  }

  const isAdmin = (profile as any).role === 'admin'

  const menuItems = [
    { icon: User,      label: 'Mi perfil',       action: () => { router.push(`/user/${profile.username}`); setMenuOpen(false) } },
    { icon: Upload,    label: 'Subir post',       action: () => { router.push('/create'); setMenuOpen(false) } },
    { icon: Settings,  label: 'Ajustes',          action: () => toast('⚙️', 'Proximamente') },
  ]

  return (
    <div className="flex items-center gap-1.5">
      {/* Notification bell */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => { setNotifOpen(o => !o); setMenuOpen(false) }}
          className="relative p-1.5 text-muted hover:text-white hover:bg-surface2 rounded-lg transition-colors"
        >
          <NotificationBell />
        </button>
        <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* User pill */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => { setMenuOpen(o => !o); setNotifOpen(false) }}
          className="flex items-center gap-1.5 bg-surface2 border border-border rounded-full pl-1 py-1 hover:border-accent transition-colors pr-1.5 md:pr-3"
        >
          <div className="w-7 h-7 rounded-full border-2 border-accent flex items-center justify-center overflow-hidden shrink-0 bg-surface">
            <Avatar
              avatarUrl={(profile as any).avatar_url}
              avatarEmoji={profile.avatar_emoji}
              size={28}
            />
          </div>
          <span className="hidden md:block text-sm font-bold max-w-[90px] truncate">{profile.username}</span>
          <ChevronDown size={12} className={clsx('hidden md:block text-muted transition-transform', menuOpen && 'rotate-180')} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl p-2 shadow-2xl z-50 animate-popIn">
            <div className="px-3 py-3 border-b border-border mb-2">
              <div
                className="flex items-center gap-2 mb-2 cursor-pointer"
                onClick={() => { router.push(`/user/${profile.username}`); setMenuOpen(false) }}
              >
                <div className="w-9 h-9 rounded-full bg-surface2 border border-border flex items-center justify-center overflow-hidden shrink-0">
                  <Avatar
                    avatarUrl={(profile as any).avatar_url}
                    avatarEmoji={profile.avatar_emoji}
                    size={36}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight hover:text-accent transition-colors">{profile.username}</p>
                  <p className="text-[10px] text-muted font-mono">Ver perfil publico →</p>
                </div>
              </div>
              <div className="flex gap-4">
                {[['posts', 'Posts'], ['points', 'Puntos']].map(([key, label]) => (
                  <div key={key} className="text-center">
                    <p className="font-bebas text-xl text-accent leading-none">{(profile as any)[key] ?? 0}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => { router.push('/admin'); setMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-accent hover:text-white hover:bg-accent/10 transition-colors text-left mb-1"
              >
                <Shield size={14} strokeWidth={2} /> Panel Admin
              </button>
            )}

            {menuItems.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-surface2 transition-colors text-left"
              >
                <Icon size={14} strokeWidth={2} /> {label}
              </button>
            ))}

            <div className="h-px bg-border my-2" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-accent hover:bg-surface2 transition-colors text-left"
            >
              <LogOut size={14} strokeWidth={2} /> Cerrar sesion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}