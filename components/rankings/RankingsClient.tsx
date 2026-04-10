'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Trophy, Medal, Award } from 'lucide-react'

interface RankUser {
  username: string
  avatar_emoji: string
  points: number
  posts: number
}

function getLevel(points: number): { label: string; color: string; emoji: string } {
  if (points >= 10000) return { label: 'Legend', color: '#ff4654', emoji: '👑' }
  if (points >= 5000)  return { label: 'Gold',   color: '#ffcc00', emoji: '🥇' }
  if (points >= 1000)  return { label: 'Silver',  color: '#a0a0b0', emoji: '🥈' }
  if (points >= 100)   return { label: 'Bronze',  color: '#cd7f32', emoji: '🥉' }
  return { label: 'Novato', color: '#8888a0', emoji: '🌱' }
}

function getRankIcon(i: number) {
  if (i === 0) return <Trophy size={18} className="text-yellow-400" />
  if (i === 1) return <Medal size={18} className="text-gray-300" />
  if (i === 2) return <Award size={18} className="text-orange-400" />
  return <span className="font-mono text-sm text-muted font-bold">#{i + 1}</span>
}

export function RankingsClient() {
  const [users, setUsers] = useState<RankUser[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRankings()
  }, [])

  async function fetchRankings() {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_emoji, points, posts')
      .order('points', { ascending: false })
      .limit(50)
    setUsers(data ?? [])
    setLoading(false)
  }

  const podium = [
    { user: users[1], medal: '🥈', height: 'h-28', border: 'hover:border-gray-300' },
    { user: users[0], medal: '🥇', height: 'h-36', border: 'hover:border-yellow-400' },
    { user: users[2], medal: '🥉', height: 'h-28', border: 'hover:border-orange-400' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent2/20 border border-accent2/40 rounded-xl flex items-center justify-center">
          <Trophy size={20} className="text-accent2" />
        </div>
        <div>
          <h1 className="font-bebas text-3xl tracking-wide">Rankings</h1>
          <p className="text-[11px] font-mono text-muted">Top usuarios por puntos</p>
        </div>
      </div>

      {/* Top 3 podio */}
      {!loading && users.length >= 3 && (
        <div className="flex items-end gap-3 mb-8">
          {podium.map(({ user: u, medal, height, border }, i) => {
            if (!u) return null
            const level = getLevel(u.points)
            return (
              <div
                key={u.username}
                onClick={() => router.push(`/user/${u.username}`)}
                className={`flex-1 flex flex-col items-center justify-end pb-4 pt-3 bg-surface border border-border rounded-xl cursor-pointer ${border} transition-all ${height}`}
              >
                <span className="text-3xl mb-1">{medal}</span>
                <span className="text-2xl">{u.avatar_emoji}</span>
                <p className="font-bold text-xs mt-1 truncate max-w-[80px] text-center">{u.username}</p>
                <p className="font-bebas text-xl leading-none mt-1" style={{ color: level.color }}>{u.points}</p>
                <p className="text-[9px] text-muted font-mono">pts</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      )}

      {/* Lista completa */}
      {!loading && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {users.map((u, i) => {
            const level = getLevel(u.points)
            return (
              <div
                key={u.username}
                onClick={() => router.push(`/user/${u.username}`)}
                className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface2 transition-colors"
              >
                <div className="w-8 flex items-center justify-center shrink-0">
                  {getRankIcon(i)}
                </div>
                <div className="w-10 h-10 rounded-full bg-surface2 border-2 border-border flex items-center justify-center text-xl shrink-0">
                  {u.avatar_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{u.username}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                      style={{ color: level.color, borderColor: `${level.color}44`, background: `${level.color}22` }}
                    >
                      {level.emoji} {level.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted font-mono">{u.posts} posts</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bebas text-xl leading-none text-accent2">{u.points}</p>
                  <p className="text-[10px] text-muted font-mono">puntos</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-5xl mb-4">🏆</p>
          <p className="font-bebas text-2xl">Sin usuarios todavia</p>
        </div>
      )}
    </div>
  )
}