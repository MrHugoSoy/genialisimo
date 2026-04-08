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

  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      post:posts!reports_post_id_fkey(id, title, image_url, user_id),
      reporter:profiles!reports_user_id_fkey(username, avatar_emoji)
    `)
    .order('created_at', { ascending: false })

  return <AdminClient reports={reports ?? []} />
}