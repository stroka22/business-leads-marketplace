// Force dynamic rendering so Supabase session cookies are evaluated per request
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  // Fetch user and simple stats placeholders
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      {!user ? (
        <div>Please <a className="underline" href="/login">login</a> to view your dashboard.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2">Purchased Leads</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your purchase history and downloads will appear here.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2">Saved Filters</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Save commonly used filters for quick access.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2">Wallet / Credits</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Top up your credits and track transactions.</p>
          </div>
        </div>
      )}
    </div>
  )
}
