'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { AVATARS } from '@/types'
import clsx from 'clsx'

export function ProfilePage() {
  const { profile, user, loading, updateProfile, signOut } = useAuthContext()
  const { toast } = useToast()
  const router = useRouter()
  const [bio, setBio] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/')
    if (profile) {
      setBio(profile.bio ?? '')
      setSelectedAvatar(profile.avatar_emoji)
    }
  }, [profile, user, loading])

  async function handleSave() {
    setSaving(true)
    await updateProfile({ bio, avatar_emoji: selectedAvatar })
    setSaving(false)
    toast('✅', 'Perfil actualizado')
  }

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-bounce">🔥</div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-16">
      {/* Banner */}
      <div className="h-28 rounded-2xl mb-[-36px]" style={{ background: profile.banner ?? 'linear-gradient(135deg,#ff4654,#ff8c00)' }} />

      {/* Avatar */}
      <div className="flex items-end gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-surface border-4 border-bg flex items-center justify-center text-4xl relative z-10">
          {selectedAvatar}
        </div>
        <div className="pb-2">
          <h1 className="font-bebas text-3xl tracking-wide">{profile.username}</h1>
          <p className="text-muted text-sm">Miembro desde {new Date(profile.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 px-4 py-4 mt-4 bg-surface border border-border rounded-xl">
        {[['posts', 'Posts'], ['points', 'Puntos']].map(([key, label]) => (
          <div key={key} className="text-center">
            <p className="font-bebas text-3xl text-accent2 leading-none">{(profile as any)[key] ?? 0}</p>
            <p className="text-[10px] text-muted uppercase tracking-widest font-mono">{label}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="mt-6 bg-surface border border-border rounded-xl p-6 space-y-5">
        <h2 className="font-bebas text-xl tracking-wide text-muted">EDITAR PERFIL</h2>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Avatar</label>
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

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Bio</label>
          <input
            type="text"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Cuéntanos algo de ti..."
            maxLength={80}
            className="w-full px-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
          />
        </div>

        <button
          onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-xl tracking-widest transition-all disabled:opacity-50"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>

        <button
          onClick={() => { signOut(); router.push('/') }}
          className="w-full py-2.5 bg-surface2 border border-border hover:border-accent text-muted hover:text-white rounded-xl text-sm font-semibold transition-all"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
