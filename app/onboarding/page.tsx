'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AVATARS, BANNER_GRADIENTS } from '@/types'
import { useToast } from '@/components/ui/Toaster'
import clsx from 'clsx'

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [selectedBanner, setSelectedBanner] = useState(BANNER_GRADIENTS[0])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }

      // Si ya tiene username, no necesita onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.username) { router.replace('/'); return }

      setUserId(user.id)
      setChecking(false)
    }
    checkSession()
  }, [])

  async function handleSubmit() {
    if (!username.trim()) { toast('⚠️', 'Elige un nombre de usuario'); return }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      toast('⚠️', 'Usuario: 3-20 chars, solo letras minúsculas, números y _')
      return
    }
    if (!userId) return

    setLoading(true)

    // Verificar que el username no esté tomado
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      toast('❌', 'Ese nombre de usuario ya está en uso')
      setLoading(false)
      return
    }

    // Upsert del perfil (puede existir sin username si el trigger corrió con NULL)
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username,
        avatar_emoji: selectedAvatar,
        banner: selectedBanner,
      }, { onConflict: 'id' })

    setLoading(false)

    if (error) {
      toast('❌', 'Error al guardar perfil: ' + error.message)
      return
    }

    toast('🎉', '¡Bienvenido a Genialisimo!')
    router.replace('/')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted text-sm animate-pulse">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-7 animate-popIn">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-4xl mb-3">👋</p>
          <h1 className="font-bebas text-3xl tracking-widest text-white">
            ¡Ya casi listo!
          </h1>
          <p className="text-muted text-sm mt-1">
            Elige tu usuario y avatar para empezar
          </p>
        </div>

        {/* Username */}
        <div className="mb-5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-2">
            Nombre de usuario
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-mono">@</span>
            <input
              type="text"
              placeholder="tu_usuario"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              maxLength={20}
              className="w-full pl-7 pr-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors font-mono"
            />
          </div>
          <p className="text-[10px] text-muted mt-1 font-mono">
            3–20 caracteres. Solo letras minúsculas, números y _
          </p>
        </div>

        {/* Avatar picker */}
        <div className="mb-5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-2">
            Tu avatar
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setSelectedAvatar(a)}
                className={clsx(
                  'w-11 h-11 rounded-full bg-surface2 border-2 text-xl flex items-center justify-center transition-all',
                  selectedAvatar === a
                    ? 'border-accent scale-110 bg-accent/10'
                    : 'border-border hover:border-accent/50'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Banner picker */}
        <div className="mb-7">
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-2">
            Color de perfil
          </label>
          <div className="flex gap-2 flex-wrap">
            {BANNER_GRADIENTS.map(g => (
              <button
                key={g}
                onClick={() => setSelectedBanner(g)}
                className={clsx(
                  'w-10 h-10 rounded-lg border-2 transition-all',
                  selectedBanner === g ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                )}
                style={{ background: g }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div
          className="rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{ background: selectedBanner }}
        >
          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-2xl shrink-0">
            {selectedAvatar}
          </div>
          <div>
            <p className="font-bebas text-xl tracking-wide text-white drop-shadow">
              {username || 'tu_usuario'}
            </p>
            <p className="text-white/70 text-xs">Nuevo en Genialisimo</p>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || username.length < 3}
          className="w-full py-3 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-xl tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'GUARDANDO...' : 'EMPEZAR'}
        </button>
      </div>
    </div>
  )
}