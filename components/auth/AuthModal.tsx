'use client'
import { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from './AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { AVATARS } from '@/types'
import clsx from 'clsx'

interface AuthModalProps {
  isOpen: boolean
  defaultTab?: 'login' | 'register'
  onClose: () => void
}

export function AuthModal({ isOpen, defaultTab = 'login', onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuthContext()
  const { toast } = useToast()
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regUser, setRegUser] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')

  const passStrength = (p: string) => {
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^a-zA-Z0-9]/.test(p)) s++
    return s
  }
  const strength = passStrength(regPass)
  const strengthColors = ['', '#ef4444', '#ff6b35', '#ffcc00', '#00d4aa', '#00d4aa']
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte 💪', 'Fuerte 💪']

  async function handleLogin() {
    if (!loginEmail || !loginPass) { toast('⚠️', 'Completa todos los campos'); return }
    setLoading(true)
    const { error } = await signIn(loginEmail, loginPass)
    setLoading(false)
    if (error) { toast('❌', 'Credenciales incorrectas'); return }
    toast('👋', '¡Bienvenido de vuelta!')
    onClose()
  }

  async function handleRegister() {
    if (!regName || !regUser || !regEmail || !regPass) { toast('⚠️', 'Completa todos los campos'); return }
    if (!/^[a-z0-9_]{3,20}$/i.test(regUser)) { toast('⚠️', 'Usuario: 3-20 chars sin espacios'); return }
    if (regPass.length < 6) { toast('⚠️', 'Contraseña mínimo 6 caracteres'); return }
    setLoading(true)
    const { error } = await signUp(regEmail, regPass, regUser, selectedAvatar)
    setLoading(false)
    if (error) { toast('❌', error.message); return }
    toast('🚀', `¡Cuenta creada! Bienvenido, ${regUser}!`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md mx-4 bg-surface border border-border rounded-2xl p-7 animate-popIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface2 text-muted hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface2 rounded-xl p-1 mb-6">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'flex-1 py-2 rounded-lg font-bebas text-lg tracking-widest transition-all',
                tab === t ? 'bg-accent text-white' : 'text-muted hover:text-white'
              )}
            >
              {t === 'login' ? 'ENTRAR' : 'REGISTRARSE'}
            </button>
          ))}
        </div>

        {/* LOGIN */}
        {tab === 'login' && (
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface2 border border-border rounded-lg text-sm font-semibold hover:border-accent transition-colors"
            >
              🌐 Continuar con Google
            </button>
            <div className="flex items-center gap-3 text-muted text-xs">
              <div className="flex-1 h-px bg-border" /> o con email <div className="flex-1 h-px bg-border" />
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text" placeholder="Email o usuario"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showPass ? 'text' : 'password'} placeholder="Contraseña"
                value={loginPass} onChange={e => setLoginPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full pl-9 pr-10 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
              <button onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              onClick={handleLogin} disabled={loading}
              className="w-full py-3 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-xl tracking-widest transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR →'}
            </button>
            <p className="text-center text-xs text-muted cursor-pointer hover:text-accent transition-colors" onClick={() => toast('📧', 'Link de recuperación enviado')}>
              ¿Olvidaste tu contraseña?
            </p>
          </div>
        )}

        {/* REGISTER */}
        {tab === 'register' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text" placeholder="Nombre"
                  value={regName} onChange={e => setRegName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
                <input
                  type="text" placeholder="username"
                  value={regUser} onChange={e => setRegUser(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email" placeholder="tu@email.com"
                value={regEmail} onChange={e => setRegEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Contraseña (mín. 6 chars)"
                  value={regPass} onChange={e => setRegPass(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
                />
                <button onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {regPass && (
                <div className="mt-1.5">
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${strength * 20}%`, background: strengthColors[strength] }}
                    />
                  </div>
                  <p className="text-[10px] mt-1 font-mono" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Elige tu avatar</p>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setSelectedAvatar(a)}
                    className={clsx(
                      'w-10 h-10 rounded-full bg-surface2 border-2 text-xl flex items-center justify-center transition-all',
                      selectedAvatar === a ? 'border-accent scale-110' : 'border-border hover:border-accent/50'
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleRegister} disabled={loading}
              className="w-full py-3 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-xl tracking-widest transition-all disabled:opacity-50"
            >
              {loading ? 'CREANDO...' : 'CREAR CUENTA 🚀'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
