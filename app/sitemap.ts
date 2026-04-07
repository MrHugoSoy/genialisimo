import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, created_at')
    .limit(500)

  const postUrls = (posts ?? []).map(p => ({
    url: `https://genialisimo.com/post/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const profileUrls = (profiles ?? []).map(p => ({
    url: `https://genialisimo.com/user/${p.username}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    { url: 'https://genialisimo.com', lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: 'https://genialisimo.com/trending', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: 'https://genialisimo.com/fresh', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: 'https://genialisimo.com/top', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...postUrls,
    ...profileUrls,
  ]
}