// Prevent Next.js from statically prerendering this page so that
// Supabase session cookies are evaluated at request time.
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div>Please <a className="underline" href="/login">login</a>.</div>
  }

  // Fetch profile to check admin
  type ProfileRow = { is_admin: boolean } | null
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // Cast through unknown to satisfy strict type checking without using `any`
  const isAdmin = Boolean((profileRow as unknown as ProfileRow)?.is_admin)
  if (!isAdmin) {
    return <div>Access denied.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin: Upload Leads CSV</h1>
      <form action="/api/admin/upload" method="post" encType="multipart/form-data" className="border rounded p-4">
        <input type="file" name="file" accept=".csv" className="block mb-4" required />
        <button className="px-4 py-2 rounded bg-black text-white">Upload CSV</button>
      </form>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">Expected headers: Company Name, Owner Name, Phone, Email, State, Zip Code, Industry, Time in Business, Monthly Revenue, Loan Purpose, Loan Amount Requested, Lead Source, Date Acquired</p>
    </div>
  )
}
