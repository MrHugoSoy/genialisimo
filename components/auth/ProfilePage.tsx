'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import { AVATARS, BANNER_GRADIENTS } from '@/types'
import { Camera } from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'

export function ProfilePage() {
  const { profile, user, loading, updateProfile, signOut } = useAuthContext()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bio, setBio] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [selectedBanner, setSelectedBanner] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/')
    if (profile) {
      setBio(profile.bio ?? '')
      setSelectedAvatar(profile.avatar_emoji)
      setSelectedBanner(profile.banner ?? BANNER_GRADIENTS[0])
      setAvatarUrl((profile as any).avatar_url ?? null)
    }
  }, [profile, user, loading])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) { toast('⚠️', 'La foto no puede pesar mas de 5MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast('⚠️', 'Solo se permiten JPG, PNG o WEBP')
      return
    }
    setUploadingPhoto(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      const urlWithCache = `${url}?t=${Date.now()}`

      await supabase.from('profiles').update({ avatar_url: urlWithCache }).eq('id', user.id)
      setAvatarUrl(urlWithCache)
      toast('📸', 'Foto de perfil actualizada')
    } catch {
      toast('❌', 'Error al subir la foto')
    }
    setUploadingPhoto(false)
  }

  async function handleRemovePhoto() {
    if (!user) return
    const supabase = createClient()
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
    setAvatarUrl(null)
    toast('🗑️', 'Foto eliminada')
  }

  async function handleSave() {
    setSaving(true)
    await updateProfile({ bio, avatar_emoji: selectedAvatar, banner: selectedBanner })
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
      {/* Banner preview */}
      <div
        className="h-28 rounded-2xl mb-[-36px] transition-all duration-300"
        style={{ background: selectedBanner }}
      />

      {/* Avatar */}
      <div className="flex items-end gap-4 px-4">
        <div className="relative w-20 h-20 z-10">
          <div className="w-20 h-20 rounded-full bg-surface border-4 border-bg flex items-center justify-center text-4xl overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{selectedAvatar}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-0 right-0 w-7 h-7 bg-accent hover:bg-red-500 rounded-full flex items-center justify-center transition-colors border-2 border-bg"
          >
            {uploadingPhoto ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={12} className="text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
        <div className="pb-2">
          <h1 className="font-bebas text-3xl tracking-wide">{profile.username}</h1>
          <p className="text-muted text-sm">
            Miembro desde {new Date(profile.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </p>
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

        {/* Foto de perfil */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Foto de perfil</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-surface2 border border-border overflow-hidden flex items-center justify-center text-2xl">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="avatar" width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <span>{selectedAvatar}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center justify-center gap-2 py-2 bg-surface2 border border-border rounded-lg text-sm text-muted hover:text-white hover:border-accent transition-colors disabled:opacity-50"
              >
                <Camera size={13} /> {uploadingPhoto ? 'Subiendo...' : 'Subir foto'}
              </button>
              {avatarUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="py-2 bg-surface2 border border-border rounded-lg text-xs text-muted hover:text-accent hover:border-accent transition-colors"
                >
                  Eliminar foto
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-muted font-mono mt-2">JPG, PNG o WEBP — máximo 5MB</p>
        </div>

        {/* Avatar emoji — solo si no tiene foto */}
        {!avatarUrl && (
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">O elige un avatar</label>
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
        )}

        {/* Banner */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Banner</label>
          <div className="grid grid-cols-3 gap-2">
            {BANNER_GRADIENTS.map((gradient, i) => (
              <button
                key={i}
                onClick={() => setSelectedBanner(gradient)}
                className={clsx(
                  'h-12 rounded-lg border-2 transition-all',
                  selectedBanner === gradient ? 'border-accent scale-105' : 'border-transparent hover:border-accent/50'
                )}
                style={{ background: gradient }}
              />
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
            Bio <span className="normal-case text-muted">({bio.length}/80)</span>
          </label>
          <input
            type="text"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Cuentanos algo de ti..."
            maxLength={80}
            className="w-full px-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-xl tracking-widest transition-all disabled:opacity-50"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>

        <button
          onClick={() => router.push(`/user/${profile.username}`)}
          className="w-full py-2.5 bg-surface2 border border-border hover:border-accent2 text-muted hover:text-white rounded-xl text-sm font-semibold transition-all"
        >
          Ver mi perfil publico
        </button>

        <button
          onClick={() => { signOut(); router.push('/') }}
          className="w-full py-2.5 bg-surface2 border border-border hover:border-accent text-muted hover:text-white rounded-xl text-sm font-semibold transition-all"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}