export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the admin dashboard.</p>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Log In
          </a>
        </div>
      </div>
    )
  }

  type ProfileRow = { is_admin: boolean } | null
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const isAdmin = Boolean((profileRow as unknown as ProfileRow)?.is_admin)
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <a href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
