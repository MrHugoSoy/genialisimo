import type { Metadata } from 'next'
import { FeedPage } from '@/components/feed/FeedPage'

export const metadata: Metadata = {
  title: 'Hot 🔥 — Genialisimo',
  description: 'Los posts más votados de las últimas 24 horas en Genialisimo.',
}

export default function HotPage() {
  return <FeedPage feedType="hot" />
}
