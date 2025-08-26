// Force dynamic rendering so Supabase session cookies are evaluated per request
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function DashboardPage() {
  const supabase = createClient()
  // Fetch user and simple stats placeholders
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // helper to pretty-print USD from cents
  const centsToUsd = (cents: number) =>
    `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  let wallet:
    | { balance_cents: number } 
    | null = null
  let transactions:
    | {
        id: string
        amount_cents: number
        type: string
        reference_id: string | null
        created_at: string
      }[]
    | [] = []

  if (user) {
    // Ensure profile + wallet exist, capture profileId for reuse
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    let profileId: string

    if (profile) {
      profileId = (profile as unknown as { id: string }).id
    } else {
      // Fallback (should rarely happen) – create profile & wallet via service-role client
      const admin = createAdminClient()
      const { data: newProf } = await admin
        .from('profiles')
        .insert({ auth_user_id: user.id, email: user.email })
        .select('id')
        .single()

      profileId =
        ((newProf as unknown as { id: string } | null)?.id) ?? user.id // fallback to user.id if insert fails

      // Ensure wallet exists for that profileId
      await admin
        .from('wallets')
        .upsert(
          { user_id: profileId, balance_cents: 0 },
          { onConflict: 'user_id', ignoreDuplicates: true },
        )
    }

    // Fetch wallet + latest transactions (after ensuring existence)
    const { data: w } = await supabase
      .from('wallets')
      .select('balance_cents')
      .eq('user_id', profileId)
      .maybeSingle()
    wallet = w

    const { data: tx } = await supabase
      .from('wallet_transactions')
      .select('id, amount_cents, type, reference_id, created_at')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
      .limit(10)
    transactions = tx ?? []
  }

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
            {wallet ? (
              <>
                {/* cast wallet to satisfy TS when accessing balance */}
                <div className="text-3xl font-semibold mb-2">
                  {centsToUsd((wallet as { balance_cents: number }).balance_cents)}
                </div>
                <h3 className="font-medium mt-4 mb-2 text-sm">Recent Transactions</h3>
                {transactions.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">No transactions yet.</p>
                ) : (
                  <ul className="text-sm space-y-1 max-h-48 overflow-y-auto pr-1">
                    {transactions.map((t) => (
                      <li key={t.id} className="flex justify-between">
                        <span>
                          {t.type}{' '}
                          {t.reference_id ? (
                            <span className="text-gray-500">({t.reference_id.slice(0, 6)})</span>
                          ) : null}
                        </span>
                        <span
                          className={t.amount_cents >= 0 ? 'text-green-700' : 'text-red-700'}
                        >
                          {t.amount_cents >= 0 ? '+' : '-'}
                          {centsToUsd(Math.abs(t.amount_cents))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading wallet...</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
