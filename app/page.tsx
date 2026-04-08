import type { Metadata } from 'next'
import { FeedPage } from '@/components/feed/FeedPage'

export const metadata: Metadata = {
  title: 'Genialisimo 🔥 — Memes y contenido viral en español',
  description: 'Los mejores memes, fails y contenido viral en español. Vota, comenta y comparte.',
}

export default function Home() {
  return <FeedPage feedType="hot" />
}