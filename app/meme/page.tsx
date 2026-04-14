import type { Metadata } from 'next'
import { MemeGenerator } from '@/components/meme/MemeGenerator'

export const metadata: Metadata = {
  title: 'Crear Meme — Genialisimo',
  description: 'Crea tus propios memes y compártelos con la comunidad.',
}

export default function MemePage() {
  return <MemeGenerator />
}