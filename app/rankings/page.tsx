import type { Metadata } from 'next'
import { RankingsClient } from '@/components/rankings/RankingsClient'

export const metadata: Metadata = {
  title: 'Rankings — Genialisimo',
  description: 'Los usuarios con mas puntos en Genialisimo.',
}

export default function RankingsPage() {
  return <RankingsClient />
}