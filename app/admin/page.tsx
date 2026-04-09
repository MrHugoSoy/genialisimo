import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AdminClient } from '@/components/admin/AdminClient'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: rawReports } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      created_at,
      post_id,
      user_id,
      post:posts(id, title, image_url, user_id),
      reporter:profiles(username, avatar_emoji)
    `)
    .order('created_at', { ascending: false })

  // Normalizar arrays a objetos simples
  const reports = (rawReports ?? []).map((r: any) => ({
    ...r,
    post: Array.isArray(r.post) ? r.post[0] ?? null : r.post,
    reporter: Array.isArray(r.reporter) ? r.reporter[0] ?? null : r.reporter,
  }))

  return <AdminClient reports={reports} />
}