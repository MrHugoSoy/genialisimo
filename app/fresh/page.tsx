import type { Metadata } from 'next'
import { FeedPage } from '@/components/feed/FeedPage'

export const metadata: Metadata = {
  title: 'Fresh ✨ — Genialisimo',
  description: 'Los posts mas recientes y frescos de Genialisimo.',
}

export default function FreshPage() {
  return <FeedPage feedType="fresh" />
}