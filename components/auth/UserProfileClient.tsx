'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { PostCard } from '@/components/feed/PostCard'
import { AuthModal } from './AuthModal'
import { Profile, Post, BANNER_GRADIENTS } from '@/types'
import { Calendar, Award, FileText, Pencil, UserPlus, UserMinus, Users } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toaster'

interface UserProfileClientProps {
  profile: Profile
  posts: Post[]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

function getLevel(points: number): { label: string; color: string; emoji: string } {
  if (points >= 10000) return { label: 'Legend', color: '#ff4654', emoji: '👑' }
  if (points >= 5000)  return { label: 'Gold',   color: '#ffcc00', emoji: '🥇' }
  if (points >= 1000)  return { label: 'Silver',  color: '#a0a0b0', emoji: '🥈' }
  if (points >= 100)   return { label: 'Bronze',  color: '#cd7f32', emoji: '🥉' }
  return { label: 'Novato', color: '#8888a0', emoji: '🌱' }
}

type SortType = 'recent' | 'top'

export function UserProfileClient({ profile, posts: initialPosts }: UserProfileClientProps) {
  const { user } = useAuthContext()
  const { vote } = usePosts()
  const { toast } = useToast()
  const router = useRouter()
  const [authOpen, setAuthOpen] = useState(false)
  const [posts, setPosts] = useState(initialPosts)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(profile.followers ?? 0)
  const [followingCount, setFollowingCount] = useState(profile.following ?? 0)
  const [loadingFollow, setLoadingFollow] = useState(false)
  const [sort, setSort] = useState<SortType>('recent')
  const isOwn = user?.id === profile.id
  const level = getLevel(profile.points ?? 0)

  const sortedPosts = [...posts].sort((a, b) =>
    sort === 'top'
      ? b.votes - a.votes
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  useEffect(() => {
    if (!user || isOwn) return
    checkFollowing()
  }, [user])

  async function checkFollowing() {
    const supabase = createClient()
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user!.id)
      .eq('following_id', profile.id)
      .single()
    setIsFollowing(!!data)
  }

  async function handleFollow() {
    if (!user) { setAuthOpen(true); return }
    setLoadingFollow(true)
    const supabase = createClient()
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', profile.id)
      setIsFollowing(false)
      setFollowersCount(c => Math.max(0, c - 1))
      toast('👋', `Dejaste de seguir a ${profile.username}`)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(true)
      setFollowersCount(c => c + 1)
      toast('✅', `Ahora sigues a ${profile.username}`)
    }
    setLoadingFollow(false)
  }

  function handleDelete(id: number) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">
        {/* Banner */}
        <div
          className="h-32 rounded-2xl mb-[-40px]"
          style={{ background: profile.banner ?? BANNER_GRADIENTS[0] }}
        />

        {/* Avatar + info */}
        <div className="flex items-end gap-4 px-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-surface border-4 border-bg flex items-center justify-center text-4xl relative z-10 shrink-0">
            {profile.avatar_emoji}
          </div>
          <div className="pb-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bebas text-3xl tracking-wide">{profile.username}</h1>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                style={{ color: level.color, borderColor: `${level.color}44`, background: `${level.color}22` }}
              >
                {level.emoji} {level.label}
              </span>
            </div>
            {profile.bio && (
              <p className="text-sm text-muted mt-0.5">{profile.bio}</p>
            )}
          </div>
          {isOwn ? (
            <button
              onClick={() => router.push('/profile')}
              className="pb-2 flex items-center gap-1.5 text-xs font-bold text-muted hover:text-accent border border-border hover:border-accent px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Pencil size={12} /> Editar perfil
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={loadingFollow}
              className={`pb-2 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                isFollowing
                  ? 'border-border text-muted hover:text-accent hover:border-accent'
                  : 'border-accent2 bg-accent2/10 text-accent2 hover:bg-accent2/20'
              }`}
            >
              {isFollowing
                ? <><UserMinus size={12} /> Siguiendo</>
                : <><UserPlus size={12} /> Seguir</>
              }
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: FileText, value: posts.length, label: 'Posts', color: 'text-accent2' },
            { icon: Users,    value: followersCount, label: 'Seguidores', color: 'text-accent2' },
            { icon: Users,    value: followingCount, label: 'Siguiendo', color: 'text-accent2' },
            { icon: Award,    value: profile.points ?? 0, label: 'Puntos', color: 'text-accent' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-3 text-center">
              <p className={`font-bebas text-2xl leading-none ${color}`}>{value}</p>
              <p className="text-[10px] text-muted uppercase tracking-widest font-mono mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Miembro desde */}
        <div className="flex items-center gap-2 mb-6 text-muted">
          <Calendar size={13} strokeWidth={2} />
          <p className="text-[11px] font-mono">Miembro desde {formatDate(profile.created_at)}</p>
        </div>

        {/* Posts header con sort */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bebas text-xl tracking-wide text-muted">
            POSTS DE {profile.username.toUpperCase()}
          </h2>
          <div className="flex gap-1 bg-surface2 rounded-lg p-1">
            <button
              onClick={() => setSort('recent')}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${sort === 'recent' ? 'bg-surface text-white' : 'text-muted hover:text-white'}`}
            >
              Recientes
            </button>
            <button
              onClick={() => setSort('top')}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${sort === 'top' ? 'bg-surface text-white' : 'text-muted hover:text-white'}`}
            >
              Top
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-5xl mb-4">😶</p>
            <p className="font-bebas text-2xl tracking-wide">Sin posts todavia</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedPosts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={vote}
                onAuthRequired={() => setAuthOpen(true)}
                onDelete={handleDelete}
                delay={i * 40}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}