import type { Metadata } from 'next'
import { FeedPage } from '@/components/feed/FeedPage'

export const metadata: Metadata = {
  title: 'Siguiendo — Genialisimo',
  description: 'Posts de los usuarios que sigues en Genialisimo.',
}

export default function FollowingPage() {
  return <FeedPage feedType="following" />
}