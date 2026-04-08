'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toaster'
import { Lock, Eye, EyeOff } from 'lucide-react'

export function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit() {
    if (!password) { toast('⚠️', 'Escribe una contraseña'); return }
    if (password.length < 6) { toast('⚠️', 'Mínimo 6 caracteres'); return }
    if (password !== confirm) { toast('⚠️', 'Las contraseñas no coinciden'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { toast('❌', error.message); return }
    toast('✅', '¡Contraseña actualizada!')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h1 className="font-bebas text-3xl tracking-wide mb-2">Nueva contraseña</h1>
          <p className="text-muted text-sm mb-6">Elige una contraseña segura para tu cuenta.</p>

          <div className="space-y-4">
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                className="w-full pl-9 pr-10 py-3 bg-surface2 border border-border rounded-xl text-sm outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={() => setShowPass(o => !o)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Confirmar contraseña"
                className="w-full pl-9 pr-4 py-3 bg-surface2 border border-border rounded-xl text-sm outline-none focus:border-accent transition-colors"
              />
            </div>

            {password && confirm && password !== confirm && (
              <p className="text-[11px] text-accent font-mono">Las contraseñas no coinciden</p>
            )}
            {password && confirm && password === confirm && (
              <p className="text-[11px] text-fresh font-mono">✓ Las contraseñas coinciden</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-xl tracking-widest transition-all disabled:opacity-50"
            >
              {loading ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}