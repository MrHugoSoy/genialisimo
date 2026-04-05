'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { User, LogOut, Upload, Bell, Settings, ChevronDown, BarChart2 } from 'lucide-react'

export function UserMenu() {
  const { profile, signOut } = useAuthContext()
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!profile) return null

  async function handleLogout() {
    await signOut()
    toast('👋', '¡Hasta luego!')
    setOpen(false)
  }

  const menuItems = [
    { icon: User,     label: 'Mi perfil',      action: () => { router.push('/profile'); setOpen(false) } },
    { icon: Upload,   label: 'Subir post',      action: () => { router.push('/create'); setOpen(false) } },
    { icon: BarChart2,label: 'Mis estadísticas',action: () => toast('📊', 'Próximamente') },
    { icon: Bell,     label: 'Notificaciones',  action: () => toast('🔔', 'Próximamente') },
    { icon: Settings, label: 'Ajustes',         action: () => toast('⚙️', 'Próximamente') },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-surface2 border border-border rounded-full pl-1 pr-3 py-1 hover:border-accent transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-surface border-2 border-accent flex items-center justify-center text-base leading-none">
          {profile.avatar_emoji}
        </div>
        <span className="text-sm font-bold max-w-[90px] truncate">{profile.username}</span>
        <ChevronDown size={12} className={clsx('text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl p-2 shadow-2xl z-50 animate-popIn">
          {/* Header */}
          <div className="px-3 py-3 border-b border-border mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-surface2 border border-border flex items-center justify-center text-xl">
                {profile.avatar_emoji}
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{profile.username}</p>
                <p className="text-[10px] text-muted font-mono">Miembro</p>
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
            <LogOut size={14} strokeWidth={2} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
