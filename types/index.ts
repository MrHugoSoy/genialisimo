export type Category =
  | 'memes' | 'gaming' | 'animals' | 'tech'
  | 'sports' | 'fails' | 'relatable' | 'movies'

export interface Profile {
  id: string
  username: string
  avatar_emoji: string
  bio: string | null
  points: number
  created_at: string
}

export interface Post {
  id: number
  user_id: string
  title: string
  image_url: string | null
  category: Category
  votes: number
  comment_count: number
  tags: string[]
  created_at: string
  profiles?: Profile
  user_vote?: number
}

export interface Comment {
  id: number
  post_id: number
  user_id: string
  content: string
  likes: number
  created_at: string
  profiles?: Profile
}

export const CATEGORIES: Record<Category, { label: string; emoji: string; color: string }> = {
  memes:     { label: 'Memes',     emoji: '😂', color: '#ff6b35' },
  gaming:    { label: 'Gaming',    emoji: '🎮', color: '#7b61ff' },
  animals:   { label: 'Animales',  emoji: '🐾', color: '#00d4aa' },
  tech:      { label: 'Tech',      emoji: '💻', color: '#0ea5e9' },
  sports:    { label: 'Deportes',  emoji: '⚽', color: '#22c55e' },
  fails:     { label: 'Fails',     emoji: '💀', color: '#ef4444' },
  relatable: { label: 'Relatable', emoji: '😔', color: '#f59e0b' },
  movies:    { label: 'Películas', emoji: '🎬', color: '#ec4899' },
}

export const AVATARS = ['🗿','😈','🤡','👾','🦊','🐸','🤖','💀','🧠','👽','🐙','🦁']

export const BANNER_GRADIENTS = [
  'linear-gradient(135deg,#ff4654,#ff8c00)',
  'linear-gradient(135deg,#7b61ff,#00d4aa)',
  'linear-gradient(135deg,#0ea5e9,#7b61ff)',
  'linear-gradient(135deg,#22c55e,#ffcc00)',
  'linear-gradient(135deg,#ef4444,#7b61ff)',
  'linear-gradient(135deg,#ff6b35,#ffcc00)',
]

export const POPULAR_TAGS = [
  'memes','relatable','lol','fyp','gato','fail',
  'based','devlife','lunes','cursed','viral','cringe',
  'gaming','tech','animals','humor','españa','mexico'
]
