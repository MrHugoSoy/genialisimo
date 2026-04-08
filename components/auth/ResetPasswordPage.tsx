'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toaster'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  async function handleSubmit() {
    if (!email.trim()) { toast('⚠️', 'Escribe tu email'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://genialisimo.com/update-password',
    })
    setLoading(false)
    if (error) { toast('❌', error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {!sent ? (
            <>
              <h1 className="font-bebas text-3xl tracking-wide mb-2">Recuperar contraseña</h1>
              <p className="text-muted text-sm mb-6">Te enviaremos un link para restablecer tu contraseña.</p>

              <div className="space-y-4">
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="tu@email.com"
                    className="w-full pl-9 pr-4 py-3 bg-surface2 border border-border rounded-xl text-sm outline-none focus:border-accent transition-colors"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-xl tracking-widest transition-all disabled:opacity-50"
                >
                  {loading ? 'ENVIANDO...' : 'ENVIAR LINK'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-5xl mb-4">📧</p>
              <h2 className="font-bebas text-2xl tracking-wide mb-2">¡Revisa tu email!</h2>
              <p className="text-muted text-sm mb-6">
                Enviamos un link a <span className="text-white font-bold">{email}</span>. 
                Revisa también tu carpeta de spam.
              </p>
              <Link
                href="/"
                className="text-sm text-accent hover:underline font-bold"
              >
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}