import type { Metadata } from 'next'
import { FeedPage } from '@/components/feed/FeedPage'

export const metadata: Metadata = {
  title: 'Top 👑 — Genialisimo',
  description: 'Los posts mas votados de todos los tiempos en Genialisimo.',
}

export default function TopPage() {
  return <FeedPage feedType="top" />
}