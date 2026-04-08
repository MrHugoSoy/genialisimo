import type { Metadata } from 'next'
import { FeedPage } from '@/components/feed/FeedPage'

export const metadata: Metadata = {
  title: 'Trending 📈 — Genialisimo',
  description: 'Los posts mas comentados y virales del momento en Genialisimo.',
}

export default function TrendingPage() {
  return <FeedPage feedType="trending" />
}