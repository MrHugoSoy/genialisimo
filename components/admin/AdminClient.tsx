'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toaster'
import { Flag, Trash2, Check, Eye, Shield, Lock, Unlock, Plus } from 'lucide-react'
import Image from 'next/image'

interface Report {
  id: number
  reason: string
  created_at: string
  post_id: number
  user_id: string
  post: {
    id: number
    title: string
    image_url: string | null
    user_id: string
  } | null
  reporter: {
    username: string
    avatar_emoji: string
  } | null
}

interface ReservedUsername {
  id: number
  username: string
  reason: string | null
  unlock_at: string | null
  created_at: string
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

type Tab = 'reports' | 'usernames'

export function AdminClient({ reports: initialReports }: { reports: Report[] }) {
  const [tab, setTab] = useState<Tab>('reports')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [reserved, setReserved] = useState<ReservedUsername[]>([])
  const [loadingReserved, setLoadingReserved] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newReason, setNewReason] = useState('')
  const [newUnlockAt, setNewUnlockAt] = useState('')
  const [adding, setAdding] = useState(false)
  const { toast } = useToast()

  useEffect(() => { fetchReports() }, [])
  useEffect(() => { if (tab === 'usernames') fetchReserved() }, [tab])

  async function fetchReports() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reports')
      .select('id, reason, created_at, post_id, user_id')
      .order('created_at', { ascending: false })

    if (error) { setLoading(false); return }

    const reportsWithData = await Promise.all((data ?? []).map(async (r) => {
      const { data: post } = await supabase.from('posts').select('id, title, image_url, user_id').eq('id', r.post_id).single()
      const { data: reporter } = await supabase.from('profiles').select('username, avatar_emoji').eq('id', r.user_id).single()
      return { ...r, post: post ?? null, reporter: reporter ?? null }
    }))

    setReports(reportsWithData)
    setLoading(false)
  }

  async function fetchReserved() {
    setLoadingReserved(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('reserved_usernames')
      .select('*')
      .order('created_at', { ascending: false })
    setReserved(data ?? [])
    setLoadingReserved(false)
  }

  async function handleAddReserved() {
    if (!newUsername.trim()) { toast('⚠️', 'Escribe un username'); return }
    setAdding(true)
    const supabase = createClient()
    const { error } = await supabase.from('reserved_usernames').insert({
      username: newUsername.trim().toLowerCase(),
      reason: newReason.trim() || null,
      unlock_at: newUnlockAt || null,
    })
    if (error) {
      toast('❌', error.message.includes('unique') ? 'Ese username ya está bloqueado' : error.message)
    } else {
      toast('🔒', `@${newUsername} bloqueado`)
      setNewUsername('')
      setNewReason('')
      setNewUnlockAt('')
      fetchReserved()
    }
    setAdding(false)
  }

  async function handleUnlock(id: number, username: string) {
    if (!confirm(`Desbloquear @${username}?`)) return
    const supabase = createClient()
    await supabase.from('reserved_usernames').delete().eq('id', id)
    setReserved(prev => prev.filter(r => r.id !== id))
    toast('🔓', `@${username} desbloqueado`)
  }

  async function handleDeletePost(postId: number) {
    if (!confirm('Borrar este post permanentemente?')) return
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', postId)
    await supabase.from('reports').delete().eq('post_id', postId)
    setReports(prev => prev.filter(r => r.post_id !== postId))
    toast('🗑️', 'Post borrado')
  }

  async function handleDismiss(postId: number) {
    const supabase = createClient()
    await supabase.from('reports').delete().eq('post_id', postId)
    setReports(prev => prev.filter(r => r.post_id !== postId))
    toast('✅', 'Reportes descartados')
  }

  const grouped = reports.reduce((acc, r) => {
    const key = r.post?.id ?? 0
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {} as Record<number, Report[]>)

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/20 border border-accent rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="font-bebas text-3xl tracking-wide">Panel de Admin</h1>
          <p className="text-[11px] font-mono text-muted">Control total del sitio</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface2 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('reports')}
          className={`flex-1 py-2 rounded-lg font-bebas text-lg tracking-widest transition-all flex items-center justify-center gap-2 ${tab === 'reports' ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}
        >
          <Flag size={15} /> Reportes
          {reports.length > 0 && (
            <span className="bg-white text-accent text-xs font-bold px-1.5 rounded-full">{reports.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('usernames')}
          className={`flex-1 py-2 rounded-lg font-bebas text-lg tracking-widest transition-all flex items-center justify-center gap-2 ${tab === 'usernames' ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}
        >
          <Lock size={15} /> Usernames
          {reserved.length > 0 && (
            <span className="bg-white/20 text-white text-xs font-bold px-1.5 rounded-full">{reserved.length}</span>
          )}
        </button>
      </div>

      {/* TAB REPORTES */}
      {tab === 'reports' && (
        <>
          {!loading && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Posts reportados', value: Object.keys(grouped).length, color: 'text-accent' },
                { label: 'Reportes totales', value: reports.length, color: 'text-orange-400' },
                { label: 'Razones distintas', value: [...new Set(reports.map(r => r.reason))].length, color: 'text-accent2' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface border border-border rounded-xl p-4 text-center">
                  <p className={`font-bebas text-3xl ${color}`}>{value}</p>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {loading && <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>}

          {!loading && Object.keys(grouped).length === 0 && (
            <div className="text-center py-20 text-muted">
              <Flag size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-bebas text-2xl tracking-wide">Sin reportes pendientes</p>
              <p className="text-sm mt-2">El sitio esta limpio</p>
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              {Object.entries(grouped).map(([postId, postReports]) => {
                const post = postReports[0].post
                if (!post) return null
                return (
                  <div key={postId} className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="flex gap-4 p-4 border-b border-border">
                      {post.image_url && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface2 shrink-0">
                          <Image src={post.image_url} alt={post.title} width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{post.title}</p>
                        <p className="text-[11px] font-mono text-muted mt-1">{postReports.length} reporte{postReports.length !== 1 ? 's' : ''}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[...new Set(postReports.map(r => r.reason))].map(reason => (
                            <span key={reason} className="text-[10px] px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent rounded-full font-mono">{reason}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 items-center">
                        <a href={`/post/${post.id}`} target="_blank" className="p-2 bg-surface2 hover:bg-surface border border-border rounded-lg text-muted hover:text-white transition-colors"><Eye size={14} /></a>
                        <button onClick={() => handleDismiss(post.id)} className="p-2 bg-surface2 hover:bg-surface border border-border rounded-lg text-muted hover:text-fresh transition-colors"><Check size={14} /></button>
                        <button onClick={() => handleDeletePost(post.id)} className="p-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent hover:text-white transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {postReports.map(report => (
                        <div key={report.id} className="flex items-center gap-2 text-xs text-muted">
                          <span className="text-base">{report.reporter?.avatar_emoji ?? '😐'}</span>
                          <span className="font-bold text-white/70">{report.reporter?.username ?? 'anon'}</span>
                          <span>reporto:</span>
                          <span className="text-orange-400">{report.reason}</span>
                          <span className="ml-auto font-mono">{timeAgo(report.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* TAB USERNAMES */}
      {tab === 'usernames' && (
        <div className="space-y-6">

          {/* Agregar nuevo username bloqueado */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">Bloquear username</p>
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-mono">@</span>
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username a bloquear"
                  className="w-full pl-7 pr-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors font-mono"
                />
              </div>
              <input
                type="text"
                value={newReason}
                onChange={e => setNewReason(e.target.value)}
                placeholder="Razón del bloqueo (opcional)"
                className="w-full px-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
              <div>
                <label className="text-[10px] text-muted font-mono mb-1 block">Desbloquear automáticamente (opcional)</label>
                <input
                  type="datetime-local"
                  value={newUnlockAt}
                  onChange={e => setNewUnlockAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                onClick={handleAddReserved}
                disabled={adding}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                <Plus size={15} /> {adding ? 'Bloqueando...' : 'Bloquear username'}
              </button>
            </div>
          </div>

          {/* Lista de usernames bloqueados */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Usernames bloqueados — {reserved.length}</p>
            </div>
            {loadingReserved && <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>}
            {!loadingReserved && reserved.length === 0 && (
              <div className="text-center py-10 text-muted">
                <Lock size={30} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sin usernames bloqueados</p>
              </div>
            )}
            {!loadingReserved && reserved.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-surface2 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">@{r.username}</span>
                    {r.unlock_at && new Date(r.unlock_at) > new Date() && (
                      <span className="text-[10px] bg-accent2/20 text-accent2 border border-accent2/30 px-2 py-0.5 rounded-full font-mono">
                        se desbloquea {new Date(r.unlock_at).toLocaleDateString('es-MX')}
                      </span>
                    )}
                    {r.unlock_at && new Date(r.unlock_at) <= new Date() && (
                      <span className="text-[10px] bg-fresh/20 text-fresh border border-fresh/30 px-2 py-0.5 rounded-full font-mono">
                        ya desbloqueado
                      </span>
                    )}
                  </div>
                  {r.reason && <p className="text-[11px] text-muted mt-0.5">{r.reason}</p>}
                  <p className="text-[10px] text-muted font-mono mt-0.5">bloqueado {timeAgo(r.created_at)}</p>
                </div>
                <button
                  onClick={() => handleUnlock(r.id, r.username)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2 border border-border rounded-lg text-xs text-muted hover:text-white hover:border-fresh transition-colors"
                >
                  <Unlock size={12} /> Desbloquear
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}